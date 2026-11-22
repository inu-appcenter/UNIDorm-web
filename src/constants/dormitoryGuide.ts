import { PATHS } from "@/constants/paths";
import { MobilePlatform } from "@/utils/getMobilePlatform";

export type DormitoryFilter = "all" | "1기숙사" | "2기숙사" | "3기숙사";

export type GuideActionType =
  | "app"
  | "iframe"
  | "external"
  | "internal"
  | "aichat"
  | "tel"
  | "info";

export type DormitoryGuideCategory =
  | "생활·시설"
  | "식단·캠퍼스"
  | "입·퇴사·행정"
  | "생활 정보"
  | "질문·문의";

export type GuideVisualKey =
  | "metaclub"
  | "intip"
  | "inu"
  | "unidorm"
  | "chatbuli"
  | "washing"
  | "wrench"
  | "lecture"
  | "rules"
  | "facilities"
  | "archive"
  | "qna"
  | "phone";

export interface AppStoreLinks {
  android: string;
  ios: string;
}

export interface DormitoryGuideItem {
  id: string;
  category: DormitoryGuideCategory;
  title: string;
  description: string;
  dorms: DormitoryFilter[];
  visual: GuideVisualKey;
  badge?: string;
  type: GuideActionType;
  url?: string;
  path?: string;
  tel?: string;
  appLinks?: AppStoreLinks;
  actionLabel?: string;
  secondaryApp?: {
    label: string;
    appLinks: AppStoreLinks;
  };
}

export interface DormitoryGuideSection {
  category: DormitoryGuideCategory;
  items: DormitoryGuideItem[];
}

export const DORMITORY_FILTER_OPTIONS: ReadonlyArray<{
  value: DormitoryFilter;
  label: string;
}> = [
  { value: "all", label: "전체" },
  { value: "1기숙사", label: "1기숙사" },
  { value: "2기숙사", label: "2기숙사" },
  { value: "3기숙사", label: "3기숙사" },
];

export const DORMITORY_GUIDE_CATEGORIES: readonly DormitoryGuideCategory[] = [
  "생활·시설",
  "식단·캠퍼스",
  "입·퇴사·행정",
  "생활 정보",
  "질문·문의",
];

export const METACLUB_STORE_LINKS: AppStoreLinks = {
  android: "https://play.google.com/store/apps/details?id=com.fingerverse.metapoint",
  ios: "https://apps.apple.com/kr/app/id6444430778",
};

export const INTIP_STORE_LINKS: AppStoreLinks = {
  android: "https://play.google.com/store/apps/details?id=inu.appcenter.intip_android",
  ios: "https://apps.apple.com/kr/app/id6740070975",
};

