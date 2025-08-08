import styled from "styled-components";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { useEffect, useState } from "react";
import { getCalendarByMonth } from "../../apis/calendar.ts";
import { CalendarItem } from "../../types/calendar.ts";

export default function FullCalendar() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(today, "yyyy-MM"),
  );

  const [weeks, setWeeks] = useState<Date[][]>([]);
  const [eventsByWeek, setEventsByWeek] = useState<
    {
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
    }[]
  >([]);

  // 월이 바뀌면 weeks 재계산
  useEffect(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = startOfMonth(new Date(year, month - 1));
    const lastDay = endOfMonth(firstDay);

    // 달력 첫 줄의 시작 (해당 달의 1일이 포함된 주의 일요일)
    const calendarStart = startOfWeek(firstDay, { weekStartsOn: 0 });
    // 달력 마지막 줄의 끝 (해당 달의 말일이 포함된 주의 토요일)
    const calendarEnd = endOfWeek(lastDay, { weekStartsOn: 6 });

    const totalDays = Math.ceil(
      (calendarEnd.getTime() - calendarStart.getTime()) /
        (1000 * 60 * 60 * 24) +
        1,
    );

    const dates = Array.from({ length: totalDays }, (_, i) =>
      addDays(calendarStart, i),
    );

    // 7일 단위로 나누기
    const weeksArr: Date[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeksArr.push(dates.slice(i, i + 7));
    }

    setWeeks(weeksArr);
  }, [selectedMonth]);

  // 이벤트 불러오기
  useEffect(() => {
    if (weeks.length === 0) return;

    const fetchEvents = async () => {
      const dates = weeks.flat();
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
            const startIdx = week.findIndex((d) =>
              isSameDay(
                d,
                isBefore(start, weekStartDate) ? weekStartDate : start,
              ),
            );
            const endIdx = week.findIndex((d) =>
              isSameDay(d, isAfter(end, weekEndDate) ? weekEndDate : end),
            );

            eventsInWeek.push({
              start: startIdx,
              end: endIdx,
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
  }, [weeks]);

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  return (
    <CalendarContainer>
      <MonthSelector>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </MonthSelector>

      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </Weekdays>

      {weeks.map((week, weekIdx) => {
        const maxRows = maxRowsByWeek[weekIdx];
        return (
          <WeekRow key={weekIdx} $maxRows={maxRows}>
            {week.map((date, idx) => {
              const isToday = isSameDay(date, today);
              const isCurrentMonth =
                date.getMonth() === new Date(selectedMonth).getMonth();
              return (
                <DayCell
                  key={idx}
                  $isToday={isToday}
                  $isCurrentMonth={isCurrentMonth}
                >
                  <DateNumber
                    $isToday={isToday}
                    $isCurrentMonth={isCurrentMonth}
                  >
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
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  font-family: sans-serif;
`;

const MonthSelector = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;

  input[type="month"] {
    padding: 4px;
    font-size: 14px;
  }
`;

const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #888;
  font-size: 14px;
`;

const WeekRow = styled.div<{ $maxRows: number }>`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 16}px;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;

  & > div {
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }
`;

const DayCell = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  padding: 6px;
  background-color: ${({ $isToday }) => ($isToday ? "#e0f0ff" : "#fff")};
  opacity: ${({ $isCurrentMonth }) => ($isCurrentMonth ? 1 : 0.4)};
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DateNumber = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  font-weight: ${({ $isToday }) => ($isToday ? "bold" : "normal")};
  color: ${({ $isToday, $isCurrentMonth }) =>
    $isToday ? "#007aff" : $isCurrentMonth ? "#000" : "#888"};
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
