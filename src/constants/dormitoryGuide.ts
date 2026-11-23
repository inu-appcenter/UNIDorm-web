import { PATHS } from "@/constants/paths";
import { MobilePlatform } from "@/utils/getMobilePlatform";
import { scoreGuideItem } from "@/utils/koreanGuideSearch";

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
  keywords?: string[];
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
    keywords: ["세탁기", "건조기", "유니룩스", "빨래"],
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
    keywords: ["세탁기", "건조기", "고산실업", "현금", "충전카드", "빨래"],
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
    keywords: ["고장", "수리", "보수", "시설불편"],
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
    keywords: ["고장", "수리", "보수", "시설불편"],
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
    keywords: ["민원", "불편", "신고", "건의"],
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
    keywords: ["학식", "식단", "식당", "밥", "인팁"],
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
    keywords: ["입사", "퇴사", "포털", "신청"],
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
    keywords: ["신입생", "편입생", "입사", "통합정보시스템"],
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
    keywords: ["교양", "강좌", "특강", "프로그램"],
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
    keywords: ["통금", "외박", "택배", "규정", "출입"],
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
    keywords: ["편의점", "헬스장", "체력단련실", "택배실", "취사실"],
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
    keywords: ["상점", "벌점", "상벌점", "서식"],
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
    keywords: ["생활원", "공식", "홈페이지"],
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
    keywords: ["AI", "챗봇", "질문", "문의"],
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
    keywords: ["질문", "답변", "문의", "게시판"],
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
    keywords: ["전화", "연락처", "행정실"],
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
    keywords: ["전화", "연락처", "관리실", "2기숙사"],
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
    keywords: ["전화", "연락처", "관리실", "3기숙사"],
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

function matchesDormitoryFilter(
  item: DormitoryGuideItem,
  filter: DormitoryFilter,
): boolean {
  return (
    filter === "all" ||
    item.dorms.includes("all") ||
    item.dorms.includes(filter)
  );
}

/**
 * 선택한 기숙사 필터와 검색어에 맞는 안내 항목을 관련도 순으로 반환합니다.
 */
export function searchGuideItems(
  filter: DormitoryFilter,
  query: string,
): DormitoryGuideItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return DORMITORY_GUIDE_ITEMS.filter((item) =>
      matchesDormitoryFilter(item, filter),
    );
  }

  return DORMITORY_GUIDE_ITEMS.filter((item) =>
    matchesDormitoryFilter(item, filter),
  )
    .map((item, index) => ({
      item,
      index,
      score: scoreGuideItem(item, trimmed),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

/**
 * 선택한 기숙사 필터와 검색어에 맞는 안내 항목을 카테고리별로 묶어 반환합니다.
 */
export function filterGuideSections(
  filter: DormitoryFilter,
  query = "",
): DormitoryGuideSection[] {
  const matched = query.trim()
    ? searchGuideItems(filter, query)
    : DORMITORY_GUIDE_ITEMS.filter((item) =>
        matchesDormitoryFilter(item, filter),
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
