import { DropdownMenu } from 'radix-ui';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, EllipsisVertical, Funnel, ListFilter, Sparkles } from 'lucide-react';
import { IconButton, MenuContainer, MenuItem } from '@cake-admin/cakeand';

/*
 * cake& ships the menu visuals (MenuContainer + MenuItem) but no anchored
 * popover, so the Radix DropdownMenu primitive supplies positioning, focus and
 * keyboard handling and renders the cake& parts through `asChild`.
 */

type ColumnFilterProps = {
  column: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

/**
 * Header-cell filter (Figma funnel icon). A tonal button marks a column with an
 * active filter; the default (nothing filtered) is NOT highlighted, per the
 * canvas design-review note.
 */
export function ColumnFilter({ column, options, selected, onChange, disabled }: ColumnFilterProps) {
  const active = selected.length > 0;
  const toggle = (o: string) => onChange(selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o]);
  const trigger = (
    <IconButton
      size="xs"
      variant={active ? 'tonal' : 'ghost'}
      intent={active ? 'primary' : 'secondary'}
      label={disabled ? `${column} filter (set by the card BG switch)` : `Filter ${column}${active ? ` (${selected.length} selected)` : ''}`}
      icon={<Funnel />}
      disabled={disabled}
    />
  );
  if (disabled) return trigger;
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="start" sideOffset={4} className="dt-menu">
          <MenuContainer aria-label={`Filter ${column}`} width="calc(var(--space-1000) * 3)" maxHeight="calc(var(--space-1000) * 4)">
            {options.map((o) => (
              <DropdownMenu.Item
                key={o}
                asChild
                onSelect={(e) => {
                  e.preventDefault();
                  toggle(o);
                }}
              >
                <MenuItem showCheckbox checked={selected.includes(o)} showRightSlot={false}>
                  {o}
                </MenuItem>
              </DropdownMenu.Item>
            ))}
            {active && (
              <DropdownMenu.Item asChild onSelect={() => onChange([])}>
                <MenuItem showRightSlot={false}>Clear filter</MenuItem>
              </DropdownMenu.Item>
            )}
          </MenuContainer>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export type SortDir = 'asc' | 'desc' | null;

/** Header-cell sort control (Figma sort-lines icon). Cycles none → desc → asc. */
export function SortButton({ column, dir, onChange }: { column: string; dir: SortDir; onChange: (d: SortDir) => void }) {
  const next: SortDir = dir === null ? 'desc' : dir === 'desc' ? 'asc' : null;
  const icon = dir === 'asc' ? <ArrowUpNarrowWide /> : dir === 'desc' ? <ArrowDownWideNarrow /> : <ListFilter />;
  return (
    <IconButton
      size="xs"
      variant={dir ? 'tonal' : 'ghost'}
      intent={dir ? 'primary' : 'secondary'}
      label={`Sort by ${column}${dir ? (dir === 'asc' ? ', ascending' : ', descending') : ''}`}
      aria-pressed={dir !== null}
      icon={icon}
      onClick={() => onChange(next)}
    />
  );
}

/** Figma "Dropdown Menu - Add Resources" (10210:9855): row overflow actions. */
export function RowActions({ label, onAction }: { label: string; onAction: (action: string) => void }) {
  const items = [
    { key: 'due', label: 'Update Due Date on D365', icon: <Sparkles /> },
    { key: 'view', label: 'View on D365 (or Aviso based on geo)' },
    { key: 'a1', label: 'Action Label' },
    { key: 'a2', label: 'Action Label' },
  ];
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <IconButton size="sm" variant="ghost" intent="secondary" label={`Actions for ${label}`} icon={<EllipsisVertical />} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="end" sideOffset={4} className="dt-menu">
          <MenuContainer aria-label={`Actions for ${label}`} width="calc(var(--space-1000) * 3.5)">
            {items.map((it) => (
              <DropdownMenu.Item key={it.key} asChild onSelect={() => onAction(it.label)}>
                <MenuItem showLeftSlot={!!it.icon} leftSlot={it.icon} showRightSlot={false}>
                  {it.label}
                </MenuItem>
              </DropdownMenu.Item>
            ))}
          </MenuContainer>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* ── Filter/sort helpers ─────────────────────────────────────────────── */

export const uniq = <T,>(xs: T[]) => Array.from(new Set(xs));

export function applySort<T>(rows: T[], key: keyof T | null, dir: SortDir): T[] {
  if (!key || !dir) return rows;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return dir === 'asc' ? c : -c;
  });
}

export const matches = (q: string, ...fields: (string | number)[]) => {
  const s = q.trim().toLowerCase();
  return !s || fields.some((f) => String(f).toLowerCase().includes(s));
};
