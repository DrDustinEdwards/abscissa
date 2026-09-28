import * as Plot from "@observablehq/plot";
import {
  defaultFormat,
  domainOf,
  type KeysOfType,
  readDate,
  readLabel,
  readNumber,
  readNumberOrNull,
} from "../render/data.js";
import { type FigureOptions, figure, type SeriesColor } from "../render/figure.js";
import { keyed, renderPlot } from "../render/plot.js";
import { planSeries } from "../render/series.js";

/** A horizontal line across the chart at a value: a threshold, a limit, a target. */
export interface ReferenceLine {
  readonly y: number;
  readonly label: string;
}

/** A vertical line at an x position: a deploy, an intervention, an outbreak declared. */
export interface EventMarker {
  readonly x: number | Date | string;
  readonly label: string;
}

/** Options shared by {@link lineChart} and {@link areaChart}. */
export interface SeriesChartOptions<T extends object> extends FigureOptions {
  readonly data: readonly T[];
  /** The field along the x axis: dates (Date, ISO 8601 string or epoch milliseconds) or numbers. */
  readonly x: KeysOfType<T, number | Date | string>;
  /** The field for the value. `null` or a missing value is a gap, never zero. */
  readonly y: KeysOfType<T, number | null | undefined>;
  /** A field naming the series each row belongs to. */
  readonly series?: KeysOfType<T, string>;
  /** Whether x is time or a number. Inferred from the first row: numbers are linear, the rest time. */
  readonly xType?: "time" | "linear";
  /** Every series in display and color order. Without it, first-seen order. */
  readonly seriesDomain?: readonly string[];
  /** Color overrides by series name (or by `yLabel` when there is one series). */
  readonly colors?: Readonly<Record<string, SeriesColor>>;
  /** The x axis label; defaults to the field name; `null` hides it. */
  readonly xLabel?: string | null;
  /** The y axis label; defaults to the field name; `null` hides it. */
  readonly yLabel?: string | null;
  /** Formats values in hover details and the data table. */
  readonly formatValue?: (value: number) => string;
  /** Formats x values in hover details and the data table. Dates default to YYYY-MM-DD. */
  readonly formatX?: (value: number | Date) => string;
  /** Horizontal reference lines, each labelled on the chart. */
  readonly references?: readonly ReferenceLine[];
  /** Vertical event markers, each labelled on the chart. */
  readonly markers?: readonly EventMarker[];
}

/** Options for {@link lineChart}. */
export interface LineChartOptions<T extends object> extends SeriesChartOptions<T> {
  /** Show a dot at every value (default: only when there are 30 or fewer per series). */
  readonly points?: boolean;
  /** Label each series at the end of its line as well as in the legend. */
  readonly directLabels?: boolean;
  /** Use a logarithmic y axis, for values spanning orders of magnitude. */
  readonly yType?: "linear" | "log";
  /** Include zero on the y axis (default true, except on a log axis). */
  readonly zero?: boolean;
}

interface Point {
  readonly x: number | Date;
  readonly xText: string;
  readonly series: string;
  readonly value: number | null;
}

const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

interface Prepared {
  readonly points: Point[];
  readonly seriesNames: string[];
  readonly time: boolean;
  readonly format: (value: number) => string;
  readonly xLabel: string | null;
  readonly yLabel: string | null;
}

function prepare<T extends object>(kind: string, options: SeriesChartOptions<T>): Prepared {
  const { data, x, y, series } = options;
  if (data.length === 0) throw new Error(`${kind}: data is empty`);
  const first: unknown = (data[0] as Record<string, unknown>)[x];
  const time = options.xType ? options.xType === "time" : typeof first !== "number";
  const format = options.formatValue ?? defaultFormat;
  const yLabel = options.yLabel === undefined ? y : options.yLabel;
  const xLabel = options.xLabel === undefined ? x : options.xLabel;
  const sole = yLabel ?? "Value";
  const formatX = (v: number | Date): string =>
    options.formatX ? options.formatX(v) : v instanceof Date ? isoDate(v) : defaultFormat(v);

  const seriesOf = (row: T, i: number): string =>
    series === undefined ? sole : readLabel(kind, row, series, i);
  const seriesNames =
    series === undefined
      ? [sole]
      : domainOf(
          kind,
          series,
          data.map((row, i) => seriesOf(row, i)),
          options.seriesDomain,
        );
  const seen = new Set<string>();
  const points = data.map((row, i): Point => {
    const xv = time ? readDate(kind, row, x, i) : readNumber(kind, row, x, i);
    const point = {
      x: xv,
      xText: formatX(xv),
      series: seriesOf(row, i),
      value: readNumberOrNull(kind, row, y, i),
    };
    const id = `${point.xText}|${point.series}`;
    if (seen.has(id))
      throw new Error(`${kind}: two rows for x ${point.xText} in series "${point.series}"`);
    seen.add(id);
    return point;
  });
  const byX = (a: Point, b: Point): number => Number(a.x) - Number(b.x);
  return { points: points.sort(byX), seriesNames, time, format, xLabel, yLabel };
}

