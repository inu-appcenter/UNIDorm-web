import styled from "styled-components";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import { useNavigate } from "react-router-dom";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useMemo, useState } from "react";
import { ComplaintDetail, MyComplaint } from "@/types/complain";
import { getComplaintDetail, getMyComplaints } from "@/apis/complain";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import TopPopupNotification from "../../components/common/TopPopupNotification.tsx";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { useSetHeader } from "@/hooks/useSetHeader";
import useAIChatStore from "@/stores/useAIChatStore";
import ChatBulButtonImg from "@/assets/ai-chat/챗불이버튼.webp";
import { useSetAIChat } from "@/hooks/useSetAIChat";

const ComplainListPage = () => {
  useSetAIChat({ isVisible: true, shouldAnimate: false });
  const navigate = useNavigate();
  const openChat = useAIChatStore((state) => state.openChat);
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<MyComplaint[]>([]);
  const [recentComplain, setRecentComplain] = useState<ComplaintDetail | null>(
    null,
  );

  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [isRecentLoading, setIsRecentLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filter = ["최근 3개월", "2025"];
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  // 1. 민원 목록 불러오기
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsListLoading(true);
      try {
        const response = await getMyComplaints();
        console.log("민원 목록 불러오기 성공", response);
        setComplaints(response.data);
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      } finally {
        setIsListLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchComplaints();
    }
  }, [isLoggedIn]);

  // 2. 가장 최근 민원 상세 불러오기
  useEffect(() => {
    const fetchRecentComplain = async () => {
      if (complaints.length === 0) {
        setRecentComplain(null);
        return;
      }

      setIsRecentLoading(true);
      try {
        const response = await getComplaintDetail(complaints[0].id);
        setRecentComplain(response.data);
      } catch (error) {
        console.error("민원 상세 불러오기 실패:", error);
        setRecentComplain(null);
      } finally {
        setIsRecentLoading(false);
      }
    };

    fetchRecentComplain();
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    let list = complaints;
    if (searchTerm) {
      list = list.filter((complaint) =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    /**
     * ❗ 아이폰(Safari) 호환성을 위한 날짜 파싱 헬퍼 함수
     * '2025.10.23' 형식을 '2025/10/23' 형식으로 변경합니다.
     */
    const parseSafeDate = (dateString: string) => {
      // 🔽 수정된 부분: 모든 점(.)을 슬래시(/)로 변경 (g: global)
      const safariSafeFormat = dateString.replace(/\./g, "/");
      return new Date(safariSafeFormat);
    };

    if (selectedFilterIndex === 0) {
      list = list.filter((complaint) => {
        // 🔽 수정된 헬퍼 함수 사용
        const complaintDate = parseSafeDate(complaint.date);
        return complaintDate >= threeMonthsAgo;
      });
    } else if (selectedFilterIndex === 1) {
      list = list.filter((complaint) => {
        // 🔽 수정된 헬퍼 함수 사용
        const complaintDate = parseSafeDate(complaint.date);
        const year = complaintDate.getFullYear();
        return year === 2025;
      });
    }

    return list;
  }, [searchTerm, complaints, selectedFilterIndex]);

  useEffect(() => {
    const platform = getMobilePlatform();
    if (platform !== "ios_webview" && platform !== "android_webview") {
      setNotification({
        title: "민원 처리 상태 알림은 앱에서만 받을 수 있어요",
        message: `스토어에서 유니돔 앱을 설치 후 로그인하세요.`,
      });
    }
  }, []);

  // 알림에 표시할 데이터의 타입 (예시)
  interface NotificationData {
    title: string;
    message: string;
  }

  // 1. 알림 데이터를 관리할 state.
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  // 3. 알림이 닫힐 때 호출될 함수 (onClose prop으로 전달)
  const handleCloseNotification = () => {
    // 1. UI에서 즉시 숨김
    setNotification(null);
  };

  useSetHeader({
    title: "생활원 민원",
  });

  return (
    <ComplainListPageWrapper>
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          // (선택 사항) 앱 아이콘이나 이름을 바꿀 수 있습니다.
          // appName="내 앱"
          // appIcon="🚀"
        />
      )}

      <TitleContentArea
        description={
          "생활원 민원을 접수할 수 있습니다.\n통합행정실 근무시간 내 처리되며, 담당자 사정에 따라 확인 및 처리가 늦어질 수 있습니다."
        }
      />

      <AIChatBanner onClick={openChat}>
        <div className="banner-content">
          <div className="banner-text">
            <span className="banner-title">챗불이에게 먼저 물어보세요!</span>
            <span className="banner-desc">
              기숙사 생활 수칙부터 행정 절차까지 바로 답변해드려요.
            </span>
          </div>
          <div className="banner-character">
            <img src={ChatBulButtonImg} alt="챗불이" />
          </div>
        </div>
      </AIChatBanner>

      {/*<span className="description">*/}
      {/*  인천대학교 생활원 민원을 작성할 수 있습니다.*/}
      {/*  <br />*/}
      {/*  유니돔 앱 관련 문의는 마이페이지의 1대1 문의를 이용해주세요.*/}
      {/*</span>*/}
      <MainContent>
        {/* 최근 민원 현황: 로딩 중이거나 데이터가 있을 때만 섹션을 표시 */}
        {(isRecentLoading || recentComplain) && (
          <LeftSection>
            <TitleContentArea
              description={
                "인천대학교 생활원 민원을 작성할 수 있습니다.\n유니돔 앱 관련 문의는 마이페이지의 1대1 문의를 이용해주세요."
              }
            />
            <TitleContentArea title={"최근 민원 현황"}>
              {isRecentLoading ? (
                <LoadingSpinner />
              ) : recentComplain ? (
                <Wrapper1
                  onClick={() => navigate(`/complain/${recentComplain.id}`)}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SelectableChipGroup
                Groups={filter}
                selectedIndex={selectedFilterIndex}
                onSelect={setSelectedFilterIndex}
                backgroundColor={"transparent"}
                color={"#0A84FF"}
                borderColor={"#007AFF"}
              />
              {isListLoading ? (
                <LoadingSpinner message="민원 목록을 불러오는 중..." />
              ) : filteredComplaints.length > 0 ? (
                <ComplainListTable data={filteredComplaints} />
              ) : (
                <EmptyMessage>
                  해당 기간에 접수하신 민원이 없습니다.
                </EmptyMessage>
              )}
            </Wrapper2>
          </TitleContentArea>
        </RightSection>
      </MainContent>

      {isLoggedIn && (
        <WriteButton onClick={() => navigate("/complain/write")}>
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
  background-color: white;
  flex: 1;
  align-items: center; // 🖥️ PC 레이아웃을 위해 중앙 정렬 추가

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

// 🔽 추가된 스타일: 메인 콘텐츠 레이아웃 래퍼
const MainContent = styled.div`
  display: flex;
  flex-direction: column; // 모바일 기본: 세로 배치
  gap: 32px;
  flex: 1;
  width: 100%;

  /* PC 화면 (1024px 이상)에서 가로 배치로 변경 */
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start; /* 상단 정렬 */
    max-width: 1200px;
    //padding: 32px;
    box-sizing: border-box;
  }
`;

// 🔽 추가된 스타일: 좌측 섹션 (최근 민원 현황)
const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  @media (min-width: 1024px) {
    flex: 1; /* 너비 비율 1 */
    min-width: 300px; /* 최소 너비 지정 */
  }
`;

// 🔽 추가된 스타일: 우측 섹션 (민원 목록)
const RightSection = styled.div`
  width: 100%;
  @media (min-width: 1024px) {
    flex: 2; /* 너비 비율 2 (왼쪽보다 2배 크게) */
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
  gap: 8px;
  width: 100%;
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 20px;
  background-color: #007bff;
  color: #f4f4f4;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
`;
