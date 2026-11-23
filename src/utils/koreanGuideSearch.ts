export interface SearchableGuideItem {
  id: string;
  category: string;
  title: string;
  description: string;
  dorms: readonly string[];
  keywords?: readonly string[];
}

interface GuideIntentRule {
  patterns: readonly string[];
  targetIds: readonly string[];
}

const CHOSEONG_TABLE = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

const KOREAN_SUFFIXES = [
  "에서",
  "으로",
  "에게",
  "한테",
  "부터",
  "까지",
  "처럼",
  "보다",
  "은",
  "는",
  "이",
  "가",
  "을",
  "를",
  "에",
  "도",
  "만",
  "로",
  "요",
  "야",
] as const;

const STOPWORDS = new Set([
  "어디",
  "어떻게",
  "뭐",
  "좀",
  "할",
  "수",
  "있어",
  "있나요",
  "알려줘",
  "궁금",
  "기숙사",
  "오늘",
  "지금",
]);

export const GUIDE_INTENT_RULES: readonly GuideIntentRule[] = [
  {
    patterns: ["세탁", "건조", "빨래", "돌리"],
    targetIds: ["laundry-metaclub", "laundry-dorm3"],
  },
  {
    patterns: ["유니룩스", "메타클럽"],
    targetIds: ["laundry-metaclub"],
  },
  {
    patterns: ["고산실업", "충전카드", "현금"],
    targetIds: ["laundry-dorm3"],
  },
  {
    patterns: [
      "고장",
      "수리",
      "보수",
      "안돼",
      "안됨",
      "안켜",
      "안나와",
      "안시원",
      "막힘",
      "막혔",
      "누수",
      "물새",
      "전등",
      "형광등",
      "에어컨",
      "냉방",
      "난방",
      "히터",
      "변기",
      "샤워",
      "수도",
      "도어락",
      "콘센트",
      "와이파이",
      "인터넷",
      "에듀맥",
    ],
    targetIds: ["facility-dorm1", "facility-dorm23"],
  },
  {
    patterns: [
      "민원",
      "소음",
      "시끄",
      "흡연",
      "담배",
      "벌레",
      "청소",
      "건의",
      "신고",
      "불편",
    ],
    targetIds: ["unidorm-complain"],
  },
  {
    patterns: [
      "학식",
      "식단",
      "식당",
      "메뉴",
      "밥",
      "아침",
      "점심",
      "저녁",
      "조식",
      "중식",
      "석식",
      "뭐나와",
      "배고",
      "인팁",
      "intip",
      "생협",
    ],
    targetIds: ["intip-menu"],
  },
  {
    patterns: [
      "입사",
      "퇴사",
      "입주",
      "방빼",
      "합격",
      "선발",
      "신입생",
      "편입생",
      "포털",
      "erp",
    ],
    targetIds: ["portal-apply", "erp-freshman-apply"],
  },
  {
    patterns: [
      "통금",
      "출입",
      "새벽",
      "밤",
      "몇시",
      "문닫",
      "외박",
      "귀사",
      "규정",
      "수칙",
      "택배",
    ],
    targetIds: ["dorm-rules"],
  },
  {
    patterns: [
      "편의점",
      "gs",
      "cu",
      "이마트",
      "헬스",
      "체력단련",
      "운동",
      "독서실",
      "세미나",
      "취사",
      "전자레인지",
      "택배실",
      "자판기",
      "카페",
      "맘스터치",
      "몇층",
    ],
    targetIds: ["dorm-facilities"],
  },
  {
    patterns: ["상점", "벌점", "상벌점", "서식", "양식", "자료실", "확인서"],
    targetIds: ["dorm-archive"],
  },
  {
    patterns: ["교양", "강좌", "특강", "강의", "프로그램", "무료"],
    targetIds: ["dorm-lecture"],
  },
  {
    patterns: [
      "전화",
      "번호",
      "연락처",
      "행정실",
      "관리실",
      "질문",
      "문의",
      "qna",
      "챗봇",
      "챗불이",
      "ai",
    ],
    targetIds: ["chatbuli", "dorm-qna", "tel-admin", "tel-dorm2", "tel-dorm3"],
  },
];

/**
 * 한글 음절을 초성 문자열로 변환합니다.
 */
export function extractChoseong(text: string): string {
  let result = "";

  for (const char of text.toLowerCase()) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const index = Math.floor((code - 0xac00) / 588);
      result += CHOSEONG_TABLE[index];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * 토큰이 한글 자음(초성)으로만 이루어졌는지 확인합니다.
 */
export function isChoseongOnly(token: string): boolean {
  return /^[ㄱ-ㅎ]+$/.test(token);
}

function stripKoreanSuffix(token: string): string {
  if (token.length < 2) return token;

  for (const suffix of KOREAN_SUFFIXES) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 1) {
      return token.slice(0, token.length - suffix.length);
    }
  }

  return token;
}

/**
 * 검색어를 구두점 제거·조사 정제·불용어 필터링된 토큰 배열로 분해합니다.
 */
export function tokenizeKoreanQuery(query: string): string[] {
  const cleaned = query
    .toLowerCase()
    .replace(/[?!.,~()[\]{}"'·/]/g, " ")
    .trim();

  if (!cleaned) return [];

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const strippedTokens = rawTokens.map(stripKoreanSuffix);
  const nonStopwords = strippedTokens.filter((token) => !STOPWORDS.has(token));
  const selected = nonStopwords.length > 0 ? nonStopwords : strippedTokens;

  return Array.from(new Set(selected));
}

/**
 * 검색어와 안내 항목 간의 관련도 점수를 계산합니다.
 */
export function scoreGuideItem(
  item: SearchableGuideItem,
  rawQuery: string,
): number {
  const trimmed = rawQuery.trim().toLowerCase();
  if (!trimmed) return 0;

  const compactQuery = trimmed.replace(/\s+/g, "");
  const tokens = tokenizeKoreanQuery(rawQuery);

  const titleLower = item.title.toLowerCase();
  const keywordsLower = (item.keywords ?? []).map((keyword) =>
    keyword.toLowerCase(),
  );
  const descLower = item.description.toLowerCase();
  const categoryLower = item.category.toLowerCase();
  const metaLower = `${descLower} ${categoryLower}`;

  const titleChoseong = extractChoseong(titleLower);
  const keywordsChoseong = keywordsLower.map(extractChoseong);

  let score = 0;

  if (
    titleLower.includes(trimmed) ||
    keywordsLower.some((keyword) => keyword.includes(trimmed))
  ) {
    score += 10;
  }

  for (const token of tokens) {
    if (isChoseongOnly(token)) {
      if (
        titleChoseong === token ||
        keywordsChoseong.some((keyword) => keyword === token)
      ) {
        score += 8;
      } else if (
        titleChoseong.includes(token) ||
        keywordsChoseong.some((keyword) => keyword.includes(token))
      ) {
        score += 4;
      }
      continue;
    }

    if (titleLower.includes(token)) {
      score += 6;
    }
    if (keywordsLower.some((keyword) => keyword.includes(token))) {
      score += 4;
    }
    if (metaLower.includes(token)) {
      score += 2;
    }
  }

  for (const rule of GUIDE_INTENT_RULES) {
    if (!rule.targetIds.includes(item.id)) continue;

    const matchedIntent = rule.patterns.some((pattern) => {
      if (tokens.some((token) => token.includes(pattern))) {
        return true;
      }
      return pattern.length >= 3 && compactQuery.includes(pattern);
    });

    if (matchedIntent) {
      score += 5;
    }
  }

  return score;
}
