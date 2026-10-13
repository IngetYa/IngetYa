import fs from "fs"
import path from "path"
import { Plugin } from "vite"

export function moveManifestPlugin(targetDir: string = "views"): Plugin {
  return {
    name: "vite-plugin-move-manifest",
    writeBundle(options) {
      const outDir = options.dir || "views"
      const sourcePath = path.resolve(outDir, ".xxxmanifest.json")
      const targetPath = path.resolve(targetDir, "manifest.json")

      // cek file manifest.json ada di outdir
      if (!fs.existsSync(sourcePath)) {
        console.warn("[move-manifest] file manifest.json ga ada")
        return
      }

      moveFile(sourcePath, targetPath, targetDir)
    }
  }
}

function moveFile(src: string, dest: string, target: string) {
  // bikin folder kalo gada
  const destDir = path.dirname(dest)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // copy file
  fs.copyFileSync(src, dest)

  // hajpus file
  fs.rmSync(src)

  console.log(`\x1b[32m[move-manifest]\x1b[0m manifest.json >> ${target}/manifest.json`)
}
