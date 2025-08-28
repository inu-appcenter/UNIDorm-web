import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import StepFlow from "../../components/complain/StepFlow.tsx";
import ComplainCard from "../../components/complain/ComplainCard.tsx";
import ComplainAnswerCard from "../../components/complain/ComplainAnswerCard.tsx";

const ComplainDetailPage = () => {
  return (
    <ComplainListPageWrapper>
      <Header title={"민원 상세"} hasBack={true} />
      <StepFlow activeIndex={1} assignee={"배현준"} />
      <ComplainCard
        date="25.08.27"
        type="기물"
        dorm="제 1기숙사"
        studentNumber="B139840"
        phoneNumber="010-8019-2936"
        title="화장실 거울이 깨졌어요."
        content="화장지를 꺼내려고 장을 열었는데 그대로 떨어져 버렸습니다.. 확인 부탁드립니다."
      />
      <ComplainAnswerCard
        date={"25.08.27"}
        type="답변"
        managerName="배현준"
        title={"답변 드립니다."}
        content={
          "담당자에게 전달 완료 했습니다. 28일 5시 내로 방문 예정입니다."
        }
      />
    </ComplainListPageWrapper>
  );
};

export default ComplainDetailPage;

const ComplainListPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;
