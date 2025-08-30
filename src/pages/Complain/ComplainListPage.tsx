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

const ComplainListPage = () => {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<MyComplaint[]>([]);

  const [recentComplain, setRecentComplain] = useState<ComplaintDetail | null>(
    null,
  );

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await getMyComplaints();
        setComplaints(response.data); // API에서 받은 배열을 state에 저장
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      }
    };

    const fetchRecentComplain = async () => {
      try {
        const response = await getComplaintDetail(complaints[0].id);
        console.log(response);
        setRecentComplain(response.data);
      } catch (error) {
        console.error("민원 상세 불러오기 실패:", error);
      }
    };

    if (isLoggedIn) {
      fetchComplaints();
      if (complaints.length > 0) {
        fetchRecentComplain();
      }
    }
  }, [isLoggedIn]);

  return (
    <ComplainListPageWrapper>
      <Header title={"생활원 민원"} hasBack={true} backPath={"/home"} />

      {/* 최근 민원 현황 */}
      {recentComplain && (
        <TitleContentArea
          title={"최근 민원 현황"}
          children={
            <Wrapper1
              onClick={() => navigate(`/complain/${recentComplain.id}`)}
            >
              <StepFlow activeIndex={1} assignee={"배현준"} />
              <ComplainCard
                miniView={true}
                date={recentComplain.createdDate}
                type={recentComplain.type}
                dorm={recentComplain.dormType}
                studentNumber={recentComplain.caseNumber}
                phoneNumber={recentComplain.contact}
                title={recentComplain.title}
                content={recentComplain.content}
              />
            </Wrapper1>
          }
        />
      )}

      {/* 민원 목록 */}
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
            <SearchInput />
            {complaints ? (
              <ComplainListTable data={complaints} />
            ) : (
              <EmptyMessage>조회된 민원이 없습니다.</EmptyMessage>
            )}
          </Wrapper2>
        }
      />

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
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
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
