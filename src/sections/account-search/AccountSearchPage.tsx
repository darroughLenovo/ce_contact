import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { Button, IconButton, MenuContainer, MenuHeader, MenuItem, TextInput } from '@cake-admin/cakeand';
import { navigate } from '../../shell/router';
import { ACCOUNTS, CURRENT_ACCOUNT_ID, REGIONS, search, type AccountRecord, type Region } from './accounts';
import { AccountTypeahead } from './AccountTypeahead';
import { Highlight, queriesField } from './Highlight';
import './account-search.css';

/** `#/account-search?q=Kroger` — the top-nav search hands its text over here. */
const readParam = (key: string) => {
  const qs = window.location.hash.split('?')[1] ?? '';
  return new URLSearchParams(qs).get(key) ?? '';
};
const readQuery = () => readParam('q');

const open = (_a: AccountRecord) => navigate('overview');

function AccountTile({ a, query, current }: { a: AccountRecord; query: string; current: boolean }) {
  const id = (field: 'IDG' | 'ISG', v?: string) => (
    <span className="as-tile__line">
      <span className={queriesField(query, field) ? 'as-tile__key as-tile__key--hit' : 'as-tile__key'}>{field}</span>{' '}
      {v ? <Highlight text={v} query={query} /> : 'NA'}
    </span>
  );
  return (
    <li>
      <button
        type="button"
        className={`as-tile${current ? ' as-tile--current' : ''}`}
        aria-current={current ? 'page' : undefined}
        onClick={() => open(a)}
      >
        <span className="as-tile__name">
          <Highlight text={a.name} query={query} />
        </span>
        {id('IDG', a.idg)}
        {id('ISG', a.isg)}
        <span className="as-tile__line as-tile__muted">
          {a.region} • Alias: {a.alias ? <Highlight text={a.alias} query={query} /> : 'NA'}
        </span>
        {current && <span className="ce-sr-only">(currently viewing)</span>}
      </button>
    </li>
  );
}

type Filters = { regions: Set<Region>; needIdg: boolean; needIsg: boolean };

function FilterMenu({ filters, onChange, onClose }: { filters: Filters; onChange: (f: Filters) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest('.as-rail__filter')) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  const toggleRegion = (r: Region) => {
    const next = new Set(filters.regions);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    onChange({ ...filters, regions: next });
  };

  return (
    <div className="as-filter" ref={ref} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <MenuContainer width="100%" role="menu" aria-label="Filter accounts">
        <MenuHeader>Region</MenuHeader>
        {REGIONS.map((r) => (
          <MenuItem
            key={r}
            showCheckbox
            showLeftSlot={false}
            showRightSlot={false}
            checked={filters.regions.has(r)}
            onCheckedChange={() => toggleRegion(r)}
            onClick={() => toggleRegion(r)}
          >
            {r}
          </MenuItem>
        ))}
        <MenuHeader>MDM ID</MenuHeader>
        <MenuItem
          showCheckbox
          showLeftSlot={false}
          showRightSlot={false}
          checked={filters.needIdg}
          onCheckedChange={(v) => onChange({ ...filters, needIdg: v })}
          onClick={() => onChange({ ...filters, needIdg: !filters.needIdg })}
        >
          Has IDG ID
        </MenuItem>
        <MenuItem
          showCheckbox
          showLeftSlot={false}
          showRightSlot={false}
          checked={filters.needIsg}
          onCheckedChange={(v) => onChange({ ...filters, needIsg: v })}
          onClick={() => onChange({ ...filters, needIsg: !filters.needIsg })}
        >
          Has ISG ID
        </MenuItem>
      </MenuContainer>
    </div>
  );
}

/**
 * Account Search (Figma 10210:10524 default list, 10210:10632 results,
 * 10210:10714 no result) — the accounts rail — plus the global typeahead
 * (10210:10326 / 10456 / 10502). Choosing an account opens its Overview.
 */
export default function AccountSearchPage() {
  const [query, setQuery] = useState(readQuery);
  const [globalQuery, setGlobalQuery] = useState(() => readParam('ta'));
  const [railOpen, setRailOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ regions: new Set(), needIdg: false, needIsg: false });
  const railInput = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => setQuery(readQuery());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const filtered = ACCOUNTS.filter(
    (a) =>
      (!filters.regions.size || filters.regions.has(a.region)) &&
      (!filters.needIdg || a.idg) &&
      (!filters.needIsg || a.isg),
  );
  const results = search(query, filtered);
  const hasQuery = query.trim().length > 0;
  const filterCount = filters.regions.size + Number(filters.needIdg) + Number(filters.needIsg);

  return (
    <div className="as-layout">
      {railOpen ? (
        <aside className="as-rail" aria-label="Accounts">
          <div className="as-rail__head">
            <h1 className="as-rail__title">{hasQuery ? 'Accounts' : `Accounts (${filtered.length})`}</h1>
            <IconButton
              size="sm"
              intent="secondary"
              variant="ghost"
              label="Collapse accounts panel"
              icon={<ChevronLeft />}
              onClick={() => setRailOpen(false)}
            />
          </div>

          <div className="as-rail__search" ref={railInput}>
            <div className="as-rail__input">
              <TextInput
                size="sm"
                aria-label="Search accounts by name or MDM ID"
                placeholder="Search for accounts"
                startIcon={<Search />}
                endIcon={
                  query ? (
                    <IconButton
                      size="xs"
                      intent="secondary"
                      variant="ghost"
                      label="Clear search"
                      icon={<X />}
                      onClick={() => {
                        setQuery('');
                        railInput.current?.querySelector('input')?.focus();
                      }}
                    />
                  ) : undefined
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <span className="as-rail__filter">
              <IconButton
                size="sm"
                intent="secondary"
                variant={filterCount ? 'tonal' : 'ghost'}
                label={filterCount ? `Open filters (${filterCount} applied)` : 'Open filters'}
                aria-expanded={filterOpen}
                icon={<SlidersHorizontal />}
                onClick={() => setFilterOpen((o) => !o)}
              />
            </span>
            {filterOpen && <FilterMenu filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />}
          </div>

          {results.length ? (
            <ul className="as-rail__list" aria-label={`${results.length} accounts`}>
              {results.map((a) => (
                <AccountTile key={a.id} a={a} query={query} current={a.id === CURRENT_ACCOUNT_ID} />
              ))}
            </ul>
          ) : (
            <div className="as-empty" role="status">
              <SearchX aria-hidden className="as-empty__icon" />
              <strong>No accounts found</strong>
              <span>Try searching by account name, MDM ID or alias</span>
              {filterCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setFilters({ regions: new Set(), needIdg: false, needIsg: false })}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </aside>
      ) : (
        <aside className="as-rail as-rail--collapsed" aria-label="Accounts">
          <IconButton
            size="sm"
            intent="secondary"
            variant="ghost"
            label="Expand accounts panel"
            icon={<ChevronRight />}
            onClick={() => setRailOpen(true)}
          />
        </aside>
      )}

      <section className="ce-page as-main" aria-label="Search all accounts">
        <div className="as-main__intro">
          <h2>Find an account</h2>
          <p>Search every account by name, MDM ID (IDG / ISG) or alias. Choose a result to open its Overview.</p>
        </div>
        <AccountTypeahead
          value={globalQuery}
          onChange={setGlobalQuery}
          onSubmit={(v) => {
            setQuery(v);
            setRailOpen(true);
          }}
          onPick={open}
          initialOpen={Boolean(globalQuery)}
        />
      </section>
    </div>
  );
}
