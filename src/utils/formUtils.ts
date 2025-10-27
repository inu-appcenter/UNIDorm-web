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
