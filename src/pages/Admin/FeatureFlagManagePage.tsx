import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  createFeatureFlag,
  FeatureFlag,
  updateFeatureFlag,
} from "@/apis/featureFlag";
import AdminBottomSheet from "@/components/modal/AdminBottomSheet";
import { useAdminFeatureFlags } from "@/queries/admin";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminChoiceCard,
  AdminChoiceDescription,
  AdminChoiceGrid,
  AdminChoiceTitle,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminShell,
  AdminSubtleText,
} from "@/pages/Admin/adminPageStyles";

const EMPTY_NEW_FLAG: FeatureFlag = { key: "", flag: false };

const FeatureFlagManagePage = () => {
  const { data: rawFlags = [], isLoading: loading } = useAdminFeatureFlags();
  const flags = useMemo(
    () => [...rawFlags].sort((a, b) => a.key.localeCompare(b.key)),
    [rawFlags],
  );
  const [newFlag, setNewFlag] = useState<FeatureFlag>(EMPTY_NEW_FLAG);
  const [searchValue, setSearchValue] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const filteredFlags = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) {
      return flags;
    }

    return flags.filter((flag) => flag.key.toLowerCase().includes(keyword));
  }, [flags, searchValue]);

  const activeCount = useMemo(
    () => flags.filter((flag) => flag.flag).length,
    [flags],
  );

  const inactiveCount = flags.length - activeCount;

  const animatedTotal = useCountUp(flags.length);
  const animatedActive = useCountUp(activeCount);
  const animatedInactive = useCountUp(inactiveCount);

  const openCreator = () => {
    setNewFlag(EMPTY_NEW_FLAG);
    setIsCreatorOpen(true);
  };

  const closeCreator = () => {
    if (isCreating) {
      return;
    }

    setIsCreatorOpen(false);
    setNewFlag(EMPTY_NEW_FLAG);
  };

  const handleToggle = async (item: FeatureFlag) => {
    try {
      setPendingKey(item.key);
      const updated = { ...item, flag: !item.flag };
      await updateFeatureFlag(updated);
    } catch (error) {
      alert("Feature Flag 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPendingKey(null);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedKey = newFlag.key.trim();

    if (!normalizedKey) {
      alert("새 Feature Flag 이름을 입력해 주세요.");
      return;
    }

    if (
      flags.some(
        (flag) => flag.key.toLowerCase() === normalizedKey.toLowerCase(),
      )
    ) {
      alert("이미 등록된 Feature Flag 입니다.");
      return;
    }

    try {
      setIsCreating(true);
      await createFeatureFlag({ ...newFlag, key: normalizedKey });
      alert("Feature Flag를 등록했습니다.");
      closeCreator();
    } catch (error) {
      alert("Feature Flag를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  useSetHeader({ title: "Feature Flag 관리" });

  return (
    <AdminShell>
      <AdminPage>
        {/* 상단 3대 통계 (Zero-Icon & 카운트업) */}
        <MetricsGrid>
          <AdminMiniStat>
            <AdminMiniStatLabel>전체 플래그</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedTotal}개</AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>활성화 (ON)</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#04b05c" }}>
              {animatedActive}개
            </AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>비활성화 (OFF)</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#8b95a1" }}>
              {animatedInactive}개
            </AdminMiniStatValue>
          </AdminMiniStat>
        </MetricsGrid>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>Feature Flag 목록</AdminCardTitle>
              <AdminCardDescription>
                서비스 기능별 활성화 여부를 실시간으로 제어하고 새 플래그를 등록할 수 있습니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            <HeaderActions>
              <SearchInput
                type="text"
                placeholder="플래그 키 검색..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <DesktopCreateButton type="button" onClick={openCreator}>
                새 플래그 만들기
              </DesktopCreateButton>
            </HeaderActions>
          </AdminCardHeader>

          {loading ? (
            <LoadingState>Feature Flag 목록을 불러오는 중입니다...</LoadingState>
          ) : filteredFlags.length === 0 ? (
            <AdminEmptyState>
              <AdminEmptyTitle>표시할 Feature Flag가 없습니다.</AdminEmptyTitle>
              <AdminEmptyDescription>
                검색어를 확인하거나 새로운 Feature Flag를 추가해 보세요.
              </AdminEmptyDescription>
              <AdminButton type="button" onClick={openCreator}>
                새 Feature Flag 만들기
              </AdminButton>
            </AdminEmptyState>
          ) : (
            <FlagList>
              {filteredFlags.map((flag) => (
                <FlagRow key={flag.key}>
                  <FlagInfo>
                    <FlagKeyText>{flag.key}</FlagKeyText>
                    <FlagStatusText>
                      {flag.flag ? (
                        <StatusBadge $active={true}>활성화 (ON)</StatusBadge>
                      ) : (
                        <StatusBadge $active={false}>비활성화 (OFF)</StatusBadge>
                      )}
                      <StatusHint>
                        {flag.flag
                          ? "현재 모든 사용자에게 이 기능이 켜져 있어요"
                          : "현재 사용자에게 노출되지 않는 상태예요"}
                      </StatusHint>
                    </FlagStatusText>
                  </FlagInfo>

                  {/* 모던 슬라이딩 스위치 (물리 모션 토글) */}
                  <SwitchButton
                    type="button"
                    role="switch"
                    aria-checked={flag.flag}
                    $isOn={flag.flag}
                    disabled={pendingKey === flag.key}
                    onClick={() => handleToggle(flag)}
                    aria-label={`${flag.key} 상태 전환`}
                  >
                    <SwitchHandle $isOn={flag.flag} />
                  </SwitchButton>
                </FlagRow>
              ))}
            </FlagList>
          )}
        </AdminCard>

        {/* 플래그 생성 바텀시트 */}
        <AdminBottomSheet
          isOpen={isCreatorOpen}
          setIsOpen={(nextOpen) => {
            if (!nextOpen) {
              closeCreator();
            }
          }}
          title="Feature Flag 만들기"
          description="새 런타임 플래그 등록"
        >
          <CreatorHeader>
            <CreatorTitleGroup>
              <AdminBadge $tone="green">새 Feature Flag</AdminBadge>
              <CreatorTitle>새 Feature Flag 만들기</CreatorTitle>
              <AdminSubtleText>
                플래그 키와 초기 활성화 상태를 지정하여 등록합니다.
              </AdminSubtleText>
            </CreatorTitleGroup>

            <CloseButton type="button" onClick={closeCreator} aria-label="닫기">
              ✕
            </CloseButton>
          </CreatorHeader>

          <CreatorScrollArea>
            <CreateForm onSubmit={handleCreate}>
              <AdminField>
                <AdminLabel htmlFor="feature-flag-key">Flag 고유 키</AdminLabel>
                <AdminInput
                  id="feature-flag-key"
                  type="text"
                  value={newFlag.key}
                  onChange={(e) =>
                    setNewFlag({ ...newFlag, key: e.target.value })
                  }
                  placeholder="예: roommate_recommendation_v2"
                  required
                />
                <AdminSubtleText>
                  영문 소문자와 언더스코어(_) 조합으로 규칙에 맞게 입력해 주세요.
                </AdminSubtleText>
              </AdminField>

              <AdminField>
                <AdminLabel>초기 상태 설정</AdminLabel>
                <AdminChoiceGrid $minWidth="140px">
                  <AdminChoiceCard
                    type="button"
                    $selected={newFlag.flag}
                    onClick={() => setNewFlag({ ...newFlag, flag: true })}
                  >
                    <AdminChoiceTitle>활성화 (ON)</AdminChoiceTitle>
                    <AdminChoiceDescription>
                      등록 즉시 기능이 모든 사용자에게 켜집니다.
                    </AdminChoiceDescription>
                  </AdminChoiceCard>
                  <AdminChoiceCard
                    type="button"
                    $selected={!newFlag.flag}
                    onClick={() => setNewFlag({ ...newFlag, flag: false })}
                  >
                    <AdminChoiceTitle>비활성화 (OFF)</AdminChoiceTitle>
                    <AdminChoiceDescription>
                      배포만 먼저 진행하고 추후에 켤 수 있습니다.
                    </AdminChoiceDescription>
                  </AdminChoiceCard>
                </AdminChoiceGrid>
              </AdminField>

              <AdminActionRow>
                <AdminButton type="submit" disabled={isCreating}>
                  {isCreating ? "생성하고 있어요..." : "Feature Flag 등록하기"}
                </AdminButton>
                <AdminButton
                  type="button"
                  $tone="secondary"
                  onClick={closeCreator}
                  disabled={isCreating}
                >
                  취소
                </AdminButton>
              </AdminActionRow>
            </CreateForm>
          </CreatorScrollArea>
        </AdminBottomSheet>

        {/* 모바일 하단 고정 CTA */}
        <MobileCTAContainer>
          <MobileCTAButton type="button" onClick={openCreator}>
            새 Feature Flag 만들기
          </MobileCTAButton>
        </MobileCTAContainer>
      </AdminPage>
    </AdminShell>
  );
};

export default FeatureFlagManagePage;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  @media (min-width: 768px) {
    width: auto;
  }
`;

const SearchInput = styled(AdminInput)`
  height: 42px;
  padding: 0 14px;
  font-size: 0.88rem;
  width: 100%;

  @media (min-width: 768px) {
    width: 240px;
  }
`;

const DesktopCreateButton = styled(AdminButton)`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    white-space: nowrap;
    min-height: 42px;
    padding: 0 16px;
  }
`;

const LoadingState = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: #8b95a1;
  font-size: 0.95rem;
`;

const FlagList = styled.div`
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #e5e8eb;
`;

const FlagRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 8px;
  border-bottom: 1px solid #e5e8eb;
  transition: background-color 0.15s ease-out;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const FlagInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const FlagKeyText = styled.strong`
  font-size: 0.98rem;
  font-weight: 700;
  color: #191f28;
  font-family: monospace;
  word-break: break-all;
`;

const FlagStatusText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#e6f8ef" : "#f2f4f6")};
  color: ${({ $active }) => ($active ? "#04b05c" : "#6b7684")};
`;

const StatusHint = styled.span`
  font-size: 0.8rem;
  color: #8b95a1;
`;

const SwitchButton = styled.button<{ $isOn: boolean }>`
  position: relative;
  display: inline-flex;
  height: 32px;
  width: 56px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 999px;
  border: 2px solid transparent;
  background-color: ${({ $isOn }) => ($isOn ? "#3182f6" : "#e5e8eb")};
  transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.45;
    cursor: wait;
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }
`;

const SwitchHandle = styled.span<{ $isOn: boolean }>`
  pointer-events: none;
  display: inline-block;
  height: 28px;
  width: 28px;
  border-radius: 999px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateX(${({ $isOn }) => ($isOn ? "24px" : "0px")});
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

const CreatorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e5e8eb;
`;

const CreatorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const CreatorTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #191f28;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  color: #6b7684;
  background: #f2f4f6;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const CreatorScrollArea = styled.div`
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CreateForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MobileCTAContainer = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff 65%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  pointer-events: auto;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;
