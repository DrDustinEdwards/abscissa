# API reference

Abscissa has two entry points. `abscissa` runs anywhere (server, build step,
browser) and returns HTML strings. `abscissa/enhance` runs in the browser and
adds interaction to charts already on the page.

Every chart function takes one options object and returns a string. Options
are checked when the chart is drawn, and anything that would draw a wrong
chart (a missing field, a non-finite number, an unknown series in `colors`,
more series than the palette has colors) throws an `Error` naming the chart,
the row and the field. Nothing is silently dropped or defaulted.

The TypeScript declarations carry the same documentation, field by field, and
show in any editor. This page is the map; a test fails if an export is missing
from it.

## Common options

### `FigureOptions`

Every chart (not the primitives) accepts these.

| Option | Type | Meaning |
|---|---|---|
| `alt` | `string`, required | What the chart shows, including its finding. Names the SVG for assistive technology. |
| `title` | `string` | Visible title above the chart. |
| `caption` | `string` | Visible caption below: method, source, caveats. |
| `id` | `string` | The figure's `id`, reported as `chartId` in events. |
| `width`, `height` | `number` | Drawing size in CSS pixels; the SVG scales down to fit. |
| `dataTable` | `"details"` or `"visually-hidden"` | How the always-present data table is shown. Default `"details"`. |

A chart returns:

```html
<figure class="abscissa" data-abscissa="bar" id="...">
  <p class="abscissa-title">...</p>
  <ul class="abscissa-legend">...</ul>
  <svg role="img" aria-label="{alt}">... one keyed element per datum ...</svg>
  <figcaption class="abscissa-caption">...</figcaption>
  <details class="abscissa-data"><summary>Data table</summary><table>...</table></details>
</figure>
```

### `SeriesColor`

A color override for one series: any CSS color (`"#8a4a1b"`,
`"var(--brand)"`), or `{ light, dark }`, rendered with CSS `light-dark()`.
Given in a chart's `colors` option, keyed by series name.

## Charts

### `barChart`

`barChart(options: BarChartOptions<T>): string`. Bars for categories, one
series or several stacked or grouped. When `y` is omitted it counts rows, so
one row per item (a CV entry, a case) is enough.

### `BarChartOptions`

`data`, `x` (category field), `y` (value field, optional), `series`,
`layout` (`"stacked"` or `"grouped"`), `orientation` (`"vertical"` or
`"horizontal"`), `xDomain` (every category in order, including empty ones),
`seriesDomain`, `colors`, `xLabel`, `yLabel`, `formatValue`, and:

