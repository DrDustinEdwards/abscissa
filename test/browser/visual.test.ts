/**
 * Visual regression: every gallery example, in each theme and color scheme, compared pixel by
 * pixel with a stored image. Images are stored per platform, because fonts render differently;
 * CI runs on Linux and its images are the ones committed.
 *
 * To create or accept images: UPDATE_SNAPSHOTS=1 npm run test:browser, then review the new PNGs.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Harness, startHarness } from "./harness.ts";

const here = import.meta.dirname;
const snapshots = resolve(here, "__snapshots__", process.platform);
const output = resolve(here, "__output__");
const update = process.env["UPDATE_SNAPSHOTS"] === "1";

/** Pixels that may differ before a comparison fails: anti-aliasing noise, not a changed chart. */
const TOLERATED_PIXELS = 30;

let harness: Harness;

beforeAll(async () => {
  harness = await startHarness();
  mkdirSync(snapshots, { recursive: true });
});

afterAll(async () => {
  // Undefined when the browser failed to launch: let that error, not this one, be reported.
  await harness?.close();
});

/**
 * Compares one image with its stored copy. With none stored, it writes one and returns false, so
 * a run records every missing image before the test fails, not just the first.
 */
function compare(name: string, actual: Uint8Array): boolean {
  const stored = join(snapshots, `${name}.png`);
  if (update || !existsSync(stored)) {
    writeFileSync(stored, actual);
    return update;
  }
  const expected = PNG.sync.read(readFileSync(stored));
  const received = PNG.sync.read(Buffer.from(actual));
  if (expected.width !== received.width || expected.height !== received.height) {
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, `${name}.actual.png`), actual);
    throw new Error(
      `${name}: size changed from ${expected.width}x${expected.height} to ${received.width}x${received.height}`,
    );
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const changed = pixelmatch(
    expected.data,
    received.data,
    diff.data,
    expected.width,
    expected.height,
    {
      threshold: 0.1,
    },
  );
  if (changed > TOLERATED_PIXELS) {
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, `${name}.actual.png`), actual);
    writeFileSync(join(output, `${name}.diff.png`), PNG.sync.write(diff));
  }
  expect(changed, `${name}: ${changed} pixels differ`).toBeLessThanOrEqual(TOLERATED_PIXELS);
  return true;
}

const pages = [
  ["default", "index.html"],
  ["dustinedwards", "dustinedwards.html"],
] as const;
const schemes = ["light", "dark"] as const;

describe.each(pages)("%s theme", (theme, file) => {
  it.each(schemes)("matches the stored images, %s", async (scheme) => {
    const page = await harness.open(file, scheme, { scripts: false });
    const sections = await page.$$("section.example");
    expect(sections.length).toBeGreaterThan(0);
    const missing: string[] = [];
    for (const section of sections) {
      const id = await section.evaluate((el) => el.getAttribute("data-example") ?? "");
      const target = (await section.$("figure, .primitives, svg")) ?? section;
      const shot = await target.screenshot({ type: "png" });
      const name = `${theme}-${scheme}-${id}`;
      if (!compare(name, shot)) missing.push(name);
    }
    await page.close();
    expect(missing, "no stored image for these; wrote them, review and commit them").toEqual([]);
  });
});
