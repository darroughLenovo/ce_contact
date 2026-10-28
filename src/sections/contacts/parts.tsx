import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Info, Linkedin, Mail, Phone, Star } from 'lucide-react';
import { Dialog, Popover } from 'radix-ui';
import { Badge, Button, Chip, IconButton, InputLabel, HelperString, MenuContainer, MenuItem, SimpleTooltip } from '@cake-admin/cakeand';
import type { BadgeColor } from '@cake-admin/cakeand';
import { dmRole, type Contact, type DmCode, type Flag } from './data';

/* ── Rating stars (table "Relationship Strength", cards, drawer) ─────── */

/** Tone follows the Figma: 4–5 green, 2–3 orange, 1 red, 0 = outline only. */
export const toneFor = (v: number) => (v >= 4 ? 'success' : v >= 2 ? 'warn' : v >= 1 ? 'error' : 'none');

export function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const full = Math.round(value);
  return (
    <span className={`ct-stars ct-stars--${size} ct-tone--${toneFor(full)}`} role="img" aria-label={`${full} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden fill={i <= full ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

/* ── Decision-making role badges (E / C / B …) with tooltip 10210:18519 ── */

const DM_COLORS: Record<DmCode, BadgeColor> = { A: 'teal', B: 'magenta', C: 'red', D: 'violet', E: 'indigo' };

export function DmBadges({ roles }: { roles: DmCode[] }) {
  if (!roles.length) return null;
  return (
    <span className="ct-dm">
      {roles.map((code) => {
        const r = dmRole(code);
        return (
          <SimpleTooltip
            key={code}
            triggerAriaLabel={r.label}
            trigger={
              <Badge color={DM_COLORS[code]} dot={false} className="ct-dm__badge" aria-hidden>
                {code}
              </Badge>
            }
          >
            <strong className="ct-tip-title">{r.label}</strong>
            <span className="ct-tip-body">{r.hint}</span>
          </SimpleTooltip>
        );
      })}
    </span>
  );
}

export function DmRoleBadges({ roles }: { roles: DmCode[] }) {
  if (!roles.length) return <span className="ct-na">NA</span>;
  return (
    <span className="ct-dm ct-dm--wide">
      {roles.map((code) => (
        <Badge key={code} color="indigo" dot={false}>
          {dmRole(code).label}
        </Badge>
      ))}
    </span>
  );
}

/* ── Notification flag badge (cards) ─────────────────────────────────── */

const FLAG_COLOR: Record<Flag, BadgeColor> = { 'Pending Review': 'orange', 'Invalid Email': 'destructive', New: 'green' };

export function FlagBadge({ flag }: { flag?: Flag }) {
  if (!flag) return null;
  return (
    <Badge color={FLAG_COLOR[flag]} tone="subtle" dot={false}>
      {flag}
    </Badge>
  );
}

/* ── Email / phone / LinkedIn quick actions ──────────────────────────── */

export function ContactIcons({ contact }: { contact: Contact }) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const name = `${contact.first} ${contact.last}`;
  return (
    <span className="ct-icons" onClick={stop} onKeyDown={(e) => e.stopPropagation()}>
      <IconButton size="xs" variant="ghost" intent="secondary" label={`Email ${name}`} icon={<Mail />} onClick={() => (window.location.href = `mailto:${contact.email}`)} />
      <IconButton size="xs" variant="ghost" intent="secondary" label={`Call ${name}`} icon={<Phone />} onClick={() => (window.location.href = `tel:${contact.phone}`)} />
      <IconButton size="xs" variant="ghost" intent="secondary" label={`${name} on LinkedIn`} icon={<Linkedin />} />
    </span>
  );
}

/* ── Info "ⓘ" with a SimpleTooltip ───────────────────────────────────── */

export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SimpleTooltip triggerAriaLabel={`About ${label}`} trigger={<Info className="ct-info" aria-hidden />}>
      {children}
    </SimpleTooltip>
  );
}

/** "NA" for empty values (design-review rule: never "Null"). */
export const orNA = (v?: string | string[] | null) => {
  const s = Array.isArray(v) ? v.join(', ') : v;
  return s && s.trim() ? s : null;
};
export function Value({ v }: { v?: string | string[] | null }) {
  const s = orNA(v);
  return s ? <>{s}</> : <span className="ct-na">NA</span>;
}

/* ── Side drawer — COMPONENT GAP ─────────────────────────────────────── */

/**
 * cake& ships no side drawer / sheet. Figma draws 768px right-hand panels
 * (06_ContactDrawer 10210:12754, Add Contact 10210:16741 …) over the scrim.
 * Built on the Radix Dialog primitive (role="dialog", aria-modal, focus trap,
 * focus moved in, Esc + scrim click close) and styled with cake& tokens only.
 * The header sticks to the top while the body scrolls (Gesture 10210:18525).
 */
export function SideDrawer({
  open,
  onOpenChange,
  title,
  actions,
  tabs,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ct-drawer__scrim" />
        <Dialog.Content className="ct-drawer" aria-describedby={undefined}>
          <div className="ct-drawer__sticky">
            <header className="ct-drawer__header">
              <Dialog.Title className="ct-drawer__title">{title}</Dialog.Title>
              {actions && <div className="ct-drawer__actions">{actions}</div>}
            </header>
            {tabs}
          </div>
          <div className="ct-drawer__body">{children}</div>
          {footer && <div className="ct-drawer__footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Rating picker (N/A + 1–5) — COMPONENT GAP ───────────────────────── */

/**
 * Figma "Relationship Strength" category rows: an N/A box then five scored
 * boxes with a caption under each; the selected box fills with the score's
 * semantic color. cake& has no scored segmented / rating control
 * (ContentSwitcher can't carry per-segment colors or captions), so this is a
 * token-only radiogroup with roving arrow-key focus.
 */
export function RatingPicker({
  label,
  levels,
  value,
  onChange,
}: {
  label: string;
  levels: readonly string[];
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const opts = [{ v: 0, cap: 'Unrated', text: 'N/A' }, ...levels.map((cap, i) => ({ v: i + 1, cap, text: String(i + 1) }))];
  const focusIdx = value === undefined ? 0 : value;
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + opts.length) % opts.length;
    onChange(opts[n].v);
    refs.current[n]?.focus();
  };
  return (
    <div className="ct-rate" role="radiogroup" aria-label={label}>
      {opts.map((o, i) => {
        const on = value === o.v;
        return (
          <div key={o.v} className={`ct-rate__opt${i === 0 ? ' ct-rate__opt--na' : ''}`}>
            <button
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${o.text} – ${o.cap}`}
              tabIndex={i === focusIdx ? 0 : -1}
              className={`ct-rate__box${on ? ` ct-rate__box--on ct-tone--${o.v === 0 ? 'none' : toneForLevel(o.v)}` : ''}`}
              onClick={() => onChange(o.v)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {o.text}
            </button>
            <span className="ct-rate__cap">{o.cap}</span>
          </div>
        );
      })}
    </div>
  );
}
const toneForLevel = (v: number) => (v >= 4 ? 'success' : v >= 2 ? 'warn' : 'error');

