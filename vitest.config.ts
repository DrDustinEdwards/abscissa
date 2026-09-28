import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const src = resolve(import.meta.dirname, "src");

export default defineConfig({
  // Examples import "abscissa" as a reader would; in tests that means the source, not dist.
  resolve: {
    alias: [
      { find: /^abscissa\/enhance$/, replacement: resolve(src, "enhance", "index.ts") },
      { find: /^abscissa$/, replacement: resolve(src, "index.ts") },
    ],
  },
  test: {
    include: ["test/**/*.test.ts"],
    exclude: ["test/browser/**"],
  },
});