function annotations(
  options: Pick<SeriesChartOptions<object>, "references" | "markers">,
  time: boolean,
  kind: string,
): Plot.Markish[] {
  const marks: Plot.Markish[] = [];
  const references = options.references ?? [];
  if (references.length > 0) {
    marks.push(
      Plot.ruleY(references, { y: "y", strokeDasharray: "4,3" }),
      Plot.text(references, {
        y: "y",
        text: "label",
        frameAnchor: "right",
        textAnchor: "end",
        dy: -6,
      }),
    );
  }
  const markers = (options.markers ?? []).map((m, i) => ({
    x: time ? readDate(kind, m, "x", i) : readNumber(kind, m, "x", i),
    label: m.label,
  }));
  if (markers.length > 0) {
    marks.push(
      Plot.ruleX(markers, { x: "x", strokeDasharray: "2,3" }),
      Plot.text(markers, { x: "x", text: "label", frameAnchor: "top", textAnchor: "start", dx: 4 }),
    );
  }
  return marks;
}

function table(prepared: Prepared, xColumn: string) {
  const xs = [...new Set(prepared.points.map((p) => p.xText))];
  const cell = new Map(prepared.points.map((p) => [`${p.xText}|${p.series}`, p.value]));
  return {
    columns: [xColumn, ...prepared.seriesNames],
    rows: xs.map((xt) => [
      xt,
      ...prepared.seriesNames.map((s) => {
        const v = cell.get(`${xt}|${s}`);
        return v === null || v === undefined ? "" : prepared.format(v);
      }),
    ]),
  };
}

function describePoint(prepared: Prepared, multi: boolean, xColumn: string) {
  return (p: Point): string =>
    `${multi ? `${p.series}, ` : ""}${xColumn} ${p.xText}: ${p.value === null ? "no data" : prepared.format(p.value)}`;
}

const LINE = "lineChart";

/**
 * A line chart over time or any continuous x: one series or several, with gaps where values are
 * missing, reference lines and event markers. Every value is a keyed point that shows hover
 * details and, once enhanced, can be reached by keyboard and brushed as a range.
 *
 * @example
 * lineChart({
 *   data: weekly,
 *   x: "week",
 *   y: "cases",
 *   series: "county",
 *   references: [{ y: 50, label: "Alert threshold" }],
 *   alt: "Weekly cases in three counties ...",
 * });
 */
