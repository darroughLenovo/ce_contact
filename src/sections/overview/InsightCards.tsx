import { useState } from 'react';
import { ChevronRight, MousePointerClick, Sparkles } from 'lucide-react';
import { Button, Card, Chip } from '@cake-admin/cakeand';
import { navigate } from '../../shell/router';
import {
  BG_COLOR,
  BG_TEXT,
  BG_TINT,
  STRENGTH_COLOR,
  STRENGTH_LABEL,
  formatUsd,
  type BusinessGroup,
  type OverviewData,
  type StrengthGroup,
} from './data';
import { CardHeader, EmptyState, InfoTip, MetricView, StackedBar, Swatch } from './parts';

const pct = (n: number, total: number) => (total ? `${((n / total) * 100).toFixed(2)}%` : 'NA');

/* ── Contact Intelligence (Figma "Contacts" 10210:5172) ── */

export function ContactIntelCard({ data }: { data: OverviewData }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.strength.reduce((a, r) => a + r.count, 0);
  const groups = (Object.keys(STRENGTH_COLOR) as StrengthGroup[]).map((g) => ({
    key: g,
    label: STRENGTH_LABEL[g],
    color: STRENGTH_COLOR[g],
    value: data.strength.filter((r) => r.group === g).reduce((a, r) => a + r.count, 0),
  }));

  return (
    <Card className="ov-card" role="region" aria-labelledby="ov-contacts-h">
      <div className="ov-card__body">
        <CardHeader
          id="ov-contacts-h"
          title="Contact Intelligence"
          subtitle="Contact relationships and engagement health at a glance."
          action={
            <Button size="sm" variant="ghost" endIcon={<ChevronRight />} onClick={() => navigate('contacts')}>
              View Contacts
            </Button>
          }
        />

        {data.contactInsight && (
          <div className="ov-ai">
            <Sparkles className="ov-ai__icon" aria-hidden />
            <p className="ov-body1">{data.contactInsight}</p>
          </div>
        )}

        <section className="ov-panel" aria-labelledby="ov-mix-h">
          <div className="ov-label-row">
            <h3 id="ov-mix-h" className="ov-subtitle2">
              Relationship Strength Mix
            </h3>
            {total > 0 && (
              <InfoTip
                label="Relationship Strength Mix"
                body="Share of account contacts by relationship rating."
              />
            )}
          </div>
          {total === 0 ? (
            <p className="ov-caption ov-muted">No relationship strength rating available</p>
          ) : (
            <>
              <StackedBar
                segments={groups}
                label={groups.map((g) => `${g.label} ${pct(g.value, total)}`).join(', ')}
                highlighted={hover}
                onHover={setHover}
              />
              <ul className="ov-legend">
                {data.strength.map((r) => (
                  <li
                    key={r.label}
                    className="ov-legend__row"
                    data-active={hover === r.group || undefined}
                    onMouseEnter={() => setHover(r.group)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="ov-legend__name">
                      <Swatch color={STRENGTH_COLOR[r.group]} />
                      <Button
                        size="xs"
                        variant="ghost"
                        onFocus={() => setHover(r.group)}
                        onBlur={() => setHover(null)}
                        onClick={() => navigate('contacts')}
                      >
                        {r.label}
                      </Button>
                    </span>
                    <span className="ov-legend__num">{r.count}</span>
                    <span className="ov-legend__pct">{pct(r.count, total)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="ov-stats">
          {data.statCards.map((s) => (
            <section key={s.title} className="ov-panel ov-stat" aria-label={s.title}>
              <div className="ov-stat__value">{s.value}</div>
              <h3 className="ov-subtitle2 ov-stat__title">{s.title}</h3>
              <p className="ov-caption ov-muted">{s.body}</p>
              <div className="ov-stat__action">
                <Button size="sm" variant="ghost" endIcon={<ChevronRight />} onClick={() => navigate(s.to)}>
                  {s.action}
                </Button>
              </div>
            </section>
          ))}
        </div>

        <p className="ov-caption ov-muted">{data.contactSource}</p>
      </div>
    </Card>
  );
}

/* ── Share of Wallet (Figma "bg-allocation" 10210:5252) ── */

export function ShareOfWalletCard({ data }: { data: OverviewData }) {
  const [selected, setSelected] = useState<BusinessGroup>('IDG');
  const [hover, setHover] = useState<string | null>(null);
  const w = data.wallet;

  return (
    <Card className="ov-card" role="region" aria-labelledby="ov-sow-h">
      <div className="ov-card__body">
        <CardHeader
          id="ov-sow-h"
          title="Share of Wallet"
          subtitle="Lenovo revenue breakdown by business group, channel, and partner."
        />
        {!w ? (
          <EmptyState title="No share of wallet data yet" hint="Share of wallet data will appear here when available." />
        ) : (
          <WalletBody w={w} selected={selected} setSelected={setSelected} hover={hover} setHover={setHover} />
        )}
      </div>
    </Card>
  );
}

function WalletBody({
  w,
  selected,
  setSelected,
  hover,
  setHover,
}: {
  w: NonNullable<OverviewData['wallet']>;
  selected: BusinessGroup;
  setSelected: (g: BusinessGroup) => void;
  hover: string | null;
  setHover: (k: string | null) => void;
}) {
  const total = w.slices.reduce((a, s) => a + s.amount, 0);
  const current = w.slices.find((s) => s.group === selected) ?? w.slices[0];
  const segments = w.slices.map((s) => ({ key: s.group, label: s.group, value: s.amount, color: BG_COLOR[s.group] }));

  return (
    <div className="ov-sow">
      <div className="ov-sow__col">
        <section className="ov-panel ov-panel--roomy" aria-labelledby="ov-itspend-h">
          <CardHeader
            id="ov-itspend-h"
            level="h3"
            title="Customer IT Spend"
            subtitle="Lenovo spend (%) is calculated using spend from matching timeframes only."
          />
          <div className="ov-metrics">
            {w.itSpend.map((m) => (
              <MetricView key={m.label} m={m} />
            ))}
          </div>
        </section>

        <section className="ov-panel ov-panel--roomy" aria-labelledby="ov-breakdown-h">
          <CardHeader
            id="ov-breakdown-h"
            level="h3"
            title="Lenovo Spend Breakdown (USD)"
            action={
              <Button size="sm" variant="ghost" endIcon={<ChevronRight />} onClick={() => navigate('details')}>
                View Lenovo Purchase History
              </Button>
            }
          />
          <div className="ov-breakdown">
            <StackedBar
              segments={segments}
              label={segments.map((s) => `${s.label} ${formatUsd(s.value)}`).join(', ')}
              highlighted={hover ?? selected}
              onHover={setHover}
              onSelect={(k) => setSelected(k as BusinessGroup)}
            />
            <div className="ov-chips" role="group" aria-label="Business group">
              {w.slices.map((s) => (
                <Chip
                  key={s.group}
                  size="sm"
                  type={s.group === selected ? 'primary' : 'secondary'}
                  leadingIcon={<Swatch color={BG_COLOR[s.group]} />}
                  onClick={() => setSelected(s.group)}
                  onMouseEnter={() => setHover(s.group)}
                  onMouseLeave={() => setHover(null)}
                >
                  {`${s.group}: ${formatUsd(s.amount)} (${pct(s.amount, total).replace('.00', '')})`}
                  {s.group === selected && <span className="ce-sr-only"> (selected)</span>}
                </Chip>
              ))}
            </div>
            <p className="ov-hint">
              <MousePointerClick aria-hidden />
              Click the bar or legend to view product categories.
            </p>
          </div>

          <div className="ov-cats" style={{ background: BG_TINT[current.group] }} aria-live="polite">
            <h4 className="ov-cats__head" style={{ color: BG_TEXT[current.group] }}>
              {current.group} Product Categories
            </h4>
            <ul className="ov-cats__list">
              {current.categories.map((c) => (
                <li key={c.name} className="ov-legend__row">
                  <span className="ov-legend__name ov-subtitle2">{c.name}</span>
                  <span className="ov-legend__num">{formatUsd(c.amount)}</span>
                  <span className="ov-legend__pct">{pct(c.amount, current.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="ov-sow__col">
        <div className="ov-ai">
          <Sparkles className="ov-ai__icon" aria-hidden />
          <div className="ov-ai__stack">
            {w.suggestions.map((s) => (
              <p key={s.title} className="ov-body1">
                <strong>{s.title}</strong>
                <br />
                {s.body}
              </p>
            ))}
          </div>
        </div>

        <section className="ov-panel ov-panel--roomy" aria-labelledby="ov-comp-h">
          <CardHeader
            id="ov-comp-h"
            level="h3"
            title="Top Competitors"
            action={
              <Button size="sm" variant="ghost" endIcon={<ChevronRight />} onClick={() => navigate('details')}>
                View Customer IT Landscape
              </Button>
            }
          />
          <ul className="ov-comp">
            {w.competitors.map((c) => (
              <li key={c.name}>
                <div className="ov-label-row">
                  <h4 className="ov-subtitle2">{c.name}</h4>
                  <InfoTip label={c.name} title="Sources" body={c.source} />
                </div>
                <p className="ov-body2">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
