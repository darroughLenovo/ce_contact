import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, DataCell, DataRow, Dropdown, HeaderCell, HeaderRow, HorizontalTabItem, HorizontalTabs, HorizontalTabsList, Table, TextInput } from '@cake-admin/cakeand';
import { BGS, fmtCommaDate, fmtUsd, oppStats, opportunities, type BG, type Opp } from './data';
import { ColumnFilter, RowActions, SortButton, applySort, matches, uniq, type SortDir } from './menus';
import { AiSummaryButton, AiSummaryPanel, BgSwitch, EmptyRow, PagedFooter, SectionCard, Sources, Trend, useAiSummary, usePaging } from './parts';
import { AlertList } from './AlertList';

export const FY_OPTIONS = [
  { value: 'fy2526q4-fy2627q4', label: 'Time FY2526 Q4 - FY2627 Q4' },
  { value: 'fy2627', label: 'Time FY2627 Q1 - FY2627 Q4' },
  { value: 'fy2526', label: 'Time FY2526 Q1 - FY2526 Q4' },
];

const STAGE_COLOR: Record<Opp['stage'], 'blue' | 'green' | 'jade' | 'red' | 'violet'> = {
  Develop: 'blue',
  Execute: 'green',
  Qualify: 'violet',
  'Closed Won': 'jade',
  'Closed Lost': 'red',
};

type F = 'stage' | 'alerts' | 'type' | 'bg';

const COL = {
  opp: '1.8 1 0',
  stage: '1.1 1 0',
  alerts: '1.3 1 0',
  type: '1 1 0',
  bg: '0.8 1 0',
  revenue: '1.2 1 0',
  close: '1.2 1 0',
  owner: '1.6 1 0',
};

/**
 * Figma "Pipeline Health" (10210:7050), single-BG variant "1 bg pipeline"
 * (13075:16856). Gesture 13081:17067: a card-level BG disables the BG column filter.
 * Row kebab opens "Dropdown Menu - Add Resources" (10210:9855).
 */
