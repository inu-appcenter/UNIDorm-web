import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import { useNavigate } from "react-router-dom";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";

const ComplainListPage = () => {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const data = [
    {
      date: "08.27",
      type: "기물",
      title: "화장실 거울이 깨짐",
      status: "대기",
    },
    {
      date: "08.27",
      type: "기물",
      title: "화장실 거울이 깨짐",
      status: "확인",
    },
  ];
  return (
    <ComplainListPageWrapper>
      <Header title={"생활원 민원"} hasBack={true} backPath={"/home"} />
      <TitleContentArea
        title={"최근 민원 현황"}
        children={
          <Wrapper1
            onClick={() => {
              navigate("/complain/1");
            }}
          >
            <StepFlow activeIndex={1} assignee={"배현준"} />
            <ComplainCard
              miniView={true}
              date="25.08.27"
              type="기물"
              dorm="제 1기숙사"
              studentNumber="B139840"
              phoneNumber="010-8019-2936"
              title="화장실 거울이 깨졌어요."
              content="화장지를 꺼내려고 장을 열었는데 그대로 떨어져 버렸습니다.. 확인 부탁드립니다."
            />
          </Wrapper1>
        }
      />
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
            <SearchInput />
            <ComplainListTable data={data} />
          </Wrapper2>
        }
      />

      {!isLoggedIn && (
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
