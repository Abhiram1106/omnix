import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],           // CJS allows shebang at line 1 without ESM loader issues
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
  splitting: false,
  shims: true,               // needed for CJS shims of ESM globals (import.meta.url etc.)
  // No banner — shebang lives in bin/omnix.js wrapper
  // Bundle all deps so npx works without installing separately
  noExternal: [
    "commander",
    "fast-glob",
    "fs-extra",
    "picocolors",
    "prompts",
  ],
});
