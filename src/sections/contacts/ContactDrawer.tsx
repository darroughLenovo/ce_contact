import { useMemo, useState, type ReactNode } from 'react';
import { Archive, Check, ChevronDown, ChevronUp, MoreVertical, Pencil, Plus, Search, Star, X } from 'lucide-react';
import { Popover } from 'radix-ui';
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Dropdown,
  HorizontalTabItem,
  HorizontalTabs,
  HorizontalTabsList,
  IconButton,
  MenuContainer,
  MenuItem,
  Notification,
  TextInput,
} from '@cake-admin/cakeand';
import { CURRENT_USER, DIRECTORY, NOTE_TAGS, NOTE_TYPES, TODAY, historyFor, type Contact, type Note } from './data';
import { DmRoleBadges, InfoTip, MultiSelect, SideDrawer, Value } from './parts';
import { StrengthView } from './RelationshipStrength';

export type DrawerTab = 'overview' | 'hierarchy' | 'notes' | 'history';

type Props = {
  contact: Contact;
  tab: DrawerTab;
  onTab: (t: DrawerTab) => void;
  onClose: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  /** Persist a change. `toast` shows a success toast with Undo. */
  onUpdate: (next: Contact, toast?: string) => void;
  /** Deep-link boot states. */
  initialHierarchyEdit?: boolean;
  initialNoteEdit?: boolean;
};

const TABS: { value: DrawerTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'hierarchy', label: 'Hierarchy' },
  { value: 'notes', label: 'Notes' },
  { value: 'history', label: 'History' },
];

/** 06_ContactDrawer 10210:12754 · Hierarchy 10210:12167/12584 · Notes 14373:62344/10210:12346 · History 10210:12426. */
export function ContactDrawer({ contact, tab, onTab, onClose, onEdit, onDeactivate, onUpdate, initialHierarchyEdit, initialNoteEdit }: Props) {
  const [hierEdit, setHierEdit] = useState<string | null>(initialHierarchyEdit ? 'David L' : null);
  const [noteDraft, setNoteDraft] = useState<Note | null>(initialNoteEdit ? newNote() : null);

  const editing = hierEdit !== null || noteDraft !== null;
  const tabBar = (
    <HorizontalTabs value={tab} onValueChange={(v) => onTab(v as DrawerTab)}>
      <HorizontalTabsList aria-label="Contact details sections" className="ct-drawer__tabs">
        {(editing ? TABS.filter((t) => t.value === tab) : TABS).map((t) => (
          <HorizontalTabItem key={t.value} value={t.value}>
            {t.label}
          </HorizontalTabItem>
        ))}
      </HorizontalTabsList>
    </HorizontalTabs>
  );

  let actions: ReactNode = null;
  if (hierEdit !== null) {
    actions = (
      <SaveCancel
        onCancel={() => setHierEdit(null)}
        onSave={() => {
          onUpdate({ ...contact, reportsTo: hierEdit.trim() || undefined }, 'Contact changes have been saved.');
          setHierEdit(null);
        }}
      />
    );
  } else if (noteDraft) {
    actions = (
      <SaveCancel
        disabled={!noteDraft.title.trim()}
        onCancel={() => setNoteDraft(null)}
        onSave={() => {
          const exists = contact.notes.some((n) => n.id === noteDraft.id);
          const n = { ...noteDraft, updated: TODAY };
          onUpdate({ ...contact, notes: exists ? contact.notes.map((x) => (x.id === n.id ? n : x)) : [n, ...contact.notes] }, exists ? 'Note has been saved.' : 'Note has been added.');
          setNoteDraft(null);
        }}
      />
    );
  } else if (tab === 'notes') {
    actions = (
      <>
        <Button size="xs" startIcon={<Plus />} onClick={() => setNoteDraft(newNote())}>
          Add Note
        </Button>
        <CloseBtn onClose={onClose} />
      </>
    );
  } else if (tab === 'history') {
    actions = <CloseBtn onClose={onClose} />;
  } else {
    actions = (
      <>
        <Button size="xs" startIcon={<Pencil />} onClick={tab === 'hierarchy' ? () => setHierEdit(contact.reportsTo ?? '') : onEdit}>
          Edit
        </Button>
        <CloseBtn onClose={onClose} />
      </>
    );
  }

  const footer =
    !editing && (tab === 'overview' || tab === 'history') ? (
      <Button variant="outline" startIcon={<Archive />} onClick={onDeactivate}>
        Deactivate
      </Button>
    ) : undefined;

  return (
    <SideDrawer open onOpenChange={(o) => !o && onClose()} title="Contact Details" actions={actions} tabs={tabBar} footer={footer}>
      {tab === 'overview' && <Overview contact={contact} onEdit={onEdit} onDeactivate={onDeactivate} onUpdate={onUpdate} />}
      {tab === 'hierarchy' && (hierEdit !== null ? <HierarchyEdit value={hierEdit} onChange={setHierEdit} /> : <Hierarchy contact={contact} />)}
      {tab === 'notes' && (
        <Notes
          contact={contact}
          draft={noteDraft}
          onDraft={setNoteDraft}
          onToggleFav={(id) => onUpdate({ ...contact, notes: contact.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)) })}
        />
      )}
      {tab === 'history' && <History contact={contact} />}
    </SideDrawer>
  );
}

