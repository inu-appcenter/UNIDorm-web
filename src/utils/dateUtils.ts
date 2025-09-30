// 🔹 마감일 계산 함수
export const getDeadlineText = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) return "마감";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays >= 1) {
    return `D-${diffDays}`;
  } else if (diffHours >= 1) {
    return `마감 ${diffHours}시간 전`;
  } else {
    return `마감 ${diffMinutes}분 전`;
  }
};
