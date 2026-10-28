import { useEffect, useState, type ReactNode } from 'react';
import { FileSearch, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SimpleTooltip } from '@cake-admin/cakeand';
import type { Metric } from './data';

/** Info glyph with a cake& SimpleTooltip (Figma Tooltip 10210:10782). */
export function InfoTip({ label, title, body }: { label: string; title?: string; body: string }) {
  return (
    <SimpleTooltip trigger={<Info className="ov-info" aria-hidden />} triggerAriaLabel={`About ${label}`}>
      {title && <strong className="ov-tip-title">{title}</strong>}
      <span>{body}</span>
    </SimpleTooltip>
  );
}

export function MetricView({ m }: { m: Metric }) {
  return (
    <div className="ov-metric">
      <div className="ov-metric__label">
        <span>{m.label}</span>
        {m.info && <InfoTip label={m.label} title={m.info.title} body={m.info.body} />}
      </div>
      <div className="ov-metric__value">{m.value || 'NA'}</div>
      {m.sub && <div className="ov-caption">{m.sub}</div>}
      {m.trend && (
        <div className={`ov-trend ov-trend--${m.trend.dir}`}>
          {m.trend.dir === 'up' ? <TrendingUp aria-hidden /> : <TrendingDown aria-hidden />}
          <span>
            <span className="ce-sr-only">{m.trend.dir === 'up' ? 'Up ' : 'Down '}</span>
            {m.trend.text}
          </span>
        </div>
      )}
    </div>
  );
}

export function CardHeader({
  title,
  id,
  level = 'h2',
  subtitle,
  action,
}: {
  title: string;
  id?: string;
  level?: 'h2' | 'h3';
  subtitle?: string;
  action?: ReactNode;
}) {
  const H = level;
  return (
    <header className="ov-head">
      <div className="ov-head__row">
        <H id={id} className={level === 'h2' ? 'ov-h2' : 'ov-h3'}>{title}</H>
        {action}
      </div>
      {subtitle && <p className="ov-subtitle">{subtitle}</p>}
    </header>
  );
}

/** Figma empty state: muted search-document glyph + title + hint. */
export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="ov-empty" role="status">
      <FileSearch className="ov-empty__icon" aria-hidden />
      <p className="ov-empty__title">{title}</p>
      <p className="ov-empty__hint">{hint}</p>
    </div>
  );
}

/** Reads a numeric cake& token (e.g. --radius-50 → 4) for recharts props. */
function useTokenNumber(name: string, fallback: number) {
  const [n, setN] = useState(fallback);
  useEffect(() => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    if (!Number.isNaN(v)) setN(v);
  }, [name]);
  return n;
}

export type Segment = { key: string; label: string; value: number; color: string };

/**
 * One-row 100% stacked bar. recharts draws the marks only; legend, labels and
 * selection controls live outside it as cake& components.
 * Hovered / selected segments get a border (design-review note).
 */
export function StackedBar({
  segments,
  label,
  highlighted,
  onHover,
  onSelect,
}: {
  segments: Segment[];
  label: string;
  highlighted?: string | null;
  onHover?: (key: string | null) => void;
  onSelect?: (key: string) => void;
}) {
  const radius = useTokenNumber('--radius-50', 4);
  const stroke = useTokenNumber('--stroke-200', 2);
  const row = Object.fromEntries(segments.map((s) => [s.key, s.value]));
  const total = segments.reduce((a, s) => a + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  return (
    <div className="ov-bar" role="img" aria-label={label} onMouseLeave={() => onHover?.(null)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[row]} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={0}>
          <XAxis type="number" hide domain={[0, total]} />
          <YAxis type="category" hide />
          {visible.map((s, i) => {
            const first = i === 0;
            const last = i === visible.length - 1;
            const on = highlighted === s.key;
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="one"
                fill={s.color}
                stroke={on ? 'var(--color-text-icon-primary)' : 'var(--color-surfaces-container)'}
                strokeWidth={on ? stroke : stroke / 2}
                radius={[first ? radius : 0, last ? radius : 0, last ? radius : 0, first ? radius : 0]}
                isAnimationActive={false}
                cursor={onSelect ? 'pointer' : undefined}
                onMouseEnter={() => onHover?.(s.key)}
                onClick={() => onSelect?.(s.key)}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Chart legend swatch (a chart mark, not a UI control). */
export function Swatch({ color }: { color: string }) {
  return <span className="ov-swatch" style={{ background: color }} aria-hidden />;
}
