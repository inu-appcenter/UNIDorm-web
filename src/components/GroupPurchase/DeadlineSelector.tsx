import React, { useEffect, useMemo } from "react";
import styled from "styled-components";

// Helper Functions
const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();
const parseUnit = (value: string): number => parseInt(value) || 0;

interface Deadline {
  year: string;
  month: string;
  day: string;
  ampm: string;
  hour: string;
  minute: string;
}

interface DeadlineSelectorProps {
  category: string;
  deadline: Deadline;
  onDeadlineChange: (newDeadline: Deadline) => void;
}

export default function DeadlineSelector({
  category,
  deadline,
  onDeadlineChange,
}: DeadlineSelectorProps) {
  const today = useMemo(() => new Date(), []);
  const isDelivery = category === "배달";
  const isOtherCategory = ["생활용품", "식자재", "기타"].includes(category);

  const dateRange = useMemo(() => {
    if (!isOtherCategory) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [isOtherCategory]);

  // --- 연/월/일 유효성 체크 ---
  useEffect(() => {
    const deadlineDate = new Date(
      `${parseUnit(deadline.year)}-${parseUnit(deadline.month)}-${parseUnit(deadline.day)}`,
    );

    let newDeadline = { ...deadline };
    let needsUpdate = false;

    if (isDelivery) {
      const todayYear = `${today.getFullYear()}년`;
      const todayMonth = `${today.getMonth() + 1}월`;
      const todayDay = `${today.getDate()}일`;
      if (
        deadline.year !== todayYear ||
        deadline.month !== todayMonth ||
        deadline.day !== todayDay
      ) {
        newDeadline = {
          ...newDeadline,
          year: todayYear,
          month: todayMonth,
          day: todayDay,
        };
        needsUpdate = true;
      }
    } else if (isOtherCategory && dateRange) {
      if (deadlineDate < dateRange.start || deadlineDate > dateRange.end) {
        newDeadline = {
          ...newDeadline,
          year: `${today.getFullYear()}년`,
          month: `${today.getMonth() + 1}월`,
          day: `${today.getDate()}일`,
        };
        needsUpdate = true;
      }
    }

    if (needsUpdate) onDeadlineChange(newDeadline);
  }, [category, onDeadlineChange, today]);

  useEffect(() => {
    const year = parseUnit(deadline.year);
    const month = parseUnit(deadline.month);
    const day = parseUnit(deadline.day);
    let maxDay = getDaysInMonth(year, month);

    if (
      isOtherCategory &&
      dateRange &&
      year === dateRange.end.getFullYear() &&
      month - 1 === dateRange.end.getMonth()
    ) {
      maxDay = Math.min(maxDay, dateRange.end.getDate());
    }

    if (day > maxDay) {
      onDeadlineChange({ ...deadline, day: `${maxDay}일` });
    }
  }, [
    deadline.year,
    deadline.month,
    deadline.day,
    onDeadlineChange,
    isOtherCategory,
    dateRange,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onDeadlineChange({ ...deadline, [name]: value });
  };

  // --- 연/월/일 옵션 ---
  const { yearOptions, monthOptions, dayOptions } = useMemo(() => {
    const currentYear = parseUnit(deadline.year);
    const currentMonth = parseUnit(deadline.month);

    let yOpts = ["2025년", "2026년", "2027년"];
    let mOpts = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    let dOpts = Array.from(
      { length: getDaysInMonth(currentYear, currentMonth) },
      (_, i) => `${i + 1}일`,
    );

    if (isDelivery) {
      yOpts = [`${today.getFullYear()}년`];
      mOpts = [`${today.getMonth() + 1}월`];
      dOpts = [`${today.getDate()}일`];
    } else if (isOtherCategory && dateRange) {
      const { start, end } = dateRange;
      yOpts = [];
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++)
        yOpts.push(`${y}년`);

      const mStart = currentYear === start.getFullYear() ? start.getMonth() : 0;
      const mEnd = currentYear === end.getFullYear() ? end.getMonth() : 11;
      mOpts = [];
      for (let m = mStart; m <= mEnd; m++) mOpts.push(`${m + 1}월`);

      const dStart =
        currentYear === start.getFullYear() && currentMonth - 1 === mStart
          ? start.getDate()
          : 1;
      const dEnd =
        currentYear === end.getFullYear() && currentMonth - 1 === mEnd
          ? end.getDate()
          : getDaysInMonth(currentYear, currentMonth);
      dOpts = [];
      for (let d = dStart; d <= dEnd; d++) dOpts.push(`${d}일`);
    }

    return { yearOptions: yOpts, monthOptions: mOpts, dayOptions: dOpts };
  }, [
    deadline.year,
    deadline.month,
    isDelivery,
    isOtherCategory,
    dateRange,
    today,
  ]);

  const { ampmOptions, hourOptions, minuteOptions } = useMemo(() => {
    let ampmOpts = ["오전", "오후"];
    let hourOpts = Array.from({ length: 12 }, (_, i) => `${i + 1}시`);
    let minuteOpts = Array.from(
      { length: 60 / 15 },
      (_, i) => (i * 15).toString().padStart(2, "0") + "분",
    );

    const selectedDate = new Date(
      parseUnit(deadline.year),
      parseUnit(deadline.month) - 1,
      parseUnit(deadline.day),
    );
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    ) {
      // 오전/오후 필터
      if (currentHour >= 12) {
        ampmOpts = ["오후"];
      } else {
        ampmOpts = ["오전", "오후"];
      }

      // 시 필터
      hourOpts = hourOpts.filter((h) => {
        const hNum = parseInt(h); // 1~12
        const isAm = deadline.ampm === "오전"; // 현재 선택된 AM/PM
        const hour24 = (hNum % 12) + (isAm ? 0 : 12);
        return hour24 >= currentHour;
      });

      // 분 필터
      const selectedHour = parseInt(deadline.hour);
      const isSelectedAm = deadline.ampm === "오전";
      const selectedHour24 = (selectedHour % 12) + (isSelectedAm ? 0 : 12);

      if (selectedHour24 === currentHour) {
        minuteOpts = minuteOpts.filter((m) => parseInt(m) > currentMinute);
      } else {
        minuteOpts = Array.from(
          { length: 60 / 15 },
          (_, i) => (i * 15).toString().padStart(2, "0") + "분",
        );
      }
    }

    return {
      ampmOptions: ampmOpts,
      hourOptions: hourOpts,
      minuteOptions: minuteOpts,
    };
  }, [deadline]);

  return (
    <>
      <DeadlineRow>
        <Select
          name="year"
          value={deadline.year}
          onChange={handleChange}
          disabled={isDelivery}
        >
          {yearOptions.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </Select>
        <Select
          name="month"
          value={deadline.month}
          onChange={handleChange}
          disabled={isDelivery}
        >
          {monthOptions.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
        <Select
          name="day"
          value={deadline.day}
          onChange={handleChange}
          disabled={isDelivery}
        >
          {dayOptions.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
      </DeadlineRow>

      <DeadlineRow>
        <Select name="ampm" value={deadline.ampm} onChange={handleChange}>
          {ampmOptions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Select>
        <Select name="hour" value={deadline.hour} onChange={handleChange}>
          {hourOptions.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </Select>
        <Select name="minute" value={deadline.minute} onChange={handleChange}>
          {minuteOptions.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
      </DeadlineRow>

      <WarningText>설정한 마감 시간이 지나면 게시물은 삭제됩니다.</WarningText>
      <WarningText>
        ‘배달’ 카테고리의 경우, 당일 24시 내 시각으로만 설정 가능합니다. (타
        요일 설정 불가)
      </WarningText>
      <WarningText>
        ‘생활용품’, ‘식자재’, ‘기타’ 카테고리의 경우, 7일 이내 날짜로만 설정
        가능합니다. (24시 기준)
      </WarningText>
    </>
  );
}

// --- Styles ---
const DeadlineRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #ddd;
  background: white;

  &:disabled {
    background-color: #f2f2f2;
    color: #999;
  }
`;

const WarningText = styled.div`
  color: #f97171;
  font-size: 12px;
  margin-bottom: 8px;
`;
