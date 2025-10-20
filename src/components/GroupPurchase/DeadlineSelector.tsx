import React, { useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";

// --- 새로운 헬퍼 함수 ---

/** Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환합니다. */
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/** Date 객체를 'HH:mm' 형식의 문자열로 변환합니다. */
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/** 'YYYY년', 'M월', 'D일'을 'YYYY-MM-DD'로 변환합니다. */
const formatToDateString = (
  year: string,
  month: string,
  day: string,
): string => {
  const y = parseInt(year) || 0;
  const m = parseInt(month) || 0;
  const d = parseInt(day) || 0;
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

/** '오전/오후', 'H시', 'M분'을 'HH:mm'으로 변환합니다. */
const formatToTimeString = (
  ampm: string,
  hour: string,
  minute: string,
): string => {
  let h = parseInt(hour) || 0;
  const m = parseInt(minute) || 0;

  if (ampm === "오후" && h !== 12) h += 12;
  if (ampm === "오전" && h === 12) h = 0; // 12 AM (자정)

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** 'YYYY-MM-DD'를 Deadline 객체 부분으로 변환합니다. */
const dateStringToDeadline = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return {
    year: `${y}년`,
    month: `${m}월`,
    day: `${d}일`,
  };
};

/** 'HH:mm'을 Deadline 객체 부분으로 변환합니다. */
const timeStringToDeadline = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 || h === 24 ? "오전" : "오후"; // 24시(00시)는 오전
  let hour = h % 12;
  if (hour === 0) hour = 12; // 00시는 12시(오전), 12시는 12시(오후)

  return {
    ampm,
    hour: `${hour}시`,
    minute: `${String(m).padStart(2, "0")}분`,
  };
};

// --- 기존 헬퍼 함수 ---
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

  // '생활용품' 카테고리용 날짜 범위 (오늘 00:00 ~ 6일 뒤 23:59)
  const dateRange = useMemo(() => {
    if (!isOtherCategory) return null;
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [isOtherCategory, today]);

  // --- 1. 카테고리 변경 시 날짜 유효성 검사 및 자동 수정 ---
  // (기존 로직과 거의 동일, '배달'은 오늘로, '기타'는 범위 밖이면 오늘로 리셋)
  useEffect(() => {
    const deadlineDate = new Date(
      `${parseUnit(deadline.year)}-${parseUnit(deadline.month)}-${parseUnit(
        deadline.day,
      )}`,
    );
    deadlineDate.setHours(0, 0, 0, 0); // 날짜만 비교하기 위해 정규화

    let newDeadline = { ...deadline };
    let needsUpdate = false;

    const todayYear = `${today.getFullYear()}년`;
    const todayMonth = `${today.getMonth() + 1}월`;
    const todayDay = `${today.getDate()}일`;

    if (isDelivery) {
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
          year: todayYear,
          month: todayMonth,
          day: todayDay,
        };
        needsUpdate = true;
      }
    }

    if (needsUpdate) onDeadlineChange(newDeadline);
  }, [
    category,
    onDeadlineChange,
    today,
    deadline,
    isDelivery,
    isOtherCategory,
    dateRange,
  ]);

  // --- 2. 날짜/시간 Input에 필요한 속성 계산 ---

  // Date Input 속성 (min, max)
  const { minDate, maxDate } = useMemo(() => {
    const todayStr = formatDate(today);
    if (isDelivery) {
      return { minDate: todayStr, maxDate: todayStr };
    }
    if (isOtherCategory && dateRange) {
      return {
        minDate: formatDate(dateRange.start),
        maxDate: formatDate(dateRange.end),
      };
    }
    // 기본값 (예: 2025 ~ 2027년)
    return { minDate: "2025-01-01", maxDate: "2027-12-31" };
  }, [isDelivery, isOtherCategory, dateRange, today]);

  // Time Input 속성 (min) - 오늘 날짜일 경우에만 과거 시간 비활성화
  const minTime = useMemo(() => {
    const selectedDateStr = formatToDateString(
      deadline.year,
      deadline.month,
      deadline.day,
    );
    const todayStr = formatDate(today);

    if (selectedDateStr === todayStr) {
      // 현재 시간보다 1분 뒤부터, 15분 단위로 올림
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1); // 현재 시간보다 미래여야 함

      const currentMinutes = now.getMinutes();
      const remainder = currentMinutes % 15;

      if (remainder > 0) {
        now.setMinutes(currentMinutes + (15 - remainder));
      }
      now.setSeconds(0, 0);

      // 올림으로 인해 날짜가 바뀌었는지 확인
      if (now.getDate() !== today.getDate()) {
        return "23:59"; // 오늘 선택 가능한 시간 없음
      }
      return formatTime(now);
    }

    return "00:00"; // 오늘이 아닌 경우 시간 제한 없음
  }, [deadline.year, deadline.month, deadline.day, today]);

  // --- 3. 시간 유효성 검사 (오늘 날짜인데 과거 시간이 선택된 경우) ---
  useEffect(() => {
    const selectedDateStr = formatToDateString(
      deadline.year,
      deadline.month,
      deadline.day,
    );
    const todayStr = formatDate(today);

    // 오늘 날짜일 때만 검사
    if (selectedDateStr === todayStr) {
      const selectedTimeStr = formatToTimeString(
        deadline.ampm,
        deadline.hour,
        deadline.minute,
      );

      // minTime (선택 가능한 최소 시간) 보다 과거 시간이면 minTime으로 강제 조정
      if (selectedTimeStr < minTime) {
        onDeadlineChange({
          ...deadline,
          ...timeStringToDeadline(minTime),
        });
      }
    }
  }, [deadline, onDeadlineChange, today, minTime]);

  // --- 4. Input 값과 Deadline 상태 동기화 ---

  const dateValue = useMemo(() => {
    return formatToDateString(deadline.year, deadline.month, deadline.day);
  }, [deadline.year, deadline.month, deadline.day]);

  const timeValue = useMemo(() => {
    return formatToTimeString(deadline.ampm, deadline.hour, deadline.minute);
  }, [deadline.ampm, deadline.hour, deadline.minute]);

  // --- 5. 핸들러 ---

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDateStr = e.target.value;
      if (!newDateStr) return;
      onDeadlineChange({
        ...deadline,
        ...dateStringToDeadline(newDateStr),
      });
    },
    [deadline, onDeadlineChange],
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTimeStr = e.target.value;
      if (!newTimeStr) return;
      onDeadlineChange({
        ...deadline,
        ...timeStringToDeadline(newTimeStr),
      });
    },
    [deadline, onDeadlineChange],
  );

  return (
    <>
      <DeadlineRow>
        <Input
          type="date"
          name="date"
          value={dateValue}
          onChange={handleDateChange}
          min={minDate}
          max={maxDate}
          readOnly={isDelivery} // '배달' 카테고리는 날짜 수정 불가
          disabled={isDelivery} // readOnly와 함께 시각적 비활성화
        />
      </DeadlineRow>

      <DeadlineRow>
        <Input
          type="time"
          name="time"
          value={timeValue}
          onChange={handleTimeChange}
          min={minTime} // 오늘 날짜일 경우 과거 시간 비활성화
          step={900} // 15분 (900초) 단위
        />
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

// <select> 대신 사용할 <input> 스타일
const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #ddd;
  background: white;
  min-width: 100px; // input[type=date/time]이 너무 줄어드는 것 방지

  // 네이티브 컨트롤의 모양을 어느 정도 유지
  font-family: inherit;
  line-height: inherit;

  &:disabled,
  &[readOnly] {
    background-color: #f2f2f2;
    color: #999;
    cursor: not-allowed;
  }
`;

const WarningText = styled.div`
  color: #f97171;
  font-size: 12px;
  margin-bottom: 8px;
`;
