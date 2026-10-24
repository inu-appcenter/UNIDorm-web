import { z } from "zod";

/**
 * 모든 브릿지 메시지의 단일 소스(single source of truth).
 *
 * 웹(UNIDorm-web)과 네이티브(unidorm-app)가 이 패키지를 공유 import 하여
 * 동일한 스키마로 직렬화/검증한다. event 별 payload 타입은 discriminated union
 * 으로 강제되며, 런타임에는 Zod 가 경계에서 검증한다.
 *
 * 봉투(envelope) 공통 필드:
 *   - event: 메시지 종류 (discriminator)
 *   - value: event 에 따라 타입이 결정되는 payload
 *   - v:     스키마 버전 (구앱/구웹 공존 시 migration 분기용)
 *   - id:    요청-응답 상관관계용 선택 식별자
 *
 * NOTE: 공개 타입(WebToNative/NativeToWeb)은 **구체 union 으로 직접 작성**한다.
 * `z.infer<typeof Schema>` 로 노출하면 생성된 .d.ts 가 소비자의 zod 메이저
 * 버전으로 해석되어(예: web=zod4, native=zod3) discriminated union 이 풀리지
 * 않는 문제가 있다. 스키마와의 일치는 아래 컴파일 타임 가드로 강제한다.
 */

export const PROTOCOL_VERSION = 1 as const;

/** 모든 메시지에 공통으로 붙는 메타 필드. */
const META = {
  v: z.literal(PROTOCOL_VERSION).optional(),
  id: z.string().optional(),
} as const;

/** payload 가 있는 메시지 멤버를 정의한다. */
const def = <E extends string, V extends z.ZodTypeAny>(event: E, value: V) =>
  z.object({ event: z.literal(event), value, ...META });

/** payload 가 없는(void) 메시지 멤버를 정의한다. */
const voidDef = <E extends string>(event: E) =>
  z.object({ event: z.literal(event), value: z.undefined().optional(), ...META });

// ---------------------------------------------------------------------------
// 공유 payload 스키마
// ---------------------------------------------------------------------------

/** 멀티 웹뷰 스택 push 시 전달되는 라우팅 정보. */
export const NavigateToPayload = z.object({
  path: z.string(),
  url: z.string().url(),
});
export type NavigateToPayload = { path: string; url: string };

/** 홈 탭 경로로 복귀 시 전달되는 목표 path (풀 웹뷰 스택 collapse 대상). */
export const GoHomePayload = z.object({
  path: z.string(),
});
export type GoHomePayload = { path: string };

/**
 * 로그인/리프레시로 얻은 JWT 전체 쌍. 웹(TokenInfo)과 네이티브 양쪽에서 이 필드명을
 * 그대로 재사용해 매핑 없이 통과시킨다. 만료시각은 타임존 없는 naive datetime 문자열.
 */
export const TokenInfoPayload = z.object({
  accessToken: z.string(),
  accessTokenExpiredTime: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiredTime: z.string(),
});
export type TokenInfoPayload = {
  accessToken: string;
  accessTokenExpiredTime: string;
  refreshToken: string;
  refreshTokenExpiredTime: string;
};

/**
 * 웹 → 네이티브 토큰 재발급 요청. 서버는 재발급마다 refreshToken 을 교체하므로
 * 여러 웹뷰가 각자 재발급하면 늦은 쪽이 폐기된 토큰을 보내 로그아웃된다.
 * `tokenRefresh` 기능을 광고한 셸에서는 웹이 직접 재발급하지 않고 이 요청으로
 * 네이티브에 맡기며, 네이티브는 같은 토큰에 대해 단 한 번만 서버를 호출한다.
 */
export const TokenRefreshRequestPayload = z.object({
  refreshToken: z.string(),
});
export type TokenRefreshRequestPayload = { refreshToken: string };

/**
 * `requestTokenRefresh` 에 대한 응답(같은 id).
 *
 * `ok`       — 새 토큰 쌍. 다른 웹뷰에는 `tokenInfoUpdated` 로도 전파된다.
 * `rejected` — 서버가 refreshToken 을 거절했다. 세션이 끝났다.
 * `error`    — 네트워크/서버 오류. 세션은 살아 있을 수 있다.
 */
export const TokenRefreshResultPayload = z.object({
  status: z.enum(["ok", "rejected", "error"]),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  role: z.string().optional(),
});
export type TokenRefreshResultPayload = {
  status: "ok" | "rejected" | "error";
  accessToken?: string;
  refreshToken?: string;
  role?: string;
};