export function PipelineCard({ onRowAction, initialBg = 'All' }: { onRowAction: (action: string, row: string) => void; initialBg?: 'All' | BG }) {
  const ai = useAiSummary();
  const [time, setTime] = useState(FY_OPTIONS[0].value);
  const [bg, setBg] = useState<'All' | BG>(initialBg);
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<F, string[]>>({ stage: [], alerts: [], type: [], bg: [] });
  const [sort, setSort] = useState<SortDir>(null);

  const scoped = useMemo(() => opportunities.filter((o) => bg === 'All' || o.bg === bg), [bg]);
  const openCount = scoped.filter((o) => o.open).length;
  const closedCount = scoped.length - openCount;

  const rows = useMemo(() => {
    const f = scoped.filter(
      (o) =>
        o.open === (tab === 'open') &&
        matches(q, o.name, o.oppId, o.owner) &&
        (filters.stage.length === 0 || filters.stage.includes(o.stage)) &&
        (filters.type.length === 0 || filters.type.includes(o.type)) &&
        (bg !== 'All' || filters.bg.length === 0 || filters.bg.includes(o.bg)) &&
        (filters.alerts.length === 0 || o.alerts.some((a) => filters.alerts.includes(a)) || (filters.alerts.includes('NA') && o.alerts.length === 0)),
    );
    return applySort(f, sort ? 'revenue' : null, sort);
  }, [scoped, q, filters, sort, bg, tab]);
  const paging = usePaging(rows);

  const fCell = (key: F, label: string, opts: string[]) => {
    const disabled = key === 'bg' && bg !== 'All';
    return (
      <HeaderCell
        style={{ flex: COL[key] }}
        active={!disabled && filters[key].length > 0}
        actions={<ColumnFilter column={label} options={opts} selected={filters[key]} disabled={disabled} onChange={(n) => setFilters((f) => ({ ...f, [key]: n }))} />}
      >
        {label}
      </HeaderCell>
    );
  };

  return (
    <SectionCard
      id="dt-pipeline"
      title="Pipeline Health"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={
        <>
          <div className="dt-time dt-time--wide">
            <Dropdown options={FY_OPTIONS} value={time} onValueChange={setTime} name="pipeline-time" />
          </div>
          <BgSwitch label="Business group" value={bg} onChange={setBg} />
          <AiSummaryButton open={ai.open} onOpen={ai.onOpen} />
        </>
      }
      sources={<Sources />}
    >
      {ai.open && <AiSummaryPanel onClose={ai.onClose} />}
      <section className="dt-panel" aria-labelledby="dt-opp-title">
        <h3 className="dt-panel__title" id="dt-opp-title">
          {bg === 'All' ? 'Opportunity Stats' : 'Key Stats'}
        </h3>
        <div className="dt-statgrid">
          {oppStats.map((s) => (
            <div className="dt-stat" key={s.label}>
              <span className="dt-label">{s.label}</span>
              <span className="dt-stat__value">{s.value}</span>
              <Trend>{s.yoy}</Trend>
            </div>
          ))}
        </div>
      </section>

      <div className="dt-tabsbar">
        <HorizontalTabs value={tab} onValueChange={(v) => setTab(v as 'open' | 'closed')}>
          <HorizontalTabsList aria-label="Opportunity status">
            <HorizontalTabItem value="open">Open ({openCount})</HorizontalTabItem>
            <HorizontalTabItem value="closed">Closed ({closedCount})</HorizontalTabItem>
          </HorizontalTabsList>
        </HorizontalTabs>
        <div className="dt-search dt-search--wide">
          <TextInput aria-label="Search for opportunities" placeholder="Search for opportunities" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="dt-tablewrap">
      <Table
        aria-label={`${tab === 'open' ? 'Open' : 'Closed'} opportunities`}
        header={
          <HeaderRow>
            <HeaderCell style={{ flex: COL.opp }}>Opportunity</HeaderCell>
            {fCell('stage', 'Stage', uniq(opportunities.filter((o) => o.open === (tab === 'open')).map((o) => o.stage)))}
            {fCell('alerts', 'Alerts', ['Past Due', 'ATS', 'NA'])}
            {fCell('type', 'Type', ['Project', 'Renewal'])}
            {fCell('bg', 'BG', BGS)}
            <HeaderCell style={{ flex: COL.revenue }} active={sort !== null} actions={<SortButton column="Revenue" dir={sort} onChange={setSort} />}>
              Revenue (USD)
            </HeaderCell>
            <HeaderCell style={{ flex: COL.close }}>Close Date</HeaderCell>
            <HeaderCell style={{ flex: COL.owner }}>Owner</HeaderCell>
          </HeaderRow>
        }
        footer={<PagedFooter paging={paging} label="Opportunity pages" />}
      >
        {paging.pageRows.length === 0 && <EmptyRow />}
        {paging.pageRows.map((o, i) => (
          <DataRow
            key={o.id}
            selectable={false}
            stripe={i % 2 ? 'inverse' : 'default'}
            action={<RowActions label={o.name} onAction={(a) => onRowAction(a, o.name)} />}
          >
            <DataCell style={{ flex: COL.opp }}>
              <span className="dt-cell-stack">
                <span>{o.name}</span>
                <span className="dt-caption">ID: {o.oppId}</span>
              </span>
            </DataCell>
            <DataCell style={{ flex: COL.stage }}>
              <Badge color={STAGE_COLOR[o.stage]} tone="subtle" dot={false}>
                {o.stage}
              </Badge>
            </DataCell>
            <DataCell style={{ flex: COL.alerts }}>
              <AlertList alerts={o.alerts} />
            </DataCell>
            <DataCell style={{ flex: COL.type }}>{o.type}</DataCell>
            <DataCell style={{ flex: COL.bg }}>{o.bg}</DataCell>
            <DataCell style={{ flex: COL.revenue }}>
              <span className="dt-num">{fmtUsd(o.revenue)}</span>
            </DataCell>
            <DataCell style={{ flex: COL.close }}>{fmtCommaDate(o.closeDate)}</DataCell>
            <DataCell style={{ flex: COL.owner }}>{o.owner}</DataCell>
          </DataRow>
        ))}
      </Table>
      </div>
    </SectionCard>
  );
}
