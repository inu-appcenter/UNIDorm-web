/**
 * 학기 코드/문자열을 사용자가 보기 편한 학기 명칭으로 변환합니다.
 * @example
 * formatSemesterName("1") => "1학기"
 * formatSemesterName("2") => "2학기"
 * formatSemesterName("3") => "여름계절학기"
 * formatSemesterName("4") => "겨울계절학기"
 * formatSemesterName("SUMMER") => "여름계절학기"
 * formatSemesterName("WINTER") => "겨울계절학기"
 */
export const formatSemesterName = (
  semester?: string | number | null,
): string => {
  if (semester == null) return "";

  const str = String(semester).trim();

  if (str.includes("학기")) {
    return str;
  }

  switch (str) {
    case "1":
      return "1학기";
    case "2":
      return "2학기";
    case "3":
    case "SUMMER":
    case "summer":
      return "여름계절학기";
    case "4":
    case "WINTER":
    case "winter":
      return "겨울계절학기";
    default:
      return `${str}학기`;
  }
};
