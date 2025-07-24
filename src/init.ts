// global이 없으면 window로 설정
if (typeof global === "undefined") {
  (window as any).global = window;
}