- `filterBy`: what a click filters by once enhanced, `"series"` (the default
  when there are series) or `"x"` (the bar's category, such as its year).
- `href`: a function from category to link. Without script each bar is a link
  (and the SVG a named group rather than one image, so the links stay
  reachable); with the enhancement layer the bar filters instead, and the link
  is kept in `data-abscissa-href`. Only relative and `http(s)` links are
  allowed.
- `maxXTicks`: the most category labels to print; with more categories, every
  nth label is printed from the first.

### `lineChart`

`lineChart(options: LineChartOptions<T>): string`. Lines over time or any
continuous x. `null` values are gaps. Supports `references`, `markers`,
`directLabels`, `points`, `yType: "log"` and `zero`.

### `areaChart`

`areaChart(options: SeriesChartOptions<T>): string`. Stacked areas; values
must be zero or more.

### `SeriesChartOptions`

Options shared by line and area charts: `data`, `x` (Date, ISO string, epoch
milliseconds or number), `y`, `series`, `xType` (`"time"` or `"linear"`,
inferred), `seriesDomain`, `colors`, `xLabel`, `yLabel`, `formatValue`,
`formatX`, `references`, `markers`.

### `LineChartOptions`

`SeriesChartOptions` plus `points`, `directLabels`, `yType` and `zero`.

### `ReferenceLine`

`{ y: number; label: string }`: a labelled horizontal line, such as a threshold.

### `EventMarker`

`{ x: number | Date | string; label: string }`: a labelled vertical line, such
as a deploy or an intervention.

### `scatterPlot`

`scatterPlot(options: ScatterPlotOptions<T>): string`. Points by two numeric
fields, with series told apart by color and symbol, and an optional ordinary
least-squares line with its 95% confidence band.

### `ScatterPlotOptions`

`data`, `x`, `y`, `series`, `label` (names each point), `xType`, `yType`
(`"linear"` or `"log"`), `regression`, `seriesDomain`, `colors`, `xLabel`,
`yLabel`, `formatValue`.

### `heatmap`

`heatmap(options: HeatmapOptions<T>): string`. A grid colored on the theme's
five-step sequential ramp, with a labelled legend of the bins, values printed
in cells in a readable color, and dashed outlines for empty cells.

### `HeatmapOptions`

`data`, `x`, `y`, `value`, `xDomain`, `yDomain`, `thresholds` (four ascending
values; default equal intervals), `cellLabels`, `xLabel`, `yLabel`,
`valueLabel`, `formatValue`.

### `networkChart`

`networkChart(options: NetworkChartOptions): string`. A force-directed
network laid out on the server with d3-force. The layout is deterministic: the
same data always draws the same picture.

### `NetworkChartOptions`

`nodes`, `links`, `groupDomain`, `colors`, `nodeLabels`, `iterations`.

### `NetworkNode`

`{ id: string; label?: string; group?: string }`.

### `NetworkLink`

`{ source: string; target: string }`, by node id.

## Scientific charts

### `titerPlot`

`titerPlot(options: TiterPlotOptions<T>): string`. Titers (reciprocal
dilutions) by group on a logarithmic dilution axis: each sample as a point,
identical titers spread side by side, the geometric mean titer with its 95%
confidence interval, and the limit of detection. Values below the limit are
drawn hollow at half the limit, and counted that way in the GMT.

### `TiterPlotOptions`

`data`, `group`, `titer`, `dilution`, `limitOfDetection`, `groupDomain`,
`colorByGroup`, `colors`, `tickLabels` (`"ratio"` for 1:40 or `"reciprocal"`
for 40), `groupLabel`, `titerLabel`.

### `DilutionSeries`

`{ start: number; factor: number }`: the first reciprocal dilution and the
step factor, e.g. `{ start: 10, factor: 2 }` for 1:10 two-fold.

### `genomeTrack`

`genomeTrack(options: GenomeTrackOptions): string`. Features drawn to scale on
a nucleotide axis, as arrows pointing along their strand, one row per track,
with overlapping features packed into lanes.

### `GenomeTrackOptions`

`features`, `length`, `trackDomain`, `typeDomain`, `colors`, `positionLabel`,
`featureLabels`.

### `GenomeFeature`

`{ name; start; end; strand?: 1 | -1 | 0; type?; track? }`, with 1-based,
inclusive coordinates as in GenBank and GFF.

### `geometricSummary`

`geometricSummary(values: number[]): GeometricSummary`. The geometric mean of
positive values and its 95% confidence interval from Student's t on the log
scale. Used by `titerPlot`, exported for tables and text that must agree with
the chart.

### `GeometricSummary`

`{ n: number; mean: number; lower?: number; upper?: number }`. No interval for
a single value.

## Primitives

Primitives return an `<svg class="abscissa">` sized for inline use, named by a
generated or given text alternative. They use the same theme.

### `sparkline`

`sparkline(options: SparklineOptions): string`. A word-sized trend. Its text
alternative is generated from the data unless `alt` is given.

### `SparklineOptions`

`values` (numbers or `null` for gaps), `label`, `alt`, `width`, `height`,
`area`, `endDot`, `color`, `formatValue`.

### `progressRing`

`progressRing(options: ProgressRingOptions): string`. Progress toward a total.

### `ProgressRingOptions`

`value`, `max` (default 1), `label` (required), `size`, `thickness`,
`showValue`, `color`.

### `uptimeStrip`

`uptimeStrip(options: UptimeStripOptions): string`. One tick per period;
status is carried by tick height and outline as well as color.

### `UptimeStripOptions`

`slots`, `label` (required), `width`, `height`.

### `UptimeSlot`

An `UptimeStatus`, or `{ status: UptimeStatus; label?: string }` with its own
hover text.

### `UptimeStatus`

`"up" | "degraded" | "down" | "unknown"`.

## Themes

### `Theme`

`{ name; fonts: { body; numeric? }; gridlines; light: ColorScheme; dark: ColorScheme }`.

### `ColorScheme`

`background`, `text`, `mutedText`, `grid`, `focus`, `series`
(`SeriesPalette`), `sequential` (`SequentialRamp`), `status` (`StatusColors`).
All hex colors.

### `SeriesPalette`

Exactly eight `HexColor`s, assigned to series in order.

### `SequentialRamp`

Exactly five `HexColor`s, from least to most.

### `StatusColors`

`{ good; warning; bad; unknown }`.

### `HexColor`

`` `#${string}` ``: `#rgb` or `#rrggbb`.

### `Gridlines`

`"none" | "x" | "y" | "both"`.

### `defineTheme`

`defineTheme(theme: Theme): Theme`. Validates a theme built at run time
(from JSON, say) and returns it. Throws naming the first bad field.

### `stylesheet`

`stylesheet(theme: Theme, options?: StylesheetOptions): string`. The CSS a
page includes once. Light and dark follow the page's `color-scheme`.

### `StylesheetOptions`

`{ colorScheme?: { dark?: string; light?: string } }`: selectors for sites
that switch schemes with an attribute, e.g. `'[data-theme="dark"]'`.

### `defaultTheme`

Abscissa's own theme: neutral surfaces, system fonts.

### `dustinedwardsTheme`

The theme of dustinedwards.info, and a worked example of a site theme.

## Color checks

### `checkTheme`

`checkTheme(theme: Theme, thresholds?: Partial<CheckThresholds>): CheckReport`.
Measures text and mark contrast (WCAG 2.2), the order of the sequential ramp,
and the difference between every pair of series colors with typical vision and
simulated protanopia, deuteranopia and tritanopia. Reports rather than throws.

### `CheckReport`

`{ theme: string; ok: boolean; issues: CheckIssue[] }`. `ok` is false only for
errors; warnings about similar series colors leave it true.

### `CheckIssue`

`{ severity; scheme; check; message; colors; measured }`.

### `CheckThresholds`

`{ text: number; graphics: number; seriesDifference: number }`.

### `DEFAULT_THRESHOLDS`

`{ text: 4.5, graphics: 3, seriesDifference: 10 }`.

### `contrastRatio`

`contrastRatio(a: string, b: string): number`. WCAG 2 contrast, 1 to 21.

### `colorDifference`

`colorDifference(a: string, b: string, vision?: ColorVision): number`. CIEDE2000
difference, optionally as seen with a color vision deficiency.

### `simulateColorVision`

`simulateColorVision(color: string, vision: ColorVision): Rgb`. After Machado,
Oliveira and Fernandes (2009), at full severity.

### `ColorVision`

`"protanopia" | "deuteranopia" | "tritanopia"`.

### `Rgb`

`readonly [number, number, number]`: sRGB channels from 0 to 1.

## Enhancement layer: `abscissa/enhance`

### `enhance`

`enhance(root?: ParentNode, options?: EnhanceOptions): EnhancedChart[]`.
Enhances every `figure.abscissa` under `root` (default `document`). Safe to
call again: a figure is enhanced once.

### `EnhanceOptions`

`{ tooltips?; filter?; brush?; entrance? }`, each `true` unless set `false`.

### `EnhancedChart`

`{ figure; update(markup); setFilter(filter); clear(); destroy() }`.

- `update` swaps in new server markup for the same chart, animating marks
  that share a key, and keeps the current filter.
- `setFilter({ field, value })` shows a filter the page chose (from its own
  controls or the URL); `setFilter(null)` removes it.
- `clear()` removes the filter and range.
- `destroy()` restores the server markup.

Calls the page makes (`update`, `setFilter`, `clear`) fire no events, since
the page already knows; only a reader's clicks and keys fire
`abscissa:select` and `abscissa:brush`.

### `SelectDetail`

The detail of `abscissa:select`: `{ chartId; field; value; x? }`. `value` is
`null` when the filter is cleared.

### `BrushDetail`

The detail of `abscissa:brush`: `{ chartId; range; time }`. `range` is
`[low, high]` in data units (epoch milliseconds on a time axis), or `null`
when cleared.

### Keyboard

| Key | Does |
|---|---|
| Tab | Moves into the chart (one tab stop) and on to the next control. |
| Left, Right | Previous or next category. |
| Up, Down | Through a stack or group within a category. |
| Home, End | First or last mark. |
| Enter, Space | Filter by the focused mark; again to clear. |
| Shift with arrows | Extend a range on a continuous axis. |
| Escape | Clear the filter and the range. |
