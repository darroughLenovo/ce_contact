import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { DataCell, DataRow, HeaderCell, HeaderRow, Table, TextInput } from '@cake-admin/cakeand';
import { fmtShortDate, itRows, type ItRow } from './data';
import { ColumnFilter, SortButton, applySort, matches, uniq, type SortDir } from './menus';
import { AiSummaryButton, AiSummaryPanel, EmptyRow, PagedFooter, SectionCard, useAiSummary, usePaging } from './parts';

type FilterKey = 'vendor' | 'category' | 'product' | 'family' | 'delivery' | 'source';
type SortKey = 'firstDetected' | 'lastVerified';

const COLS: { key: keyof ItRow; label: string; flex: string; kind: 'filter' | 'sort' }[] = [
  { key: 'vendor', label: 'Vendor', flex: '1.5 1 0', kind: 'filter' },
  { key: 'category', label: 'Category', flex: '1.4 1 0', kind: 'filter' },
  { key: 'product', label: 'Product', flex: '1.5 1 0', kind: 'filter' },
  { key: 'family', label: 'Product Family', flex: '1.5 1 0', kind: 'filter' },
  { key: 'firstDetected', label: 'First Detected', flex: '1.3 1 0', kind: 'sort' },
  { key: 'lastVerified', label: 'Last Verified', flex: '1.2 1 0', kind: 'sort' },
  { key: 'delivery', label: 'Delivery Type', flex: '1.3 1 0', kind: 'filter' },
  { key: 'source', label: 'Source', flex: '0.8 1 0', kind: 'filter' },
];

/** Figma "Customer IT Landscape" (10210:5838). */
export function ItLandscapeCard() {
  const ai = useAiSummary();
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({ vendor: [], category: [], product: [], family: [], delivery: [], source: [] });
  const [sort, setSort] = useState<{ key: SortKey | null; dir: SortDir }>({ key: null, dir: null });

  const rows = useMemo(() => {
    const f = itRows.filter(
      (r) =>
        matches(q, r.vendor, r.product, r.category, r.family) &&
        (Object.keys(filters) as FilterKey[]).every((k) => filters[k].length === 0 || filters[k].includes(r[k])),
    );
    return applySort(f, sort.key, sort.dir);
  }, [q, filters, sort]);
  const paging = usePaging(rows);

  return (
    <SectionCard
      id="dt-it"
      title="Customer IT Landscape"
      actions={
        <>
          <div className="dt-search dt-search--wide">
            <TextInput aria-label="Search for products" placeholder="Search for products" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <AiSummaryButton open={ai.open} onOpen={ai.onOpen} />
        </>
      }
    >
      {ai.open && <AiSummaryPanel onClose={ai.onClose} />}
      <div className="dt-tablewrap">
      <Table
        aria-label="Customer IT landscape"
        header={
          <HeaderRow>
            {COLS.map((c) => (
              <HeaderCell
                key={c.key}
                style={{ flex: c.flex }}
                active={c.kind === 'sort' ? sort.key === c.key : filters[c.key as FilterKey]?.length > 0}
                actions={
                  c.kind === 'sort' ? (
                    <SortButton
                      column={c.label}
                      dir={sort.key === c.key ? sort.dir : null}
                      onChange={(dir) => setSort({ key: dir ? (c.key as SortKey) : null, dir })}
                    />
                  ) : (
                    <ColumnFilter
                      column={c.label}
                      options={uniq(itRows.map((r) => String(r[c.key])))}
                      selected={filters[c.key as FilterKey]}
                      onChange={(next) => setFilters((f) => ({ ...f, [c.key]: next }))}
                    />
                  )
                }
              >
                {c.label}
              </HeaderCell>
            ))}
          </HeaderRow>
        }
        footer={<PagedFooter paging={paging} label="IT landscape pages" />}
      >
        {paging.pageRows.length === 0 && <EmptyRow />}
        {paging.pageRows.map((r, i) => (
          <DataRow key={r.id} selectable={false} stripe={i % 2 ? 'inverse' : 'default'}>
            {COLS.map((c) => (
              <DataCell key={c.key} style={{ flex: c.flex }}>
                {c.kind === 'sort' ? fmtShortDate(String(r[c.key])) : String(r[c.key])}
              </DataCell>
            ))}
          </DataRow>
        ))}
      </Table>
      </div>
    </SectionCard>
  );
}
