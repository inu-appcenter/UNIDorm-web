import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { AdminComplaint } from "../../types/complain.ts";
import { getAllComplaints } from "../../apis/complainAdmin.ts";

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);

  // 관리자 전체 민원 조회
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await getAllComplaints();
        setComplaints(response.data);
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      }
    };

    if (isLoggedIn) {
      fetchComplaints();
    }
  }, [isLoggedIn]);

  return (
    <ComplainListPageWrapper>
      <Header
        title={"생활원 민원 관리자 페이지"}
        hasBack={true}
        backPath={"/admin"}
      />

      {/* 민원 목록 */}
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
            <SearchInput />
            <ComplainListTable data={complaints} isAdmin={true} />
          </Wrapper2>
        }
      />
    </ComplainListPageWrapper>
  );
};
export default ComplainAdminPage;

const ComplainListPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
`;

const Wrapper2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;
