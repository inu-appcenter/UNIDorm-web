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
import { getCalendarByMonth, getCalendarDetail } from "@/apis/calendar";
import { CalendarItem } from "@/types/calendar";
import { mixpanelTrack } from "@/utils/mixpanel";
import CalendarEventBottomSheet from "@/components/modal/CalendarEventBottomsheet";

interface CalendarProps {
  mode?: "month" | "week";
  location?: string;
}

const CALENDAR_COLORS = ["#FF6A62", "#E5F1FF", "#555555", "#FFC53D", "#5AC8FA"];

const getCalendarColor = (id: number) =>
  CALENDAR_COLORS[(id - 1) % CALENDAR_COLORS.length];

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18L15 12L9 6"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Calendar({ mode = "month", location }: CalendarProps) {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarItem[]>([]);
  const [isCalendarSheetOpen, setIsCalendarSheetOpen] = useState(false);

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
      id: number;
      weekIndex: number;
      start: number;
      end: number;
      title: string;
      row: number;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const months = new Set<string>();

      dates.forEach((date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        months.add(`${year}-${month}`);
      });

      const eventMap = new Map<number, CalendarItem>();

      await Promise.all(
        Array.from(months).map(async (ym) => {
          const [year, month] = ym.split("-").map(Number);
          const res = await getCalendarByMonth(year, month);

          res.data.forEach((item) => {
            if (!eventMap.has(item.id)) {
              eventMap.set(item.id, item);
            }
          });
        }),
      );

      const fetchedEvents = Array.from(eventMap.values());
      setEvents(fetchedEvents);

      const parsedEvents: {
        id: number;
        weekIndex: number;
        start: number;
        end: number;
        title: string;
        row: number;
        color: string;
      }[] = [];

      weeks.forEach((week, weekIndex) => {
        const weekStartDate = week[0];
        const weekEndDate = week[6];

        const eventsInWeek: {
          id: number;
          start: number;
          end: number;
          title: string;
          color: string;
        }[] = [];

        fetchedEvents.forEach((event) => {
          const start = parseISO(event.startDate);
          const end = parseISO(event.endDate);

          const isEventInWeek =
            (isBefore(start, addDays(weekEndDate, 1)) ||
              isSameDay(start, weekEndDate)) &&
            (isAfter(end, addDays(weekStartDate, -1)) ||
              isSameDay(end, weekStartDate));

          if (!isEventInWeek) return;

          const visibleStart = isBefore(start, weekStartDate)
            ? weekStartDate
            : start;

          const visibleEnd = isAfter(end, weekEndDate) ? weekEndDate : end;

          const startIdx = week.findIndex((date) =>
            isSameDay(date, visibleStart),
          );

          const endIdx = week.findIndex((date) => isSameDay(date, visibleEnd));

          if (startIdx === -1 || endIdx === -1) return;

          eventsInWeek.push({
            id: event.id,
            start: startIdx,
            end: endIdx,
            title: event.title,
            color: getCalendarColor(event.id),
          });
        });

        const placedEvents: {
          id: number;
          start: number;
          end: number;
          title: string;
          row: number;
          color: string;
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

          placedEvents.push({
            ...currentEvent,
            row,
          });
        });

        placedEvents.forEach((event) => {
          parsedEvents.push({
            id: event.id,
            weekIndex,
            start: event.start,
            end: event.end,
            title: event.title,
            row: event.row,
            color: event.color,
          });
        });
      });

      setEventsByWeek(parsedEvents);
    };

    fetchEvents();
  }, [dates, weeks]);

  const maxRowsByWeek = weeks.map((_, weekIdx) => {
    const rows = eventsByWeek
      .filter((event) => event.weekIndex === weekIdx)
      .map((event) => event.row);

    return rows.length > 0 ? Math.max(...rows) + 1 : 1;
  });

  const handleDateClick = async (date: Date) => {
    const clickedEvents = events.filter((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);

      return (
        (isAfter(date, start) || isSameDay(date, start)) &&
        (isBefore(date, end) || isSameDay(date, end))
      );
    });

    setSelectedDate(date);
    setSelectedEvents(clickedEvents);
    setIsCalendarSheetOpen(true);

    if (clickedEvents.length === 0) return;

    try {
      const detailResponses = await Promise.all(
        clickedEvents.map((event) => getCalendarDetail(event.id)),
      );

      const detailedEvents = detailResponses.map((res, index) => ({
        ...clickedEvents[index],
        ...res.data,
        description: res.data.description ?? clickedEvents[index].description,
      }));

      setSelectedEvents(detailedEvents);
    } catch (error) {
      console.error("Calendar detail fetch error", error);
      setSelectedEvents(clickedEvents);
    }
  };

  const handleClickEvent = (event: CalendarItem) => {
    if (event.link) {
      window.open(event.link, "_blank");
    }
  };

  const goToNext = () => {
    if (mode === "month") {
      setCurrentDate((prev) => {
        const nextDate = addMonths(prev, 1);

        mixpanelTrack.calendarMonthChanged(
          nextDate.getFullYear(),
          nextDate.getMonth() + 1,
          location || "알수없음",
        );

        return nextDate;
      });
    } else {
      setCurrentDate((prev) => addDays(prev, 7));
    }
  };

  const goToPrev = () => {
    if (mode === "month") {
      setCurrentDate((prev) => {
        const prevDate = subMonths(prev, 1);

        mixpanelTrack.calendarMonthChanged(
          prevDate.getFullYear(),
          prevDate.getMonth() + 1,
          location || "알수없음",
        );

        return prevDate;
      });
    } else {
      setCurrentDate((prev) => subDays(prev, 7));
    }
  };

  return (
    <>
      <CalendarContainer>
        {mode === "month" && (
          <CalendarHeader>
            <ArrowButton type="button" onClick={goToPrev}>
              <ChevronLeft />
            </ArrowButton>

            <MonthDisplay>{format(currentDate, "yyyy. MM.")}</MonthDisplay>

            <ArrowButton type="button" onClick={goToNext}>
              <ChevronRight />
            </ArrowButton>
          </CalendarHeader>
        )}

        <Weekdays>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <WeekdayCell key={day} $index={i}>
              {day}
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
                      type="button"
                      onClick={() => handleDateClick(date)}
                      $isLastRow={isLastRow}
                      $isCurrentMonth={mode === "month" ? isCurrentMonth : true}
                    >
                      {isToday && <TodayCircle />}

                      <DateNumber
                        $isToday={isToday}
                        $isCurrentMonth={
                          mode === "month" ? isCurrentMonth : true
                        }
                      >
                        {format(date, "d")}
                      </DateNumber>
                    </DayCell>
                  );
                })}

                {eventsByWeek
                  .filter((event) => event.weekIndex === weekIdx)
                  .map((event, i) => (
                    <EventBar
                      key={`${event.id}-${event.weekIndex}-${event.row}-${i}`}
                      $start={event.start}
                      $end={event.end}
                      $row={event.row}
                      $color={event.color}
                    >
                      {event.title}
                    </EventBar>
                  ))}
              </WeekRow>
            );
          })}
        </CalendarBody>
      </CalendarContainer>

      <CalendarEventBottomSheet
        isOpen={isCalendarSheetOpen}
        setIsOpen={setIsCalendarSheetOpen}
        selectedDate={selectedDate}
        events={selectedEvents}
        getCalendarColor={getCalendarColor}
        onClickEvent={handleClickEvent}
      />
    </>
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
    $index === 0 ? "#f97171" : $index === 6 ? "#0a84ff" : "#4c4c4c"};
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
  min-height: ${({ $maxRows }) => 80 + ($maxRows - 1) * 24}px;
  border-top: 1px solid #c3c3c3;

  &:first-child {
    border-top: none;
  }
