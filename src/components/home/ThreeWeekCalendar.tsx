import styled from "styled-components";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
import { getCalendarByMonth } from "../../apis/calendar.ts";
import { CalendarItem } from "../../types/calendar.ts";

export default function WeeklyCalendar() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const startDate = addDays(weekStart, -7); // 앞 주 일요일
  const dates = Array.from({ length: 21 }, (_, i) => addDays(startDate, i));
  // const endDate = dates[dates.length - 1];

  const [eventMap, setEventMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      const months = new Set<string>();

      dates.forEach((date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        months.add(`${y}-${m}`);
      });

      const resultMap: { [key: string]: string } = {};

      await Promise.all(
        Array.from(months).map(async (ym) => {
          const [year, month] = ym.split("-").map(Number);
          const res = await getCalendarByMonth(year, month);
          console.log(res.data);
          res.data.forEach((item: CalendarItem) => {
            const start = parseISO(item.startDate);
            const end = parseISO(item.endDate);

            // 일정 범위가 현재 달력 범위 안에 있는지 체크
            dates.forEach((date) => {
              if (
                (isAfter(date, start) || isSameDay(date, start)) &&
                (isBefore(date, end) || isSameDay(date, end))
              ) {
                const dateStr = format(date, "yyyy-MM-dd");
                resultMap[dateStr] = item.title;
              }
            });
          });
        }),
      );

      setEventMap(resultMap);
    };

    fetchEvents();
  }, []);

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
            const event = eventMap[dateStr];
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
