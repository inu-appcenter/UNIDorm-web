import { ANNOUNCE_CATEGORY_LIST } from "../constants/announcement.ts";

type Language = "ko" | "en";

/**
 * value로부터 label을 반환
 * @param value - "DORMITORY" | "SUPPORTERS" | "UNI_DORM"
 * @param lang - "ko" | "en" (기본값: "ko")
 */
export function getLabelByValue(value: string, lang: Language = "ko"): string {
  const category = ANNOUNCE_CATEGORY_LIST.find((item) => item.value === value);
  return category ? category.label[lang] : value;
}

export const getTypeBackgroundColor = (
  type: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"],
) => {
  switch (type) {
    case "DORMITORY":
      return "rgba(255, 214, 10, 0.2)"; // 현재 색상
    case "SUPPORTERS":
      return "#F9717133"; // 생활원 색상
    case "UNI_DORM":
      return "rgba(10, 132, 255, 0.2)"; // 0A84FF의 투명도 20%
    default:
      return "rgba(200, 200, 200, 0.2)"; // 기본값
  }
};
