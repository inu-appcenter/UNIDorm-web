import i18n from "@/i18n";

/**
 * 학기 코드/문자열을 현재 선택된 언어의 학기 명칭으로 변환합니다.
 * @example
 * formatSemesterName("1") => "1학기" / "Spring" / "第1学期" / "Học kỳ 1"
 */
export const formatSemesterName = (
  semester?: string | number | null,
): string => {
  if (semester == null) return "";

  const str = String(semester).trim();

  if (str.includes("학기")) {
    if (str === "1학기") return i18n.t("common:semester.first");
    if (str === "2학기") return i18n.t("common:semester.second");
    if (str === "여름계절학기") return i18n.t("common:semester.summer");
    if (str === "겨울계절학기") return i18n.t("common:semester.winter");
    return str;
  }

  switch (str) {
    case "1":
      return i18n.t("common:semester.first");
    case "2":
      return i18n.t("common:semester.second");
    case "3":
    case "SUMMER":
    case "summer":
      return i18n.t("common:semester.summer");
    case "4":
    case "WINTER":
    case "winter":
      return i18n.t("common:semester.winter");
    default:
      return i18n.t("common:semester.other", { value: str });
  }
};
