import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import path from "path";
// import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/", // 중요한 부분: 상대경로

  plugins: [
    react(),
    tsconfigPaths(),

    // VitePWA({
    //   registerType: "autoUpdate", // 앱이 새로 빌드되면 자동 업데이트
    //   includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
    //   manifest: {
    //     name: "UNI Dorm", // 전체 앱 이름
    //     short_name: "유니돔", // 아이콘 밑에 표시될 짧은 이름
    //     description: "인천대학교 기숙사 생활을 더욱 편하게!",
    //     theme_color: "#ffffff", // 상단 바 색상
    //     background_color: "#ffffff",
    //     display: "standalone", // 브라우저 UI 없이 앱처럼
    //     start_url: "./", // 시작 경로
    //     icons: [
    //       {
    //         src: "/pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    host: "0.0.0.0", // 모든 네트워크 인터페이스 바인딩
    port: 5173, // 포트 지정 (선택)
  },
  // resolve: {
  //   alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  // },
  // define: {
  //   global: "window",
  // },
});
