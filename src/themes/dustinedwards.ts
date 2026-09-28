import type { Theme } from "../theme/types.js";

/**
 * The theme of dustinedwards.info, from the site's design tokens: warm paper, Inter for chart
 * text, the ratified chart ladder (cadet, purple, claret, sage, gold, rust) for the first six
 * series, and the site's figure ramps for the rest. It is published as a worked example of a
 * site theme as well as for the site itself.
 */
export const dustinedwardsTheme: Theme = {
  name: "dustinedwards.info",
  fonts: {
    body: '"Inter", "Inter Fallback", ui-sans-serif, system-ui, sans-serif',
  },
  gridlines: "y",
  light: {
    background: "#f4efe6",
    text: "#241f1b",
    mutedText: "#5b5349",
    grid: "#c9c0b4",
    focus: "#4f2d7f",
    series: [
      "#142b42",
      "#4f2d7f",
      "#9b3268",
      "#55684a",
      "#9a7a0e",
      "#8a4a1b",
      "#7d7263",
      "#6b4a9b",
    ],
    sequential: ["#e3dcf0", "#9279b9", "#6b4a9b", "#4f2d7f", "#3a1f5e"],
    status: { good: "#375445", warning: "#8a4f1e", bad: "#8e1024", unknown: "#a89d8d" },
  },
  dark: {
    background: "#1c1916",
    text: "#e9e1d6",
    mutedText: "#b2a898",
    grid: "#6f675c",
    focus: "#b7a5e0",
    series: [
      "#5887b5",
      "#c0b0e6",
      "#c9699e",
      "#93b29b",
      "#efd99c",
      "#ce7f44",
      "#ab9f8f",
      "#a48fd0",
    ],
    sequential: ["#5a4479", "#7f66a8", "#a48fd0", "#c0aee6", "#e0d7f2"],
    status: { good: "#79baa8", warning: "#cf9f5e", bad: "#f0a9b4", unknown: "#6f675c" },
  },
};
