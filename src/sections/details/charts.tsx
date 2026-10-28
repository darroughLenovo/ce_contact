import { useState, type ReactNode } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

/*
 * Data-viz exception: recharts draws the marks only. Every colour comes from a
 * cake& token string; the card, titles, legends and filters around each chart
 * are cake& / token-built. Hovered bars get a border and the tooltip is
 * anchored to the hovered column (not the pointer), per the canvas review notes.
 */

const AXIS_TICK = { fill: 'var(--color-text-icon-secondary)', fontSize: 'var(--type-size-caption)' } as const;
const GRID = 'var(--color-stroke-border)';
const HOVER_STROKE = 'var(--color-text-icon-on-tonal)';

export type Series = { key: string; label: string; color: string };

type Hover = { x: number; index: number } | null;

function useAnchoredHover() {
  const [hover, setHover] = useState<Hover>(null);
  const onMouseMove = (s: { activeTooltipIndex?: number; activeCoordinate?: { x: number } }) => {
    if (s && s.activeTooltipIndex !== undefined && s.activeCoordinate) {
      setHover({ x: s.activeCoordinate.x, index: s.activeTooltipIndex });
    }
  };
  return { hover, onMouseMove, onMouseLeave: () => setHover(null) };
}

/** Chart tooltip body (cake& has no chart tooltip; styled like SimpleTooltip from tokens). */
function TooltipBody({ title, rows }: { title: ReactNode; rows: { label: string; value: string; color?: string; line?: boolean }[] }) {
  return (
    <div className="dt-chart-tip" role="status">
      <p className="dt-chart-tip__title">{title}</p>
      {rows.map((r) => (
        <p className="dt-chart-tip__row" key={r.label}>
          <span className="dt-inline">
            {r.color && <span className={r.line ? 'dt-swatch dt-swatch--line' : 'dt-swatch'} style={{ background: r.color }} />}
            {r.label}
          </span>
          <span>{r.value}</span>
        </p>
      ))}
    </div>
  );
}

const fmtM = (v: number) => `${v}M`;
const money = (v: number) => `$${Math.round(v * 10) / 10}M`;

/* ── Revenue trend: stacked BG bars + gross-profit line ──────────────── */

export function RevenueTrendChart({
  data,
  series,
  line,
}: {
  data: Record<string, number | string>[];
  series: Series[];
  line?: Series;
}) {
  const h = useAnchoredHover();
  return (
    <div className="dt-chart" role="img" aria-label={`Revenue trend by quarter: ${series.map((s) => s.label).join(', ')}${line ? ` and ${line.label}` : ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} onMouseMove={h.onMouseMove} onMouseLeave={h.onMouseLeave}>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="2 4" />
          <XAxis dataKey="q" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtM} domain={[0, 24]} ticks={[0, 4, 8, 12, 16, 20, 24]} />
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            position={h.hover ? { x: h.hover.x + 24, y: 0 } : undefined}
            content={(p: TooltipProps<number, string>) => {
              if (!p.active || !p.payload?.length) return null;
              const row = p.payload[0].payload as Record<string, number>;
              const total = series.reduce((s, x) => s + (Number(row[x.key]) || 0), 0);
              return (
                <TooltipBody
                  title={p.label}
                  rows={[
                    { label: 'Total Rev', value: money(total) },
                    ...(line ? [{ label: line.label, value: money(Number(row[line.key])), color: line.color, line: true }] : []),
                    ...series.map((s) => ({ label: `${s.label} Rev`, value: money(Number(row[s.key])), color: s.color })),
                  ]}
                />
              );
            }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="rev"
              fill={s.color}
              barSize={40}
              isAnimationActive={false}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
              activeBar={{ stroke: HOVER_STROKE, strokeWidth: 2 }}
            />
          ))}
          {line && (
            <Line
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-surfaces-container)', stroke: line.color, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Stacked status bars (service tickets / critsits) ─────────────────── */

export function StatusBarChart({ data, series, label }: { data: Record<string, number | string>[]; series: Series[]; label: string }) {
  const h = useAnchoredHover();
  return (
    <div className="dt-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} onMouseMove={h.onMouseMove} onMouseLeave={h.onMouseLeave}>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="2 4" />
          <XAxis dataKey="q" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtM} domain={[0, 24]} ticks={[0, 4, 8, 12, 16, 20, 24]} />
          <Tooltip
            cursor={false}
            isAnimationActive={false}
            position={h.hover ? { x: h.hover.x + 24, y: 0 } : undefined}
            content={(p: TooltipProps<number, string>) => {
              if (!p.active || !p.payload?.length) return null;
              const row = p.payload[0].payload as Record<string, number>;
              return <TooltipBody title={p.label} rows={series.map((s) => ({ label: s.label, value: money(Number(row[s.key])), color: s.color }))} />;
            }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="st"
              fill={s.color}
              barSize={40}
              isAnimationActive={false}
              radius={i === series.length - 1 ? [2, 2, 0, 0] : 0}
              activeBar={{ stroke: HOVER_STROKE, strokeWidth: 2 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── CX scores: OSAT / EoDB (0–10, left) and NPS (−100–100, right) ────── */

export function CxScoresChart({ data, left, right }: { data: Record<string, number | string>[]; left: Series[]; right: Series }) {
  const h = useAnchoredHover();
  return (
    <div className="dt-chart dt-chart--tall" role="img" aria-label="CX scores by quarter: OSAT and EoDB on a 0 to 10 scale, NPS on a minus 100 to 100 scale">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -16 }} onMouseMove={h.onMouseMove} onMouseLeave={h.onMouseLeave}>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="2 4" />
          <XAxis dataKey="q" tick={AXIS_TICK} axisLine={false} tickLine={false} padding={{ left: 16, right: 16 }} />
          <YAxis yAxisId="l" tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
          <YAxis yAxisId="r" orientation="right" tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[-100, 100]} ticks={[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]} />
          <Tooltip
            cursor={{ stroke: GRID }}
            isAnimationActive={false}
            position={h.hover ? { x: h.hover.x + 16, y: 0 } : undefined}
            content={(p: TooltipProps<number, string>) => {
              if (!p.active || !p.payload?.length) return null;
              const row = p.payload[0].payload as Record<string, number>;
              return (
                <TooltipBody
                  title={p.label}
                  rows={[...left, right].map((s) => ({ label: s.label, value: String(row[s.key]), color: s.color, line: true }))}
                />
              );
            }}
          />
          {left.map((s) => (
            <Line key={s.key} yAxisId="l" type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4 }} />
          ))}
          <Line yAxisId="r" type="monotone" dataKey={right.key} stroke={right.color} strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Legend entry (token-built; cake& has no chart legend). */
export function LegendItem({ color, label, line }: { color: string; label: ReactNode; line?: boolean }) {
  return (
    <span className="dt-legend">
      <span className={line ? 'dt-swatch dt-swatch--line' : 'dt-swatch'} style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}
