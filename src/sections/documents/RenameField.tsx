import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { IconButton, TextInput } from '@cake-admin/cakeand';
import { extOf, validateRename } from './naming';

type Props = {
  name: string;
  taken: string[];
  onSave: (name: string) => void;
  onCancel: () => void;
};

/** Inline rename (Figma 10210:3243): the name field with cancel / confirm. */
export function RenameField({ name, taken, onSave, onCancel }: Props) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);
  const ext = extOf(name);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // Select the stem, leaving the fixed extension alone.
    el.setSelectionRange(0, Math.max(0, name.length - ext.length - 1));
  }, [name, ext]);

  const save = () => {
    const v = value.trim();
    if (v === name) return onCancel();
    const err = validateRename(v, ext, taken);
    if (err) return setError(err);
    onSave(v);
  };

  return (
    <div className="docs-rename">
      <div className="docs-rename__field">
        <TextInput
          ref={ref}
          size="sm"
          aria-label="File name"
          value={value}
          status={error ? 'error' : 'default'}
          helperText={error}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>
      <div className="docs-rename__actions">
        <IconButton size="sm" variant="outline" intent="secondary" label="Cancel rename" icon={<X />} onClick={onCancel} />
        <IconButton size="sm" label="Save name" icon={<Check />} onClick={save} />
      </div>
    </div>
  );
}
