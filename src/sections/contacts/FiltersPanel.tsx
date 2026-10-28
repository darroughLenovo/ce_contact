import { ChevronUp } from 'lucide-react';
import { Button, Card, Counter, Divider, Dropdown } from '@cake-admin/cakeand';
import { DM_ROLES, FUNCTIONAL_AREAS, INTERESTS, NOTIFICATION_FLAGS, SENIORITIES, starsOf, type Contact } from './data';
import { MultiSelect } from './parts';

export type Filters = {
  title: string;
  dm: string;
  seniority: string;
  rating: string;
  functional: string;
  interest: string;
  notifications: string[];
};
export const NO_FILTERS: Filters = { title: 'all', dm: 'all', seniority: 'all', rating: 'all', functional: 'all', interest: 'all', notifications: [] };

export const FILTER_LABELS: Record<keyof Filters, string> = {
  title: 'Job Title',
  dm: 'Decision Making Role',
  seniority: 'Seniority',
  rating: 'Relationship Strength',
  functional: 'Functional Area',
  interest: 'Area of Interest',
  notifications: 'Notifications',
};

export const countFilters = (f: Filters) =>
  (Object.keys(f) as (keyof Filters)[]).filter((k) => (k === 'notifications' ? f.notifications.length > 0 : f[k] !== 'all')).length;

export const applyFilters = (rows: Contact[], f: Filters) =>
  rows.filter(
    (c) =>
      (f.title === 'all' || c.title === f.title) &&
      (f.dm === 'all' || c.dm.includes(f.dm as never)) &&
      (f.seniority === 'all' || c.seniority === f.seniority) &&
      (f.rating === 'all' || starsOf(c) === Number(f.rating)) &&
      (f.functional === 'all' || c.functional.includes(f.functional)) &&
      (f.interest === 'all' || c.interests.includes(f.interest)) &&
      (f.notifications.length === 0 || (c.flag !== undefined && f.notifications.includes(c.flag))),
  );

const withAll = (xs: { label: string; value: string }[]) => [{ label: 'All', value: 'all' }, ...xs];
const o = (xs: readonly string[]) => xs.map((x) => ({ label: x, value: x }));

/** 02_ContactFilters 10210:14351 — expanded "All Filters" panel. */
export function FiltersPanel({
  draft,
  onDraft,
  titles,
  onApply,
  onCancel,
  onClear,
}: {
  draft: Filters;
  onDraft: (f: Filters) => void;
  titles: string[];
  onApply: () => void;
  onCancel: () => void;
  onClear: () => void;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onDraft({ ...draft, [k]: v });
  const n = countFilters(draft);
  return (
    <Card className="ct-filters" role="region" aria-label="All filters">
      <div className="ct-filters__head">
        <span className="ct-filters__title">
          All Filters {n > 0 && <Counter count={n} />}
        </span>
        <Button size="sm" variant="ghost" underline={false} endIcon={<ChevronUp />} onClick={onCancel}>
          Collapse
        </Button>
      </div>
      <Divider weight="weak" />
      <div className="ct-filters__grid">
        <Dropdown label="Job Title" options={withAll(o(titles))} value={draft.title} onValueChange={(v) => set('title', v)} />
        <Dropdown label="Decision Making Role" options={withAll(DM_ROLES.map((r) => ({ label: r.label, value: r.code })))} value={draft.dm} onValueChange={(v) => set('dm', v)} />
        <Dropdown label="Seniority" options={withAll(o(SENIORITIES))} value={draft.seniority} onValueChange={(v) => set('seniority', v)} />
        <Dropdown
          label="Relationship Strength"
          options={withAll([5, 4, 3, 2, 1, 0].map((s) => ({ label: s ? `${s} star${s > 1 ? 's' : ''}` : 'Not rated', value: String(s) })))}
          value={draft.rating}
          onValueChange={(v) => set('rating', v)}
        />
        <Dropdown label="Functional Area" options={withAll(o(FUNCTIONAL_AREAS))} value={draft.functional} onValueChange={(v) => set('functional', v)} />
        <Dropdown label="Area of Interest" options={withAll(o(INTERESTS))} value={draft.interest} onValueChange={(v) => set('interest', v)} />
        <MultiSelect label="Notifications" options={NOTIFICATION_FLAGS} value={draft.notifications} onChange={(v) => set('notifications', v)} placeholder="All" />
      </div>
      <Divider weight="weak" />
      <div className="ct-filters__foot">
        <Button size="sm" variant="ghost" underline={false} onClick={onClear}>
          Clear All
        </Button>
        <span className="ct-grow" />
        <Button size="sm" variant="ghost" underline={false} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </Card>
  );
}
