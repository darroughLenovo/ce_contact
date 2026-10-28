import { useEffect, useId, useState } from 'react';
import { Modal, ModalContent, ModalFooter } from '@cake-admin/cakeand';

const MAX_WORDS = 100;
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (justification: string) => void;
};

/**
 * Figma "Modal" (10292:35645) + gesture "Submit Dialog" (10210:20987):
 * justification is mandatory, capped at 100 words; the counter turns red when
 * exceeded. Field states follow "Long Text" (10210:20056/20057/21009) and
 * "Label Row" (10210:21010).
 *
 * Component gap: cake& has no multi-line text field (TextInput is single-line),
 * so the textarea is built from the TextInput tokens.
 */
export function ReviewTicketModal({ open, onOpenChange, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const id = useId();

  useEffect(() => {
    if (open) {
      setText('');
      setTouched(false);
    }
  }, [open]);

  const words = countWords(text);
  const empty = words === 0;
  const over = words > MAX_WORDS;
  const showError = touched && (empty || over);

  const submit = () => {
    setTouched(true);
    if (empty || over) {
      document.getElementById(`${id}-field`)?.focus();
      return;
    }
    onSubmit(text.trim());
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Submit Account Review Ticket"
      footer={
        <ModalFooter
          // No acknowledgement checkbox in this dialog: an empty slot replaces the default.
          checkbox={<span />}
          secondaryActionLabel="Cancel"
          onSecondaryAction={() => onOpenChange(false)}
          primaryActionLabel="Submit"
          onPrimaryAction={submit}
        />
      }
    >
      <ModalContent description="Please provide a justification of your updates in the field below.">
      <div className="dt-textarea-wrap">
        <label htmlFor={`${id}-field`} className="ce-sr-only">
          Justification (required, up to {MAX_WORDS} words)
        </label>
        <div className={`dt-textarea ${showError ? 'dt-textarea--error' : ''}`}>
          <textarea
            id={`${id}-field`}
            value={text}
            required
            aria-invalid={showError || undefined}
            aria-describedby={`${id}-count ${showError ? `${id}-err` : ''}`}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={8}
            autoFocus
          />
          <span id={`${id}-count`} className={`dt-textarea__count ${over ? 'dt-textarea__count--over' : ''}`} aria-live="polite">
            {words}/{MAX_WORDS}
            <span className="ce-sr-only"> words</span>
          </span>
        </div>
        {showError && (
          <p id={`${id}-err`} className="dt-field-error" role="alert">
            {empty ? 'Please provide the reason for this update' : `Please shorten the justification to ${MAX_WORDS} words or fewer`}
          </p>
        )}
      </div>
      </ModalContent>
    </Modal>
  );
}
