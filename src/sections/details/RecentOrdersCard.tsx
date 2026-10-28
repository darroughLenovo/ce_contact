import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Badge, DataCell, DataRow, Dropdown, HeaderCell, HeaderRow, IconButton, Table, TextInput } from '@cake-admin/cakeand';
import { BGS, fmtDate, fmtUsd, orders, type OrderStatus } from './data';
import { ColumnFilter, RowActions, SortButton, applySort, matches, uniq, type SortDir } from './menus';
import { AiSummaryButton, AiSummaryPanel, EmptyRow, PagedFooter, SectionCard, Sources, useAiSummary, usePaging } from './parts';
import { AlertList } from './AlertList';
import { FY_OPTIONS } from './PipelineCard';

const STATUS_COLOR: Record<OrderStatus, 'blue' | 'green' | 'orange'> = {
  'Released to Manufacturing': 'blue',
  'Order Received': 'blue',
  Delivered: 'green',
  'Order Processing': 'blue',
  'Customer Action': 'orange',
};

const COL = {
  expand: '0.35 1 0',
  date: '1.1 1 0',
  id: '1.1 1 0',
  products: '1 1 0',
  bg: '0.6 1 0',
  category: '1.2 1 0',
  reseller: '1.1 1 0',
  qty: '0.7 1 0',
  rev: '0.9 1 0',
  status: '1.9 1 0',
  alerts: '1.9 1 0',
};

type F = 'date' | 'bg' | 'status' | 'alerts';
type S = 'qty' | 'revenue';

