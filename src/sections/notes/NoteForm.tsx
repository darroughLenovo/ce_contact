import { useId, useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Button, Dropdown, HelperString, InputLabel, TextInput } from '@cake-admin/cakeand';
import { SideDrawer } from './SideDrawer';
import { TagPicker } from './TagPicker';
import { CONTACTS, NOTE_TYPES, type Note } from './data';

export type NoteDraft = Pick<
  Note,
  'title' | 'body' | 'type' | 'opportunityId' | 'contactIds' | 'tags' | 'favorite'
>;

const EMPTY: NoteDraft = { title: '', body: '', type: undefined, opportunityId: '', contactIds: [], tags: [], favorite: false };

type Props = {
  open: boolean;
  /** Note being edited; omitted for "Add Notes". */
  note?: Note;
  allTags: string[];
  onCreateTag: (tag: string) => void;
  onCancel: () => void;
  onSubmit: (draft: NoteDraft) => void;
  /** Deep-link review states only. */
  initialTagsOpen?: boolean;
  initialTagQuery?: string;
};

const TYPE_OPTIONS = NOTE_TYPES.map((t) => ({ label: t, value: t }));
const CONTACT_OPTIONS = CONTACTS.map((c) => ({ label: `${c.name} — ${c.title}`, value: c.id }));

/**
 * Add Notes (14373:62601 / 62663 / 62710) and Edit Note (14373:62814) drawer.
 * The primary action stays disabled until a title is entered (Figma disabled
 * "Add Note" → enabled once "Note Title" is typed).
 */
export function NoteForm(props: Props) {
  // Remount the inner form per open/note so it starts from fresh state.
  if (!props.open) return null;
  return <NoteFormInner key={props.note?.id ?? 'new'} {...props} />;
}

function NoteFormInner({ note, allTags, onCreateTag, onCancel, onSubmit, initialTagsOpen, initialTagQuery }: Props) {
  const editing = Boolean(note);
  const [draft, setDraft] = useState<NoteDraft>(() =>
    note
      ? { title: note.title, body: note.body, type: note.type, opportunityId: note.opportunityId ?? '', contactIds: note.contactIds, tags: note.tags, favorite: note.favorite }
      : { ...EMPTY, title: initialTagQuery ? 'Note Title' : '' },
  );
  const [titleTouched, setTitleTouched] = useState(false);
  const bodyId = useId();
  const set = <K extends keyof NoteDraft>(k: K, v: NoteDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const titleMissing = !draft.title.trim();
  const submit = () => {
    if (titleMissing) {
      setTitleTouched(true);
      return;
    }
    onSubmit({ ...draft, title: draft.title.trim(), opportunityId: draft.opportunityId?.trim() || undefined });
  };

  return (
    <SideDrawer
      open
      onOpenChange={(o) => !o && onCancel()}
      title={editing ? 'Edit Note' : 'Add Notes'}
      actions={
        <>
          <Button size="xs" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="xs" startIcon={<Check />} disabled={titleMissing} onClick={submit}>
            {editing ? 'Save' : 'Add Note'}
          </Button>
        </>
      }
    >
      <form
        className="notes-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <TextInput
          label="Title"
          required
          placeholder="Enter note title"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          onBlur={() => setTitleTouched(true)}
          status={titleTouched && titleMissing ? 'error' : 'default'}
          helperText={titleTouched && titleMissing ? 'Title is required' : undefined}
          maxLength={150}
        />

        {/* COMPONENT GAP — cake& has no Textarea (TextInput docs: "Use
            Textarea (future)"). Native textarea composed with InputLabel and
            HelperString, styled from the TextInput tokens. */}
        <div className="notes-field">
          <InputLabel htmlFor={bodyId} size="sm">
            Body
          </InputLabel>
          <textarea
            id={bodyId}
            className="notes-textarea"
            placeholder="Write your note here"
            value={draft.body}
            onChange={(e) => set('body', e.target.value)}
            rows={4}
            maxLength={5000}
            aria-describedby={`${bodyId}-help`}
          />
          <HelperString id={`${bodyId}-help`} showIcon={false} count={draft.body.length} max={5000} />
        </div>

        <Dropdown
          label="Type"
          placeholder="Select"
          options={TYPE_OPTIONS}
          value={draft.type ?? ''}
          onValueChange={(v) => set('type', v)}
        />

        <TextInput
          label="Link to Opportunity"
          placeholder="Enter opportunity ID"
          inputMode="numeric"
          value={draft.opportunityId ?? ''}
          onChange={(e) => set('opportunityId', e.target.value)}
        />

        {/* Figma shows a single-select "Select"; the view lists several linked
            contacts, so this picks the primary one and keeps any others. */}
        <Dropdown
          label="Link to Contact"
          placeholder="Select"
          options={CONTACT_OPTIONS}
          value={draft.contactIds[0] ?? ''}
          onValueChange={(v) => set('contactIds', [v, ...draft.contactIds.filter((c) => c !== v)])}
        />

        <TagPicker
          value={draft.tags}
          onChange={(t) => set('tags', t)}
          allTags={allTags}
          onCreateTag={onCreateTag}
          defaultOpen={initialTagsOpen}
          defaultQuery={initialTagQuery}
        />

        <div>
          <Button
            type="button"
            variant="ghost"
            intent="secondary"
            underline={false}
            aria-pressed={draft.favorite}
            startIcon={<Star className={draft.favorite ? 'notes-star--on' : undefined} />}
            onClick={() => set('favorite', !draft.favorite)}
          >
            {draft.favorite ? 'Marked as Favorite' : 'Mark as Favorite'}
          </Button>
        </div>
      </form>
    </SideDrawer>
  );
}
