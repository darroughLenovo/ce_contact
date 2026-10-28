// Pin chat column (Figma "Master Exe Brief", 10210:19861).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Copy, Download, RefreshCw, Send, Sparkles, ThumbsDown, ThumbsUp, ChevronDown } from 'lucide-react';
import { Popover } from 'radix-ui';
import { Button, Dropdown, IconButton, MenuContainer, MenuItem, Spinner } from '@cake-admin/cakeand';
import { ATTENDEES } from './data';

export type ChatMessage =
  | { id: string; role: 'ai'; body: ReactNode; docActions?: boolean }
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'attendees'; done: boolean }
  | { id: string; role: 'choice'; done: boolean };

type Props = {
  messages: ChatMessage[];
  thinking: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onAddAttendees: (ids: string[]) => void;
  onChoice: (optimized: boolean) => void;
  onViewDocuments: () => void;
  onDownload: () => void;
};

export function AiAvatar() {
  return (
    <span className="eb-avatar" aria-hidden="true">
      <Sparkles />
    </span>
  );
}

function Feedback() {
  return (
    <div className="eb-feedback">
      <IconButton size="xs" variant="outline" intent="secondary" label="Good response" icon={<ThumbsUp />} />
      <IconButton size="xs" variant="outline" intent="secondary" label="Bad response" icon={<ThumbsDown />} />
      <IconButton size="xs" variant="outline" intent="secondary" label="Copy" icon={<Copy />} />
      <IconButton size="xs" variant="outline" intent="secondary" label="Regenerate" icon={<RefreshCw />} />
    </div>
  );
}

export function AiBubble({ children, feedback = true }: { children: ReactNode; feedback?: boolean }) {
  return (
    <div className="eb-msg eb-msg--ai">
      <div className="eb-msg__row">
        <AiAvatar />
        <div className="eb-msg__bubble">{children}</div>
      </div>
      {feedback && <Feedback />}
    </div>
  );
}

/**
 * Multi-select attendee picker (Figma 14376:68003). cake& Dropdown is
 * single-select, so this is a Popover holding a MenuContainer of checkbox
 * MenuItems — gap reported.
 */
function AttendeePicker({ done, onAdd }: { done: boolean; onAdd: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const summary = selected.length
    ? ATTENDEES.filter((a) => selected.includes(a.id))
        .map((a) => a.name.split(' ')[0])
        .join(', ')
    : 'Please Select';
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));

  return (
    <div className="eb-picker">
      <span className="eb-picker__label" id="eb-attendees-label">
        Meeting Attendees (Select All Apply)
      </span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={done}>
          <Button
            variant="outline"
            intent="secondary"
            fullWidth
            underline={false}
            endIcon={<ChevronDown />}
            aria-labelledby="eb-attendees-label"
            aria-describedby="eb-attendees-value"
            className="eb-picker__trigger"
          >
            <span id="eb-attendees-value" className="eb-picker__value">
              {summary}
            </span>
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="eb-popover" align="start" sideOffset={4}>
            <MenuContainer role="group" aria-label="Meeting attendees" width="var(--radix-popover-trigger-width)" maxHeight="calc(var(--space-1000) * 3)">
              {ATTENDEES.map((a) => (
                <MenuItem
                  key={a.id}
                  showCheckbox
                  showLeftSlot={false}
                  showRightSlot={false}
                  selected={selected.includes(a.id)}
                  checked={selected.includes(a.id)}
                  onCheckedChange={(c) => toggle(a.id, c)}
                  onClick={() => toggle(a.id, !selected.includes(a.id))}
                >
                  <span className="eb-picker__option">
                    <span>{a.name}</span>
                    <span className="eb-picker__sub">{a.title}</span>
                  </span>
                </MenuItem>
              ))}
            </MenuContainer>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div className="eb-picker__actions">
        <Button size="sm" disabled={done || selected.length === 0} onClick={() => onAdd(selected)}>
          {done ? 'Added to Executive Brief' : 'Add to Executive Brief'}
        </Button>
      </div>
    </div>
  );
}

export function Chat({
  messages,
  thinking,
  draft,
  onDraftChange,
  onSend,
  onAddAttendees,
  onChoice,
  onViewDocuments,
  onDownload,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length, thinking]);

  const docActions = (
    <div className="eb-msg__actions">
      <Button size="sm" variant="ghost" underline={false} onClick={onViewDocuments}>
        View in Documents
      </Button>
      <Button size="sm" startIcon={<Download />} onClick={onDownload}>
        Download
      </Button>
    </div>
  );

  return (
    <section className="eb-chat" aria-label="Chat with Pin">
      <div className="eb-chat__log" role="log" aria-live="polite">
        {messages.map((m) => {
          if (m.role === 'user')
            return (
              <div key={m.id} className="eb-msg eb-msg--user">
                <p className="eb-msg__user">{m.text}</p>
              </div>
            );
          if (m.role === 'attendees')
            return (
              <AiBubble key={m.id}>
                <p>
                  I’ve prepared the Executive Brief slide 1-5 using your account plan. I just need a few details from you.
                  First, please select the <strong>meeting attendees</strong>.
                </p>
                <AttendeePicker done={m.done} onAdd={onAddAttendees} />
              </AiBubble>
            );
          if (m.role === 'choice')
            return (
              <div key={m.id} className="eb-choices">
                <Button variant="outline" disabled={m.done} onClick={() => onChoice(true)}>
                  Yes, use optimized version
                </Button>
                <Button variant="outline" disabled={m.done} onClick={() => onChoice(false)}>
                  Use my original version
                </Button>
              </div>
            );
          return (
            <AiBubble key={m.id}>
              {m.body}
              {m.docActions && docActions}
            </AiBubble>
          );
        })}
        {thinking && (
          <div className="eb-msg eb-msg--ai">
            <div className="eb-msg__row">
              <AiAvatar />
              <span className="eb-thinking">
                <Spinner size="sm" aria-label="Pin is thinking" /> Pin is thinking…
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="eb-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) onSend();
        }}
      >
        <div className="eb-composer__box">
          <textarea
            className="eb-composer__input"
            aria-label="Message Pin"
            placeholder="Ask Pin or reply here…"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (draft.trim()) onSend();
              }
            }}
          />
          <div className="eb-composer__bar">
            <div className="eb-composer__tools">
              <label className="ce-sr-only" htmlFor="eb-tools">
                Tools
              </label>
              <Dropdown
                id="eb-tools"
                placeholder="Tools"
                options={[
                  { label: 'Executive Brief', value: 'exec' },
                  { label: 'Customer Brief', value: 'customer' },
                  { label: 'Buyer Change Blueprint', value: 'bcb' },
                ]}
              />
            </div>
            <IconButton type="submit" size="sm" label="Send" icon={<Send />} disabled={!draft.trim() || thinking} />
          </div>
        </div>
        <p className="eb-composer__disclaimer">AI disclaimer information goes here with links and resources available.</p>
      </form>
    </section>
  );
}
