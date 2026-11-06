import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. vendor-react: react, react-dom, react-router, react-router-dom 및 scheduler
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/") ||
              id.includes("/scheduler/") ||
              id.includes("\\react\\") ||
              id.includes("\\react-dom\\") ||
              id.includes("\\react-router\\") ||
              id.includes("\\react-router-dom\\") ||
              id.includes("\\scheduler\\")
            ) {
              return "vendor-react";
            }

            // 2. vendor-query: @tanstack/react-query, axios
            if (
              id.includes("/@tanstack/") ||
              id.includes("/axios/") ||
              id.includes("\\@tanstack\\") ||
              id.includes("\\axios\\")
            ) {
              return "vendor-query";
            }

            // 3. vendor-ui: styled-components, framer-motion
            if (
              id.includes("/styled-components/") ||
              id.includes("/framer-motion/") ||
              id.includes("\\styled-components\\") ||
              id.includes("\\framer-motion\\")
            ) {
              return "vendor-ui";
            }

            // 4. vendor-utils: mixpanel-browser, zod
            if (
              id.includes("/mixpanel-browser/") ||
              id.includes("/zod/") ||
              id.includes("\\mixpanel-browser\\") ||
              id.includes("\\zod\\")
            ) {
              return "vendor-utils";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
