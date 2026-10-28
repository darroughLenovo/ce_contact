import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { DataCell, DataRow, Dropdown, HeaderCell, HeaderRow, Table, TextInput } from '@cake-admin/cakeand';
import { BGS, BG_COLOR, productRows, revenueTotals, revenueTrend, spendByCategory, type BG, type ProductRow } from './data';
import { LegendItem, RevenueTrendChart } from './charts';
import { ColumnFilter, SortButton, applySort, matches, uniq, type SortDir } from './menus';
import { AiSummaryButton, AiSummaryPanel, BgSwitch, EmptyRow, PagedFooter, SectionCard, Sources, Trend, useAiSummary, usePaging } from './parts';

export const TIME_OPTIONS = [
  { value: '8', label: 'Time: Last 8 Quarters' },
  { value: '4', label: 'Time: Last 4 Quarters' },
  { value: '2', label: 'Time: Last 2 Quarters' },
];

const GP_COLOR = 'var(--color-primary-primary)';

/**
 * Figma "Lenovo Purchase History" (10210:5915), single-BG variant
 * "1 bg purchase history" (10210:8087), empty BG column "Empty purchase"
 * (14572:18414, reached with Time: Last 2 Quarters — no ISG purchases).
 * Gestures 10210:9851 / 9854: picking a BG on the card switch scopes every
 * block and disables the table's BG column filter.
 */
