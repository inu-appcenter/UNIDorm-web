import styled from "styled-components";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import Calendar from "../components/calendar/Calendar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

const CalendarPage = () => {
  useSetHeader({ title: "생활원 일정" });
  return (
    <CalendarPageWrapper>
      <TitleContentArea
        title={""}
        description={"인천대학교 생활원 각종 행사 일정입니다."}
        children={<Calendar />}
      />
    </CalendarPageWrapper>
  );
};

export default CalendarPage;

const CalendarPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 100px;
  box-sizing: border-box;
  //
  //width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;
