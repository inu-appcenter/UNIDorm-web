import styled from "styled-components";
import { useTranslation } from "react-i18next";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import Calendar from "../components/calendar/Calendar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

const CalendarPage = () => {
  const { t } = useTranslation("home");
  useSetHeader({ title: t("calendarSection.pageTitle") });
  return (
    <CalendarPageWrapper>
      <TitleContentArea
        title={""}
        description={t("calendarSection.pageDescription")}
        children={<Calendar location="일정페이지" />}
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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;

  overflow-y: auto;
`;
