import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { electronSimple } from "vite-plugin-electron/multi-env";
import { notBundle } from "vite-plugin-electron/plugin";

const external = ["uiohook-napi", "better-sqlite3", "electron-store", "@nut-tree-fork/nut-js", "clipboardy"];

export default defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: {
        "@": path.join(import.meta.dirname, "src"),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      electronSimple({
        main: {
          input: "src/main/index.ts",
          plugins: [notBundle()],
          options: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: { external },
            },
          },
        },
        preload: {
          input: "src/preload/index.ts",
          plugins: [notBundle()],
          options: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: { external },
            },
          },
        },
      }),
    ],
    clearScreen: false,
  };
});
