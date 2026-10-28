import { useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, Sparkles, X } from 'lucide-react';
import { Popover } from 'radix-ui';
import { Button, Chip, Divider, IconButton, MenuContainer, MenuItem, TextInput } from '@cake-admin/cakeand';
import { AI_SUGGESTED_TAGS } from './data';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Every tag known to the account; new tags are added through onCreateTag. */
  allTags: string[];
  onCreateTag: (tag: string) => void;
  /** Open the menu on mount (deep-link review state only). */
  defaultOpen?: boolean;
  defaultQuery?: string;
};

/**
 * Tags field (Figma "Drop Down" 14373:62709 / no-match 14373:62710 / chips
 * 14373:62814). COMPONENT GAP — cake& has no searchable multi-select /
 * combobox. Composed from TextInput (search), MenuContainer + MenuItem
 * (showCheckbox) for the option list, Button for Select All / Done / Create,
 * and removable Chips for the selected tokens. Delta: Figma draws the chips
 * inside the field; TextInput has no token slot, so they sit directly under it.
 */
export function TagPicker({ value, onChange, allTags, onCreateTag, defaultOpen = false, defaultQuery = '' }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(defaultQuery);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const q = query.trim();
  const matches = allTags.filter((t) => t.toLowerCase().includes(q.toLowerCase()));
  const exact = allTags.some((t) => t.toLowerCase() === q.toLowerCase());

  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);

  const create = () => {
    if (!q) return;
    if (!exact) onCreateTag(q);
    const name = exact ? allTags.find((t) => t.toLowerCase() === q.toLowerCase())! : q;
    if (!value.includes(name)) onChange([...value, name]);
    setQuery('');
  };

  const allSelected = matches.length > 0 && matches.every((t) => value.includes(t));
  const selectAll = () =>
    onChange(allSelected ? value.filter((t) => !matches.includes(t)) : Array.from(new Set([...value, ...matches])));

  const suggestions = AI_SUGGESTED_TAGS.filter((t) => !value.includes(t));

  return (
    <div className="notes-tags">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div ref={anchorRef} className="notes-tags__field">
            <TextInput
              label="Tags"
              placeholder="Search and Select"
              value={query}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (q && matches.length === 0) create();
                  else if (q && matches.length === 1) toggle(matches[0]);
                }
                if (e.key === 'Escape' && open) {
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
              endIcon={
                <span className="notes-tags__end">
                  {query && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      intent="secondary"
                      label="Clear search"
                      icon={<X />}
                      onClick={() => setQuery('')}
                    />
                  )}
                  <IconButton
                    size="xs"
                    variant="ghost"
                    intent="secondary"
                    label={open ? 'Close tag list' : 'Open tag list'}
                    icon={open ? <ChevronUp /> : <ChevronDown />}
                    onClick={() => setOpen((o) => !o)}
                  />
                </span>
              }
            />
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            className="notes-popover"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            // Keep the list open while focus moves between the field and its
            // controls; it closes on outside click, Esc or Done.
            onFocusOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
          >
            <MenuContainer width="var(--radix-popper-anchor-width)" id={listId}>
              {matches.length > 0 ? (
                <>
                  <div className="notes-tags__list" role="listbox" aria-label="Tags" aria-multiselectable>
                    {matches.map((t) => (
                      <MenuItem
                        key={t}
                        role="option"
                        aria-selected={value.includes(t)}
                        showCheckbox
                        checked={value.includes(t)}
                        onCheckedChange={() => toggle(t)}
                        onClick={() => toggle(t)}
                        showLeftSlot={false}
                        showRightSlot={false}
                      >
                        {t}
                      </MenuItem>
                    ))}
                  </div>
                  {q && !exact && (
                    <>
                      <Divider weight="weak" />
                      <Button size="sm" variant="ghost" startIcon={<Plus />} onClick={create}>
                        {`Create new tag '${q}'`}
                      </Button>
                    </>
                  )}
                  <Divider weight="weak" />
                  <div className="notes-tags__footer">
                    <Button size="sm" variant="ghost" intent="secondary" underline={false} onClick={selectAll}>
                      {allSelected ? 'Clear All' : 'Select All'}
                    </Button>
                    <Button size="sm" variant="ghost" intent="secondary" underline={false} onClick={() => setOpen(false)}>
                      Done
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="notes-tags__empty" role="status">
                    <Search aria-hidden />
                    <div>
                      <p className="notes-tags__empty-title">No matching tag found</p>
                      <p className="notes-tags__empty-hint">Press Enter or click below to create a new tag.</p>
                    </div>
                  </div>
                  <Divider weight="weak" />
                  <Button size="sm" variant="ghost" startIcon={<Plus />} onClick={create}>
                    {`Create new tag '${q}'`}
                  </Button>
                </>
              )}
            </MenuContainer>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {value.length > 0 && (
        <div className="notes-tags__chips" aria-label="Selected tags">
          {value.map((t) => (
            <Chip key={t} size="sm" onRemove={() => toggle(t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="notes-tags__ai">
          <p className="notes-tags__ai-label">
            <Sparkles aria-hidden /> AI Suggested Tags
          </p>
          <div className="notes-tags__chips">
            {suggestions.map((t) => (
              <Chip
                key={t}
                type="info"
                size="sm"
                leadingIcon={<Plus />}
                onClick={() => {
                  if (!allTags.includes(t)) onCreateTag(t);
                  onChange([...value, t]);
                }}
              >
                {t}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
