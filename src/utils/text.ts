/**
 * HTML 태그를 제거하고 순수 텍스트만 추출합니다. (카드 및 리스트 미리보기용)
 */
export function stripHtmlTags(html: string): string {
  if (!html) return "";
  // 1. 브라우저 환경에서는 DOMParser 또는 임시 엘리먼트를 활용하여 엔티티 디코딩까지 안전하게 처리
  if (typeof window !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  // 2. 서버 사이드 또는 기타 환경 fallback (정규식 기반)
  return html.replace(/<[^>]*>/g, "").trim();
}
