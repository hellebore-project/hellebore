import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [react()],

    build: {
        target: "esnext",
        manifest: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
        },
    },

    resolve: {
        alias: {
            "@": "/src",
            "@tests": "/tests",
        },
    },

    test: {
        environment: "jsdom",
        setupFiles: "./vitest.setup.mjs",
        include: ["./tests/{unit,functional}/**/*.{test,spec}.{ts,tsx}"],
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    clearScreen: false, // prevent vite from obscuring rust errors
    server: {
        port: 1420, // tauri expects a fixed port, fail if that port is not available
        strictPort: true,
        watch: {
            ignored: ["**/src-tauri/**", "**/tests/**"],
        },
    },
}));