const newNote = (): Note => ({ id: `n-${Date.now()}`, title: '', body: '', type: '', tags: ['Meeting', 'Strategy'], updated: TODAY, author: CURRENT_USER });

function CloseBtn({ onClose }: { onClose: () => void }) {
  return <IconButton size="sm" variant="ghost" intent="secondary" label="Close contact details" icon={<X />} onClick={onClose} />;
}

function SaveCancel({ onCancel, onSave, disabled }: { onCancel: () => void; onSave: () => void; disabled?: boolean }) {
  return (
    <>
      <Button size="xs" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="xs" startIcon={<Check />} onClick={onSave} disabled={disabled}>
        Save
      </Button>
    </>
  );
}

/* ── Overview ────────────────────────────────────────────────────────── */

function Row({ label, info, children, meta }: { label: string; info?: string; children: ReactNode; meta?: string }) {
  return (
    <div className="ct-row">
      <dt className="ct-row__k">
        {label}
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </dt>
      <dd className="ct-row__v">
        <span className="ct-row__val">{children}</span>
        {meta && <span className="ct-caption">{meta}</span>}
      </dd>
    </div>
  );
}

function Overview({ contact: c, onEdit, onDeactivate, onUpdate }: { contact: Contact; onEdit: () => void; onDeactivate: () => void; onUpdate: Props['onUpdate'] }) {
  const meta = `Updated on 18 Aug 2026 • By ${CURRENT_USER}`;
  const sugg = c.suggestions ?? [];
  const resolve = (ids: string[], accept: boolean) => {
    let next: Contact = { ...c, suggestions: sugg.filter((s) => !ids.includes(s.id)) };
    if (accept)
      sugg
        .filter((s) => ids.includes(s.id))
        .forEach((s) => {
          if (s.field === 'Job Title') next = { ...next, title: s.to };
          if (s.field === 'Functional Area') next = { ...next, functional: [s.to] };
        });
    if (!next.suggestions?.length && next.flag === 'Pending Review') next = { ...next, flag: undefined };
    onUpdate(next, accept ? 'Suggestions have been approved.' : 'Suggestions have been rejected.');
  };

  return (
    <div className="ct-overview">
      {c.flag === 'Invalid Email' && (
        // Invalid Email 10210:11588
        <Notification
          status="error"
          className="ct-alert"
          title="Invalid Email"
          description="This email was found unreachable on Aug 27, 2026. If no action is taken, this contact will be removed."
          actions={
            <>
              <Button size="xs" variant="ghost" underline={false} onClick={onDeactivate}>
                Deactivate Contact
              </Button>
              <Button size="xs" variant="outline" onClick={onEdit}>
                Update
              </Button>
            </>
          }
        />
      )}
      {sugg.length > 0 && (
        // Suggestions 10210:11763 (collapsed) / 10210:11949 (expanded)
        <Accordion type="single" collapsible defaultValue="s" className="ct-sugg">
          <AccordionItem value="s" title={`${sugg.length} Suggestion${sugg.length > 1 ? 's' : ''} Awaiting Review`}>
            <div className="ct-sugg__bulk">
              <Button size="xs" variant="ghost" intent="secondary" underline={false} startIcon={<X />} onClick={() => resolve(sugg.map((s) => s.id), false)}>
                Reject All
              </Button>
              <Button size="xs" variant="tonal" startIcon={<Check />} onClick={() => resolve(sugg.map((s) => s.id), true)}>
                Accept All
              </Button>
            </div>
            <ul className="ct-sugg__list">
              {sugg.map((s) => (
                <li key={s.id} className="ct-sugg__row">
                  <span className="ct-row__k">{s.field}</span>
                  <span className="ct-row__v">
                    <span className="ct-row__val">
                      {s.from} → {s.to}
                    </span>
                    <span className="ct-caption">
                      {s.source} • {TODAY}
                    </span>
                  </span>
                  <span className="ct-sugg__act">
                    <IconButton size="sm" variant="outline" intent="secondary" label={`Reject ${s.field} suggestion`} icon={<X />} onClick={() => resolve([s.id], false)} />
                    <IconButton size="sm" label={`Accept ${s.field} suggestion`} icon={<Check />} onClick={() => resolve([s.id], true)} />
                  </span>
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      )}

      <dl className="ct-rows">
        <Row label="First Name">{c.first}</Row>
        <Row label="Last Name">{c.last}</Row>
        <Row label="Job Title" meta={meta}>
          <Value v={c.title} />
        </Row>
        <Row label="Email">{c.email ? <a href={`mailto:${c.email}`} className="ct-link">{c.email}</a> : <span className="ct-na">NA</span>}</Row>
        <Row label="Phone">
          <Value v={c.phone} />
        </Row>
        <Row label="Linkedin">{c.linkedin ? <a href="#" onClick={(e) => e.preventDefault()} className="ct-link">{c.linkedin}</a> : <span className="ct-na">NA</span>}</Row>
        <Row label="Country of Residence" info="Country the contact lives and works in.">
          <Value v={c.country} />
        </Row>
        <Row label="Seniority" info="Level of the contact in their organization.">
          <Value v={c.seniority} />
        </Row>
        <Row label="Decision Making Role" info="The contact's part in purchase decisions." meta="Updated on 18 Aug 2026 • Default">
          <DmRoleBadges roles={c.dm} />
        </Row>
        <Row label="Functional Area" info="Business functions the contact covers." meta={meta}>
          <Value v={c.functional} />
        </Row>
        <Row label="Areas of Interest" info="Topics the contact engages with." meta="Updated on 18 Aug 2026 • By 3rd Party">
          <Value v={c.interests} />
        </Row>
        <Row label="Associated L2 Accounts" info="Sub-accounts this contact is linked to.">
          {c.l2.length ? c.l2.map((l) => <span key={l} className="ct-block">{l}</span>) : <span className="ct-na">NA</span>}
        </Row>
      </dl>

      <StrengthView ratings={c.ratings} meta={meta} />
    </div>
  );
}

/* ── Hierarchy ───────────────────────────────────────────────────────── */

function Hierarchy({ contact }: { contact: Contact }) {
  return (
    <dl className="ct-rows">
      <Row label="Reports to" info="The person this contact reports to." meta={contact.reportsTo ? `Updated on 18 Aug 2026 • By ${CURRENT_USER}` : undefined}>
        <Value v={contact.reportsTo} />
      </Row>
    </dl>
  );
}

/**
 * Hierarchy Edit 10210:12584 — COMPONENT GAP: cake& has no combobox /
 * autocomplete. Composed from TextInput + MenuContainer/MenuItem + Button.
 */
function HierarchyEdit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(true);
  const q = value.trim().toLowerCase();
  const matches = DIRECTORY.filter((n) => !q || n.toLowerCase().startsWith(q) || n.toLowerCase().includes(q));
  const exact = DIRECTORY.some((n) => n.toLowerCase() === q);
  const bold = (n: string) => {
    const i = n.toLowerCase().indexOf(q);
    if (!q || i < 0) return n;
    return (
      <>
        {n.slice(0, i)}
        <strong>{n.slice(i, i + q.length)}</strong>
        {n.slice(i + q.length)}
      </>
    );
  };
  return (
    <div className="ct-form">
      <div className="ct-combo">
        <TextInput
          label="Reports to"
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoFocus
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          endIcon={
            value ? (
              <IconButton size="xs" variant="ghost" intent="secondary" label="Clear" icon={<X />} onClick={() => onChange('')} />
            ) : undefined
          }
        />
        {open && (
          <MenuContainer width="100%" maxHeight={240} role="listbox" aria-label="People">
            {q && !exact && (
              <MenuItem showLeftSlot={false} showRightSlot={false} onClick={() => setOpen(false)}>
                {`Select “${value.trim()}” as new entry`}
              </MenuItem>
            )}
            {matches.map((n) => (
              <MenuItem key={n} showLeftSlot={false} selected={n.toLowerCase() === q} showRightSlot={n.toLowerCase() === q} onClick={() => { onChange(n); setOpen(false); }}>
                {bold(n)}
              </MenuItem>
            ))}
            <div className="ct-pop__foot ct-pop__foot--end">
              <Button size="sm" variant="ghost" intent="secondary" underline={false} onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </MenuContainer>
        )}
      </div>
      <p className="ct-caption">Updated on {TODAY} • By {CURRENT_USER}</p>
    </div>
  );
}

/* ── Notes ───────────────────────────────────────────────────────────── */

function Notes({ contact, draft, onDraft, onToggleFav }: { contact: Contact; draft: Note | null; onDraft: (n: Note | null) => void; onToggleFav: (id: string) => void }) {
  const [q, setQ] = useState('');
  const list = contact.notes.filter((n) => !q.trim() || `${n.title} ${n.body} ${n.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="ct-notes">
      {draft && (
        <Card>
          <div className="ct-note-form">
            <TextInput label="Title" required autoFocus value={draft.title} onChange={(e) => onDraft({ ...draft, title: e.target.value })} />
            <TextInput label="Body" value={draft.body} onChange={(e) => onDraft({ ...draft, body: e.target.value })} />
            <Dropdown label="Type" placeholder="Select" options={NOTE_TYPES.map((t) => ({ label: t, value: t }))} value={draft.type || undefined} onValueChange={(v) => onDraft({ ...draft, type: v })} />
            <MultiSelect label="Tags" options={NOTE_TAGS} value={draft.tags} onChange={(tags) => onDraft({ ...draft, tags })} />
          </div>
        </Card>
      )}
      <TextInput aria-label="Search for notes" placeholder="Search for notes" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 && <p className="ct-empty">{contact.notes.length ? 'No notes match your search.' : 'No notes yet. Add the first note for this contact.'}</p>}
      <ul className="ct-note-list">
        {list.map((n) => (
          <li key={n.id}>
            <Card>
              <article className="ct-note">
                <div className="ct-note__head">
                  <div className="ct-note__title">
                    <h4>
                      {n.favorite && <Star className="ct-fav" aria-label="Favorite" fill="currentColor" />}
                      {n.title}
                    </h4>
                    <span className="ct-caption">
                      Updated on {n.updated} • By {n.author}
                    </span>
                  </div>
                  <div className="ct-note__act">
                    <IconButton size="sm" variant="ghost" intent="secondary" label={`Edit ${n.title}`} icon={<Pencil />} disabled={!!draft} onClick={() => onDraft(n)} />
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <IconButton size="sm" variant="ghost" intent="secondary" label={`More actions for ${n.title}`} icon={<MoreVertical />} disabled={!!draft} />
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content className="ct-pop" align="end" sideOffset={4}>
                          <MenuContainer width={200} role="menu" aria-label="Note actions">
                            <Popover.Close asChild>
                              <MenuItem leftSlot={<Star />} showRightSlot={false} onClick={() => onToggleFav(n.id)}>
                                {n.favorite ? 'Remove from Favorites' : 'Mark as Favorite'}
                              </MenuItem>
                            </Popover.Close>
                          </MenuContainer>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                </div>
                <p className="ct-note__body">{n.body || <span className="ct-na">NA</span>}</p>
                <p className="ct-caption">Tags: {n.tags.length ? n.tags.join(', ') : 'NA'}</p>
              </article>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── History ─────────────────────────────────────────────────────────── */

function History({ contact }: { contact: Contact }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ h3: true });
  const events = useMemo(() => historyFor(contact), [contact]);
  const list = events.filter((e) => !q.trim() || `${e.title} ${e.detail ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <section className="ct-history" aria-labelledby="ct-hist-h">
      <h3 id="ct-hist-h" className="ct-overline">
        History Timeline
      </h3>
      <TextInput aria-label="Search for events" placeholder="Search for events" startIcon={<Search />} value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 && <p className="ct-empty">No events match your search.</p>}
      <ol className="ct-timeline">
        {list.map((e) => (
          <li key={e.id} className="ct-timeline__item">
            <Card>
              <div className="ct-event">
                <span className="ct-caption">{e.date}</span>
                <h4 className="ct-event__title">{e.title}</h4>
                {e.detail && <p className="ct-event__detail">{e.detail}</p>}
                {e.changes && (
                  <>
                    <Button
                      size="xs"
                      variant="ghost"
                      intent="secondary"
                      underline={false}
                      startIcon={open[e.id] ? <ChevronUp /> : <ChevronDown />}
                      aria-expanded={!!open[e.id]}
                      onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
                    >
                      {e.changes.length} fields updated
                    </Button>
                    {open[e.id] && (
                      <ul className="ct-event__changes">
                        {e.changes.map((ch) => (
                          <li key={ch.text} className={`ct-tone-text--${ch.tone === 'success' ? 'success' : 'error'}`}>
                            {ch.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}