export function lineChart<T extends object>(options: LineChartOptions<T>): string {
  const prepared = prepare(LINE, options);
  const { points, seriesNames, time } = prepared;
  const plan = planSeries(LINE, seriesNames, options.colors);
  const multi = options.series !== undefined;
  const xColumn = prepared.xLabel ?? options.x;
  const describe = describePoint(prepared, multi, xColumn);
  const present = points.filter((p) => p.value !== null);
  const perSeries = present.length / seriesNames.length;
  const showPoints = options.points ?? perSeries <= 30;
  const log = options.yType === "log";

  const marks: Plot.Markish[] = [
    Plot.line(points, {
      x: "x",
      y: "value",
      z: "series",
      stroke: "series",
      strokeWidth: 2,
      curve: "linear",
    }),
    Plot.dot(present, {
      x: "x",
      y: "value",
      fill: "series",
      r: showPoints ? 3 : 4,
      fillOpacity: showPoints ? 1 : 0,
      title: describe,
      render: keyed(present, (p) => ({
        key: `${p.xText}|${p.series}`,
        filter:
          multi && options.series
            ? { field: options.series, value: p.series }
            : { field: options.x, value: p.xText },
        x: p.xText,
        ...(multi ? { series: p.series } : {}),
      })),
    }),
    ...annotations(options, time, LINE),
  ];
  if (options.directLabels && multi) {
    marks.push(
      Plot.text(
        present,
        Plot.selectLast({
          x: "x",
          y: "value",
          z: "series",
          text: "series",
          fill: "series",
          textAnchor: "start",
          dx: 6,
        }),
      ),
    );
  }

  const rendered = renderPlot(
    {
      width: options.width ?? 640,
      height: options.height ?? 320,
      marginTop: 20,
      marginLeft: prepared.yLabel === null ? 48 : 64,
      marginRight: options.directLabels && multi ? 96 : 24,
      marginBottom: 44,
      x: {
        type: time ? "utc" : "linear",
        label: prepared.xLabel,
        labelAnchor: "center",
        labelArrow: "none",
      },
      y: {
        type: log ? "log" : "linear",
        label: prepared.yLabel,
        labelAnchor: "center",
        labelArrow: "none",
        grid: true,
        nice: true,
        ...(log ? {} : { zero: options.zero ?? true }),
      },
      color: { domain: seriesNames, range: [...plan.range] },
      marks,
    },
    options.alt,
  );

  return figure(options, {
    kind: "line",
    svg: rendered.svg,
    ...(rendered.x ? { x: rendered.x } : {}),
    legend: multi ? plan.legend : [],
    ...(multi && options.series ? { seriesField: options.series } : {}),
    slotColors: plan.slotColors,
    table: table(prepared, xColumn),
  });
}

const AREA = "areaChart";

/**
 * An area chart over time or any continuous x. Several series stack, so the top edge is their
 * total; gaps are drawn as zero-height breaks. Keyed points carry hover details as in
 * {@link lineChart}.
 *
 * @example
 * areaChart({ data: monthly, x: "month", y: "hours", series: "activity", alt: "..." });
 */
export function areaChart<T extends object>(options: SeriesChartOptions<T>): string {
  const prepared = prepare(AREA, options);
  const { points, seriesNames, time } = prepared;
  const plan = planSeries(AREA, seriesNames, options.colors);
  const multi = options.series !== undefined;
  const xColumn = prepared.xLabel ?? options.x;
  const describe = describePoint(prepared, multi, xColumn);
  for (const p of points) {
    if (p.value !== null && p.value < 0) {
      throw new Error(
        `${AREA}: stacked areas need values of zero or more; ${p.series} at ${p.xText} is ${p.value}`,
      );
    }
  }
  const filled = points.map((p) => ({ ...p, value: p.value ?? 0 }));
  const order = { order: seriesNames };

  const rendered = renderPlot(
    {
      width: options.width ?? 640,
      height: options.height ?? 320,
      marginTop: 20,
      marginLeft: prepared.yLabel === null ? 48 : 64,
      marginBottom: 44,
      x: {
        type: time ? "utc" : "linear",
        label: prepared.xLabel,
        labelAnchor: "center",
        labelArrow: "none",
      },
      y: {
        label: prepared.yLabel,
        labelAnchor: "center",
        labelArrow: "none",
        grid: true,
        nice: true,
        zero: true,
      },
      color: { domain: seriesNames, range: [...plan.range] },
      marks: [
        Plot.areaY(
          filled,
          Plot.stackY({
            ...order,
            x: "x",
            y: "value",
            z: "series",
            fill: "series",
            fillOpacity: 0.85,
          }),
        ),
        Plot.dot(
          filled,
          Plot.stackY({
            ...order,
            x: "x",
            y: "value",
            z: "series",
            fill: "series",
            r: 4,
            fillOpacity: 0,
            title: describe,
            render: keyed(filled, (p) => ({
              key: `${p.xText}|${p.series}`,
              filter:
                multi && options.series
                  ? { field: options.series, value: p.series }
                  : { field: options.x, value: p.xText },
              x: p.xText,
              ...(multi ? { series: p.series } : {}),
            })),
          }),
        ),
        Plot.ruleY([0]),
        ...annotations(options, time, AREA),
      ],
    },
    options.alt,
  );

  return figure(options, {
    kind: "area",
    svg: rendered.svg,
    ...(rendered.x ? { x: rendered.x } : {}),
    legend: multi ? plan.legend : [],
    ...(multi && options.series ? { seriesField: options.series } : {}),
    slotColors: plan.slotColors,
    table: table(prepared, xColumn),
  });
}
