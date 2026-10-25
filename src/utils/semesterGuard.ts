/**
 * 기숙사 학사일정 및 거주 일정 기반 학기 만료 판정 가드
 * 
 * [도메인 설계 원칙]
 * 1. 룸메이트 모집 기간(5월/11월)과 거주 기간의 불일치로 인한 오잠금(False Positive) 방지
 * 2. 방학 연장(계속입사) 및 계절학기 단독 입사자의 방학 중 0초 패스 보장
 *    - 1학기(10) / 여름학기(30): 당해 연도 8월 25일까지 유효 (차기 2학기 개강 직전)
 *    - 2학기(20) / 겨울학기(40): 익년 2월 20일까지 유효 (차기 1학기 개강 직전)
 * 3. 새 정규 학기 개강 시점(8월 말, 2월 말)에 이전 학기 사생증 100% 자동 만료 잠금
 * 4. 정규화 실패나 알 수 없는 이상 데이터 시 Fail-Open (사생증 유지) 적용
 */

export type SemesterCode = "10" | "20" | "30" | "40"; // 1학기, 2학기, 여름학기, 겨울학기

/**
 * 포털 SSV, 한글, 숫자, 영문 Enum 등 다양한 형태의 학기 표현을 2자리 표준 코드로 엄격히 정규화
 */
export function normalizeSemesterCode(term?: unknown): SemesterCode | null {
  if (term === null || term === undefined) return null;
  const str = String(term).trim().toUpperCase();
  if (!str) return null;

  // 1학기 매핑
  if (
    str === "10" ||
    str === "1" ||
    str === "FIRST" ||
    str.includes("1학기") ||
    str === "FIRST_SEMESTER"
  ) {
    return "10";
  }

  // 2학기 매핑
  if (
    str === "20" ||
    str === "2" ||
    str === "SECOND" ||
    str.includes("2학기") ||
    str === "SECOND_SEMESTER"
  ) {
    return "20";
  }

  // 여름학기 매핑
  if (
    str === "30" ||
    str === "3" ||
    str === "SUMMER_VACATION" ||
    str.includes("여름")
  ) {
    return "30";
  }

  // 겨울학기 매핑
  if (
    str === "40" ||
    str === "4" ||
    str === "WINTER_VACATION" ||
    str.includes("겨울")
  ) {
    return "40";
  }

  return null;
}

export interface DormSemesterEvaluationParams {
  dormYear?: string | number | null;
  dormTerm?: unknown;
  currentDate?: Date;
}

/**
 * 사생증의 연도 및 학기가 현재 거주 유효 기간을 초과하여 만료되었는지 판정
 * @returns true: 만료됨 (잠금 화면 전환 필요), false: 유효함 (사생증 표시 허용)
 */
export function isDormitorySemesterExpired({
  dormYear,
  dormTerm,
  currentDate = new Date(),
}: DormSemesterEvaluationParams): boolean {
  if (!dormYear) return false; // Fail-Open: 연도 정보 없으면 안전하게 통과

  const dataYear = parseInt(String(dormYear).trim(), 10);
  if (isNaN(dataYear) || dataYear <= 2000) return false; // Fail-Open

  const termCode = normalizeSemesterCode(dormTerm);
  if (!termCode) return false; // Fail-Open: 알 수 없는 학기 포맷은 안전하게 통과

  const nowYear = currentDate.getFullYear();
  const nowMonth = currentDate.getMonth() + 1; // 1 ~ 12
  const nowDate = currentDate.getDate();

  // 2년 이상 지난 명백한 과거 연도 데이터는 즉시 만료
  if (dataYear < nowYear - 1) {
    return true;
  }

  // 1. 1학기(10) 또는 여름학기(30) 사생증
  // -> 해당 연도 8월 25일까지 유효 (2학기 개강 직전까지 방학 연장 거주 포용)
  if (termCode === "10" || termCode === "30") {
    if (nowYear > dataYear) {
      // 연도가 지났으면 무조건 만료
      return true;
    }
    if (nowYear === dataYear) {
      // 8월 26일 이후부터는 2학기 개강 시즌이므로 1학기/여름학기 사생증 만료
      if (nowMonth > 8 || (nowMonth === 8 && nowDate > 25)) {
        return true;
      }
    }
    // 그 이전(1학기 중 및 여름방학 8월 25일까지)은 정상 유효
    return false;
  }

  // 2. 2학기(20) 또는 겨울학기(40) 사생증
  // -> 다음 해 2월 20일까지 유효 (1학기 개강 직전까지 겨울방학 연장 거주 포용)
  if (termCode === "20" || termCode === "40") {
    const expireYear = dataYear + 1;
    if (nowYear > expireYear) {
      // 익년을 초과했으면 무조건 만료
      return true;
    }
    if (nowYear === expireYear) {
      // 익년 2월 21일 이후부터는 1학기 개강 시즌이므로 2학기/겨울학기 사생증 만료
      if (nowMonth > 2 || (nowMonth === 2 && nowDate > 20)) {
        return true;
      }
    }
    // 2학기 당해 연도(8~12월)이거나 익년 2월 20일까지는 정상 유효
    return false;
  }

  return false;
}
