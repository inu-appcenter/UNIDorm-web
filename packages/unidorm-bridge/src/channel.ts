import type { z } from "zod";

/**
 * 전송 계층 추상화. 어댑터(web/native)가 구현한다.
 * 채널은 직렬화된 문자열만 다루며, 실제 운반(postMessage/onMessage 등)은 모른다.
 */
export interface Transport {
  /** 직렬화된 메시지를 상대편으로 내보낸다. */
  post(raw: string): void;
  /**
   * 수신 raw 문자열 콜백을 등록한다. 해제 함수를 반환한다.
   * (web: window 'message' 리스너 / native: WebView onMessage 핸들러 연결)
   */
  setInbound(onRaw: (raw: string) => void): () => void;
}

/** 메시지 봉투의 최소 형태. */
export type Envelope = { event: string; value?: unknown; id?: string; v?: number };

type MemberFor<M extends Envelope, E extends string> = Extract<M, { event: E }>;
type ValueFor<M extends Envelope, E extends string> =
  MemberFor<M, E> extends { value?: infer V } ? V : never;

/** send 의 가변 인자: value 가 필수면 [value], 생략 가능하면 [value?]. */
type SendArgs<M extends Envelope, E extends string> =
  [ValueFor<M, E>] extends [undefined]
    ? [value?: undefined]
    : undefined extends ValueFor<M, E>
      ? [value?: ValueFor<M, E>]
      : [value: ValueFor<M, E>];

export interface ChannelOptions {
  /** 스키마 검증 실패 등 비정상 메시지를 받았을 때 호출. */
  onError?: (error: unknown, raw: string) => void;
  /** request() 기본 타임아웃(ms). 기본 10초. */
  requestTimeoutMs?: number;
}

/** `requestWithOptions()` 호출별 옵션. */
export interface RequestOptions {
  /** 이 호출에 한해 기본 requestTimeoutMs(10s) 를 override 한다. */
  timeoutMs?: number;
}

