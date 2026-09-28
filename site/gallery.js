// The gallery's own script: enhances every chart, toggles the color scheme, and prints each
// chart's events under it. Served as a file, so the page needs no inline script.
import { enhance } from "./enhance.js";

enhance();

const button = document.querySelector("button.scheme");
button?.addEventListener("click", () => {
  const dark = document.documentElement.dataset.scheme !== "dark";
  document.documentElement.dataset.scheme = dark ? "dark" : "light";
  button.setAttribute("aria-pressed", String(dark));
});

for (const type of ["abscissa:select", "abscissa:brush"]) {
  document.addEventListener(type, (event) => {
    const log = event.target.closest("section")?.querySelector(".events");
    if (log) log.textContent = `${type} ${JSON.stringify(event.detail)}`;
  });
}
