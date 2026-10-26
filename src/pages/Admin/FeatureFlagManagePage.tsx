import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  createFeatureFlag,
  FeatureFlag,
  updateFeatureFlag,
} from "@/apis/featureFlag";
import { useAdminFeatureFlags } from "@/queries/admin";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";

const EMPTY_NEW_FLAG: FeatureFlag = { key: "", flag: false };
const PAGE_SIZE = 10;

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type SortOption = "KEY_ASC" | "KEY_DESC" | "ACTIVE_FIRST" | "INACTIVE_FIRST";

export default function FeatureFlagManagePage() {
  const { data: rawFlags = [], isLoading: loading, refetch } = useAdminFeatureFlags();

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("KEY_ASC");
  const [currentPage, setCurrentPage] = useState(1);

  const [newFlag, setNewFlag] = useState<FeatureFlag>(EMPTY_NEW_FLAG);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useSetHeader({ title: "Feature Flag 관리" });

  const activeCount = useMemo(
    () => rawFlags.filter((f) => f.flag).length,
    [rawFlags],
  );
  const inactiveCount = rawFlags.length - activeCount;

  const animatedTotal = useCountUp(rawFlags.length);
  const animatedActive = useCountUp(activeCount);
  const animatedInactive = useCountUp(inactiveCount);

  // 검색, 필터, 정렬 적용
  const processedFlags = useMemo(() => {
    let result = [...rawFlags];

    // 1. 검색
    const query = searchValue.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => item.key.toLowerCase().includes(query));
    }

    // 2. 상태 필터
    if (statusFilter === "ACTIVE") {
      result = result.filter((item) => item.flag);
    } else if (statusFilter === "INACTIVE") {
      result = result.filter((item) => !item.flag);
    }

    // 3. 정렬
    result.sort((a, b) => {
      if (sortOption === "KEY_ASC") return a.key.localeCompare(b.key);
      if (sortOption === "KEY_DESC") return b.key.localeCompare(a.key);
      if (sortOption === "ACTIVE_FIRST") {
        if (a.flag === b.flag) return a.key.localeCompare(b.key);
        return a.flag ? -1 : 1;
      }
      if (sortOption === "INACTIVE_FIRST") {
        if (a.flag === b.flag) return a.key.localeCompare(b.key);
        return !a.flag ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [rawFlags, searchValue, statusFilter, sortOption]);

  // 슬라이딩 페이지네이션
  const totalPages = Math.max(1, Math.ceil(processedFlags.length / PAGE_SIZE));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedFlags = useMemo(() => {
    const startIndex = (currentSafePage - 1) * PAGE_SIZE;
    return processedFlags.slice(startIndex, startIndex + PAGE_SIZE);
  }, [processedFlags, currentSafePage]);

  // 페이지 슬라이딩 윈도우 (최대 5개 노출하여 모바일 가로 스크롤 방지)
  const visiblePages = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, currentSafePage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentSafePage, totalPages]);

  const handleToggle = async (item: FeatureFlag) => {
    try {
      setPendingKey(item.key);
      const updated = { ...item, flag: !item.flag };
      await updateFeatureFlag(updated);
      refetch();
    } catch (error) {
      alert("Feature Flag 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPendingKey(null);
    }
  };

  const openCreator = () => {
    setNewFlag(EMPTY_NEW_FLAG);
    setIsCreatorOpen(true);
  };

  const closeCreator = () => {
    if (isCreating) return;
    setIsCreatorOpen(false);
    setNewFlag(EMPTY_NEW_FLAG);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedKey = newFlag.key.trim();
    if (!normalizedKey) {
      alert("Feature Flag 이름을 입력해 주세요.");
      return;
    }

    if (rawFlags.some((f) => f.key.toLowerCase() === normalizedKey.toLowerCase())) {
      alert("이미 등록된 Feature Flag 키입니다.");
      return;
    }

    try {
      setIsCreating(true);
      await createFeatureFlag({ ...newFlag, key: normalizedKey });
      alert("새 Feature Flag를 등록했습니다.");
      closeCreator();
      refetch();
    } catch (error) {
      alert("Feature Flag를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageRoot>
      <ContentContainer>
        {/* 상단 인터랙티브 3대 통계 필터 칩 */}
        <StatsGrid>
          <StatCard
            type="button"
            $isSelected={statusFilter === "ALL"}
            onClick={() => {
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
          >
            <StatLabel>전체 플래그</StatLabel>
            <StatValue>{animatedTotal}개</StatValue>
            <StatSubtext>등록된 모든 기능 플래그</StatSubtext>
          </StatCard>

          <StatCard
            type="button"
            $isSelected={statusFilter === "ACTIVE"}
            onClick={() => {
              setStatusFilter("ACTIVE");
              setCurrentPage(1);
            }}
          >
            <StatLabel>활성화 (ON)</StatLabel>
            <StatValue $tone="green">{animatedActive}개</StatValue>
            <StatSubtext>모든 사용자에게 노출 중</StatSubtext>
          </StatCard>

          <StatCard
            type="button"
            $isSelected={statusFilter === "INACTIVE"}
            onClick={() => {
              setStatusFilter("INACTIVE");
              setCurrentPage(1);
            }}
          >
            <StatLabel>비활성화 (OFF)</StatLabel>
            <StatValue $tone="muted">{animatedInactive}개</StatValue>
            <StatSubtext>현재 잠겨 있는 기능</StatSubtext>
          </StatCard>
        </StatsGrid>

        {/* 메인 리스트 카드 */}
        <MainCard>
          {/* 검색 및 제어 바 */}
          <ToolbarArea>
            <SearchWrapper>
              <SearchInput
                type="text"
                placeholder="플래그 키 검색 (예: roommate_recommendation)..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchValue && (
                <ClearButton
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    setCurrentPage(1);
                  }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </ClearButton>
              )}
            </SearchWrapper>

            <ControlsGroup>
              <SelectBox
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
              >
                <option value="KEY_ASC">이름 오름차순 (A-Z)</option>
                <option value="KEY_DESC">이름 내림차순 (Z-A)</option>
                <option value="ACTIVE_FIRST">활성화(ON) 우선</option>
                <option value="INACTIVE_FIRST">비활성화(OFF) 우선</option>
              </SelectBox>

              <DesktopCreateButton type="button" onClick={openCreator}>
                새 플래그 만들기
              </DesktopCreateButton>
            </ControlsGroup>
          </ToolbarArea>

          {/* 목록 본문 */}
          {loading ? (
            <LoadingContainer>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </LoadingContainer>
          ) : processedFlags.length === 0 ? (
            <EmptyState>
              <EmptyTitle>조건에 맞는 Feature Flag가 없어요</EmptyTitle>
              <EmptyDescription>
                {searchValue
                  ? "검색어를 확인하거나 필터 조건을 변경해 보세요."
                  : "첫 번째 Feature Flag를 등록해 보세요."}
              </EmptyDescription>
              <PrimaryActionButton type="button" onClick={openCreator}>
                새 Feature Flag 만들기
              </PrimaryActionButton>
            </EmptyState>
          ) : (
            <>
              {/* PC 전용 와이드 데이터 테이블 */}
              <DesktopTableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ width: "40%" }}>플래그 고유 키</Th>
                      <Th style={{ width: "25%" }}>현재 상태</Th>
                      <Th style={{ width: "20%" }}>동작 안내</Th>
                      <Th style={{ width: "15%", textAlign: "right" }}>스위치 토글</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFlags.map((item) => (
                      <tr key={item.key}>
                        <Td>
                          <FlagKeyText>{item.key}</FlagKeyText>
                        </Td>
                        <Td>
                          <StatusBadge $active={item.flag}>
                            {item.flag ? "활성화 (ON)" : "비활성화 (OFF)"}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <HintText>
                            {item.flag
                              ? "기능 켜짐"
                              : "기능 꺼짐"}
                          </HintText>
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          <SwitchButton
                            type="button"
                            role="switch"
                            aria-checked={item.flag}
                            $isOn={item.flag}
                            disabled={pendingKey === item.key}
                            onClick={() => handleToggle(item)}
                            aria-label={`${item.key} 상태 전환`}
                          >
                            <SwitchHandle $isOn={item.flag} />
                          </SwitchButton>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </DesktopTableWrapper>

              {/* 모바일 전용 ListRow 카드 */}
              <MobileListWrapper>
                {paginatedFlags.map((item) => (
                  <MobileRow key={item.key}>
                    <MobileRowInfo>
                      <FlagKeyText>{item.key}</FlagKeyText>
                      <MobileMetaRow>
                        <StatusBadge $active={item.flag}>
                          {item.flag ? "활성화 (ON)" : "비활성화 (OFF)"}
                        </StatusBadge>
                        <HintText>
                          {item.flag ? "모든 사용자 적용 중" : "비활성화 상태"}
                        </HintText>
                      </MobileMetaRow>
                    </MobileRowInfo>

                    <SwitchButton
                      type="button"
                      role="switch"
                      aria-checked={item.flag}
                      $isOn={item.flag}
                      disabled={pendingKey === item.key}
                      onClick={() => handleToggle(item)}
                      aria-label={`${item.key} 상태 전환`}
                    >
                      <SwitchHandle $isOn={item.flag} />
                    </SwitchButton>
                  </MobileRow>
                ))}
              </MobileListWrapper>

              {/* 슬라이딩 윈도우 페이지네이션 */}
              {totalPages > 1 && (
                <PaginationContainer>
                  <PageNavButton
                    type="button"
                    disabled={currentSafePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="이전 페이지"
                  >
                    이전
                  </PageNavButton>

                  <PageNumbersWrapper>
                    {visiblePages.map((pageNum) => (
                      <PageNumberButton
                        key={pageNum}
                        type="button"
                        $isActive={pageNum === currentSafePage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageNumberButton>
                    ))}
                  </PageNumbersWrapper>

                  <PageNavButton
                    type="button"
                    disabled={currentSafePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="다음 페이지"
                  >
                    다음
                  </PageNavButton>
                </PaginationContainer>
              )}
            </>
          )}
        </MainCard>
      </ContentContainer>

      {/* 모바일 하단 고정 CTA */}
      <MobileFixedCTA>
        <MobileCTAButton type="button" onClick={openCreator}>
          새 Feature Flag 만들기
        </MobileCTAButton>
      </MobileFixedCTA>

      {/* 신규 등록 모달 */}
      {isCreatorOpen && (
        <ModalOverlay onClick={closeCreator}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitleGroup>
                <ModalTitle>새 Feature Flag 만들기</ModalTitle>
                <ModalSubtitle>
                  새로운 기능의 런타임 제어 키와 초기 활성화 상태를 지정해 주세요.
                </ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={closeCreator} aria-label="닫기">
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleCreate}>
              <FormGroup>
                <FieldLabel htmlFor="flag-key">Flag 고유 키</FieldLabel>
                <TextInput
                  id="flag-key"
                  type="text"
                  placeholder="예: roommate_recommendation_v2"
                  value={newFlag.key}
                  onChange={(e) =>
                    setNewFlag((prev) => ({ ...prev, key: e.target.value }))
                  }
                  required
                />
                <FieldCaption>
                  영문 소문자, 숫자, 언더스코어(_) 조합으로 식별하기 쉽게 입력해 주세요.
                </FieldCaption>
              </FormGroup>

              <FormGroup>
                <FieldLabel>초기 활성화 상태</FieldLabel>
                <ChoiceGrid>
                  <ChoiceCard
                    type="button"
                    $isSelected={newFlag.flag}
                    onClick={() => setNewFlag((prev) => ({ ...prev, flag: true }))}
                  >
                    <ChoiceTitle>활성화 (ON)</ChoiceTitle>
                    <ChoiceDescription>
                      등록 시 기능을 켭니다.
                    </ChoiceDescription>
                  </ChoiceCard>

                  <ChoiceCard
                    type="button"
                    $isSelected={!newFlag.flag}
                    onClick={() => setNewFlag((prev) => ({ ...prev, flag: false }))}
                  >
                    <ChoiceTitle>비활성화 (OFF)</ChoiceTitle>
                    <ChoiceDescription>
                      기능을 끈 상태로 등록합니다.
                    </ChoiceDescription>
                  </ChoiceCard>
                </ChoiceGrid>
              </FormGroup>

              <ModalActionGroup>
                <SecondaryButton
                  type="button"
                  onClick={closeCreator}
                  disabled={isCreating}
                >
                  취소
                </SecondaryButton>
                <PrimarySubmitButton type="submit" disabled={isCreating}>
                  {isCreating ? "등록하고 있어요..." : "Feature Flag 등록하기"}
                </PrimarySubmitButton>
              </ModalActionGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 16px 20px calc(90px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    padding: 24px 32px 60px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* 3대 통계 필터 카드 */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const StatCard = styled.button<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: #ffffff;
  border-radius: 18px;
  padding: 16px 18px;
  border: 1.5px solid ${({ $isSelected }) => ($isSelected ? "#3182f6" : "transparent")};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    padding: 12px 10px;
    border-radius: 14px;
  }
`;

const StatLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: #4e5968;
`;

const StatValue = styled.span<{ $tone?: "green" | "muted" }>`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === "green" ? "#04b05c" : $tone === "muted" ? "#8b95a1" : "#191f28"};
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 1.15rem;
  }
`;

const StatSubtext = styled.span`
  font-size: 0.74rem;
  color: #8b95a1;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

/* 메인 카드 */
const MainCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    padding: 24px;
  }
`;

const ToolbarArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 36px 0 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease-out;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #8b95a1;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 4px;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SelectBox = styled.select`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.88rem;
  color: #191f28;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease-out;

  &:focus {
    border-color: #3182f6;
  }
`;

const DesktopCreateButton = styled.button`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    background: #3182f6;
    color: #ffffff;
    font-size: 0.92rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease-out;

    &:hover {
      background: #1b64da;
    }

    &:active {
      transform: scale(0.98);
    }
  }
`;

/* PC 테이블 */
const DesktopTableWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 12px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #8b95a1;
  border-bottom: 1px solid #e5e8eb;
`;

const Td = styled.td`
  padding: 16px 14px;
  border-bottom: 1px solid #f2f4f6;
  font-size: 0.92rem;
  vertical-align: middle;
`;

/* 모바일 ListRow */
const MobileListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #f2f4f6;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 4px;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const MobileRowInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const MobileMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FlagKeyText = styled.strong`
  font-family: monospace;
  font-size: 0.98rem;
  font-weight: 700;
  color: #191f28;
  word-break: break-all;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: ${({ $active }) => ($active ? "#e6f8ef" : "#f2f4f6")};
  color: ${({ $active }) => ($active ? "#04b05c" : "#6b7684")};
`;

const HintText = styled.span`
  font-size: 0.82rem;
  color: #8b95a1;
`;

/* 모던 슬라이딩 토글 스위치 */
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

/* 페이지네이션 (슬라이딩 윈도우) */
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;
  overflow-x: hidden;
`;

const PageNumbersWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageNavButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4e5968;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f9fafb;
    color: #191f28;
  }
`;

const PageNumberButton = styled.button<{ $isActive: boolean }>`
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $isActive }) => ($isActive ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isActive }) => ($isActive ? "#3182f6" : "#ffffff")};
  color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#4e5968")};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #3182f6;
    color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#3182f6")};
  }
`;

/* 상태 UI */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
`;

const SkeletonRow = styled.div`
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f2f4f6 25%, #e5e8eb 50%, #f2f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 16px;
  text-align: center;
`;

const EmptyTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.88rem;
  color: #8b95a1;
  margin: 0 0 16px;
`;

const PrimaryActionButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }
`;

/* 모바일 하단 고정 CTA */
const MobileFixedCTA = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: linear-gradient(to top, #ffffff 70%, rgba(255, 255, 255, 0));
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

/* 모달 컴포넌트 */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f2f4f6;
`;

const ModalTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModalTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.82rem;
  color: #8b95a1;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #f2f4f6;
  color: #6b7684;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.86rem;
  font-weight: 700;
  color: #333d4b;
`;

const TextInput = styled.input`
  height: 46px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const FieldCaption = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ChoiceCard = styled.button<{ $isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid ${({ $isSelected }) => ($isSelected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isSelected }) => ($isSelected ? "#f2f8ff" : "#ffffff")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

const ChoiceTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #191f28;
`;

const ChoiceDescription = styled.span`
  font-size: 0.76rem;
  color: #6b7684;
`;

const ModalActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const PrimarySubmitButton = styled.button`
  flex: 2;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;
