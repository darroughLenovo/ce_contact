import type { KeyboardEvent, ReactNode } from 'react';
import { Plus, RotateCcw, ThumbsDown, Info } from 'lucide-react';
import { Button, Card, DataCell, DataRow, Divider, HeaderCell, HeaderRow, IconButton, SimpleTooltip, Table } from '@cake-admin/cakeand';
import { fullName, starsOf, SALES_TEAM, type Contact } from './data';
import { ContactIcons, DmBadges, FlagBadge, Stars, Value, orNA } from './parts';

/* ── List view: 01_Contact table (10210:15165) ───────────────────────── */

/** Figma column widths (px at 1320) used as flex ratios so the table narrows. */
const COLS = [
  { key: 'name', label: 'Name', w: 128 },
  { key: 'title', label: 'Job Title', w: 168 },
  { key: 'dm', label: 'Decision Making Role', w: 196 },
  { key: 'seniority', label: 'Seniority', w: 96 },
  { key: 'rating', label: 'Relationship Strength', w: 196 },
  { key: 'functional', label: 'Functional Area', w: 176 },
  { key: 'interests', label: 'Areas of Interest', w: 168 },
  { key: 'updated', label: 'Last Updated', w: 120 },
  { key: 'contacts', label: 'Contacts', w: 112 },
] as const;
// alignSelf: DataRow centers its cells, so multi-line rows leave the cell borders ragged (gap noted).
const flex = (w: number) => ({ flex: `${w} 1 0`, alignSelf: 'stretch' as const });

const onEnter = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

export function ContactTable({ rows, onOpen, empty }: { rows: Contact[]; onOpen?: (c: Contact) => void; empty: ReactNode }) {
  return (
    <Table
      aria-label="Contacts"
      className="ct-table"
      header={
        <HeaderRow>
          {COLS.map((c) => (
            <HeaderCell key={c.key} style={flex(c.w)}>
              {c.label}
            </HeaderCell>
          ))}
        </HeaderRow>
      }
    >
      {rows.length === 0 ? (
        <div role="row" className="ct-empty-row">
          <div role="cell">{empty}</div>
        </div>
      ) : (
        rows.map((c, i) => (
          <DataRow
            key={c.id}
            stripe={i % 2 ? 'inverse' : 'default'}
            selectable={false}
            interactive={!!onOpen}
            tabIndex={onOpen ? 0 : undefined}
            aria-label={onOpen ? `Open ${fullName(c)}` : undefined}
            onClick={onOpen ? () => onOpen(c) : undefined}
            onKeyDown={onOpen ? onEnter(() => onOpen(c)) : undefined}
          >
            <DataCell style={flex(128)}>
              <span className="ct-cell-name">{fullName(c)}</span>
            </DataCell>
            <DataCell style={flex(168)}>
              <span className="ct-cell-text">{c.title}</span>
            </DataCell>
            <DataCell style={flex(196)}>
              {c.dm.length ? <DmBadges roles={c.dm} /> : <span className="ct-na">NA</span>}
            </DataCell>
            <DataCell style={flex(96)}>
              <span className="ct-cell-text">{c.seniority}</span>
            </DataCell>
            <DataCell style={flex(196)}>
              <Stars value={starsOf(c)} />
            </DataCell>
            <DataCell style={flex(176)}>
              <span className="ct-cell-text">
                <Value v={c.functional} />
              </span>
            </DataCell>
            <DataCell style={flex(168)}>
              <span className="ct-cell-text">{orNA(c.interests) ?? <span className="ct-na">Not available</span>}</span>
            </DataCell>
            <DataCell style={flex(120)}>
              <span className="ct-cell-text">{c.updated}</span>
            </DataCell>
            <DataCell style={flex(112)}>
              <ContactIcons contact={c} />
            </DataCell>
          </DataRow>
        ))
      )}
    </Table>
  );
}

/* ── Sales Team tab (no Figma frame — same table pattern) ────────────── */