export const DORMITORY_GUIDE_ITEMS: readonly DormitoryGuideItem[] = [
  {
    id: "laundry-metaclub",
    category: "생활·시설",
    title: "세탁·건조기 (메타클럽)",
    description: "1·2기숙사 세탁기·건조기 현황 확인과 결제에 사용해요.",
    dorms: ["1기숙사", "2기숙사"],
    visual: "metaclub",
    badge: "1·2기숙사",
    type: "app",
    appLinks: METACLUB_STORE_LINKS,
    actionLabel: "앱 열기",
  },
  {
    id: "laundry-dorm3",
    category: "생활·시설",
    title: "3기숙사 세탁실",
    description: "전용 앱이 없어 세탁실에서 현금 또는 충전카드로 이용해요.",
    dorms: ["3기숙사"],
    visual: "washing",
    badge: "앱 미지원",
    type: "info",
  },
  {
    id: "facility-dorm1",
    category: "생활·시설",
    title: "시설 고장·보수 신청",
    description: "제1기숙사 시설 불편은 INU 포털 통합정보시스템에서 접수해요.",
    dorms: ["1기숙사"],
    visual: "inu",
    badge: "1기숙사",
    type: "external",
    url: "https://portal.inu.ac.kr:444/enview/",
    actionLabel: "포털 열기",
  },
  {
    id: "facility-dorm23",
    category: "생활·시설",
    title: "시설 고장·보수 신청",
    description: "제2·3기숙사(BTL) 고장·수리는 에듀맥 시설관리시스템에서 접수해요.",
    dorms: ["2기숙사", "3기숙사"],
    visual: "wrench",
    badge: "2·3기숙사",
    type: "external",
    url: "https://edumac.kr/mon/index.do?schlType=Univ",
    actionLabel: "에듀맥 열기",
  },
  {
    id: "unidorm-complain",
    category: "생활·시설",
    title: "기타 생활 민원",
    description: "시설 고장 외 생활 불편은 유니돔 민원에서 접수하고 처리 현황을 볼 수 있어요.",
    dorms: ["all"],
    visual: "unidorm",
    type: "internal",
    path: PATHS.COMPLAIN.ROOT,
    actionLabel: "민원 이동",
  },
  {
    id: "intip-menu",
    category: "식단·캠퍼스",
    title: "기숙사 식당·학식 메뉴",
    description: "제1기숙사 식당과 교내 학식 메뉴를 INTIP에서 확인해요.",
    dorms: ["all"],
    visual: "intip",
    type: "iframe",
    url: "https://intip.inuappcenter.kr/home/menu",
    actionLabel: "식단 보기",
    secondaryApp: {
      label: "INTIP 앱",
      appLinks: INTIP_STORE_LINKS,
    },
  },
  {
    id: "portal-apply",
    category: "입·퇴사·행정",
    title: "재학생 입·퇴사 신청",
    description: "INU 포털에서 재학생 입사신청과 정기·중도퇴사를 신청해요.",
    dorms: ["all"],
    visual: "inu",
    type: "external",
    url: "https://portal.inu.ac.kr:444/enview/",
    actionLabel: "포털 열기",
  },
  {
    id: "erp-freshman-apply",
    category: "입·퇴사·행정",
    title: "신·편입생 입사 신청",
    description: "포털 아이디가 없는 신·편입생 전용 입사신청 페이지예요.",
    dorms: ["all"],
    visual: "inu",
    type: "external",
    url: "https://erp.inu.ac.kr:8443/dorm.html",
    actionLabel: "신청 이동",
  },
  {
    id: "dorm-lecture",
    category: "입·퇴사·행정",
    title: "생활원 교양강좌 신청",
    description: "기숙사생 무료 교양강좌 일정 확인과 신청 안내예요.",
    dorms: ["all"],
    visual: "lecture",
    type: "iframe",
    url: "https://dorm.inu.ac.kr/dorm/6533/subview.do",
    actionLabel: "안내 보기",
  },
  {
    id: "dorm-rules",
    category: "생활 정보",
    title: "생활 수칙",
    description: "출입 통제 시간(05:00~02:00), 외박·택배실·공용시설 이용 규정이에요.",
    dorms: ["all"],
    visual: "rules",
    type: "iframe",
    url: "https://dorm.inu.ac.kr/dorm/11480/subview.do",
    actionLabel: "보기",
  },
  {
    id: "dorm-facilities",
    category: "생활 정보",
    title: "기숙사별 편의시설 현황",
    description: "편의점, 택배실, 체력단련실, 간이취사실 등 층별 위치를 확인해요.",
    dorms: ["all"],
    visual: "facilities",
    type: "iframe",
    url: "https://dorm.inu.ac.kr/dorm/6515/subview.do",
    actionLabel: "보기",
  },
  {
    id: "dorm-archive",
    category: "생활 정보",
    title: "상·벌점표 및 자료실",
    description: "최신 기숙사 상·벌점 기준표와 생활 안내문 자료실이에요.",
    dorms: ["all"],
    visual: "archive",
    type: "iframe",
    url: "https://dorm.inu.ac.kr/dorm/6530/subview.do",
    actionLabel: "보기",
  },
  {
    id: "dorm-home",
    category: "생활 정보",
    title: "인천대학교 생활원 홈페이지",
    description: "생활원 공식 홈페이지로 이동해요.",
    dorms: ["all"],
    visual: "inu",
    type: "external",
    url: "https://dorm.inu.ac.kr/",
    actionLabel: "열기",
  },
  {
    id: "chatbuli",
    category: "질문·문의",
    title: "챗불이에게 물어보기",
    description: "통금, 상·벌점, 입퇴사 등 기숙사 궁금증을 AI 챗봇에게 물어보세요.",
    dorms: ["all"],
    visual: "chatbuli",
    type: "aichat",
    actionLabel: "질문하기",
  },
  {
    id: "dorm-qna",
    category: "질문·문의",
    title: "생활원 질문과 답변 (Q&A)",
    description: "생활원 행정실 공식 1:1 문의 게시판이에요.",
    dorms: ["all"],
    visual: "qna",
    type: "external",
    url: "https://dorm.inu.ac.kr/dorm/6529/subview.do",
    actionLabel: "열기",
  },
  {
    id: "tel-admin",
    category: "질문·문의",
    title: "통합행정실",
    description: "입·퇴사 및 일반 행정 문의 (032-835-9810)",
    dorms: ["all"],
    visual: "phone",
    type: "tel",
    tel: "032-835-9810",
    actionLabel: "전화 걸기",
  },
  {
    id: "tel-dorm2",
    category: "질문·문의",
    title: "제2기숙사 관리사무실",
    description: "제2기숙사 시설·생활 문의 (032-858-7233)",
    dorms: ["2기숙사"],
    visual: "phone",
    badge: "2기숙사",
    type: "tel",
    tel: "032-858-7233",
    actionLabel: "전화 걸기",
  },
  {
    id: "tel-dorm3",
    category: "질문·문의",
    title: "제3기숙사 관리사무실",
    description: "제3기숙사 시설·생활 문의 (032-858-7222)",
    dorms: ["3기숙사"],
    visual: "phone",
    badge: "3기숙사",
    type: "tel",
    tel: "032-858-7222",
    actionLabel: "전화 걸기",
  },
];

