import styled from "styled-components";
import {
  addDays,
  addMonths,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { getCalendarByMonth } from "@/apis/calendar";
import { CalendarItem } from "@/types/calendar";

interface CalendarProps {
  mode?: "month" | "week";
}

// --- 모던한 디자인을 위한 SVG 아이콘 ---
const ChevronLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 6L9 12L15 18"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
// --- ------------------------- ---

export default function Calendar({ mode = "month" }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();

  const { dates, weeks } = useMemo(() => {
    let dates: Date[] = [];

    if (mode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const startDate = addDays(weekStart, -7);
      dates = Array.from({ length: 21 }, (_, i) => addDays(startDate, i));
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
      const daysCount = differenceInDays(endDate, startDate) + 1;
      dates = Array.from({ length: daysCount }, (_, i) =>
        addDays(startDate, i),
      );
    }

    const totalWeeks = Math.ceil(dates.length / 7);
    const weeks = Array.from({ length: totalWeeks }, (_, i) =>
      dates.slice(i * 7, i * 7 + 7),
    );
    return { dates, weeks };
  }, [currentDate, mode]);

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

      // ---
      // Map을 사용해 이벤트 ID 기준 중복 제거
      // ---
      const eventMap = new Map<string | number, CalendarItem>(); // (id가 number일 수도 있으므로)

      await Promise.all(
        Array.from(months).map(async (ym) => {
          const [year, month] = ym.split("-").map(Number);
          const res = await getCalendarByMonth(year, month);

          // 데이터를 가져올 때마다 Map에 저장 (id가 없으면 추가)
          res.data.forEach((item: CalendarItem) => {
            if (!eventMap.has(item.id)) {
              eventMap.set(item.id, item);
            }
          });
        }),
      );

      // Map의 값들만 배열로 변환하여 중복 없는 이벤트 리스트 생성
      const events = Array.from(eventMap.values());

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
  }, [dates]); // [mode] -> [dates] (dates가 변경될 때마다 fetch)

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((e) => e.weekIndex === weekIdx)
      .map((e) => e.row);
    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  const goToNext = () => {
    if (mode === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addDays(prev, 7));
    }
  };

  const goToPrev = () => {
    if (mode === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subDays(prev, 7));
    }
  };

  return (
    <CalendarContainer>
      {mode === "month" && (
        <CalendarHeader>
          <ArrowButton onClick={goToPrev}>
            <ChevronLeft />
          </ArrowButton>
          <MonthDisplay>{format(currentDate, "yyyy. MM.")}</MonthDisplay>
          <ArrowButton onClick={goToNext}>
            <ChevronRight />
          </ArrowButton>
        </CalendarHeader>
      )}

      <Weekdays>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
          <WeekdayCell key={i} $index={i}>
            {d}
          </WeekdayCell>
        ))}
      </Weekdays>

      <CalendarBody>
        {weeks.map((week, weekIdx) => {
          const maxRows = maxRowsByWeek[weekIdx];
          return (
            <WeekRow key={weekIdx} $maxRows={maxRows}>
              {week.map((date, idx) => {
                const isToday = isSameDay(date, today);
                const isLastRow = weekIdx === weeks.length - 1;
                const isCurrentMonth = date.getMonth() === currentMonth;
                return (
                  <DayCell
                    key={idx}
                    $isLastRow={isLastRow}
                    $isCurrentMonth={mode === "month" ? isCurrentMonth : true}
                  >
                    {isToday && <TodayCircle />}
                    <DateNumber
                      $isToday={isToday}
                      $isCurrentMonth={mode === "month" ? isCurrentMonth : true}
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
      </CalendarBody>
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 8px;
`;

const MonthDisplay = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #222;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f0f0f0;
  }
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
    $index === 0 ? "#F97171" : $index === 6 ? "#0A84FF" : "#4C4C4C"};
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

const DayCell = styled.div<{ $isLastRow?: boolean; $isCurrentMonth?: boolean }>`
  padding: 6px;
  background-color: ${({ $isCurrentMonth }) =>
    $isCurrentMonth ? "#fff" : "#f9f9f9"};
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

const DateNumber = styled.div<{ $isToday: boolean; $isCurrentMonth?: boolean }>`
  color: ${({ $isToday, $isCurrentMonth }) =>
    $isToday ? "#F4F4F4" : $isCurrentMonth ? "#000" : "#c3c3c3"};
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
