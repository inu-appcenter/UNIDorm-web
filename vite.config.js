import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
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