/**
 * 사용자의 기숙사 표기 문자열을 필터 값으로 정규화합니다.
 */
export function resolveDormitoryFilter(dormType?: string | null): DormitoryFilter {
  if (!dormType) return "all";
  const normalized = dormType.trim();

  if (normalized.includes("1기숙사")) return "1기숙사";
  if (normalized.includes("2기숙사")) return "2기숙사";
  if (normalized.includes("3기숙사")) return "3기숙사";

  return "all";
}

/**
 * 선택한 기숙사 필터에 맞는 안내 항목을 카테고리별로 묶어 반환합니다.
 */
export function filterGuideSections(
  filter: DormitoryFilter,
): DormitoryGuideSection[] {
  const matched = DORMITORY_GUIDE_ITEMS.filter(
    (item) =>
      filter === "all" ||
      item.dorms.includes("all") ||
      item.dorms.includes(filter),
  );

  return DORMITORY_GUIDE_CATEGORIES.map((category) => ({
    category,
    items: matched.filter((item) => item.category === category),
  })).filter((section) => section.items.length > 0);
}

/**
 * 화이트리스트에 등록된 인앱 iframe 뷰어 서비스만 ID로 조회합니다.
 */
export function getIframeGuideServiceById(
  id: string | null | undefined,
): DormitoryGuideItem | null {
  if (!id) return null;
  const trimmed = id.trim();
  if (!trimmed) return null;

  const found = DORMITORY_GUIDE_ITEMS.find(
    (item) => item.id === trimmed && item.type === "iframe" && Boolean(item.url),
  );
  return found ?? null;
}

/**
 * 플랫폼에 맞는 앱 스토어 URL을 반환합니다.
 */
export function resolveAppStoreUrl(
  appLinks: AppStoreLinks,
  platform: MobilePlatform,
): string {
  if (platform === "ios_unidorm_app" || platform === "ios_browser") {
    return appLinks.ios;
  }
  return appLinks.android;
}