/**
 * 멀티 웹뷰 간 임의의 상태 동기화 페이로드(zustand 스토어 스냅샷, 쿼리 캐시
 * 항목 등). `channel` 은 동기화 채널 식별자(예: "user-store-sync")이고
 * `payload` 는 JSON 직렬화 가능한 임의의 값이다 — 브릿지는 이 값의 형태를
 * 해석하지 않고 그대로 중계만 한다.
 */
export const BroadcastSyncPayload = z.object({
  channel: z.string(),
  payload: z.unknown(),
});
export type BroadcastSyncPayload = { channel: string; payload: unknown };

/**
 * A push notification was opened in the native shell. The server's FCM data
 * payload carries the shared `fcmMessageId`; the authenticated web client
 * uses it to mark that member's notification inbox row as read.
 */
export const NotificationOpenedPayload = z.object({
  fcmMessageId: z.number().int().positive().optional(),
  path: z.string().optional(),
  notificationType: z.string().optional(),
  campaignId: z.string().optional(),
  sentAt: z.string().optional(),
});
export type NotificationOpenedPayload = {
  fcmMessageId?: number;
  path?: string;
  notificationType?: string;
  campaignId?: string;
  sentAt?: string;
};

/**
 * `checkBack` 요청에 대한 웹의 응답.
 *
 * `handled: true`  — 웹이 뒤로가기를 소비했다(오버레이/모달을 닫았거나 SPA
 *                    히스토리를 한 칸 되돌렸다). 네이티브는 아무것도 하지 않는다.
 * `handled: false` — 웹에 되돌릴 것이 없다. 네이티브가 이 웹뷰를 pop 한다
 *                    (root 웹뷰라면 "한 번 더 누르면 종료").
 */
export const BackResultPayload = z.object({
  handled: z.boolean(),
});
export type BackResultPayload = { handled: boolean };

/** Web Share API(`ShareData`)와 필드명을 맞춘 공유 요청. */
export const SharePayload = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().url().optional(),
  // v1 네이티브는 미지원(`unsupported` 회신). 이미지/파일 공유 확장 슬롯.
  files: z.array(z.object({ name: z.string(), mimeType: z.string(), src: z.string() })).optional(),
  /** 안드로이드 chooser 제목 등 플랫폼 힌트. */
  dialogTitle: z.string().optional(),
});
export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
  files?: { name: string; mimeType: string; src: string }[];
  dialogTitle?: string;
};

/**
 * `share` 요청에 대한 네이티브의 응답. OS 공유 시트는 사용자가 닫거나 완료할
 * 때까지 열려 있으므로 이 응답은 기본 request() 타임아웃(10s)보다 훨씬 늦게
 * 올 수 있다 — 호출측은 `channel.requestWithOptions("share", { timeoutMs: … })`
 * 로 이 요청에 한해 타임아웃을 늘려야 한다.
 */
export const ShareResultPayload = z.object({
  status: z.enum(["shared", "dismissed", "unsupported", "error"]),
  activityType: z.string().optional(), // iOS UIActivityType
  message: z.string().optional(),
});
export type ShareResultPayload = {
  status: "shared" | "dismissed" | "unsupported" | "error";
  activityType?: string;
  message?: string;
};

/**
 * 네이티브가 지원하는 기능 광고. `bridgeReady` 수신 직후 네이티브가 먼저
 * 보낸다(웹의 요청 없이) — 웹은 이 값으로 `share` 등 선택적 기능의 가용
 * 여부를 미리 판단할 수 있다. `protocol` 은 네이티브가 구현한 PROTOCOL_VERSION,
 * `features` 는 지원하는 이벤트 이름 등의 자유 문자열 목록이다.
 */
export const EnterDetailViewPayload = z.object({
  path: z.string().optional(),
  type: z.string().optional(),
  id: z.string().optional(),
});
export type EnterDetailViewPayload = {
  path?: string;
  type?: string;
  id?: string;
};

export const BridgeCapabilitiesPayload = z.object({
  protocol: z.number(),
  features: z.array(z.string()),
});
export type BridgeCapabilitiesPayload = { protocol: number; features: string[] };

// ---------------------------------------------------------------------------
// 스키마 (런타임 검증) — 비공개. 공개는 z.ZodType<...> 로 캐스팅해 내보낸다.
// ---------------------------------------------------------------------------