export function PurchaseHistoryCard({ initialBg = 'All' }: { initialBg?: 'All' | BG }) {
  const ai = useAiSummary();
  const [time, setTime] = useState('8');
  const [bg, setBg] = useState<'All' | BG>(initialBg);

  const quarters = Number(time);
  const trend = revenueTrend.slice(-quarters);
  const visibleBgs: BG[] = bg === 'All' ? BGS : [bg];
  /** ISG has no purchases in the last two quarters (Empty purchase variant). */
  const emptyBg = (b: BG) => quarters === 2 && b === 'ISG';

  return (
    <SectionCard
      id="dt-purchase"
      title="Lenovo Purchase History"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={
        <>
          <div className="dt-time">
            <Dropdown options={TIME_OPTIONS} value={time} onValueChange={setTime} name="purchase-time" />
          </div>
          <BgSwitch label="Business group" value={bg} onChange={setBg} />
          <AiSummaryButton open={ai.open} onOpen={ai.onOpen} />
        </>
      }
      sources={<Sources />}
    >
      {ai.open && <AiSummaryPanel onClose={ai.onClose} />}

      <div className="dt-ph-top">
        <section className="dt-panel dt-panel--outline dt-ph-revenue" aria-labelledby="dt-rev-title">
          <h3 className="dt-panel__title" id="dt-rev-title">
            Total Revenue and Trend
          </h3>
          <div className="dt-ph-revenue__grid">
            <div className="dt-ph-total">
              <span className="dt-label">Total Revenue (USD)</span>
              <span className="dt-stat__value">{revenueTotals.total}</span>
              <Trend>{revenueTotals.yoy}</Trend>
              <div className="dt-mixbar" role="img" aria-label={`Revenue mix: ${visibleBgs.map((b) => `${b} ${bg === 'All' ? revenueTotals.mix[b] : 100}%`).join(', ')}`}>
                {visibleBgs.map((b) => (
                  <span key={b} style={{ flex: `${bg === 'All' ? revenueTotals.mix[b] : 100} 1 0`, background: BG_COLOR[b] }} />
                ))}
              </div>
              <dl className="dt-ph-legend">
                <div>
                  <dt>
                    <LegendItem color={GP_COLOR} label="Gross Profit" line />
                  </dt>
                  <dd>{revenueTotals.grossProfit}</dd>
                </div>
                {BGS.map((b) => (
                  <div key={b}>
                    <dt>
                      <LegendItem color={BG_COLOR[b]} label={b} />
                    </dt>
                    <dd>
                      {revenueTotals.byBg[b].value} ({bg === 'All' ? `${revenueTotals.byBg[b].share}%` : `${revenueTotals.byBg[b].shareSolo}%`})
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="dt-panel dt-ph-trend">
              <h4 className="dt-ph-trend__title">Revenue Trend (USD)</h4>
              <RevenueTrendChart
                data={trend}
                series={visibleBgs.map((b) => ({ key: b, label: b, color: BG_COLOR[b] }))}
                line={bg === 'All' ? { key: 'gp', label: 'Gross Profit', color: GP_COLOR } : undefined}
              />
            </div>
          </div>
        </section>

        <aside className="dt-ai dt-ph-insights" aria-label="AI insights">
          <div className="dt-ph-insight">
            <Sparkles aria-hidden className="dt-ph-insight__icon" />
            <div>
              <h3 className="dt-ai__subtitle">Next Peak Window</h3>
              <p className="dt-ai__text">
                <strong>Oct 2026 - Jan 2027 (Q4).</strong> Quisque faucibus ex sapien vitae pellentesque sem placerat. Tempus leo eu tempor.
              </p>
              <h3 className="dt-ai__subtitle">Cross-Sell Gaps</h3>
              <ul className="dt-bullets">
                <li>Fusce dictum lorem</li>
                <li>Quis turpis efficitur accumsan.</li>
                <li>Quis turpis efficitur accumsan.</li>
              </ul>
              <h3 className="dt-ai__subtitle">Growing &amp; Declining Categories</h3>
              <ul className="dt-bullets">
                <li>Dusce dictum lorem</li>
                <li>Fusce dictum lorem</li>
                <li>Quis turpis efficitur accumsan.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <section className="dt-panel dt-panel--outline" aria-labelledby="dt-spend-title">
        <h3 className="dt-panel__title" id="dt-spend-title">
          Spend by Product Category
        </h3>
        {bg === 'All' ? (
          <div className="dt-spend">
            {BGS.map((b) => (
              <SpendList key={b} bg={b} empty={emptyBg(b)} />
            ))}
          </div>
        ) : (
          <SpendStrip bg={bg} empty={emptyBg(bg)} />
        )}
      </section>

      <PurchasedProducts bg={bg} />
    </SectionCard>
  );
}

function SpendList({ bg, empty }: { bg: BG; empty: boolean }) {
  return (
    <div className="dt-spend__col">
      <h4 className="dt-spend__bg" style={{ color: BG_COLOR[bg] }}>
        {bg}
      </h4>
      {empty ? (
        <p className="dt-spend__empty">No purchase for the selected period.</p>
      ) : (
        <dl className="dt-spend__list">
          {spendByCategory[bg].map((c) => (
            <div key={c.name}>
              <dt>{c.name}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** Single-BG layout (10210:8087): categories laid out horizontally. */
function SpendStrip({ bg, empty }: { bg: BG; empty: boolean }) {
  const cats = Array.from({ length: 10 }, (_, i) => ({ name: `Category ${i + 1}`, value: '$123 (19.9%)' }));
  return (
    <div className="dt-spend__col">
      <h4 className="dt-spend__bg" style={{ color: BG_COLOR[bg] }}>
        {bg}
      </h4>
      {empty ? (
        <p className="dt-spend__empty">No purchase for the selected period.</p>
      ) : (
        <dl className="dt-spend__strip">
          {cats.map((c) => (
            <div key={c.name}>
              <dt>{c.name}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

type PFilter = 'bg' | 'category' | 'quarter' | 'partner';
type PSort = 'name' | 'pn' | 'revenue' | 'qty';

function PurchasedProducts({ bg }: { bg: 'All' | BG }) {
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<PFilter, string[]>>({ bg: [], category: [], quarter: [], partner: [] });
  const [sort, setSort] = useState<{ key: PSort | null; dir: SortDir }>({ key: null, dir: null });

  const rows = useMemo(() => {
    const f = productRows.filter(
      (r) =>
        (bg === 'All' || r.bg === bg) &&
        matches(q, r.name, r.pn, r.category) &&
        (Object.keys(filters) as PFilter[]).every((k) => (k === 'bg' && bg !== 'All') || filters[k].length === 0 || filters[k].includes(r[k] || 'NA')),
    );
    return applySort(f, sort.key, sort.dir);
  }, [q, filters, sort, bg]);
  const paging = usePaging(rows);

  const filterCell = (key: PFilter, label: string, flex: string, opts: string[]) => (
    <HeaderCell
      style={{ flex }}
      active={filters[key].length > 0 && !(key === 'bg' && bg !== 'All')}
      actions={
        <ColumnFilter
          column={label}
          options={opts}
          selected={filters[key]}
          disabled={key === 'bg' && bg !== 'All'}
          onChange={(next) => setFilters((f) => ({ ...f, [key]: next }))}
        />
      }
    >
      {label}
    </HeaderCell>
  );
  const sortCell = (key: PSort, label: string, flex: string) => (
    <HeaderCell
      style={{ flex }}
      active={sort.key === key}
      actions={<SortButton column={label} dir={sort.key === key ? sort.dir : null} onChange={(dir) => setSort({ key: dir ? key : null, dir })} />}
    >
      {label}
    </HeaderCell>
  );

  const cellText = (r: ProductRow, k: keyof ProductRow) => (r[k] === '' ? 'NA' : String(r[k]));

  return (
    <section className="dt-panel dt-panel--outline" aria-labelledby="dt-products-title">
      <div className="dt-card__head">
        <h3 className="dt-panel__title" id="dt-products-title">
          Purchased Products
        </h3>
        <div className="dt-search dt-search--wide">
          <TextInput aria-label="Search for products" placeholder="Search for products" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="dt-tablewrap">
      <Table
        aria-labelledby="dt-products-title"
        header={
          <HeaderRow>
            {filterCell('bg', 'BG', '0.6 1 0', BGS)}
            {filterCell('category', 'Product Categories', '1.6 1 0', uniq(productRows.map((r) => r.category)))}
            {sortCell('name', 'Product Name', '1.4 1 0')}
            {sortCell('pn', 'PN', '1 1 0')}
            {sortCell('revenue', 'Revenue (USD)', '1.3 1 0')}
            {sortCell('qty', 'Purchased QTY', '1.3 1 0')}
            {filterCell('quarter', 'Purchase Quarter', '1.5 1 0', uniq(productRows.map((r) => r.quarter)))}
            {filterCell('partner', 'Business Partners', '1.5 1 0', uniq(productRows.map((r) => r.partner || 'NA')))}
          </HeaderRow>
        }
        footer={<PagedFooter paging={paging} label="Purchased products pages" />}
      >
        {paging.pageRows.length === 0 && <EmptyRow />}
        {paging.pageRows.map((r, i) => (
          <DataRow key={r.id} selectable={false} stripe={i % 2 ? 'inverse' : 'default'}>
            <DataCell style={{ flex: '0.6 1 0' }}>{r.bg}</DataCell>
            <DataCell style={{ flex: '1.6 1 0' }}>{r.category}</DataCell>
            <DataCell style={{ flex: '1.4 1 0' }}>{r.name}</DataCell>
            <DataCell style={{ flex: '1 1 0' }}>{r.pn}</DataCell>
            <DataCell style={{ flex: '1.3 1 0' }}>
              <span className="dt-num">{r.revenue}</span>
            </DataCell>
            <DataCell style={{ flex: '1.3 1 0' }}>
              <span className="dt-num">{r.qty}</span>
            </DataCell>
            <DataCell style={{ flex: '1.5 1 0' }}>{r.quarter}</DataCell>
            <DataCell style={{ flex: '1.5 1 0' }}>{cellText(r, 'partner')}</DataCell>
          </DataRow>
        ))}
      </Table>
      </div>
    </section>
  );
}
