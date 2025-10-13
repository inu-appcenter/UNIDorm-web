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
  const startDate = addDays(weekStart, -7);
  const dates = Array.from({ length: 21 }, (_, i) => addDays(startDate, i));

  // 7일 단위로 잘라서 weeks 배열 생성
  const weeks = Array.from({ length: 3 }, (_, i) =>
    dates.slice(i * 7, i * 7 + 7),
  );

  const [eventsByWeek, setEventsByWeek] = useState<
    {
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const months = new Set<string>();
      dates.forEach((date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        months.add(`${y}-${m}`);
      });

      const events: CalendarItem[] = [];
      await Promise.all(
        Array.from(months).map(async (ym) => {
          const [year, month] = ym.split("-").map(Number);
          const res = await getCalendarByMonth(year, month);
          res.data.forEach((item: CalendarItem) => events.push(item));
        }),
      );

      const parsedEvents: {
        weekIndex: number;
        start: number;
        end: number;
        title: string;
        row: number;
      }[] = [];

      weeks.forEach((week, weekIndex) => {
        const weekStartDate = week[0];
        const weekEndDate = week[6];

        const eventsInWeek: {
          start: number;
          end: number;
          title: string;
          originalEvent: CalendarItem;
        }[] = [];

        events.forEach((event) => {
          const start = parseISO(event.startDate);
          const end = parseISO(event.endDate);

          if (
            (isBefore(start, addDays(weekEndDate, 1)) ||
              isSameDay(start, weekEndDate)) &&
            (isAfter(end, addDays(weekStartDate, -1)) ||
              isSameDay(end, weekStartDate))
          ) {
            const startIdx = dates.findIndex((d) =>
              isSameDay(
                d,
                isBefore(start, weekStartDate) ? weekStartDate : start,
              ),
            );
            const endIdx = dates.findIndex((d) =>
              isSameDay(d, isAfter(end, weekEndDate) ? weekEndDate : end),
            );

            eventsInWeek.push({
              start: startIdx % 7,
              end: endIdx % 7,
              title: event.title,
              originalEvent: event,
            });
          }
        });

        const placedEvents: {
          start: number;
          end: number;
          title: string;
          row: number;
        }[] = [];

        eventsInWeek.forEach((currentEvent) => {
          let row = 0;
          while (
            placedEvents.some(
              (placed) =>
                placed.row === row &&
                currentEvent.start <= placed.end &&
                currentEvent.end >= placed.start,
            )
          ) {
            row += 1;
          }
          placedEvents.push({ ...currentEvent, row });
        });

        placedEvents.forEach((e) =>
          parsedEvents.push({
            weekIndex,
            start: e.start,
            end: e.end,
            title: e.title,
            row: e.row,
          }),
        );
      });

      setEventsByWeek(parsedEvents);
    };

    fetchEvents();
  }, []);

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  return (
    <CalendarContainer>
      {/* 요일 헤더는 테두리 밖 */}
      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <WeekdayCell key={i} $index={i}>
            {d}
          </WeekdayCell>
        ))}
      </Weekdays>

      {/* 테두리와 둥근 모서리는 이 부분만 */}
      <CalendarBody>
        {weeks.map((week, weekIdx) => {
          const maxRows = maxRowsByWeek[weekIdx];
          return (
            <WeekRow key={weekIdx} $maxRows={maxRows}>
              {week.map((date, idx) => {
                const isToday = isSameDay(date, today);
                const isLastRow = weekIdx === weeks.length - 1;
                return (
                  <DayCell key={idx} $isLastRow={isLastRow}>
                    {isToday && <TodayCircle />}
                    <DateNumber $isToday={isToday}>
                      {format(date, "d")}
                    </DateNumber>
                  </DayCell>
                );
              })}

              {eventsByWeek
                .filter((e) => e.weekIndex === weekIdx)
                .map((event, i) => (
                  <EventBar
                    key={i}
                    $start={event.start}
                    $end={event.end}
                    $row={event.row}
                  >
                    {event.title}
                  </EventBar>
                ))}
            </WeekRow>
          );
        })}
      </CalendarBody>
    </CalendarContainer>
  );
}

/* 요일 헤더와 본체를 분리 */
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
`;

const WeekdayCell = styled.div<{ $index: number }>`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $index }) =>
    $index === 0
      ? "#F97171" // 일요일
      : $index === 6
        ? "#0A84FF" // 토요일
        : "#4C4C4C"}; // 평일
`;

const CalendarBody = styled.div`
  border: 0.5px solid #c3c3c3;
  border-radius: 8px;
  overflow: hidden;
`;

const WeekRow = styled.div<{ $maxRows: number }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 16}px;
  border-top: 1px solid #c3c3c3;

  &:first-child {
    border-top: none;
  }
`;

const DayCell = styled.div<{ $isLastRow?: boolean }>`
  padding: 6px;
  background-color: #fff;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  border-right: 1px solid #c3c3c3;
  border-bottom: ${({ $isLastRow }) =>
    $isLastRow ? "none" : "1px solid #c3c3c3"};

  &:nth-child(7n) {
    border-right: none;
  }
`;

// 오늘 표시용 원 컴포넌트
const TodayCircle = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #0a84ff;
  z-index: 1;
`;

const DateNumber = styled.div<{ $isToday: boolean }>`
  color: ${({ $isToday }) => ($isToday ? "#F4F4F4" : "#000")};
  position: relative;
  z-index: 2;
`;

const EventBar = styled.div<{ $start: number; $end: number; $row: number }>`
  position: absolute;
  top: ${({ $row }) => 35 + $row * 24}px;
  left: ${({ $start }) => `calc(100% / 7 * ${$start})`};
  width: ${({ $start, $end }) => `calc(100% / 7 * (${$end - $start + 1}))`};
  height: 20px;
  background-color: #ffd60a;
  font-size: 11px;
  padding: 2px 6px;
  box-sizing: border-box;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  color: #636366;
`;
