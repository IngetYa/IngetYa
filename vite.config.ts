import path from "path"
import { defineConfig } from "vite"
import publicEntries from "./frontend/public.entries"

const root = import.meta.dirname

const entries = [...publicEntries]

export default defineConfig(({ mode }) => {
  const isProd = mode === "production"

  return {
    mode,
    // logLevel: isProd ? "info" : "error",
    root: path.resolve(root, "frontend"),
    publicDir: path.resolve(root, "static"),
    resolve: {
      extensions: [".ts", ".js", ".scss"],
      alias: {
        "@/scss": path.resolve(root, "frontend/styles"),
        "@/types": path.resolve(root, "frontend/scripts/types"),
        "@/core": path.resolve(root, "frontend/scripts/core"),
        "@/main": path.resolve(root, "frontend/scripts/main"),
        "@/lib": path.resolve(root, "frontend/scripts/lib"),
        "@/pages": path.resolve(root, "frontend/scripts/pages")
      }
    },
    build: {
      watch: mode === "production" ? undefined : { clearScreen: true },
      outDir: path.resolve(root, "public"),
      emptyOutDir: true,
      cssCodeSplit: true,
      cssMinify: true,
      rollupOptions: {
        input: Object.fromEntries(entries.map((name) => [name, path.resolve(root, `frontend/${name}.html`)])),
        output: {
          format: "cjs",
          comments: false,
          minify: true,
          strict: true,
          entryFileNames: `[name]${isProd ? "-[hash]" : ""}.js`,
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return `[name]${isProd ? "-[hash]" : ""}[extname]`
            }
            return `assets/${isProd ? "[hash][extname]" : "[name][extname]"}`
          }
        }
      }
    }
  }
})
