import styled from "styled-components";
import Header from "../components/common/Header.tsx";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import FullCalendar from "../components/calendar/FullCalendar.tsx";

const CalendarPage = () => (
  <CalendarPageWrapper>
    <Header title={"캘린더 이벤트"} hasBack={true} />
    <TitleContentArea
      title={"캘린더 이벤트"}
      description={"인천대학교 생활원에서 알려드리는 일정입니다."}
      children={<FullCalendar />}
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