export function SalesTeamTable({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = SALES_TEAM.filter((s) => !q || `${s.name} ${s.role}`.toLowerCase().includes(q));
  const cols = [
    ['Name', 160],
    ['Role', 200],
    ['Email', 200],
    ['Phone', 160],
    ['Region', 100],
  ] as const;
  return (
    <Table
      aria-label="Sales team"
      className="ct-table"
      header={
        <HeaderRow>
          {cols.map(([l, w]) => (
            <HeaderCell key={l} style={flex(w)}>
              {l}
            </HeaderCell>
          ))}
        </HeaderRow>
      }
    >
      {rows.map((s, i) => (
        <DataRow key={s.id} stripe={i % 2 ? 'inverse' : 'default'} selectable={false}>
          <DataCell style={flex(160)}>
            <span className="ct-cell-name">{s.name}</span>
          </DataCell>
          <DataCell style={flex(200)}>{s.role}</DataCell>
          <DataCell style={flex(200)}>{s.email}</DataCell>
          <DataCell style={flex(160)}>{s.phone}</DataCell>
          <DataCell style={flex(100)}>{s.region}</DataCell>
        </DataRow>
      ))}
    </Table>
  );
}

/* ── Grid view cards (10210:14630 customer, 10210:14012 prospect, 10210:13511 inactive) ── */

function KV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="ct-kv">
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function CardShell({
  c,
  onOpen,
  end,
  rows,
  footer,
}: {
  c: Contact;
  onOpen?: () => void;
  end?: ReactNode;
  rows: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Card
      className={`ct-card${onOpen ? ' ct-card--open' : ''}`}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open ${fullName(c)} details` : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (e) => e.target === e.currentTarget && onEnter(onOpen)(e) : undefined}
    >
      <div className="ct-card__in">
        <div className="ct-card__head">
          <h3 className="ct-card__name">
            <span className="ct-ellipsis">{fullName(c)}</span>
            <DmBadges roles={c.dm} />
          </h3>
          {end && (
            <div className="ct-card__end" onClick={(e) => e.stopPropagation()}>
              {end}
            </div>
          )}
        </div>
        <Divider weight="weak" />
        <dl className="ct-card__rows">{rows}</dl>
        <Divider weight="weak" />
        <div className="ct-card__foot">
          <ContactIcons contact={c} />
          <span className="ct-card__meta">{footer}</span>
        </div>
      </div>
    </Card>
  );
}

export function CustomerCard({ c, onOpen }: { c: Contact; onOpen: () => void }) {
  return (
    <CardShell
      c={c}
      onOpen={onOpen}
      end={c.flag && <FlagBadge flag={c.flag} />}
      rows={
        <>
          <KV k="Job Title">{c.title}</KV>
          <KV k="Seniority">{c.seniority}</KV>
          <KV k="Relationship Strength">
            <Stars value={starsOf(c)} />
          </KV>
          <KV k="Functional Area">
            <Value v={c.functional} />
          </KV>
          <KV k="Areas of Interest">{orNA(c.interests) ?? <span className="ct-na">Not available</span>}</KV>
        </>
      }
      footer={`Last Updated on ${c.updated}`}
    />
  );
}

export function ProspectCard({
  c,
  onAdd,
  onDisqualify,
  onUndo,
}: {
  c: Contact;
  onAdd: () => void;
  onDisqualify: () => void;
  onUndo: () => void;
}) {
  const d = c.disqualified ?? { count: 0, byMe: false };
  return (
    <CardShell
      c={c}
      end={
        <>
          {/* Delta: Figma paints Add green and Disqualify red; cake& Button/IconButton have primary/secondary intents only.
              Tooltips (03_Prospect Tooltips 10210:14199) live in the accessible label: SimpleTooltip can't wrap an interactive trigger. */}
          <IconButton size="xs" label="Add to Contacts — added prospects will be moved to Customer tab as a new contact" icon={<Plus />} onClick={onAdd} />
          {d.byMe ? (
            <Button size="xs" startIcon={<ThumbsDown />} aria-label={`Undo disqualification (${d.count} disqualifications)`} onClick={onUndo}>
              {d.count}
            </Button>
          ) : (
            <Button size="xs" variant="outline" intent="secondary" startIcon={<ThumbsDown />} aria-label={`Disqualify prospect${d.count ? ` (${d.count} disqualifications)` : ''}`} onClick={onDisqualify}>
              {d.count ? d.count : ''}
            </Button>
          )}
        </>
      }
      rows={
        <>
          <KV k="Job Title">{c.title}</KV>
          <KV k="Seniority">{c.seniority}</KV>
          <KV k="Functional Area">
            <Value v={c.functional} />
          </KV>
        </>
      }
      footer={
        c.disqHistory?.length ? (
          <SimpleTooltip
            side="bottom"
            align="end"
            maxWidth={240}
            trigger={
              <span className="ct-disq-trigger">
                Disqualification History <Info className="ct-info" aria-hidden />
              </span>
            }
          >
            <span className="ct-disq">
              {c.disqHistory.map((h) => (
                <span key={h.reason} className="ct-disq__row">
                  <span className="ct-disq__reason">
                    <strong>{h.reason}</strong>
                    <span>{h.count}</span>
                  </span>
                  <span className="ct-disq__by">by {h.by}</span>
                </span>
              ))}
            </span>
          </SimpleTooltip>
        ) : null
      }
    />
  );
}

export function InactiveCard({ c, onReactivate }: { c: Contact; onReactivate: () => void }) {
  return (
    <CardShell
      c={c}
      end={<IconButton size="xs" label="Reactivate — reactivation will return the contact to the Customer tab" icon={<RotateCcw />} onClick={onReactivate} />}
      rows={
        <>
          <KV k="Job Title">{c.title}</KV>
          <KV k="Seniority">{c.seniority}</KV>
          <KV k="Relationship Strength">
            <Stars value={starsOf(c)} />
          </KV>
          <KV k="Functional Area">
            <Value v={c.functional} />
          </KV>
          <KV k="Areas of Interest">{orNA(c.interests) ?? <span className="ct-na">Not available</span>}</KV>
        </>
      }
      footer={c.deactivated ? `Deactivated on ${c.deactivated.on} • By ${c.deactivated.by}` : null}
    />
  );
}
