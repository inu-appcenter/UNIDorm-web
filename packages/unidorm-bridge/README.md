# unidorm-bridge (vendored)

네이티브 셸(`unidorm-app`)과 웹(`UNIDorm-web`)이 공유하는 브릿지 계약의 복사본입니다.
원본은 `unidorm-app` 저장소의 `packages/intip-bridge/src` 입니다(폴더명은 레거시).

| 파일 | 원본 |
| --- | --- |
| `src/messages.ts` | `src/messages.ts` |
| `src/channel.ts` | `src/channel.ts` |
| `src/adapters/web.ts` | `src/adapters/web.ts` |
| `src/index.ts` | 웹 전용 엔트리 (`native` 어댑터 제외) |

- 기준 커밋: `unidorm-app@2aece66`
- 원본과의 차이: 주석 속 저장소 이름만 UNIDorm 명칭으로 바꿨습니다. 코드는 동일합니다.

## 동기화

메시지를 추가·변경할 때는 `unidorm-app` 쪽을 먼저 고친 뒤 위 파일을 그대로 복사하고
기준 커밋을 갱신하세요. 웹은 `@unidorm/bridge`, `@unidorm/bridge/web` 별칭으로 import 합니다
(`tsconfig.json` / `tsconfig.app.json` 의 `paths`).