let __idSeq = 0;
function nextId(): string {
  __idSeq = (__idSeq + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now().toString(36)}-${__idSeq.toString(36)}`;
}

/** 이중 stringify 방어 파서 (네이티브가 문자열을 한 번 더 감싸는 경우 대비). */
function tryParse(raw: string): unknown {
  let parsed: unknown = JSON.parse(raw);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  return parsed;
}

/**
 * 양방향 타입드 메시지 채널.
 *
 * @typeParam Out 이 채널이 *보내는* 메시지 유니온 (예: z.infer<typeof WebToNative>)
 * @typeParam In  이 채널이 *받는* 메시지 유니온
 */
export class PlatformChannel<Out extends Envelope, In extends Envelope> {
  private readonly listeners = new Map<string, Set<(value: any, msg: any) => void>>();
  private readonly pending = new Map<
    string,
    { resolve: (m: In) => void; reject: (e: unknown) => void; timer: ReturnType<typeof setTimeout> }
  >();
  private readonly teardown: () => void;
  private readonly requestTimeoutMs: number;

  constructor(
    private readonly transport: Transport,
    private readonly outSchema: z.ZodType<Out>,
    private readonly inSchema: z.ZodType<In>,
    private readonly options: ChannelOptions = {},
  ) {
    this.requestTimeoutMs = options.requestTimeoutMs ?? 10_000;
    this.teardown = transport.setInbound((raw) => this.handleRaw(raw));
  }

  /** event 에 맞는 payload 를 검증 후 전송한다. */
  send<E extends Out["event"]>(event: E, ...args: SendArgs<Out, E>): void {
    this.dispatch(event, args[0], undefined);
  }

  /**
   * 요청을 보내고 동일 id 로 돌아오는 응답을 기다린다.
   * 상대편은 핸들러에서 `reply(incoming, ...)` 로 응답한다.
   */
  request<E extends Out["event"]>(event: E, ...args: SendArgs<Out, E>): Promise<In> {
    return this.requestInternal(event, args[0], undefined);
  }

  /**
   * `request()` 와 동일하지만 이 호출 한정으로 기본 타임아웃(10s)을
   * override 한다 — OS 공유 시트처럼 사용자 응답을 기다려야 해서 훨씬
   * 오래 걸릴 수 있는 요청(`share`)을 위한 것.
   *
   * `options` 를 payload 뒤가 아니라 앞(2번째 고정 위치)에 둔 것은 의도적
   * 설계 결정이다: `request()` 처럼 트레일링 가변인자로 넣으면 `SendArgs`
   * 가 이벤트마다 `[]` | `[V?]` | `[V]` 로 달라져서, 런타임에 마지막 인자가
   * payload 인지 options 인지 배열 길이만으로는 안전하게 구분할 수 없는
   * 경우가 생긴다(예: payload 가 optional 인 이벤트를 인자 1개로 호출한 경우
   * 그 1개가 값인지 options인지 스키마 없이는 판별 불가). options 를 고정
   * 위치에 두면 이 모호함이 타입/런타임 양쪽에서 애초에 발생하지 않는다.
   * 기존 request() 시그니처/호출부는 전혀 건드리지 않는다.
   */
  requestWithOptions<E extends Out["event"]>(
    event: E,
    options: RequestOptions,
    ...args: SendArgs<Out, E>
  ): Promise<In> {
    return this.requestInternal(event, args[0], options);
  }

  private requestInternal<E extends Out["event"]>(
    event: E,
    value: unknown,
    options: RequestOptions | undefined,
  ): Promise<In> {
    const id = nextId();
    const timeoutMs = options?.timeoutMs ?? this.requestTimeoutMs;
    return new Promise<In>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`[PlatformChannel] request '${String(event)}' timed out`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.dispatch(event, value, id);
    });
  }

  /** 받은 메시지에 대한 응답을 같은 id 로 돌려보낸다. */
  reply<E extends Out["event"]>(incoming: In, event: E, ...args: SendArgs<Out, E>): void {
    this.dispatch(event, args[0], incoming.id);
  }

  /** event 수신 리스너를 등록한다. 해제 함수를 반환한다. */
  on<E extends In["event"]>(
    event: E,
    handler: (value: ValueFor<In, E>, msg: MemberFor<In, E>) => void,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as (value: any, msg: any) => void);
    return () => set!.delete(handler as (value: any, msg: any) => void);
  }

  /** 채널을 닫고 모든 리스너/inbound 구독을 해제한다. */
  dispose(): void {
    this.teardown();
    this.listeners.clear();
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(new Error("[PlatformChannel] disposed"));
    }
    this.pending.clear();
  }

  // -- 내부 -----------------------------------------------------------------

  private dispatch(event: string, value: unknown, id: string | undefined): void {
    const envelope = { event, value, v: 1, ...(id ? { id } : {}) };
    const result = this.outSchema.safeParse(envelope);
    if (!result.success) {
      this.options.onError?.(result.error, JSON.stringify(envelope));
      throw new Error(
        `[PlatformChannel] outgoing '${event}' failed schema validation: ${result.error.message}`,
      );
    }
    this.transport.post(JSON.stringify(result.data));
  }

  private handleRaw(raw: string): void {
    if (typeof raw !== "string" || raw.length === 0) return;

    let parsed: unknown;
    try {
      parsed = tryParse(raw);
    } catch (error) {
      this.options.onError?.(error, raw);
      return;
    }

    const result = this.inSchema.safeParse(parsed);
    if (!result.success) {
      // 다른 출처의 'message' 이벤트(iframe 등)는 여기서 조용히 걸러진다.
      this.options.onError?.(result.error, raw);
      return;
    }

    const msg = result.data;

    if (msg.id) {
      const waiting = this.pending.get(msg.id);
      if (waiting) {
        clearTimeout(waiting.timer);
        this.pending.delete(msg.id);
        waiting.resolve(msg);
        return;
      }
    }

    const set = this.listeners.get(msg.event);
    if (!set) return;

    // 핸들러는 각각 격리한다. 하나가 던져도 (1) 같은 이벤트를 구독한 나머지
    // 핸들러는 계속 돌고, (2) 예외가 이 호출 스택 밖으로 새지 않는다.
    //
    // (2)가 중요한 이유: 웹 쪽에서 이 디스패치는 네이티브가 주입한 코드 안에서
    // 동기 실행된다. iOS의 react-native-webview는 postMessage를 injectJavaScript로
    // 구현하기 때문이다(`window.dispatchEvent(new MessageEvent('message', …))`).
    // 주입된 코드에는 script origin이 없어서, 거기서 새어 나간 예외를 WebKit은
    // 파일명·스택·error 객체가 전부 비어 있는 "Script error." 로 뭉갠다. 즉 그대로
    // 두면 핸들러 버그가 통째로 디버깅 불가능해진다. onError로 실체를 넘긴다.
    for (const handler of set) {
      try {
        handler(msg.value, msg);
      } catch (error) {
        this.options.onError?.(error, raw);
      }
    }
  }
}