/** Figma "WIP Recent Orders" (13075:14908): expandable order rows with line items. */
export function RecentOrdersCard({ onRowAction }: { onRowAction: (action: string, row: string) => void }) {
  const ai = useAiSummary();
  const [time, setTime] = useState(FY_OPTIONS[0].value);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<F, string[]>>({ date: [], bg: [], status: [], alerts: [] });
  const [sort, setSort] = useState<{ key: S | null; dir: SortDir }>({ key: null, dir: null });
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ord0']));

  const rows = useMemo(() => {
    const f = orders.filter(
      (o) =>
        matches(q, o.orderId, o.category, o.reseller, o.status) &&
        (filters.date.length === 0 || filters.date.includes(fmtDate(o.date))) &&
        (filters.bg.length === 0 || filters.bg.includes(o.bg)) &&
        (filters.status.length === 0 || filters.status.includes(o.status)) &&
        (filters.alerts.length === 0 || o.alerts.some((a) => filters.alerts.includes(a))),
    );
    return applySort(f, sort.key, sort.dir);
  }, [q, filters, sort]);
  const paging = usePaging(rows);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const fCell = (key: F, label: string, flex: string, opts: string[]) => (
    <HeaderCell
      style={{ flex }}
      active={filters[key].length > 0}
      actions={<ColumnFilter column={label} options={opts} selected={filters[key]} onChange={(n) => setFilters((f) => ({ ...f, [key]: n }))} />}
    >
      {label}
    </HeaderCell>
  );
  const sCell = (key: S, label: string, flex: string) => (
    <HeaderCell style={{ flex }} active={sort.key === key} actions={<SortButton column={label} dir={sort.key === key ? sort.dir : null} onChange={(dir) => setSort({ key: dir ? key : null, dir })} />}>
      {label}
    </HeaderCell>
  );

  return (
    <SectionCard
      id="dt-orders"
      title="Recent Orders"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={
        <>
          <div className="dt-search">
            <TextInput aria-label="Search for orders" placeholder="Search for orders" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="dt-time dt-time--wide">
            <Dropdown options={FY_OPTIONS} value={time} onValueChange={setTime} name="orders-time" />
          </div>
          <AiSummaryButton open={ai.open} onOpen={ai.onOpen} />
        </>
      }
      sources={<Sources />}
    >
      {ai.open && <AiSummaryPanel onClose={ai.onClose} />}
      <div className="dt-tablewrap">
      <Table
        aria-label="Recent orders"
        header={
          <HeaderRow>
            <HeaderCell style={{ flex: COL.expand }}>
              <span className="ce-sr-only">Expand</span>
            </HeaderCell>
            {fCell('date', 'Date', COL.date, uniq(orders.map((o) => fmtDate(o.date))))}
            <HeaderCell style={{ flex: COL.id }}>Order ID</HeaderCell>
            <HeaderCell style={{ flex: COL.products }}>No. of Products</HeaderCell>
            {fCell('bg', 'BG', COL.bg, BGS)}
            <HeaderCell style={{ flex: COL.category }}>Category</HeaderCell>
            <HeaderCell style={{ flex: COL.reseller }}>Reseller</HeaderCell>
            {sCell('qty', 'QTY', COL.qty)}
            {sCell('revenue', 'Rev. (USD)', COL.rev)}
            {fCell('status', 'Status', COL.status, uniq(orders.map((o) => o.status)))}
            {fCell('alerts', 'Alerts', COL.alerts, ['Credit Block', 'Stop Shipment', 'Customer Hold'])}
          </HeaderRow>
        }
        footer={<PagedFooter paging={paging} label="Order pages" />}
      >
        {paging.pageRows.length === 0 && <EmptyRow />}
        {paging.pageRows.map((o, i) => {
          const open = expanded.has(o.id);
          return (
            <Fragment key={o.id}>
              <DataRow
                selectable={false}
                selected={open}
                stripe={i % 2 ? 'inverse' : 'default'}
                action={<RowActions label={`order ${o.orderId}`} onAction={(a) => onRowAction(a, `order ${o.orderId}`)} />}
              >
                <DataCell style={{ flex: COL.expand }}>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    intent="secondary"
                    label={`${open ? 'Collapse' : 'Expand'} order ${o.orderId}`}
                    aria-expanded={open}
                    aria-controls={`${o.id}-lines`}
                    icon={open ? <ChevronDown /> : <ChevronRight />}
                    onClick={() => toggle(o.id)}
                  />
                </DataCell>
                <DataCell style={{ flex: COL.date }}>{fmtDate(o.date)}</DataCell>
                <DataCell style={{ flex: COL.id }}>{o.orderId}</DataCell>
                <DataCell style={{ flex: COL.products }}>
                  <span className="dt-num">{o.products}</span>
                </DataCell>
                <DataCell style={{ flex: COL.bg }}>{o.bg}</DataCell>
                <DataCell style={{ flex: COL.category }}>{o.category}</DataCell>
                <DataCell style={{ flex: COL.reseller }}>{o.reseller}</DataCell>
                <DataCell style={{ flex: COL.qty }}>
                  <span className="dt-num">{o.qty}</span>
                </DataCell>
                <DataCell style={{ flex: COL.rev }}>
                  <span className="dt-num">{fmtUsd(o.revenue)}</span>
                </DataCell>
                <DataCell style={{ flex: COL.status }}>
                  <Badge color={STATUS_COLOR[o.status]} tone="subtle" dot={false} title={o.status}>
                    {o.status}
                  </Badge>
                </DataCell>
                <DataCell style={{ flex: COL.alerts }}>
                  <AlertList alerts={o.alerts} />
                </DataCell>
              </DataRow>
              {open && (
                <div role="row" className="dt-subrow" id={`${o.id}-lines`}>
                  <div role="gridcell" className="dt-subrow__cell">
                    <Table
                      aria-label={`Line items for order ${o.orderId}`}
                      header={
                        <HeaderRow>
                          <HeaderCell>Family</HeaderCell>
                          <HeaderCell style={{ flex: '1.4 1 0' }}>Product Name</HeaderCell>
                          <HeaderCell style={{ flex: '1.4 1 0' }}>Product ID</HeaderCell>
                          <HeaderCell>Status</HeaderCell>
                          <HeaderCell>Delivery Date</HeaderCell>
                          <HeaderCell style={{ flex: '0.6 1 0' }}>QTY</HeaderCell>
                          <HeaderCell>Revenue (USD)</HeaderCell>
                          <HeaderCell style={{ flex: '2.2 1 0' }}>Alerts</HeaderCell>
                        </HeaderRow>
                      }
                    >
                      {o.lines.map((l, j) => (
                        <DataRow key={j} selectable={false} stripe={j % 2 ? 'inverse' : 'default'}>
                          <DataCell>{l.family}</DataCell>
                          <DataCell style={{ flex: '1.4 1 0' }}>{l.name}</DataCell>
                          <DataCell style={{ flex: '1.4 1 0' }}>{l.productId}</DataCell>
                          <DataCell>{l.status}</DataCell>
                          <DataCell>{fmtDate(l.delivery)}</DataCell>
                          <DataCell style={{ flex: '0.6 1 0' }}>
                            <span className="dt-num">{l.qty}</span>
                          </DataCell>
                          <DataCell>
                            <span className="dt-num">{fmtUsd(l.revenue)}</span>
                          </DataCell>
                          <DataCell style={{ flex: '2.2 1 0' }}>
                            <AlertList alerts={l.alerts} />
                          </DataCell>
                        </DataRow>
                      ))}
                    </Table>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </Table>
      </div>
    </SectionCard>
  );
}
