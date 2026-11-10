// global이 없으면 window로 설정
if (typeof global === "undefined") {
  (window as any).global = window;
}

// 신규 버전 배포 시 이전 해시 청크 404(Failed to fetch dynamically imported module) 자동 복구
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", () => {
    const lastReload = sessionStorage.getItem("chunk_reload_time");
    const now = Date.now();
    // 10초 이내 중복 새로고침 무한 루프 방지
    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem("chunk_reload_time", String(now));
      window.location.reload();
    }
  });
}
