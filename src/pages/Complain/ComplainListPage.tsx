import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import { useNavigate } from "react-router-dom";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useMemo, useState } from "react";
import { ComplaintDetail, MyComplaint } from "../../types/complain.ts";
import { getComplaintDetail, getMyComplaints } from "../../apis/complain.ts";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";

const ComplainListPage = () => {
  const navigate = useNavigate();
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

    if (selectedFilterIndex === 0) {
      list = list.filter((complaint) => {
        const complaintDate = new Date(complaint.date);
        return complaintDate >= threeMonthsAgo;
      });
    } else if (selectedFilterIndex === 1) {
      list = list.filter((complaint) => {
        const year = new Date(complaint.date).getFullYear();
        return year === 2025;
      });
    }

    return list;
  }, [searchTerm, complaints, selectedFilterIndex]);

  return (
    <ComplainListPageWrapper>
      <Header title={"생활원 민원"} hasBack={true} backPath={"/home"} />

      <span className="description">
        인천대학교 생활원 민원을 작성할 수 있습니다.
        <br />
        유니돔 앱 관련 문의는 마이페이지의 1대1 문의를 이용해주세요.
      </span>
      <MainContent>
        {/* 최근 민원 현황: 로딩 중이거나 데이터가 있을 때만 섹션을 표시 */}
        {(isRecentLoading || recentComplain) && (
          <LeftSection>
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
                  />
                </Wrapper1>
              ) : null}
            </TitleContentArea>
          </LeftSection>
        )}

        {/* 민원 목록 */}
        <RightSection>
          <TitleContentArea title={"민원 목록"}>
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
                <EmptyMessage>조회된 민원이 없습니다.</EmptyMessage>
              )}
            </Wrapper2>
          </TitleContentArea>
        </RightSection>
      </MainContent>

      {isLoggedIn && (
        <WriteButton onClick={() => navigate("/complain/write")}>
          ✏️ 민원 접수
        </WriteButton>
      )}
    </ComplainListPageWrapper>
  );
};
export default ComplainListPage;

const ComplainListPageWrapper = styled.div`
  padding: 90px 16px;
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
