import styled from "styled-components";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useComplaintDetail, useMyComplaints } from "@/queries/complaints";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import TopPopupNotification from "../../components/common/TopPopupNotification.tsx";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { useSetHeader } from "@/hooks/useSetHeader";
import useAIChatStore from "@/stores/useAIChatStore";
import ChatBulButtonImg from "@/assets/ai-chat/챗불이버튼.webp";
import { mixpanelTrack } from "@/utils/mixpanel";
import { AlertCircle, RotateCw, X } from "lucide-react";

const PERIOD_MENUS = ["전체", "최근 1개월", "최근 3개월", "올해"];

const ComplainListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const openChat = useAIChatStore((state) => state.openChat);
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // URL searchParams로부터 상태 도출 (뒤로가기 시 복원)
  const appliedKeyword = searchParams.get("keyword") || "";
  const periodParam = searchParams.get("period");
  const selectedFilterIndex = useMemo(() => {
    const num = Number(periodParam);
    return !isNaN(num) && num >= 0 && num < PERIOD_MENUS.length ? num : 0;
  }, [periodParam]);

  // 검색창 입력 폼 상태 (타이핑용 로컬 state)
  const [searchDraft, setSearchDraft] = useState<string>(appliedKeyword);

  useEffect(() => {
    setSearchDraft(appliedKeyword);
  }, [appliedKeyword]);

  // URL 갱신 헬퍼 함수
  const updateFilters = useCallback(
    (newKeyword: string, newPeriodIdx: number) => {
      const params = new URLSearchParams();
      const trimmed = newKeyword.trim();
      if (trimmed) {
        params.set("keyword", trimmed);
      }
      if (newPeriodIdx !== 0) {
        params.set("period", String(newPeriodIdx));
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  const {
    data: complaints = [],
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useMyComplaints(isLoggedIn);

  // 가장 최근 민원 상세
  const { data: recentComplain = null, isLoading: isRecentLoading } =
    useComplaintDetail(complaints[0]?.id);

  // 검색창 엔터/아이콘 클릭 핸들러
  const handleSearchSubmit = () => {
    updateFilters(searchDraft, selectedFilterIndex);
  };

  // 기간 선택 핸들러
  const handleSelectPeriod = (idx: number | null) => {
    const nextIdx = idx === null ? 0 : idx;
    updateFilters(appliedKeyword, nextIdx);
  };

  // 검색어 해제 핸들러
  const handleClearKeyword = () => {
    setSearchDraft("");
    updateFilters("", selectedFilterIndex);
  };

  // 전체 초기화 핸들러
  const handleResetAll = () => {
    setSearchDraft("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filteredComplaints = useMemo(() => {
    let list = complaints;
    if (appliedKeyword) {
      list = list.filter((complaint) =>
        complaint.title.toLowerCase().includes(appliedKeyword.toLowerCase()),
      );
    }

    if (selectedFilterIndex === 0) {
      return list; // 전체
    }

    const now = new Date();
    const parseSafeDate = (dateString: string) => {
      const safariSafeFormat = dateString.replace(/\./g, "/");
      return new Date(safariSafeFormat);
    };

    if (selectedFilterIndex === 1) {
      // 최근 1개월
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return list.filter((c) => parseSafeDate(c.date) >= oneMonthAgo);
    }

    if (selectedFilterIndex === 2) {
      // 최근 3개월
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return list.filter((c) => parseSafeDate(c.date) >= threeMonthsAgo);
    }

    if (selectedFilterIndex === 3) {
      // 올해
      const currentYear = now.getFullYear();
      return list.filter(
        (c) => parseSafeDate(c.date).getFullYear() === currentYear,
      );
    }

    return list;
  }, [complaints, appliedKeyword, selectedFilterIndex]);

  useEffect(() => {
    const platform = getMobilePlatform();
    if (platform !== "ios_unidorm_app" && platform !== "android_unidorm_app") {
      setNotification({
        title: "민원 처리 상태 알림은 앱에서만 받을 수 있어요",
        message: `스토어에서 유니돔 앱을 설치 후 로그인하세요.`,
      });
    }
  }, []);

  interface NotificationData {
    title: string;
    message: string;
  }

  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  const handleCloseNotification = () => {
    setNotification(null);
  };

  useSetHeader({
    title: "생활원 민원",
  });

  const hasActiveFilters = Boolean(appliedKeyword || selectedFilterIndex !== 0);

  return (
    <ComplainListPageWrapper>
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
        />
      )}

      <TitleContentArea
        description={
          "생활원 민원을 접수할 수 있습니다.\n통합행정실 업무시간 내 처리되며, 담당자 사정에 따라 확인 및 처리가 늦어질 수 있습니다.\n유니돔 앱 관련 문의는 마이페이지의 1대1 문의를 이용해주세요."
        }
      />

      <AIChatBanner
        onClick={() => {
          mixpanelTrack.featureClicked("챗불이", "민원_상단배너");
          openChat();
        }}
      >
        <div className="banner-content">
          <div className="banner-text">
            <span className="banner-title">챗불이에게 먼저 물어보세요!</span>
            <span className="banner-desc">
              간단한 질문은 챗불이가 답해드릴 수 있어요.
              <br />
              여기를 눌러 챗불이가 무엇을 할 수 있는지 알아보세요.
            </span>
          </div>
          <div className="banner-character">
            <img src={ChatBulButtonImg} alt="챗불이" />
          </div>
        </div>
      </AIChatBanner>

      <MainContent>
        {/* 최근 민원 현황: 로딩 중이거나 데이터가 있을 때만 섹션을 표시 */}
        {(isRecentLoading || recentComplain) && (
          <LeftSection>
            <TitleContentArea title={"최근 민원 현황"}>
              {isRecentLoading ? (
                <LoadingSpinner />
              ) : recentComplain ? (
                <Wrapper1
                  onClick={() => {
                    mixpanelTrack.itemClicked(
                      "민원",
                      recentComplain.id,
                      recentComplain.title,
                      "민원_최근현황",
                    );
                    navigate(`/complain/${recentComplain.id}`);
                  }}
                >
                  <StepFlow
                    activeIndex={
                      recentComplain.status === "대기중"
                        ? 0
                        : recentComplain.status === "담당자 배정"
                          ? 1
                          : recentComplain.status === "처리중"
                            ? 2
                            : recentComplain.status === "처리완료"
                              ? 3
                              : recentComplain.status === "반려"
                                ? 4
                                : 0
                    }
                  />
                  <ComplainCard
                    miniView={true}
                    date={recentComplain.createdDate}
                    type={recentComplain.type}
                    dorm={recentComplain.dormType}
                    location={`${recentComplain.building} / ${recentComplain.floor} / ${recentComplain.roomNumber} / ${recentComplain.bedNumber}`}
                    title={recentComplain.title}
                    content={recentComplain.content}
                    incidentDate={recentComplain.incidentDate}
                    incidentTime={recentComplain.incidentTime}
                    specificLocation={recentComplain.specificLocation}
                    studentNumber={recentComplain.studentNumber}
                  />
                </Wrapper1>
              ) : null}
            </TitleContentArea>
          </LeftSection>
        )}

        {/* 민원 목록 */}
        <RightSection>
          <TitleContentArea
            title={"내 민원 목록"}
            description={"내가 작성한 민원만 조회됩니다."}
          >
            <Wrapper2>
              <SearchInput
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onSearch={handleSearchSubmit}
              />

              <ControlsRow>
                <SelectableChipGroup
                  Groups={PERIOD_MENUS}
                  selectedIndex={selectedFilterIndex}
                  onSelect={handleSelectPeriod}
                  backgroundColor={"transparent"}
                  color={"#0A84FF"}
                  borderColor={"#007AFF"}
                />
              </ControlsRow>

              {appliedKeyword && (
                <ActiveTagsContainer>
                  <TagChip>
                    <span>검색어: "{appliedKeyword}"</span>
                    <TagCloseButton
                      type="button"
                      onClick={handleClearKeyword}
                      aria-label="검색어 해제"
                    >
                      <X size={12} />
                    </TagCloseButton>
                  </TagChip>
                  <ResetAllButton type="button" onClick={handleResetAll}>
                    초기화
                  </ResetAllButton>
                </ActiveTagsContainer>
              )}

              {isListLoading ? (
                <LoadingSpinner message="민원 목록을 불러오는 중..." />
              ) : isListError ? (
                <ErrorContainer>
                  <ErrorIconWrapper>
                    <AlertCircle size={28} />
                  </ErrorIconWrapper>
                  <ErrorTitle>민원 목록을 불러오지 못했어요</ErrorTitle>
                  <ErrorDescription>
                    일시적인 서버 오류이거나 네트워크 연결 문제일 수 있어요.
                  </ErrorDescription>
                  <RetryButton
                    type="button"
                    onClick={() => void refetchList()}
                  >
                    <RotateCw size={14} />
                    <span>다시 시도하기</span>
                  </RetryButton>
                </ErrorContainer>
              ) : filteredComplaints.length > 0 ? (
                <ComplainListTable data={filteredComplaints} />
              ) : (
                <EmptyMessage>
                  {hasActiveFilters
                    ? "해당 조건에 일치하는 민원이 없습니다."
                    : "접수하신 민원이 아직 없습니다."}
                  {hasActiveFilters && (
                    <EmptySubAction type="button" onClick={handleResetAll}>
                      검색 조건 초기화하기
                    </EmptySubAction>
                  )}
                </EmptyMessage>
              )}
            </Wrapper2>
          </TitleContentArea>
        </RightSection>
      </MainContent>

      {isLoggedIn && (
        <WriteButton
          onClick={() => {
            mixpanelTrack.complainStarted();
            navigate("/complain/write");
          }}
        >
          ✏️ 민원 작성
        </WriteButton>
      )}
    </ComplainListPageWrapper>
  );
};
export default ComplainListPage;

const ComplainListPageWrapper = styled.div`
  padding: 16px 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  flex: 1;
  align-items: center;

  .description {
    font-size: 14px;
  }
`;

const AIChatBanner = styled.div`
  width: 100%;
  max-width: 1200px;
  background: linear-gradient(135deg, #eef5ff 0%, #f9fbff 100%);
  border-radius: 16px;
  padding: 18px 20px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid rgba(0, 122, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.1);
  }

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .banner-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .banner-title {
    font-size: 15px;
    font-weight: 700;
    color: #1c408c;
  }

  .banner-desc {
    font-size: 12px;
    color: #5570a6;
    word-break: keep-all;
  }

  .banner-character {
    position: relative;
    width: 54px;
    height: 54px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .bubble {
      position: absolute;
      top: -4px;
      right: -4px;
      background: white;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 122, 255, 0.2);
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    max-width: 1200px;
    box-sizing: border-box;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  @media (min-width: 1024px) {
    flex: 1;
    min-width: 300px;
  }
`;

const RightSection = styled.div`
  width: 100%;
  @media (min-width: 1024px) {
    flex: 2;
  }
`;

const Wrapper1 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;
`;

const Wrapper2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActiveTagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 2px 0;
`;

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  background-color: #f2f4f6;
  color: #333d4b;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const TagCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  color: #8b95a1;
  cursor: pointer;

  &:hover {
    color: #191f28;
  }
`;

const ResetAllButton = styled.button`
  border: none;
  background: none;
  padding: 4px 8px;
  color: #8b95a1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #4e5968;
  }
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: calc(96px + var(--safe-area-bottom, 0px));
  right: 20px;
  background-color: #007bff;
  color: #f4f4f4;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1001;
`;

const EmptyMessage = styled.div`
  padding: 36px 16px;
  text-align: center;
  color: #8b95a1;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const EmptySubAction = styled.button`
  border: none;
  background: none;
  color: #3182f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #1b64da;
  }
`;

const ErrorContainer = styled.div`
  padding: 36px 16px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  background-color: #f9fafb;
  border: 1px dashed #e5e8eb;
`;

const ErrorIconWrapper = styled.div`
  color: #f04452;
  margin-bottom: 2px;
`;

const ErrorTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const ErrorDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8b95a1;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background-color: #3182f6;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #1b64da;
  }

  &:active {
    transform: scale(0.97);
  }
`;
