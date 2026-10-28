import { useState } from 'react';
import { User } from 'lucide-react';
import {
  DateInput,
  Dropdown,
  FileUpload,
  HelperString,
  InputLabel,
  Modal,
  ModalContent,
  ModalFooter,
  parseDisplayDate,
  TextInput,
} from '@cake-admin/cakeand';
import {
  buildFileName,
  CATEGORIES,
  categoryOf,
  extOf,
  nextVersion,
  validateOppoId,
  validateSegment,
  type CategoryId,
} from './naming';

/** ModalFooter renders a "Don't remind me again" checkbox unless the slot is filled. */
const NO_CHECKBOX = <span />;

/* ── Confirm (Figma "Modal" 10210:20984) ─────────────────────────────── */

export type ConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export function ConfirmModal({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  return (
    <Modal
      open={!!state}
      onOpenChange={(o) => !o && onClose()}
      title={state?.title ?? ''}
      showClose={false}
      footer={
        <ModalFooter
          checkbox={NO_CHECKBOX}
          secondaryActionLabel="Cancel"
          onSecondaryAction={onClose}
          primaryActionLabel={state?.confirmLabel ?? 'Confirm'}
          onPrimaryAction={() => {
            state?.onConfirm();
            onClose();
          }}
        />
      }
    >
      <ModalContent description={state?.description} />
    </Modal>
  );
}

/* ── Share (Figma 10210:3737) ───────────────────────────────────────── */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShareModal({
  docName,
  onClose,
  onSend,
}: {
  docName: string | null;
  onClose: () => void;
  onSend: (recipients: string[]) => void;
}) {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();

  const close = () => {
    setTo('');
    setMessage('');
    setError(undefined);
    onClose();
  };

  const send = () => {
    const list = to.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (!list.length) return setError('Add at least one name or email');
    const bad = list.find((s) => s.includes('@') && !EMAIL.test(s));
    if (bad) return setError(`"${bad}" isn't a valid email address`);
    onSend(list);
    close();
  };

  return (
    <Modal
      open={docName !== null}
      onOpenChange={(o) => !o && close()}
      title={`Share “${docName ?? ''}”`}
      footer={
        <ModalFooter
          checkbox={NO_CHECKBOX}
          secondaryActionLabel="Cancel"
          onSecondaryAction={close}
          primaryActionLabel="Send"
          onPrimaryAction={send}
        />
      }
    >
      <ModalContent>
        <div className="docs-form">
          <TextInput
            aria-label="Add a name, or email"
            placeholder="Add a name, or email"
            startIcon={<User />}
            value={to}
            status={error ? 'error' : 'default'}
            helperText={error ?? 'Separate multiple people with a comma'}
            onChange={(e) => {
              setTo(e.target.value);
              if (error) setError(undefined);
            }}
          />
          <div className="docs-textarea">
            <InputLabel htmlFor="docs-share-message">Message (optional)</InputLabel>
            {/* Gap: cake& has no multi-line text field yet (Textarea is "future"). */}
            <textarea
              id="docs-share-message"
              className="docs-textarea__field"
              placeholder="Add a message"
              rows={4}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

/* ── Upload (Add Document → Upload) — naming per Figma 14195:36774 ──── */

type Errors = Partial<Record<'category' | 'oppoId' | 'meeting' | 'requirements' | 'file', string>>;

export type UploadResult = { name: string; category: CategoryId; version: number };

export function UploadModal({
  open,
  existingNames,
  onClose,
  onUpload,
}: {
  open: boolean;
  existingNames: string[];
  onClose: () => void;
  onUpload: (r: UploadResult) => void;
}) {
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [oppoId, setOppoId] = useState('');
  const [meeting, setMeeting] = useState('');
  const [requirements, setRequirements] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const cat = category ? categoryOf(category) : undefined;
  const meetingDate = meeting ? parseDisplayDate(meeting) : null;

  const draft = category
    ? buildFileName({ category, oppoId, meetingDate, requirements })
    : '';
  const version = cat?.versioned ? nextVersion(draft, existingNames) : 1;
  const fileName = category ? buildFileName({ category, oppoId, meetingDate, requirements, version }) : '';

  const reset = () => {
    setCategory('');
    setOppoId('');
    setMeeting('');
    setRequirements('');
    setFile(null);
    setErrors({});
  };
  const close = () => {
    reset();
    onClose();
  };

  const clear = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));

  const fileError = (f: File | null, c = cat) => {
    if (!f) return 'Choose a file to upload';
    if (c && extOf(f.name) !== c.ext) return `${c.label} must be a .${c.ext} file`;
    return undefined;
  };

  const submit = () => {
    const next: Errors = {
      category: category ? undefined : 'Choose a document type',
      oppoId: category === 'bcb' ? validateOppoId(oppoId) : undefined,
      meeting:
        category === 'executive-brief' ? (!meeting ? 'Meeting date is required' : !meetingDate ? 'Enter a valid date (MM/DD/YY)' : undefined) : undefined,
      requirements: category === 'product-rec' ? validateSegment(requirements, 'Requirements') : undefined,
      file: fileError(file),
    };
    if (!next.file && existingNames.some((n) => n.toLowerCase() === fileName.toLowerCase())) {
      next.file = 'A document with this name already exists today — archive or rename it first';
    }
    setErrors(next);
    if (Object.values(next).some(Boolean) || !category) return;
    onUpload({ name: fileName, category, version });
    close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && close()}
      title="Upload document"
      subtitle="Files are renamed to the document naming standard."
      footer={
        <ModalFooter
          checkbox={NO_CHECKBOX}
          secondaryActionLabel="Cancel"
          onSecondaryAction={close}
          primaryActionLabel="Upload"
          onPrimaryAction={submit}
        />
      }
    >
      <ModalContent descriptionAsDialogDescription={false}>
        <div className="docs-form">
          <Dropdown
            label="Document type"
            required
            placeholder="Select a type"
            options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            value={category || undefined}
            onValueChange={(v) => {
              const c = categoryOf(v as CategoryId);
              setCategory(v as CategoryId);
              setErrors((e) => ({ ...e, category: undefined, file: file ? fileError(file, c) : undefined }));
            }}
            helperText={errors.category ? <span className="docs-error">{errors.category}</span> : undefined}
          />

          {category === 'bcb' && (
            <TextInput
              label="Oppo ID"
              required
              placeholder="e.g. OPP-0048213"
              value={oppoId}
              status={errors.oppoId ? 'error' : 'default'}
              helperText={errors.oppoId}
              onChange={(e) => {
                setOppoId(e.target.value);
                clear('oppoId');
              }}
            />
          )}
          {category === 'executive-brief' && (
            <DateInput
              label="Meeting date"
              required
              value={meeting}
              status={errors.meeting ? 'error' : 'default'}
              helperText={errors.meeting}
              showHelper={!!errors.meeting}
              onValueChange={(v) => {
                setMeeting(v);
                clear('meeting');
              }}
            />
          )}
          {category === 'product-rec' && (
            <TextInput
              label="Requirements"
              required
              placeholder="e.g. Store Edge Compute"
              maxLength={40}
              value={requirements}
              status={errors.requirements ? 'error' : 'default'}
              helperText={errors.requirements}
              onChange={(e) => {
                setRequirements(e.target.value);
                clear('requirements');
              }}
            />
          )}

          <div className="docs-upload">
            <InputLabel required>File</InputLabel>
            <FileUpload
              file={file}
              accept={cat ? `.${cat.ext}` : '.pdf,.pptx'}
              maxSize={25 * 1024 * 1024}
              uploadLabel="Upload File"
              updateLabel="Replace File"
              restrictions={cat ? `.${cat.ext} only, up to 25 MB` : '.pdf or .pptx, up to 25 MB'}
              status={errors.file ? 'error' : undefined}
              errorMessage={errors.file}
              onFileChange={(f) => {
                setFile(f);
                setErrors((e) => ({ ...e, file: fileError(f) }));
              }}
              onRemove={() => setFile(null)}
              onError={(msg) => setErrors((e) => ({ ...e, file: msg }))}
            />
          </div>

          {category && (
            <div className="docs-preview">
              <InputLabel>Saved as</InputLabel>
              <p className="docs-preview__name">{fileName}</p>
              <HelperString>
                {cat?.versioned && version > 1 ? `Version ${version} — earlier versions of this document exist.` : 'Generated from the document naming rules.'}
              </HelperString>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
