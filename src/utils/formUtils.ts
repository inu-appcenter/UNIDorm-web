export const statusText = (status: string) => {
  switch (status) {
    case "진행전":
      return "진행 전";
    case "진행중":
      return "진행 중";
    case "마감":
      return "마감";
    default:
      return "진행 전";
  }
};
/**
 * 웹 라우터 state의 hasSubmitted 우선, 없을 경우(앱 멀티 웹뷰, 새로고침 등) 서버 API 응답 데이터(apiHasSubmitted)로 폴백합니다.
 */
export const resolveFormSubmittedState = (
  stateHasSubmitted: unknown,
  apiHasSubmitted: boolean | undefined
): boolean => {
  if (typeof stateHasSubmitted === "boolean") {
    return stateHasSubmitted;
  }
  return Boolean(apiHasSubmitted);
};