/* ── Multi-select field — COMPONENT GAP ──────────────────────────────── */

/**
 * Figma "Decision-Making Role (Select all that apply)" (Edit Contact
 * 10210:15665): chips inside the field + a checkbox list with Select All /
 * Done. cake& Dropdown is single-select only. Composed from InputLabel,
 * Chip (removable), MenuContainer + MenuItem (showCheckbox), Button and
 * HelperString inside a Radix Popover; only the field frame is custom.
 */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  required,
  info,
  hint,
  helper,
  error,
  placeholder = 'Select',
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
  info?: boolean;
  hint?: string;
  helper?: ReactNode;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const all = options.every((o) => value.includes(o));
  return (
    <div className="ct-field">
      <InputLabel htmlFor={id} size="sm" required={required} showInfo={info}>
        {label}
        {hint && <span className="ct-field__hint"> {hint}</span>}
      </InputLabel>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div className={`ct-multi${open ? ' ct-multi--open' : ''}${error ? ' ct-multi--error' : ''}`}>
            <div className="ct-multi__chips">
              {value.length === 0 && <span className="ct-multi__ph">{placeholder}</span>}
              {value.map((v) => (
                <Chip key={v} size="sm" onRemove={() => toggle(v)}>
                  {v}
                </Chip>
              ))}
            </div>
            <Popover.Trigger asChild>
              <IconButton
                id={id}
                size="sm"
                variant="ghost"
                intent="secondary"
                label={`${open ? 'Close' : 'Open'} ${label} options`}
                icon={open ? <ChevronUp /> : <ChevronDown />}
                aria-expanded={open}
              />
            </Popover.Trigger>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content className="ct-pop" align="start" sideOffset={4} style={{ width: 'var(--radix-popover-trigger-width)' }}>
            <MultiMenu
              label={label}
              options={options}
              value={value}
              onToggle={toggle}
              allSelected={all}
              onSelectAll={() => onChange(all ? [] : [...options])}
              onDone={() => setOpen(false)}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {(error || helper) && <HelperString tone={error ? 'error' : 'greyscale'}>{error ?? helper}</HelperString>}
    </div>
  );
}

function MultiMenu({
  label,
  options,
  value,
  onToggle,
  allSelected,
  onSelectAll,
  onDone,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onToggle: (o: string) => void;
  allSelected: boolean;
  onSelectAll: () => void;
  onDone: () => void;
}) {
  return (
    <MenuContainer width="100%" maxHeight={240} aria-label={label}>
      {options.map((o) => (
        <MenuItem key={o} showCheckbox checked={value.includes(o)} onCheckedChange={() => onToggle(o)} onClick={() => onToggle(o)} showLeftSlot={false} showRightSlot={false}>
          {o}
        </MenuItem>
      ))}
      <div className="ct-pop__foot">
        <Button size="sm" variant="ghost" intent="secondary" underline={false} onClick={onSelectAll}>
          {allSelected ? 'Clear All' : 'Select All'}
        </Button>
        <Button size="sm" variant="ghost" intent="secondary" underline={false} onClick={onDone}>
          Done
        </Button>
      </div>
    </MenuContainer>
  );
}
