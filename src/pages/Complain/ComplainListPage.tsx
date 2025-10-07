import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import { useNavigate } from "react-router-dom";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
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

  // 🔽 각 데이터 로딩 상태를 관리합니다.
  const [isListLoading, setIsListLoading] = useState<boolean>(false);
  const [isRecentLoading, setIsRecentLoading] = useState<boolean>(false);

  const filter = ["최근 3개월", "2025"];
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  // 1. 민원 목록 불러오기
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsListLoading(true); // 목록 로딩 시작
      try {
        const response = await getMyComplaints();
        setComplaints(response.data);
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      } finally {
        setIsListLoading(false); // 목록 로딩 완료
      }
    };

    if (isLoggedIn) {
      fetchComplaints();
    }
  }, [isLoggedIn]);

  // 2. 가장 최근 민원 상세 불러오기
  useEffect(() => {
    const fetchRecentComplain = async () => {
      setIsRecentLoading(true); // 최근 민원 로딩 시작
      try {
        const response = await getComplaintDetail(complaints[0].id);
        setRecentComplain(response.data);
      } catch (error) {
        console.error("민원 상세 불러오기 실패:", error);
      } finally {
        setIsRecentLoading(false); // 최근 민원 로딩 완료
      }
    };

    if (complaints.length > 0) {
      fetchRecentComplain();
    } else {
      setRecentComplain(null); // 민원 목록이 비었을 때 최근 민원도 초기화
    }
  }, [complaints]);

  return (
    <ComplainListPageWrapper>
      <Header title={"생활원 민원"} hasBack={true} backPath={"/home"} />

      {/* 최근 민원 현황: 로딩 중이거나 데이터가 있을 때만 섹션을 표시 */}
      {(isRecentLoading || recentComplain) && (
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
                          : 0
                }
              />
              <ComplainCard
                miniView={true}
                date={recentComplain.createdDate}
                type={recentComplain.type}
                dorm={recentComplain.dormType}
                location={`${recentComplain.building} ${recentComplain.roomNumber} ${recentComplain.bedNumber}`}
                title={recentComplain.title}
                content={recentComplain.content}
              />
            </Wrapper1>
          ) : null}
        </TitleContentArea>
      )}

      {/* 민원 목록 */}
      <TitleContentArea title={"민원 목록"}>
        <Wrapper2>
          <SearchInput />
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
          ) : complaints.length > 0 ? (
            <ComplainListTable data={complaints} />
          ) : (
            <EmptyMessage>조회된 민원이 없습니다.</EmptyMessage>
          )}
        </Wrapper2>
      </TitleContentArea>

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
