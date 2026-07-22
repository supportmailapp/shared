import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/types/index.ts",
    "src/protocol/index.ts",
    "src/utils/index.ts",
    "src/models/index.ts",
  ],
  format: ["esm"],
  dts: true,
  tsconfig: true,
  clean: true,
  treeshake: true,
  // Generates the `exports` map into package.json on build — one subpath per
  // entry: "./types", "./protocol", "./utils", "./models" (+ "./package.json").
  exports: {
    packageJson: true, // write the map back into package.json
    all: false, // only entries above, not every dist file
    legacy: false, // ESM-only consumers — no main/module needed
    devExports: false, // consumers install shipped dist; no source-condition map
  },
});
