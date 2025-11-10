// 공지사항 작성 주체 (type)
export const ANNOUNCE_CATEGORY_LIST = [
  {
    value: "DORMITORY",
    label: {
      ko: "생활원",
      en: "Dormitory",
    },
  },
  {
    value: "SUPPORTERS",
    label: {
      ko: "서포터즈",
      en: "Supporters",
    },
  },
  {
    value: "UNI_DORM",
    label: {
      ko: "유니돔",
      en: "UniDorm",
    },
  },
] as const;

// 공지사항 카테고리 (category)
export const ANNOUNCE_SUB_CATEGORY_LIST = [
  {
    value: "ALL",
    label: {
      ko: "전체",
      en: "All",
    },
  },
  {
    value: "LIFE_GUIDANCE",
    label: {
      ko: "생활지도",
      en: "Life Guidance",
    },
  },
  {
    value: "FACILITY",
    label: {
      ko: "시설",
      en: "Facility",
    },
  },
  {
    value: "EVENT_LECTURE",
    label: {
      ko: "행사/강좌",
      en: "Event/Lecture",
    },
  },
  {
    value: "BTL_DORMITORY",
    label: {
      ko: "BTL 기숙사",
      en: "BTL Dormitory",
    },
  },
  {
    value: "MOVE_IN_OUT",
    label: {
      ko: "입퇴사 공지",
      en: "Move-in/out Notice",
    },
  },
  {
    value: "ETC",
    label: {
      ko: "기타",
      en: "Others",
    },
  },
] as const;
