import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Proxying root paths if needed, though usually /api prefix is cleaner.
      // Since our current backend routes are /signup and /login (root), we can proxy those specific paths or use a broad proxy.
      // Let's proxy specific auth routes to be safe, or just proxy everything not static.
      // Strategy: Update backend to use /api prefix OR proxy directly.
      // Let's stick to the current backend routes for now to minimize backend churn,
      // but the cleanest way is often to verify the proxy config.
    },
  },
});
