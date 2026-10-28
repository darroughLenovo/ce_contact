import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Filter, NotebookPen, Plus, Search, Star, X } from 'lucide-react';
import { Popover } from 'radix-ui';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  HorizontalTabItem,
  HorizontalTabs,
  HorizontalTabsList,
  IconButton,
  MenuContainer,
  MenuHeader,
  MenuItem,
  Modal,
  ModalContent,
  ModalFooter,
  TextInput,
} from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { useToast } from '../../shell/toast';
import { NoteForm, type NoteDraft } from './NoteForm';
import { NoteView } from './NoteView';
import { CURRENT_USER, INITIAL_NOTES, INITIAL_TAGS, NOTE_TYPES, contactById, noteMeta, todayIso, type Note } from './data';
import './notes.css';

type Sort = 'az' | 'za' | 'newest' | 'oldest';
const SORTS: { value: Sort; label: string }[] = [
  { value: 'az', label: 'Sort by A-Z' },
  { value: 'za', label: 'Sort by Z-A' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

type Drawer = { kind: 'none' } | { kind: 'add' } | { kind: 'view'; id: string } | { kind: 'edit'; id: string };

const lastChanged = (n: Note) => n.updatedAt ?? n.createdAt;

/** Review deep links: #/notes?state=add|tags|newtag|view|edit|delete|empty|nomatch */
const initialState = () => {
  const m = window.location.hash.match(/[?&]state=([\w-]+)/);
  return m ? m[1] : '';
};

/**
 * Notes tab — Figma "Group 2085662985" (14373:62457).
 * 01_Notes list (14373:62894) → Add Notes drawer (14373:62458/62601),
 * tag menu (62663), new-tag (62710), note detail (63030/63101), edit (62814).
 */
export default function NotesPage() {
  const [boot] = useState(initialState);
  const [notes, setNotes] = useState<Note[]>(boot === 'empty' ? [] : INITIAL_NOTES);
  const [allTags, setAllTags] = useState(INITIAL_TAGS);
  const [tab, setTab] = useState<'all' | 'mine'>('all');
  const [query, setQuery] = useState(boot === 'nomatch' ? 'quarterly forecast' : '');
  const [types, setTypes] = useState<string[]>([]);
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('az');
  const [filtersOpen, setFiltersOpen] = useState(boot === 'filters');
  const [sortOpen, setSortOpen] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(() => {
    if (boot === 'add' || boot === 'tags' || boot === 'newtag') return { kind: 'add' };
    if (boot === 'view' || boot === 'delete') return { kind: 'view', id: 'n1' };
    if (boot === 'edit') return { kind: 'edit', id: 'n1' };
    return { kind: 'none' };
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(boot === 'delete' ? 'n1' : null);
  const showToast = useToast();

  const mineCount = notes.filter((n) => n.author === CURRENT_USER).length;
  const filterCount = types.length + (favOnly ? 1 : 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = notes.filter(
      (n) =>
        (tab === 'all' || n.author === CURRENT_USER) &&
        (!types.length || (n.type !== undefined && types.includes(n.type))) &&
        (!favOnly || n.favorite) &&
        (!q || [n.title, n.body, ...n.tags].some((s) => s.toLowerCase().includes(q))),
    );
    const by = {
      az: (a: Note, b: Note) => a.title.localeCompare(b.title),
      za: (a: Note, b: Note) => b.title.localeCompare(a.title),
      newest: (a: Note, b: Note) => lastChanged(b).localeCompare(lastChanged(a)),
      oldest: (a: Note, b: Note) => lastChanged(a).localeCompare(lastChanged(b)),
    }[sort];
    return [...list].sort(by);
  }, [notes, tab, types, favOnly, query, sort]);

  const byId = (id: string) => notes.find((n) => n.id === id);
  const toggleFavorite = (id: string) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)));

  const save = (draft: NoteDraft) => {
    if (drawer.kind === 'edit') {
      const id = drawer.id;
      setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...draft, updatedAt: todayIso(), updatedBy: CURRENT_USER } : n)));
      setDrawer({ kind: 'view', id });
      showToast({ status: 'success', title: 'Note updated' });
    } else {
      const id = `n${Date.now()}`;
      setNotes((ns) => [{ ...draft, id, author: CURRENT_USER, createdAt: todayIso() }, ...ns]);
      setDrawer({ kind: 'none' });
      showToast({ status: 'success', title: 'Note added' });
    }
  };

  const remove = () => {
    if (!confirmDelete) return;
    const idx = notes.findIndex((n) => n.id === confirmDelete);
    const removed = notes[idx];
    setNotes((ns) => ns.filter((n) => n.id !== confirmDelete));
    setConfirmDelete(null);
    setDrawer({ kind: 'none' });
    showToast({
      status: 'success',
      title: 'Note deleted',
      actionLabel: 'Undo',
      onAction: () => removed && setNotes((ns) => [...ns.slice(0, idx), removed, ...ns.slice(idx)]),
    });
  };

  const clearFilters = () => {
    setTypes([]);
    setFavOnly(false);
    setQuery('');
  };

  const editingNote = drawer.kind === 'edit' ? byId(drawer.id) : undefined;
  const viewingNote = drawer.kind === 'view' ? byId(drawer.id) : undefined;
  const deletingNote = confirmDelete ? byId(confirmDelete) : undefined;

  return (
    <>
      <AccountHeader active="notes" />
      <div className="ce-page notes">
        {/* Top (14373:62896) */}
        <div className="notes-top">
          <h2 className="notes-top__title">Notes</h2>
          <div className="notes-top__search">
            <TextInput
              aria-label="Search notes"
              placeholder="Search notes"
              type="search"
              startIcon={<Search />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              endIcon={
                query ? (
                  <IconButton size="xs" variant="ghost" intent="secondary" label="Clear search" icon={<X />} onClick={() => setQuery('')} />
                ) : undefined
              }
            />
          </div>
          <Button startIcon={<Plus />} onClick={() => setDrawer({ kind: 'add' })}>
            Add Notes
          </Button>
        </div>

        {/* Tabs/Filters (14373:62903) */}
        <div className="notes-filters">
          <Card>
            <div className="notes-tabs">
              <HorizontalTabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'mine')}>
                <HorizontalTabsList aria-label="Notes view" scrollButtons="never">
                  <HorizontalTabItem value="all">{`All Notes (${notes.length})`}</HorizontalTabItem>
                  <HorizontalTabItem value="mine">{`My Notes (${mineCount})`}</HorizontalTabItem>
                </HorizontalTabsList>
              </HorizontalTabs>
            </div>
          </Card>

          <div className="notes-filters__row">
            <MenuPopover
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              label="Filters"
              align="start"
              trigger={
                // Default (no filter) is not highlighted — design-review rule.
                <Button
                  size="sm"
                  variant="outline"
                  intent={filterCount ? 'primary' : 'secondary'}
                  startIcon={<Filter />}
                  endIcon={<ChevronDown />}
                >
                  {`Filters (${filterCount})`}
                </Button>
              }
            >
              <MenuHeader>Type</MenuHeader>
              {NOTE_TYPES.map((t) => {
                const on = types.includes(t);
                const flip = () => setTypes((ts) => (on ? ts.filter((x) => x !== t) : [...ts, t]));
                return (
                  <MenuItem key={t} showCheckbox checked={on} onCheckedChange={flip} onClick={flip} showLeftSlot={false} showRightSlot={false}>
                    {t}
                  </MenuItem>
                );
              })}
              <Divider weight="weak" />
              <MenuItem
                showCheckbox
                checked={favOnly}
                onCheckedChange={() => setFavOnly((f) => !f)}
                onClick={() => setFavOnly((f) => !f)}
                showLeftSlot={false}
                showRightSlot={false}
              >
                Favorites only
              </MenuItem>
              {filterCount > 0 && (
                <>
                  <Divider weight="weak" />
                  <div className="notes-menu__footer">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTypes([]);
                        setFavOnly(false);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </>
              )}
            </MenuPopover>

            <MenuPopover
              open={sortOpen}
              onOpenChange={setSortOpen}
              label="Sort notes"
              align="end"
              role="menu"
              trigger={
                <Button size="sm" variant="outline" intent="secondary" endIcon={<ChevronDown />}>
                  {SORTS.find((s) => s.value === sort)!.label}
                </Button>
              }
            >
              {SORTS.map((s) => (
                <MenuItem
                  key={s.value}
                  selected={s.value === sort}
                  showLeftSlot={false}
                  showRightSlot={s.value === sort}
                  onClick={() => {
                    setSort(s.value);
                    setSortOpen(false);
                  }}
                >
                  {s.label}
                </MenuItem>
              ))}
            </MenuPopover>
          </div>
        </div>

        {/* Row 2 (14373:62933) — note cards */}
        {visible.length ? (
          <ul className="notes-list" aria-label="Notes">
            {visible.map((n) => (
              <li key={n.id}>
                <NoteCard note={n} onOpen={() => setDrawer({ kind: 'view', id: n.id })} onToggleFavorite={() => toggleFavorite(n.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState filtered={notes.length > 0} onClear={clearFilters} onAdd={() => setDrawer({ kind: 'add' })} />
        )}
      </div>

      <NoteForm
        open={drawer.kind === 'add' || drawer.kind === 'edit'}
        note={editingNote}
        allTags={allTags}
        onCreateTag={(t) => setAllTags((ts) => (ts.includes(t) ? ts : [...ts, t]))}
        onCancel={() => setDrawer(drawer.kind === 'edit' ? { kind: 'view', id: drawer.id } : { kind: 'none' })}
        onSubmit={save}
        initialTagsOpen={boot === 'tags' || boot === 'newtag'}
        initialTagQuery={boot === 'newtag' ? 'Digital Transformation' : undefined}
      />

      <NoteView
        note={viewingNote}
        onClose={() => setDrawer({ kind: 'none' })}
        onEdit={() => viewingNote && setDrawer({ kind: 'edit', id: viewingNote.id })}
        onDelete={() => viewingNote && setConfirmDelete(viewingNote.id)}
        onToggleFavorite={() => viewingNote && toggleFavorite(viewingNote.id)}
      />

      <Modal
        open={Boolean(deletingNote)}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete note?"
        modalIcon="warning"
        footer={
          <ModalFooter
            checkbox={false}
            secondaryActionLabel="Cancel"
            onSecondaryAction={() => setConfirmDelete(null)}
            primaryActionLabel="Delete"
            onPrimaryAction={remove}
          />
        }
      >
        <ModalContent
          description={`“${deletingNote?.title ?? ''}” will be permanently removed from this account. This can’t be undone.`}
        />
      </Modal>

    </>
  );
}

/** Button-triggered popover holding a cake& MenuContainer (Filters, Sort). */
function MenuPopover({
  open,
  onOpenChange,
  trigger,
  label,
  align,
  role,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  trigger: ReactNode;
  label: string;
  align: 'start' | 'end';
  role?: string;
  children: ReactNode;
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="notes-popover" align={align} sideOffset={4} aria-label={label}>
          <MenuContainer width={240} role={role} aria-label={label}>
            {children}
          </MenuContainer>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

const BODY_CLAMP = 320;

/** One note card (Figma 14373:62934 / 62956 / 62975). */
function NoteCard({ note, onOpen, onToggleFavorite }: { note: Note; onOpen: () => void; onToggleFavorite: () => void }) {
  const long = note.body.length > BODY_CLAMP;
  const people = note.contactIds.map(contactById).filter((c) => c !== undefined);
  return (
    <Card>
      <article className="notes-card" aria-labelledby={`${note.id}-t`}>
        <div className="notes-card__head">
          <div className="notes-card__titles">
            <h3 className="notes-card__title" id={`${note.id}-t`}>
              <button type="button" className="notes-card__open" onClick={onOpen}>
                {note.title}
              </button>
            </h3>
            {note.type && (
              <Badge color="teal" tone="subtle" dot={false}>
                {note.type}
              </Badge>
            )}
          </div>
          <div className="notes-card__side">
            {people.length > 0 && (
              <span className="notes-card__people" role="img" aria-label={`Linked contacts: ${people.map((p) => p.name).join(', ')}`}>
                {people.map((p) => (
                  <Avatar key={p.id} size="sm" initials={p.initials} aria-hidden />
                ))}
              </span>
            )}
            <span className="notes-card__oppty">
              Oppty: <span className={note.opportunityId ? 'notes-link-text' : undefined}>{note.opportunityId ?? 'NA'}</span>
            </span>
            <IconButton
              size="sm"
              variant="ghost"
              intent="secondary"
              label={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
              aria-pressed={note.favorite}
              icon={<Star className={note.favorite ? 'notes-star--on' : undefined} />}
              onClick={onToggleFavorite}
            />
          </div>
        </div>
        <p className="notes-caption">{noteMeta(note)}</p>
        <p className={long ? 'notes-card__body notes-card__body--clamp' : 'notes-card__body'}>{note.body.trim() ? note.body : 'NA'}</p>
        {long && (
          <div>
            <button type="button" className="notes-card__more" onClick={onOpen}>
              more<span className="ce-sr-only">{` of ${note.title}`}</span>
            </button>
          </div>
        )}
        <p className="notes-caption">Tags: {note.tags.length ? note.tags.join(', ') : 'NA'}</p>
      </article>
    </Card>
  );
}

/** Empty state — not drawn in Figma; built from Card + Button. */
function EmptyState({ filtered, onClear, onAdd }: { filtered: boolean; onClear: () => void; onAdd: () => void }) {
  return (
    <Card>
      <div className="notes-empty" role="status">
        <NotebookPen className="notes-empty__icon" aria-hidden />
        <h3 className="notes-empty__title">{filtered ? 'No notes match your search' : 'No notes yet'}</h3>
        <p className="notes-empty__text">
          {filtered
            ? 'Try a different keyword or clear the filters to see all notes.'
            : 'Capture meeting takeaways, calls and follow-ups for this account.'}
        </p>
        <div className="notes-empty__actions">
          {filtered && (
            <Button variant="outline" intent="secondary" onClick={onClear}>
              Clear search &amp; filters
            </Button>
          )}
          <Button startIcon={<Plus />} onClick={onAdd}>
            Add Notes
          </Button>
        </div>
      </div>
    </Card>
  );
}
