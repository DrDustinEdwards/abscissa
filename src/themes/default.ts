import type { Theme } from "../theme/types.js";

/**
 * Abscissa's own theme: neutral surfaces, system fonts, horizontal gridlines, and a series
 * palette chosen to pass {@link checkTheme} in light and dark.
 */
export const defaultTheme: Theme = {
  name: "default",
  fonts: {
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  gridlines: "y",
  light: {
    background: "#ffffff",
    text: "#1b1e23",
    mutedText: "#57606a",
    grid: "#e3e6ea",
    focus: "#0b57d0",
    series: [
      "#0f6cbd",
      "#c4540a",
      "#1a8a5a",
      "#b8336a",
      "#6b4fbb",
      "#8a6a00",
      "#0e8a96",
      "#5a5a5a",
    ],
    sequential: ["#dbe9f6", "#a6c8ea", "#6aa3d8", "#2f78c0", "#0b4a8c"],
    status: { good: "#1a7f37", warning: "#9a6700", bad: "#cf222e", unknown: "#8c959f" },
  },
  dark: {
    background: "#16181d",
    text: "#e6e8eb",
    mutedText: "#a3aab3",
    grid: "#2f343c",
    focus: "#8ab4f8",
    series: [
      "#5aa9f0",
      "#f08a4b",
      "#4cc38a",
      "#ee6ea3",
      "#a590f0",
      "#d6b24a",
      "#3fc1cc",
      "#b0b0b0",
    ],
    sequential: ["#1d2d42", "#1f4c7a", "#2f74b5", "#6aa6e0", "#b8d8f5"],
    status: { good: "#3fb950", warning: "#d29922", bad: "#f85149", unknown: "#6e7681" },
  },
};
