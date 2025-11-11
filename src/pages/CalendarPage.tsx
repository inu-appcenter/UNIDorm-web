import styled from "styled-components";
import Header from "../components/common/Header/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import Calendar from "../components/calendar/Calendar.tsx";

const CalendarPage = () => (
  <CalendarPageWrapper>
    <Header title={"생활원 일정"} hasBack={true} />
    <TitleContentArea
      title={""}
      description={"인천대학교 생활원 각종 행사 일정입니다."}
      children={<Calendar />}
    />
  </CalendarPageWrapper>
);

export default CalendarPage;

const CalendarPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 80px 16px;
  box-sizing: border-box;
  //
  //width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;