`;

const DayCell = styled.button<{
  $isLastRow?: boolean;
  $isCurrentMonth?: boolean;
}>`
  padding: 6px;
  background-color: ${({ $isCurrentMonth }) =>
    $isCurrentMonth ? "#fff" : "#f9f9f9"};
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  border: none;
  border-right: 1px solid #c3c3c3;
  border-bottom: ${({ $isLastRow }) =>
    $isLastRow ? "none" : "1px solid #c3c3c3"};

  cursor: pointer;

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

const DateNumber = styled.div<{
  $isToday: boolean;
  $isCurrentMonth?: boolean;
}>`
  color: ${({ $isToday, $isCurrentMonth }) =>
    $isToday ? "#f4f4f4" : $isCurrentMonth ? "#000" : "#c3c3c3"};
  position: relative;
  z-index: 2;
`;

const EventBar = styled.div<{
  $start: number;
  $end: number;
  $row: number;
  $color: string;
}>`
  position: absolute;
  top: ${({ $row }) => 35 + $row * 22}px;
  left: ${({ $start }) => `calc((100% / 7) * ${$start})`};
  width: ${({ $start, $end }) => `calc((100% / 7) * ${$end - $start + 1})`};

  height: 18px;
  padding: 0 6px;
  box-sizing: border-box;

  border-radius: 4px;
  background-color: ${({ $color }) => $color};

  display: flex;
  align-items: center;

  font-size: 10px;
  font-weight: 600;
  line-height: 1;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  color: ${({ $color }) =>
    $color === "#E5F1FF" || $color === "#FFC53D" ? "#333" : "#fff"};

  pointer-events: none;
`;
