import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronRight, Sparkles, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Button, Card, ContentSwitcher, IconButton, Pagination, RowsPerPage } from '@cake-admin/cakeand';
import type { BG } from './data';

/* ── Section card chrome ─────────────────────────────────────────────── */

type SectionCardProps = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Controls in the header's trailing slot (filters, BG switch, AI Summary). */
  actions?: ReactNode;
  /** Footer "Sources: … • As of …" line. */
  sources?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Figma "Company Info" module card. The surface is cake& Card; Figma draws a
 * 4px-radius card with the CE card shadow, cake& Card is 24px with
 * --elevation-0 (delta noted in the report).
 */
export function SectionCard({ id, title, description, actions, sources, children, className }: SectionCardProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Card role="region" aria-labelledby={headingId} className={`dt-card ${className ?? ''}`} id={id}>
      <div className="dt-card__body">
        <header className="dt-card__head">
          <div className="dt-card__titles">
            <h2 className="dt-card__title" id={headingId}>
              {title}
            </h2>
            {description && <p className="dt-card__desc">{description}</p>}
          </div>
          {actions && <div className="dt-card__actions">{actions}</div>}
        </header>
        {children}
        {sources && <p className="dt-sources">{sources}</p>}
      </div>
    </Card>
  );
}

export function Sources({ label = 'Source/link', suffix = 'As of 05 Dec, 2026', prefix = 'Sources:' }: { label?: string; suffix?: string; prefix?: string }) {
  return (
    <>
      {prefix}{' '}
      <a className="dt-link" href="#" onClick={(e) => e.preventDefault()}>
        {label}
      </a>{' '}
      • {suffix}
    </>
  );
}

/* ── AI Summary ──────────────────────────────────────────────────────── */

/**
 * Figma paints AI Summary with the CE AI gradient; cake& has no gradient token
 * so it is a primary fill Button. Per gesture 10210:10781 it is disabled while
 * the summary it opens is showing.
 */
export function AiSummaryButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <Button size="md" startIcon={<Sparkles />} disabled={open} onClick={onOpen} aria-expanded={open}>
      AI Summary
    </Button>
  );
}

type AiSummaryPanelProps = {
  onClose: () => void;
  children?: ReactNode;
  actions?: { text: string; label: string }[];
};

const AI_TEXT =
  'Summarize all data to helps sellers understand the customer experience landscape to assess relationship health, identify potential risk and prioritize follow-up. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non lorem vel neque iaculis dignissim vitae nec odio. Ut lobortis tortor non ipsum molestie volutpat. Proin ultrices mi mattis ex.';

const AI_ACTIONS = [
  { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', label: 'Button Label' },
  { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non lorem vel neque iaculis dignissim vitae nec odio.', label: 'Button Label' },
];

/** Figma "AI summary" (10210:7927): the inline summary panel a module's AI Summary button opens. */
export function AiSummaryPanel({ onClose, children, actions = AI_ACTIONS }: AiSummaryPanelProps) {
  return (
    <section className="dt-ai" aria-label="AI Summary">
      <div className="dt-ai__head">
        <h3 className="dt-ai__title">
          <Sparkles aria-hidden />
          AI Summary
        </h3>
        <IconButton size="sm" variant="ghost" intent="secondary" label="Close AI Summary" icon={<X />} onClick={onClose} />
      </div>
      <p className="dt-ai__text">{children ?? AI_TEXT}</p>
      {actions.length > 0 && (
        <div className="dt-ai__actions">
          <h4 className="dt-ai__subtitle">Suggested Actions</h4>
          {actions.map((a, i) => (
            <div className="dt-ai__action" key={i}>
              <p>{a.text}</p>
              <Button size="sm" variant="outline">
                {a.label}
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** One open AI summary at a time per module. */
export function useAiSummary(initial = false) {
  const [open, setOpen] = useState(initial);
  return { open, onOpen: () => setOpen(true), onClose: () => setOpen(false) };
}

/* ── Small display parts ─────────────────────────────────────────────── */

export function Trend({ dir = 'up', children }: { dir?: 'up' | 'down'; children: ReactNode }) {
  return (
    <span className={`dt-trend dt-trend--${dir}`}>
      {dir === 'up' ? <TrendingUp aria-hidden /> : <TrendingDown aria-hidden />}
      <span>
        <span className="ce-sr-only">{dir === 'up' ? 'Up ' : 'Down '}</span>
        {children}
      </span>
    </span>
  );
}

export function ViewDetails({ onClick, children = 'View Details' }: { onClick?: () => void; children?: ReactNode }) {
  return (
    <Button size="xs" variant="ghost" endIcon={<ChevronRight />} onClick={onClick}>
      {children}
    </Button>
  );
}

/** Card-level BG switch (gesture 10210:9851): All / IDG / ISG / SSG. */
export function BgSwitch({
  value,
  onChange,
  bgs = ['IDG', 'ISG', 'SSG'],
  label,
}: {
  value: 'All' | BG;
  onChange: (v: 'All' | BG) => void;
  bgs?: BG[];
  label: string;
}) {
  return (
    <ContentSwitcher
      aria-label={label}
      size="md"
      value={value}
      onValueChange={(v) => onChange(v as 'All' | BG)}
      options={[{ value: 'All', label: 'All' }, ...bgs.map((b) => ({ value: b, label: b }))]}
    />
  );
}

/* ── Paging ──────────────────────────────────────────────────────────── */

export function usePaging<T>(rows: T[], initialSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const count = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > count) setPage(count);
  }, [page, count]);
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);
  return {
    page: Math.min(page, count),
    setPage,
    pageSize,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
    count,
    pageRows,
    total: rows.length,
  };
}

/** Figma table footer: "Showing x of y entries" + page size, then the pager. */
export function PagedFooter({ paging, label }: { paging: ReturnType<typeof usePaging<unknown>>; label: string }) {
  return (
    <div className="dt-footer">
      <RowsPerPage
        options={[5, 10, 25]}
        value={paging.pageSize}
        onValueChange={paging.setPageSize}
        page={paging.page}
        total={paging.total}
      />
      {paging.count > 1 && (
        <Pagination
          label={label}
          count={paging.count}
          page={paging.page}
          onPageChange={paging.setPage}
          maxPageButtons={7}
        />
      )}
    </div>
  );
}

/** Empty-state row content for a filtered table. */
export function EmptyRow({ children = 'No results match the current filters.' }: { children?: ReactNode }) {
  return <p className="dt-empty">{children}</p>;
}
