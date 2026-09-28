import { describe, expect, it } from "vitest";
import { progressRing, uptimeStrip } from "../src/index.js";
import { parse } from "./helpers.js";

describe("progressRing", () => {
  it("states label, value and total, and fills the matching arc", () => {
    const svg = parse(
      progressRing({ value: 3, max: 4, label: "Chapters", size: 40, thickness: 4 }),
    );
    expect(svg.getAttribute("aria-label")).toBe("Chapters: 3 of 4 (75%)");
    const arc = svg.querySelectorAll("circle")[1];
    const circumference = 2 * Math.PI * 18;
    expect(arc?.getAttribute("stroke-dasharray")).toBe(
      `${Math.round(circumference * 0.75 * 100) / 100} ${Math.round(circumference * 100) / 100}`,
    );
    expect(svg.querySelector("text")?.textContent).toBe("75%");
  });

  it("uses a percentage for fractions, caps at full, and draws no arc at zero", () => {
    expect(parse(progressRing({ value: 0.5, label: "Done" })).getAttribute("aria-label")).toBe(
      "Done: 50%",
    );
    expect(
      parse(progressRing({ value: 2, label: "Done" })).querySelector("text")?.textContent,
    ).toBe("100%");
    expect(
      parse(progressRing({ value: 0, label: "Done" })).querySelectorAll("circle"),
    ).toHaveLength(1);
  });

  it("hides the number on small rings unless asked", () => {
    expect(
      parse(progressRing({ value: 0.5, label: "Done", size: 20 })).querySelector("text"),
    ).toBeNull();
  });

  it("refuses bad values", () => {
    expect(() => progressRing({ value: -1, label: "x" })).toThrow(/zero or more/);
    expect(() => progressRing({ value: 1, max: 0, label: "x" })).toThrow(/above zero/);
    expect(() => progressRing({ value: 1, label: " " })).toThrow(/label is required/);
  });
});

describe("uptimeStrip", () => {
  it("summarizes counts and availability, ignoring unmeasured periods", () => {
    const svg = parse(
      uptimeStrip({
        slots: ["up", "up", "degraded", "down", "unknown"],
        label: "API, last 5 hours",
      }),
    );
    expect(svg.getAttribute("aria-label")).toBe(
      "API, last 5 hours: 5 periods, 2 up, 1 degraded, 1 down, 1 no data; 75% available.",
    );
  });

  it("encodes status by height as well as color", () => {
    const svg = parse(uptimeStrip({ slots: ["up", "degraded", "down"], label: "x", height: 30 }));
    expect([...svg.querySelectorAll("rect")].map((r) => r.getAttribute("height"))).toEqual([
      "30",
      "19.8",
      "9.9",
    ]);
  });

  it("uses per-slot labels in hover details", () => {
    const svg = parse(uptimeStrip({ slots: [{ status: "down", label: "Mon 14:00" }], label: "x" }));
    expect(svg.querySelector("rect title")?.textContent).toBe("Mon 14:00: down");
  });

  it("refuses empty strips and unknown states", () => {
    expect(() => uptimeStrip({ slots: [], label: "x" })).toThrow(/at least one/);
    expect(() => uptimeStrip({ slots: ["sideways" as never], label: "x" })).toThrow(
      /unknown status/,
    );
  });
});
