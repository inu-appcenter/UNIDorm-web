/**
 * UNIDorm 네이티브(unidorm-app) ↔ 웹(UNIDorm-web) 브릿지 계약.
 * 메시지 스키마와 채널 코어를 제공한다. 웹 어댑터는 `./adapters/web` 에 있다.
 */
export * from "./messages";
export { PlatformChannel } from "./channel";
export type { Transport, ChannelOptions, RequestOptions } from "./channel";