const webToNativeSchema = z.discriminatedUnion("event", [
  // The web has installed its NativeToWeb subscriptions. Native must wait for
  // this acknowledgement before sending one-shot events such as
  // `notificationOpened`, which cannot be replayed after an early postMessage.
  voidDef("bridgeReady"),
  // 멀티 웹뷰 스택
  def("navigateTo", NavigateToPayload),
  voidDef("goBack"),
  // 메인 탭(홈) 경로 복귀: 풀 네이티브 스택을 root 로 collapse 후 root 를
  // 해당 path 로 SPA 이동 — 서브페이지 안에서 홈 이동 시 그 서브페이지
  // 자신의 웹뷰 안에서 렌더링되는 문제를 막는다.
  def("goHome", GoHomePayload),
  // 네이티브가 보낸 `checkBack` 에 대한 응답. `channel.reply()` 로 같은 id 를
  // 달아 돌려보내므로 네이티브의 `request("checkBack")` 이 이 값으로 resolve 된다.
  def("backResult", BackResultPayload),
  // 세션 / 업데이트
  def("loginSuccess", z.string().optional()),
  // JWT 동기화: 로그인 성공 / 401 자동 리프레시 성공 시 네이티브 SecureStore로 미러링.
  def("syncTokenInfo", TokenInfoPayload),
  // 토큰 재발급 위임. 네이티브는 `tokenRefreshResult` 를 같은 id 로 돌려보낸다.
  def("requestTokenRefresh", TokenRefreshRequestPayload),
  // 멀티 웹뷰 상태 동기화: 이 웹뷰가 보낸 스냅샷을 다른 모든 웹뷰(자신 제외)로
  // 중계해 달라는 요청. BroadcastChannel API 미지원 환경(예: iOS 15.4 미만
  // WKWebView)에서의 폴백이자, 지원 환경에서도 이중 전송 경로로 쓰인다.
  def("relayBroadcastSync", BroadcastSyncPayload),
  voidDef("requestAppUpdate"),
  // OS 설정 화면
  voidDef("openAppSettings"),
  voidDef("requestPermissionSettings"),
  // 진단 / 라이프사이클
  def("logWebDiagnostics", z.string()),
  def("onLaunchWebCleanupFinished", z.string().optional()),
  // 셸이 주입한 옵저버가 보내는 채널
  def("routeChange", z.string()),
  def("jsAlert", z.string()),
  // OS 공유 시트 요청/응답 메시지. 네이티브는 `shareResult` 를 같은 id 로
  // 돌려보낸다 — `checkBack`/`backResult` 와 동일한 request/reply 패턴.
  // 사용자가 시트를 닫을 때까지 걸릴 수 있어 기본 request() 타임아웃(10s)을
  // 그대로 쓰면 안 된다(`requestWithOptions` 참고).
  def("share", SharePayload),
  voidDef("onAppReady"),
  def("enterDetailView", EnterDetailViewPayload),
]);

const nativeToWebSchema = z.discriminatedUnion("event", [
  // FCM 토큰 전달 (기존 window.onReceiveFcmToken)
  def("receiveFcmToken", z.string()),
  // 푸시 탭 딥링크
  def("navigate", z.string()),
  // 네이티브 자체 리프레시(백그라운드 FCM 토큰 등록 등) 결과를 웹 store/localStorage에 반영.
  def("tokenInfoUpdated", TokenInfoPayload),
  // `requestTokenRefresh` 에 대한 응답(같은 id).
  def("tokenRefreshResult", TokenRefreshResultPayload),
  // relayBroadcastSync 로 요청된 스냅샷을 다른 웹뷰(원 발신자 제외)로 전달.
  def("broadcastSyncMessage", BroadcastSyncPayload),
  // 푸시 알림을 탭해 앱으로 진입했음을 알린다. 웹은 fcmMessageId로 읽음 처리와
  // 알림함/배지를 갱신한다.
  def("notificationOpened", NotificationOpenedPayload),
  // 뒤로가기 위임(Android 시스템 백). 네이티브는 스스로 판단하지 않고 이 요청을
  // 웹으로 보내, 웹이 닫을 오버레이/되돌릴 SPA 히스토리를 가졌는지 물어본다.
  // 웹은 `backResult` 로 응답한다 — 응답이 없으면(웹 정지/로딩 중) 네이티브가
  // 자체 타임아웃 후 폴백 처리한다.
  voidDef("checkBack"),
  // 웹의 `share` 요청에 대한 응답(같은 id).
  def("shareResult", ShareResultPayload),
  // 네이티브 기능 광고. `bridgeReady` 수신 직후 회신.
  def("bridgeCapabilities", BridgeCapabilitiesPayload),
]);

