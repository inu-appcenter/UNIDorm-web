import React, { useEffect, useMemo } from "react";
import styled from "styled-components";

// Helper Functions
const getDaysInMonth = (year: number, month: number) => {
  // month는 1-12 기반
  return new Date(year, month, 0).getDate();
};
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
  category: string; // 카테고리 prop 추가
  deadline: Deadline;
  onDeadlineChange: (newDeadline: Deadline) => void;
}

export default function DeadlineSelector({
  category,
  deadline,
  onDeadlineChange,
}: DeadlineSelectorProps) {
  // --- Constants and Memos ---
  const today = useMemo(() => new Date(), []);
  const isDelivery = category === "배달";
  const isOtherCategory = ["생활용품", "식자재", "기타"].includes(category);

  // '기타' 카테고리를 위한 7일 날짜 범위 계산
  const dateRange = useMemo(() => {
    if (!isOtherCategory) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0); // 오늘 0시
    const end = new Date();
    end.setDate(start.getDate() + 6); // 6일 뒤 (오늘 포함 총 7일)
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [isOtherCategory]);

  // --- Effects for Validation and Correction ---

  // 1. 카테고리 변경 시 마감일이 유효한지 확인하고 벗어났다면 오늘 날짜로 초기화
  useEffect(() => {
    const deadlineDate = new Date(
      `${parseUnit(deadline.year)}-${parseUnit(deadline.month)}-${parseUnit(
        deadline.day,
      )}`,
    );

    let newDeadline = { ...deadline };
    let needsUpdate = false;

    if (isDelivery) {
      // '배달' 카테고리는 항상 오늘 날짜
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
      // '기타' 카테고리는 7일 이내인지 확인
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

    if (needsUpdate) {
      onDeadlineChange(newDeadline);
    }
  }, [category, onDeadlineChange, today]); // category 변경 시에만 트리거

  // 2. 연/월 변경 시, 일이 유효한 범위를 벗어나면 마지막 날로 조정
  useEffect(() => {
    const year = parseUnit(deadline.year);
    const month = parseUnit(deadline.month);
    const day = parseUnit(deadline.day);

    let maxDay = getDaysInMonth(year, month);

    // '기타' 카테고리일 경우, 7일 범위의 마지막 날보다 클 수 없음
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

  // --- Event Handler ---
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onDeadlineChange({ ...deadline, [name]: value });
  };

  // --- Dynamic Option Generation ---
  const { yearOptions, monthOptions, dayOptions } = useMemo(() => {
    const currentYear = parseUnit(deadline.year);
    const currentMonth = parseUnit(deadline.month);

    // 기본 옵션 (카테고리 제약 없을 시)
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
      const yStart = start.getFullYear();
      const yEnd = end.getFullYear();

      // Year options
      yOpts = [];
      for (let y = yStart; y <= yEnd; y++) yOpts.push(`${y}년`);

      // Month options
      const mStart = currentYear === yStart ? start.getMonth() : 0;
      const mEnd = currentYear === yEnd ? end.getMonth() : 11;
      mOpts = [];
      for (let m = mStart; m <= mEnd; m++) mOpts.push(`${m + 1}월`);

      // Day options
      const dStart =
        currentYear === yStart && currentMonth - 1 === mStart
          ? start.getDate()
          : 1;
      const dEnd =
        currentYear === yEnd && currentMonth - 1 === mEnd
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

  // --- Render ---
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
          <option>오전</option>
          <option>오후</option>
        </Select>
        <Select name="hour" value={deadline.hour} onChange={handleChange}>
          {Array.from({ length: 12 }, (_, i) => `${i + 1}시`).map((h) => (
            <option key={h}>{h}</option>
          ))}
        </Select>
        <Select name="minute" value={deadline.minute} onChange={handleChange}>
          <option>00분</option>
          <option>30분</option>
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

// Styles used only by this component
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
  border: 1px solid #ddd; // 테두리 색상 미세 조정
  background: white;

  &:disabled {
    background-color: #f2f2f2; // 비활성화 스타일
    color: #999;
  }
`;

const WarningText = styled.div`
  color: #f97171;
  font-size: 12px;
  margin-bottom: 8px;
`;
