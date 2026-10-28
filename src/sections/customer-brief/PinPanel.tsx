import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Copy, Download, Maximize, Menu, Minus, RefreshCw, SendHorizontal, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button, Card, Dropdown, IconButton, Spinner, TextInput } from '@cake-admin/cakeand';
import { useToast } from '../../shell/toast';
import { outline } from './briefData';

export type BriefStatus = 'idle' | 'generating' | 'ready';

type Msg = { id: number; from: 'pin' | 'user'; body: ReactNode };

type Props = {
  status: BriefStatus;
  onGenerate: () => void;
  onDownload: () => void;
  onViewDocuments: () => void;
  onMinimize: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
};

function Feedback() {
  const showToast = useToast();
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <div className="cb-pin__feedback" role="group" aria-label="Response feedback">
      <IconButton
        size="xs"
        intent="secondary"
        variant={vote === 'up' ? 'tonal' : 'outline'}
        label="Helpful"
        aria-pressed={vote === 'up'}
        icon={<ThumbsUp />}
        onClick={() => setVote(vote === 'up' ? null : 'up')}
      />
      <IconButton
        size="xs"
        intent="secondary"
        variant={vote === 'down' ? 'tonal' : 'outline'}
        label="Not helpful"
        aria-pressed={vote === 'down'}
        icon={<ThumbsDown />}
        onClick={() => setVote(vote === 'down' ? null : 'down')}
      />
      <IconButton size="xs" intent="secondary" variant="outline" label="Copy response" icon={<Copy />} onClick={() => showToast({ status: 'success', title: 'Response copied' })} />
      <IconButton size="xs" intent="secondary" variant="outline" label="Regenerate response" icon={<RefreshCw />} />
    </div>
  );
}

function PinMessage({ children }: { children: ReactNode }) {
  return (
    <li className="cb-pin__msg">
      <span className="cb-pin__avatar" aria-hidden>
        <Sparkles />
      </span>
      <div className="cb-pin__bubble-wrap">
        <div className="cb-pin__bubble">{children}</div>
        <Feedback />
      </div>
    </li>
  );
}

/**
 * Figma "PIN" (10210:11456): the AI assistant chat that offers the Customer
 * Brief outline, generates it, then points to Documents / Download.
 */
export function PinPanel({ status, onGenerate, onDownload, onViewDocuments, onMinimize, inputRef }: Props) {
  const [extra, setExtra] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [status, extra.length]);

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    const id = Date.now();
    setExtra((m) => [
      ...m,
      { id, from: 'user', body: q },
      {
        id: id + 1,
        from: 'pin',
        body: 'Thanks — in this prototype I can only generate the Customer Brief. Use Generate above, or open Documents to see past briefs.',
      },
    ]);
    setDraft('');
  };

  return (
    <Card className="cb-pin" role="complementary" aria-label="PIN assistant">
      <header className="cb-pin__head">
        <IconButton size="sm" intent="secondary" variant="ghost" label="Conversation history" icon={<Menu />} />
        <span className="cb-pin__avatar" aria-hidden>
          <Sparkles />
        </span>
        <h2 className="cb-pin__title">PIN</h2>
        <span className="cb-pin__spacer" />
        <IconButton size="sm" intent="secondary" variant="ghost" label="Expand" icon={<Maximize />} />
        <IconButton size="sm" intent="secondary" variant="ghost" label="Minimize" icon={<Minus />} onClick={onMinimize} />
      </header>

      <ol className="cb-pin__log" ref={listRef} aria-live="polite">
        <li className="cb-pin__user">
          <p>Can you give me a customer brief so I can quickly understand Kroger?</p>
        </li>
        <PinMessage>
          <p>
            Sure! I can generate a <strong>Customer Brief</strong> that includes all key insights and critical data so you can
            quickly understand your customer, here is the outline:
          </p>
          <ol className="cb-pin__outline">
            {outline.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ol>
          <p>Do you want me to generate it now?</p>
          <div className="cb-pin__actions">
            <Button size="xs" onClick={onGenerate} disabled={status !== 'idle'}>
              {status === 'ready' ? 'Generated' : 'Generate'}
            </Button>
          </div>
        </PinMessage>

        {status === 'generating' && (
          <li className="cb-pin__msg cb-pin__msg--pending">
            <span className="cb-pin__avatar" aria-hidden>
              <Sparkles />
            </span>
            <span className="cb-pin__pending">
              <Spinner size="sm" aria-label="Generating Customer Brief" /> Generating your Customer Brief…
            </span>
          </li>
        )}

        {status === 'ready' && (
          <PinMessage>
            <p>
              I've generated the <strong>Customer Brief</strong> PDF for you, though the <strong>Lenovo Purchase History</strong>{' '}
              and <strong>Account Actions</strong> are currently unavailable. Feel free to check back later, or loop in your
              account manager if this doesn't look right.
            </p>
            <div className="cb-pin__actions">
              <Button size="xs" variant="ghost" onClick={onViewDocuments}>
                View in Documents
              </Button>
              <Button size="xs" startIcon={<Download />} onClick={onDownload}>
                Download
              </Button>
            </div>
          </PinMessage>
        )}

        {extra.map((m) =>
          m.from === 'user' ? (
            <li key={m.id} className="cb-pin__user">
              <p>{m.body}</p>
            </li>
          ) : (
            <PinMessage key={m.id}>
              <p>{m.body}</p>
            </PinMessage>
          ),
        )}
      </ol>

      <form
        className="cb-pin__composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="cb-pin__box">
          <TextInput
            ref={inputRef}
            aria-label="Ask PIN a question"
            placeholder="Type your question here"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="cb-pin__tools">
            <div className="cb-pin__tools-select">
              <Dropdown
                placeholder="Tools"
                options={[
                  { label: 'Customer Brief', value: 'brief' },
                  { label: 'Executive Brief', value: 'exec' },
                  { label: 'Web search', value: 'web' },
                ]}
              />
            </div>
            <IconButton type="submit" size="sm" variant="ghost" label="Send" icon={<SendHorizontal />} disabled={!draft.trim()} />
          </div>
        </div>
        <p className="cb-pin__disclaimer">AI disclaimer information goes here with links and resources available.</p>
      </form>
    </Card>
  );
}
