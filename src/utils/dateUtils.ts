import i18n from "@/i18n";

// 🔹 마감일 계산 함수
export const getDeadlineText = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) return i18n.t("common:time.closed");

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays >= 1) {
    return i18n.t("common:time.daysLeft", { count: diffDays });
  } else if (diffHours >= 1) {
    return i18n.t("common:time.hoursLeft", { count: diffHours });
  } else {
    return i18n.t("common:time.minutesLeft", { count: diffMinutes });
  }
};

/**
 * 주어진 날짜를 현재 시간과 비교하여 "N분 전", "N시간 전" 등 상대적인 시간으로 변환합니다.
 * @param date - 변환할 날짜 (ISO 문자열 또는 Date 객체)
 * @returns 변환된 상대 시간 문자열 (예: "방금 전", "5분 전")
 */
export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);

  // 현재 시간과 주어진 시간의 차이를 초 단위로 계산합니다.
  const secondsPast = Math.floor((now.getTime() - past.getTime()) / 1000);

  // 1분 미만일 경우
  if (secondsPast < 60) {
    return i18n.t("common:time.justNow");
  }

  // 1시간 미만일 경우 (분 단위)
  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) {
    return i18n.t("common:time.minutesAgo", { count: minutesPast });
  }

  // 24시간 미만일 경우 (시간 단위)
  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) {
    return i18n.t("common:time.hoursAgo", { count: hoursPast });
  }

  // 24시간 이상일 경우 (일 단위)
  const daysPast = Math.floor(hoursPast / 24);
  return i18n.t("common:time.daysAgo", { count: daysPast });
};

export const formatDeadlineDate = (deadline: string) => {
  const date = new Date(deadline);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}.${day} ${hours}:${minutes}`;
};
