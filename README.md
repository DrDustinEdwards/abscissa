# Abscissa

**Accessible, server-rendered charts and scientific figures for the web.**

> **Status: in active development.** This is an early alpha, published so the
> name is reserved while the first version is built. The API will change
> before 0.1.0. Do not depend on it in production yet.

Abscissa draws charts on the server, into the HTML, so they appear without
JavaScript, are readable by search engines and assistive technology, and cost
the reader nothing to download. It is built on
[Observable Plot](https://observablehq.com/plot/) and returns plain HTML
strings, so it works in any server framework and any JavaScript runtime
(Node.js, Cloudflare Workers, Deno, Bun).

## Install

```sh
npm install abscissa@next
```

## Use

```ts
import { barChart, defaultTheme, sparkline, stylesheet } from "abscissa";

const entries = [
  { year: 2023, type: "Publications" },
  { year: 2024, type: "Publications" },
  { year: 2024, type: "Talks" },
];

const html = `
  <style>${stylesheet(defaultTheme)}</style>
  ${barChart({
    data: entries,
    x: "year",
    series: "type",
    alt: "Entries per year by type: one publication in 2023; a publication and a talk in 2024.",
  })}
  ${sparkline({ values: [1, 2], label: "Entries per year" })}
`;
```

Every chart returns a `<figure>` whose SVG carries the text alternative you
give in `alt`, followed by an equivalent data table. Colors come from the
theme's stylesheet through CSS custom properties, so the same markup follows
light and dark mode without a re-render. `checkTheme(theme)` measures a
theme's contrast and color-vision-deficiency differences.

## Interaction (optional)

Charts are complete without JavaScript. To add hover details, keyboard
navigation, click-to-filter and range brushing, load the enhancement layer in
the browser:

```ts
import { enhance } from "abscissa/enhance";

enhance();
document.addEventListener("abscissa:select", (event) => {
  // { chartId, field: "type", value: "Publications" | null, x?: "2024" }
  console.log(event.detail);
});
```

## License

MIT. Copyright (c) 2026 Dustin Edwards.
