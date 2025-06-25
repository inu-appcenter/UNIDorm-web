// components/home/WeeklyCalendar.tsx
import styled from "styled-components";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

const mockEvents: { [key: string]: string } = {
  "2025-06-18": "모의고사 이틀치 비...",
};

export default function WeeklyCalendar() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // 일요일 시작
  const startDate = addDays(weekStart, -7); // 앞 주 일요일

  const dates = Array.from({ length: 21 }, (_, i) => addDays(startDate, i));

  return (
    <CalendarContainer>
      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </Weekdays>
      {[0, 1, 2].map((weekIdx) => (
        <WeekRow key={weekIdx}>
          {dates.slice(weekIdx * 7, weekIdx * 7 + 7).map((date, idx) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const event = mockEvents[dateStr];
            const isToday = isSameDay(date, today);

            return (
              <DayCell key={idx} $isToday={isToday}>
                <DateNumber $isToday={isToday}>{format(date, "d")}</DateNumber>
                {event && <EventBox>{event}</EventBox>}
              </DayCell>
            );
          })}
        </WeekRow>
      ))}
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  //gap: 8px;
  font-family: sans-serif;
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #888;
  font-size: 14px;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  //gap: 6px;
`;

const DayCell = styled.div<{ $isToday: boolean }>`
  padding: 6px;
  min-height: 60px;
  background-color: ${({ $isToday }) => ($isToday ? "#e0f0ff" : "#ffffff")};
  border: 1px solid #ddd;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const DateNumber = styled.div<{ $isToday: boolean }>`
  font-weight: ${({ $isToday }) => ($isToday ? "bold" : "normal")};
  color: ${({ $isToday }) => ($isToday ? "#007aff" : "#000")};
`;

const EventBox = styled.div`
  margin-top: 4px;
  font-size: 11px;
  background-color: #ffe500;
  padding: 2px 4px;
  border-radius: 4px;

  max-width: 100%; /* 🔸 DayCell의 너비를 넘지 않도록 제한 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
`;