// ---------------------------------------------------------------------------
// 공개 타입 (zod 비의존 구체 union)
// ---------------------------------------------------------------------------

/** 모든 메시지에 붙는 메타. */
type Meta = { v?: typeof PROTOCOL_VERSION; id?: string };

/** 웹이 네이티브로 보내는 메시지. */
export type WebToNative =
  | ({ event: "bridgeReady"; value?: undefined } & Meta)
  | ({ event: "navigateTo"; value: NavigateToPayload } & Meta)
  | ({ event: "goBack"; value?: undefined } & Meta)
  | ({ event: "goHome"; value: GoHomePayload } & Meta)
  | ({ event: "backResult"; value: BackResultPayload } & Meta)
  | ({ event: "loginSuccess"; value?: string } & Meta)
  | ({ event: "syncTokenInfo"; value: TokenInfoPayload } & Meta)
  | ({ event: "requestTokenRefresh"; value: TokenRefreshRequestPayload } & Meta)
  | ({ event: "relayBroadcastSync"; value: BroadcastSyncPayload } & Meta)
  | ({ event: "requestAppUpdate"; value?: undefined } & Meta)
  | ({ event: "openAppSettings"; value?: undefined } & Meta)
  | ({ event: "requestPermissionSettings"; value?: undefined } & Meta)
  | ({ event: "logWebDiagnostics"; value: string } & Meta)
  | ({ event: "onLaunchWebCleanupFinished"; value?: string } & Meta)
  | ({ event: "routeChange"; value: string } & Meta)
  | ({ event: "jsAlert"; value: string } & Meta)
  | ({ event: "share"; value: SharePayload } & Meta)
  | ({ event: "onAppReady"; value?: undefined } & Meta)
  | ({ event: "enterDetailView"; value: EnterDetailViewPayload } & Meta);
export type WebToNativeEvent = WebToNative["event"];

/** 네이티브가 웹으로 보내는 메시지. */
export type NativeToWeb =
  | ({ event: "receiveFcmToken"; value: string } & Meta)
  | ({ event: "navigate"; value: string } & Meta)
  | ({ event: "tokenInfoUpdated"; value: TokenInfoPayload } & Meta)
  | ({ event: "tokenRefreshResult"; value: TokenRefreshResultPayload } & Meta)
  | ({ event: "broadcastSyncMessage"; value: BroadcastSyncPayload } & Meta)
  | ({ event: "notificationOpened"; value: NotificationOpenedPayload } & Meta)
  | ({ event: "checkBack"; value?: undefined } & Meta)
  | ({ event: "shareResult"; value: ShareResultPayload } & Meta)
  | ({ event: "bridgeCapabilities"; value: BridgeCapabilitiesPayload } & Meta);
export type NativeToWebEvent = NativeToWeb["event"];

// ---------------------------------------------------------------------------
// 컴파일 타임 drift 가드 — 스키마 추론 타입과 공개 타입이 어긋나면 빌드 실패.
// (패키지 자체 zod 로 해석되며, 외부로 노출되지 않는다.)
// ---------------------------------------------------------------------------

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
// Exported (not bare `type _…`) so consumers that compile this file from source
// under `noUnusedLocals` (the bridge is vendored as a submodule, not a built
// package) don't flag these compile-time-only drift guards as unused. They
// carry no runtime value.
export type _AssertWebToNative = Assert<Exact<z.infer<typeof webToNativeSchema>, WebToNative>>;
export type _AssertNativeToWeb = Assert<Exact<z.infer<typeof nativeToWebSchema>, NativeToWeb>>;

// ---------------------------------------------------------------------------
// 공개 스키마 (값) — 깨끗한 z.ZodType<...> 타입으로 노출해 소비자 zod 결합을 끊는다.
// ---------------------------------------------------------------------------

export const WebToNative = webToNativeSchema as unknown as z.ZodType<WebToNative>;
export const NativeToWeb = nativeToWebSchema as unknown as z.ZodType<NativeToWeb>;

// ---------------------------------------------------------------------------
// 유틸 타입
// ---------------------------------------------------------------------------

/** 임의 방향의 메시지 유니온. */
export type AnyMessage = WebToNative | NativeToWeb;

/** 특정 유니온에서 event 에 해당하는 멤버의 value 타입을 뽑는다. */
export type ValueOf<U extends { event: string; value?: unknown }, E extends U["event"]> =
  Extract<U, { event: E }> extends { value?: infer V } ? V : never;
