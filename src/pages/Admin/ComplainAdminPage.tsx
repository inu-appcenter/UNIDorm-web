import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { AdminComplaint } from "../../types/complain.ts";
import { getAllComplaints } from "../../apis/complainAdmin.ts";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);

  const menus = ["최근 3개월", "2025"];
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

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
            <FilterGroup>
              <FilterButton>필터</FilterButton>
              <SelectableChipGroup
                Groups={menus}
                selectedIndex={selectedMenuIndex}
                onSelect={setSelectedMenuIndex}
              />
            </FilterGroup>

            {complaints ? (
              <ComplainListTable data={complaints} isAdmin={true} />
            ) : (
              <EmptyMessage>조회된 민원이 없습니다.</EmptyMessage>
            )}
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
  gap: 12px;
  width: 100%;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

const FilterButton = styled.button`
  display: flex;
  padding: 4px 16px;
  justify-content: center;
  align-items: center;
  gap: 5px;
  min-width: fit-content;
  background: none;

  border-radius: 8px;
  border: 1px solid var(--6, #8e8e93);

  color: var(--6, #8e8e93);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
  letter-spacing: 0.38px;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
`;
