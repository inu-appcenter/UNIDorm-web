import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  PlusCircle,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import {
  createFeatureFlag,
  FeatureFlag,
  getFeatureFlags,
  updateFeatureFlag,
} from "@/apis/featureFlag";
import AdminBottomSheet from "@/components/modal/AdminBottomSheet";
import { FEATURE_FLAGS_QUERY_KEY } from "@/hooks/useFeatureFlags";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardEyebrow,
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
  AdminHero,
  AdminHeroMetricGrid,
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
  const queryClient = useQueryClient();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [newFlag, setNewFlag] = useState<FeatureFlag>(EMPTY_NEW_FLAG);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const { data } = await getFeatureFlags();
      setFlags([...data].sort((a, b) => a.key.localeCompare(b.key)));
    } catch (error) {
      console.error(error);
      alert("Feature Flag 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFlags();
  }, []);

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
      setFlags((prev) => prev.map((f) => (f.key === item.key ? updated : f)));
      await queryClient.invalidateQueries({ queryKey: FEATURE_FLAGS_QUERY_KEY });
    } catch (error) {
      alert("Feature Flag 상태를 변경하지 못했습니다.");
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
      await fetchFlags();
      await queryClient.invalidateQueries({ queryKey: FEATURE_FLAGS_QUERY_KEY });
      alert("Feature Flag를 등록했습니다.");
      closeCreator();
    } catch (error) {
      alert("Feature Flag를 생성하지 못했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  useSetHeader({ title: "Feature Flag 관리" });

  return (
    <AdminShell>
      <AdminPage>
        <AdminHero>
          <AdminHeroMetricGrid>
            <AdminMiniStat>
              <AdminMiniStatLabel>전체 Flag</AdminMiniStatLabel>
              <AdminMiniStatValue>{flags.length}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>활성화</AdminMiniStatLabel>
              <AdminMiniStatValue>{activeCount}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>비활성화</AdminMiniStatLabel>
              <AdminMiniStatValue>{inactiveCount}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>검색 결과</AdminMiniStatLabel>
              <AdminMiniStatValue>{filteredFlags.length}</AdminMiniStatValue>
            </AdminMiniStat>
          </AdminHeroMetricGrid>
        </AdminHero>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardEyebrow>Flag Inventory</AdminCardEyebrow>
              <AdminCardTitle>Feature Flag 목록</AdminCardTitle>
              <AdminCardDescription>
                검색으로 빠르게 찾고, 목록에서 바로 상태를 바꿀 수 있습니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            <HeaderActions>
              <SearchField>
                <Search size={16} />
                <AdminInput
                  type="text"
                  placeholder="Flag 명 검색"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </SearchField>

              <AdminButton type="button" onClick={openCreator}>
                <PlusCircle size={16} />
                Feature Flag 만들기
              </AdminButton>
            </HeaderActions>
          </AdminCardHeader>

          {loading ? (
            <LoadingState>Feature Flag 목록을 불러오는 중입니다...</LoadingState>
          ) : filteredFlags.length === 0 ? (
            <AdminEmptyState>
              <AdminEmptyTitle>표시할 Feature Flag가 없습니다.</AdminEmptyTitle>
              <AdminEmptyDescription>
                검색어를 비우거나 새 Feature Flag를 추가해 주세요.
              </AdminEmptyDescription>
              <AdminButton type="button" onClick={openCreator}>
                <PlusCircle size={16} />
                Feature Flag 만들기
              </AdminButton>
            </AdminEmptyState>
          ) : (
            <>
              <DesktopTable>
                <thead>
                  <tr>
                    <Th>키</Th>
                    <Th>상태</Th>
                    <Th style={{ textAlign: "right" }}>액션</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlags.map((flag) => (
                    <tr key={flag.key}>
                      <Td>
                        <FlagKey>{flag.key}</FlagKey>
                      </Td>
                      <Td>
                        <AdminBadge $tone={flag.flag ? "green" : "slate"}>
                          {flag.flag ? "활성화" : "비활성화"}
                        </AdminBadge>
                      </Td>
                      <Td style={{ textAlign: "right" }}>
                        <InlineActionButton
                          type="button"
                          $tone="secondary"
                          onClick={() => handleToggle(flag)}
                          disabled={pendingKey === flag.key}
                        >
                          {flag.flag ? (
                            <ToggleRight size={16} />
                          ) : (
                            <ToggleLeft size={16} />
                          )}
                          {pendingKey === flag.key ? "변경 중..." : "상태 전환"}
                        </InlineActionButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DesktopTable>

              <MobileList>
                {filteredFlags.map((flag) => (
                  <MobileItem key={flag.key}>
                    <MobileItemTop>
                      <FlagKey>{flag.key}</FlagKey>
                      <AdminBadge $tone={flag.flag ? "green" : "slate"}>
                        {flag.flag ? "ON" : "OFF"}
                      </AdminBadge>
                    </MobileItemTop>
                    <InlineActionButton
                      type="button"
                      $tone="secondary"
                      $fullWidth
                      onClick={() => handleToggle(flag)}
                      disabled={pendingKey === flag.key}
                    >
                      {flag.flag ? (
                        <ToggleRight size={16} />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                      {pendingKey === flag.key ? "변경 중..." : "상태 전환"}
                    </InlineActionButton>
                  </MobileItem>
                ))}
              </MobileList>
            </>
          )}
        </AdminCard>

        <AdminBottomSheet
          isOpen={isCreatorOpen}
          setIsOpen={(nextOpen) => {
            if (!nextOpen) {
              closeCreator();
            }
          }}
          title="Feature Flag 만들기"
          description="Feature Flag 생성 패널"
        >
          <CreatorHeader>
            <CreatorTitleGroup>
              <AdminBadge $tone="green">새 Feature Flag</AdminBadge>
              <CreatorTitle>Feature Flag 만들기</CreatorTitle>
              <AdminSubtleText>
                이름과 초기 상태를 정한 뒤 바로 추가할 수 있습니다.
              </AdminSubtleText>
            </CreatorTitleGroup>

            <CloseButton type="button" onClick={closeCreator} aria-label="닫기">
              <X size={20} />
            </CloseButton>
          </CreatorHeader>

          <CreatorScrollArea>
            <SelectedSummary>
              <AdminBadge $tone={newFlag.flag ? "green" : "slate"}>
                {newFlag.flag ? "초기값 ON" : "초기값 OFF"}
              </AdminBadge>
              <SelectedSummaryTitle>
                {newFlag.key.trim() || "새 Feature Flag 이름을 입력해 주세요"}
              </SelectedSummaryTitle>
              <AdminSubtleText>
                영문 소문자와 언더스코어 조합으로 입력해 두면 관리하기
                쉽습니다.
              </AdminSubtleText>
            </SelectedSummary>

            <CreateForm onSubmit={handleCreate}>
              <AdminField>
                <AdminLabel htmlFor="feature-flag-key">Flag 키</AdminLabel>
                <AdminInput
                  id="feature-flag-key"
                  type="text"
                  value={newFlag.key}
                  onChange={(e) =>
                    setNewFlag({ ...newFlag, key: e.target.value })
                  }
                  placeholder="예: roommate_recommendation_v2"
                />
                <AdminSubtleText>
                  팀 내 규칙에 맞는 고유한 이름으로 입력해 주세요.
                </AdminSubtleText>
              </AdminField>

              <AdminField>
                <AdminLabel>초기 상태</AdminLabel>
                <AdminChoiceGrid $minWidth="140px">
                  <AdminChoiceCard
                    type="button"
                    $selected={newFlag.flag}
                    onClick={() => setNewFlag({ ...newFlag, flag: true })}
                  >
                    <AdminChoiceTitle>활성화</AdminChoiceTitle>
                    <AdminChoiceDescription>
                      추가 직후 바로 ON 상태로 시작합니다.
                    </AdminChoiceDescription>
                  </AdminChoiceCard>
                  <AdminChoiceCard
                    type="button"
                    $selected={!newFlag.flag}
                    onClick={() => setNewFlag({ ...newFlag, flag: false })}
                  >
                    <AdminChoiceTitle>비활성화</AdminChoiceTitle>
                    <AdminChoiceDescription>
                      배포만 먼저 하고 추후에 켤 수 있습니다.
                    </AdminChoiceDescription>
                  </AdminChoiceCard>
                </AdminChoiceGrid>
              </AdminField>

              <AdminActionRow>
                <AdminButton type="submit" disabled={isCreating}>
                  {isCreating ? "생성 중..." : "Feature Flag 생성"}
                </AdminButton>
                <AdminButton
                  type="button"
                  $tone="secondary"
                  onClick={closeCreator}
                  disabled={isCreating}
                >
                  닫기
                </AdminButton>
              </AdminActionRow>
            </CreateForm>

            <TipsCard>
              <Sparkles size={16} />
              이미 등록된 키는 다시 만들 수 없으니, 팀에서 쓰는 명명 규칙에
              맞춰 생성해 주세요.
            </TipsCard>
          </CreatorScrollArea>
        </AdminBottomSheet>
      </AdminPage>
    </AdminShell>
  );
};

export default FeatureFlagManagePage;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;

  @media (min-width: 960px) {
    width: auto;
    justify-content: flex-end;
  }
`;

const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  color: #64748b;

  @media (min-width: 960px) {
    width: 320px;
  }
`;

const LoadingState = styled.div`
  padding: 32px 12px;
  text-align: center;
  color: #64748b;
  font-size: 0.96rem;
`;

const DesktopTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Th = styled.th`
  padding: 0 0 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
`;

const Td = styled.td`
  padding: 18px 0;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
`;

const FlagKey = styled.strong`
  font-size: 0.96rem;
  font-weight: 800;
  color: #0f172a;
  word-break: break-word;
`;

const InlineActionButton = styled(AdminButton)`
  min-height: 40px;
  padding: 11px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
`;

const MobileList = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const MobileItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
`;

const MobileItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const CreatorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e2e8f0;

  @media (min-width: 768px) {
    padding: 24px 24px 18px;
  }
`;

const CreatorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const CreatorTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.3;
  color: #0f172a;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  flex-shrink: 0;
`;

const CreatorScrollArea = styled.div`
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const SelectedSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  border: 1px solid #dbeafe;
`;

const SelectedSummaryTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
`;

const CreateForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipsCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 20px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.9rem;
  line-height: 1.6;
  font-weight: 600;
`;
