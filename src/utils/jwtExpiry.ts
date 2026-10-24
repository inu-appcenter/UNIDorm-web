import { TokenInfo } from "@/types/members";

/**
 * JWT의 `exp` 클레임을 네이티브가 쓰는 타임존 없는 로컬 시각 문자열
 * (`YYYY-MM-DDTHH:mm:ss`)로 바꾼다. 디코딩할 수 없으면 빈 문자열.
 */
export const jwtExpiryNaive = (token: string): string => {
  const segment = token.split(".")[1];
  if (!segment) return "";

  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const exp = (JSON.parse(atob(padded)) as { exp?: unknown }).exp;
    if (typeof exp !== "number") return "";

    const d = new Date(exp * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
  } catch {
    return "";
  }
};

/**
 * 네이티브 브릿지의 `syncTokenInfo` 스키마는 만료 시각 두 개를 필수로 요구한다.
 * 서버 응답에는 만료 시각이 없으므로 JWT에서 읽어 붙인다. 이게 없으면 네이티브가
 * 메시지를 검증 단계에서 조용히 버린다.
 */
export const withTokenExpiry = (tokenInfo: TokenInfo) => ({
  ...tokenInfo,
  accessTokenExpiredTime: jwtExpiryNaive(tokenInfo.accessToken ?? ""),
  refreshTokenExpiredTime: jwtExpiryNaive(tokenInfo.refreshToken ?? ""),
});
