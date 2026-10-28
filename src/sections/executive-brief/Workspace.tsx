// Pin co-edit window for the Executive Brief (Figma Desktop - 2 … 8, Previous versions).
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Download, Eye, Maximize2, Menu, MessageSquarePlus, Minimize2, Minus, Pencil, Sparkles, X } from 'lucide-react';
import { Dialog, Popover } from 'radix-ui';
import {
  Badge,
  Button,
  ContentSwitcher,
  IconButton,
  MenuContainer,
  MenuItem,
  Modal,
  ModalContent,
  ModalFooter,
  TextInput,
} from '@cake-admin/cakeand';
import { navigate } from '../../shell/router';
import { useToast } from '../../shell/toast';
import { Chat, type ChatMessage } from './Chat';
import { SlideView, type AttendeeNotes, type Slide } from './Slides';
import {
  ACCOUNT_SHORT,
  ATTENDEES,
  BRIEF_ID,
  COMBINE_PROMPT,
  DEFAULT_MEETING_DATE,
  INITIAL_VERSIONS,
  OPTIMIZED_OUTCOMES,
  REWRITE_PROMPT,
  SAMPLE_FOLLOW_UPS,
  SAMPLE_OUTCOMES,
  TEMPLATE_SLIDES,
  briefFileName,
  type Version,
} from './data';

type Step = 'attendees' | 'followUps' | 'outcomes' | 'complete' | 'offer' | 'refine' | 'done';

type Props = {
  open: boolean;
  onClose: (summary: string) => void;
  onMinimize: () => void;
  /** Open the "Session Timed Out" dialog on mount (prototype state). */
  startTimedOut?: boolean;
};

let uid = 0;
const nid = () => `m${++uid}`;
const chunk = <T,>(arr: T[], n: number) =>
  arr.reduce<T[][]>((acc, x, i) => (i % n ? acc[acc.length - 1].push(x) : acc.push([x]), acc), []);
const toLines = (text: string) =>
  text
    .split(/\n|;/)
    .map((s) => s.replace(/^[\s•\-*\d.]+/, '').trim())
    .filter(Boolean);

const THUMB_FOR: Record<string, string> = {
  cover: TEMPLATE_SLIDES.cover.src,
  facts: TEMPLATE_SLIDES.facts.src,
  s3: TEMPLATE_SLIDES.s3.src,
  s4: TEMPLATE_SLIDES.s4.src,
  s5: TEMPLATE_SLIDES.s5.src,
  s6: TEMPLATE_SLIDES.s6.src,
  c1: TEMPLATE_SLIDES.c1.src,
  c2: TEMPLATE_SLIDES.c2.src,
  'att-0': TEMPLATE_SLIDES.c1.src,
  'att-1': TEMPLATE_SLIDES.c2.src,
};

export function Workspace({ open, onClose, onMinimize, startTimedOut = false }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [step, setStep] = useState<Step>('attendees');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: nid(), role: 'attendees', done: false }]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  const [mode, setMode] = useState<'edit' | 'view'>('view');
  const [meetingDate, setMeetingDate] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<AttendeeNotes>({});
  const [lists, setLists] = useState<{ followUps: string[]; outcomes: string[] }>({ followUps: [], outcomes: [] });
  const [merged, setMerged] = useState(false);
  const [selectedId, setSelectedId] = useState('facts');

  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [versions, setVersions] = useState<Version[]>(INITIAL_VERSIONS);
  const [viewing, setViewing] = useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);

  const [confirmExit, setConfirmExit] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const showToast = useToast();

  const current = versions[0];
  const previous = viewing !== null && viewing !== current.id;
  const attendees = ATTENDEES.filter((a) => attendeeIds.includes(a.id));
  const canEdit = attendeeIds.length > 0 && !previous;
  const editing = mode === 'edit' && canEdit;
  const nextVersion = () => `${Number(current.id) + 1}.0`;

  const bumpVersion = (note: string) => {
    const id = nextVersion();
    setVersions((v) => [{ id, label: id, date: '27 Oct 2026', note }, ...v.map((x, i) => (i === 0 ? { ...x, note: 'Saved version' } : x))]);
    return id;
  };

  // Prototype state: open straight into the session time-out dialog.
  useEffect(() => {
    if (startTimedOut) setTimedOut(true);
  }, [startTimedOut]);

  const deck: Slide[] = useMemo(() => {
    const s: Slide[] = [
      { id: 'cover', kind: 'image', img: 'cover', title: 'Cover' },
      { id: 'facts', kind: 'facts', title: 'Company Facts & Figures' },
      { id: 's3', kind: 'image', img: 's3', title: 'One Lenovo Revenue & CX' },
      { id: 's4', kind: 'image', img: 's4', title: 'Growth Initiatives' },
      { id: 's5', kind: 'image', img: 's5', title: 'Install Base' },
      { id: 's6', kind: 'image', img: 's6', title: 'Account Plan Objectives' },
    ];
    if (attendees.length) {
      chunk(attendees, 2).forEach((c, i) =>
        s.push({ id: `att-${i}`, kind: 'attendees', attendees: c, title: `Meeting Attendees ${i + 1}` }),
      );
    } else {
      s.push({ id: 'c1', kind: 'image', img: 'c1', title: 'Contacts' }, { id: 'c2', kind: 'image', img: 'c2', title: 'Contacts' });
    }
    if (merged) s.push({ id: 'combined', kind: 'list', lists: ['followUps', 'outcomes'], title: 'Follow-ups & Outcomes' });
    else {
      if (lists.followUps.length) s.push({ id: 'followUps', kind: 'list', lists: ['followUps'], title: 'Follow-up Actions' });
      if (lists.outcomes.length) s.push({ id: 'outcomes', kind: 'list', lists: ['outcomes'], title: 'Desired Outcomes' });
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeIds.join(','), merged, lists.followUps.length > 0, lists.outcomes.length > 0]);

  const slide = deck.find((d) => d.id === selectedId) ?? deck[1];

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const reply = (msgs: ChatMessage[], then?: () => void) => {
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, ...msgs]);
      then?.();
    }, 700);
  };

  const addAttendees = (ids: string[]) => {
    setMessages((m) => m.map((x) => (x.role === 'attendees' ? { ...x, done: true } : x)));
    setAttendeeIds(ids);
    if (!meetingDate) setMeetingDate(DEFAULT_MEETING_DATE);
    setSelectedId('att-0');
    setMode('edit');
    markDirty();
    const first = 7;
    const slideNums = chunk(ids, 2).map((_, i) => first + i);
    reply([
      {
        id: nid(),
        role: 'ai',
        body: (
          <>
            <p>
              I’ve added your selected attendees to slide{slideNums.length > 1 ? 's' : ''} {slideNums.join(', ')} to the right
              where you can directly type in their Bios and Personal Insights.
            </p>
            <p>
              Next, please tell me about the <strong>follow-up actions</strong>.
            </p>
          </>
        ),
      },
    ]);
    setStep('followUps');
    setDraft(SAMPLE_FOLLOW_UPS.join('\n'));
  };

  const send = () => {
    const text = draft.trim();
    setDraft('');
    setMessages((m) => [...m, { id: nid(), role: 'user', text }]);
    const slideNo = 7 + Math.max(1, chunk(attendeeIds, 2).length);

    switch (step) {
      case 'followUps':
        setLists((l) => ({ ...l, followUps: toLines(text) }));
        markDirty();
        reply(
          [
            {
              id: nid(),
              role: 'ai',
              body: (
                <>
                  <p>I’ve added the follow-up actions to slide {slideNo} in bullet points.</p>
                  <p>
                    Finally, please tell me the <strong>desired outcomes</strong> from this coming up meeting.
                  </p>
                </>
              ),
            },
          ],
          () => setSelectedId('followUps'),
        );
        setStep('outcomes');
        setDraft(SAMPLE_OUTCOMES.join('\n'));
        return;
      case 'outcomes':
        setLists((l) => ({ ...l, outcomes: toLines(text) }));
        markDirty();
        reply([{ id: nid(), role: 'ai', body: <p>Your Executive Brief PowerPoint is completed!</p>, docActions: true }], () =>
          setSelectedId('outcomes'),
        );
        setStep('complete');
        setDraft(REWRITE_PROMPT);
        return;
      case 'complete':
        reply([
          {
            id: nid(),
            role: 'ai',
            body: (
              <>
                <p>Got it! Here is the rewritten version:</p>
                <ul className="eb-msg__list">
                  {OPTIMIZED_OUTCOMES.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
                <p>Do you want to add this version in your brief?</p>
              </>
            ),
          },
          { id: nid(), role: 'choice', done: false },
        ]);
        setStep('offer');
        return;
      case 'refine':
        if (/combine|merge|1 slide|one slide/i.test(text)) {
          reply(
            [
              {
                id: nid(),
                role: 'ai',
                body: <p>All set! The follow-ups and desired outcomes are now merged into one slide. Here is the updated document.</p>,
                docActions: true,
              },
            ],
            () => {
              setMerged(true);
              setSelectedId('combined');
              markDirty();
            },
          );
          setStep('done');
          return;
        }
        break;
      default:
        break;
    }
    reply([{ id: nid(), role: 'ai', body: <p>Done — I’ve noted that. Edit any slide directly on the canvas, or ask me for more changes.</p> }]);
  };

  const choose = (optimized: boolean) => {
    setMessages((m) => [
      ...m.map((x) => (x.role === 'choice' ? { ...x, done: true } : x)),
      { id: nid(), role: 'user', text: optimized ? 'Yes, use optimized version' : 'Use my original version' },
    ]);
    if (optimized) {
      setLists((l) => ({ ...l, outcomes: OPTIMIZED_OUTCOMES }));
      markDirty();
    }
    reply(
      [
        {
          id: nid(),
          role: 'ai',
          body: <p>{optimized ? 'Cool, the optimized version is added. Here is the updated document.' : 'No problem — I kept your original version. Here is the document.'}</p>,
          docActions: true,
        },
      ],
      () => setSelectedId('outcomes'),
    );
    setStep('refine');
    setDraft(COMBINE_PROMPT);
  };

  const fileName = briefFileName(meetingDate, previous ? viewing! : current.id);
  const download = () => showToast({ title: 'Download started', description: fileName });
  const viewDocs = () => {
    onClose('');
    navigate('documents');
  };

  const save = () => {
    setDirty(false);
    setSaved(true);
  };

  const requestClose = () => {
    if (dirty) {
      setConfirmExit(true);
      return;
    }
    const id = bumpVersion('Saved on exit');
    onClose(`Executive Brief saved as version ${id}.`);
  };

  const exitSaving = () => {
    setConfirmExit(false);
    const id = bumpVersion('Saved on exit');
    setDirty(false);
    onClose(`Executive Brief saved as version ${id}.`);
  };

  const exitDiscarding = () => {
    setConfirmExit(false);
    setDirty(false);
    onClose('Executive Brief closed without saving changes.');
  };

  const acknowledgeTimeout = () => setTimedOut(false);

  // Session time-out: unsaved changes are auto-saved as a new version.
  useEffect(() => {
    if (!timedOut) return;
    bumpVersion('Auto-saved on session time-out');
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  const title = (
    <span className="eb-title__text">
      {ACCOUNT_SHORT} Executive Brief{' '}
      {previous ? null : meetingDate ? meetingDate : <span className="eb-title__placeholder">Meeting Date</span>}
    </span>
  );

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && requestClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="eb-scrim" />
        <Dialog.Content
          className={`eb-window${fullscreen ? ' eb-window--full' : ''}`}
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            requestClose();
          }}
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
        >
            <nav className="eb-window__rail" aria-label="Pin">
              <IconButton size="sm" variant="ghost" intent="secondary" label="Pin menu" icon={<Menu />} />
              <IconButton size="sm" variant="ghost" intent="primary" label="New chat" icon={<MessageSquarePlus />} />
            </nav>
            <div className="eb-window__main">
              <header className="eb-window__bar">
                <div className="eb-window__agent">
                  <span className="eb-avatar" aria-hidden="true">
                    <Sparkles />
                  </span>
                  <Dialog.Title className="eb-window__title">Executive Brief for {ACCOUNT_SHORT}</Dialog.Title>
                </div>
                <div className="eb-window__actions">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    intent="secondary"
                    label={fullscreen ? 'Exit full screen' : 'Full screen'}
                    icon={fullscreen ? <Minimize2 /> : <Maximize2 />}
                    onClick={() => setFullscreen((f) => !f)}
                  />
                  <IconButton size="sm" variant="ghost" intent="secondary" label="Minimize" icon={<Minus />} onClick={onMinimize} />
                </div>
              </header>

              <div className="eb-window__body">
                <Chat
                  messages={messages}
                  thinking={thinking}
                  draft={draft}
                  onDraftChange={setDraft}
                  onSend={send}
                  onAddAttendees={addAttendees}
                  onChoice={choose}
                  onViewDocuments={viewDocs}
                  onDownload={download}
                />

                <section className="eb-canvas" aria-label="Executive Brief canvas">
                  <div className="eb-canvas__head">
                    <IconButton variant="ghost" intent="secondary" label="Close Executive Brief" icon={<X />} onClick={requestClose} />
                    <div className="eb-canvas__doc">
                      {renaming ? (
                        <form
                          className="eb-rename"
                          onSubmit={(e) => {
                            e.preventDefault();
                            setMeetingDate(renameDraft.trim());
                            setRenaming(false);
                            markDirty();
                          }}
                        >
                          <TextInput
                            size="sm"
                            aria-label="Meeting date"
                            placeholder="e.g. 26 Aug, 2026"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            autoFocus
                          />
                          <IconButton
                            size="xs"
                            variant="outline"
                            intent="secondary"
                            label="Cancel rename"
                            icon={<X />}
                            type="button"
                            onClick={() => setRenaming(false)}
                          />
                          <IconButton size="xs" label="Confirm rename" icon={<Check />} type="submit" />
                        </form>
                      ) : (
                        <div className="eb-title">
                          <h2 className="eb-title__h">{title}</h2>
                          {!previous && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              intent="secondary"
                              label="Edit meeting date"
                              icon={<Pencil />}
                              onClick={() => {
                                setRenameDraft(meetingDate || '');
                                setRenaming(true);
                              }}
                            />
                          )}
                        </div>
                      )}
                      <div className="eb-meta">
                        <Popover.Root open={versionsOpen} onOpenChange={setVersionsOpen}>
                          <Popover.Trigger asChild>
                            <Button size="xs" variant="ghost" intent="secondary" underline={false} endIcon={<ChevronDown />}>
                              Version History: {previous ? viewing : current.label}
                            </Button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content className="eb-popover" align="start" sideOffset={4}>
                              <MenuContainer role="menu" aria-label="Version history" width="calc(var(--space-1000) * 3.5)">
                                {versions.map((v, i) => (
                                  <MenuItem
                                    key={v.id}
                                    role="menuitem"
                                    showLeftSlot={false}
                                    showRightSlot={(previous ? viewing : current.id) === v.id}
                                    rightSlot={<Check />}
                                    selected={(previous ? viewing : current.id) === v.id}
                                    onClick={() => {
                                      setViewing(i === 0 ? null : v.id);
                                      if (i !== 0) setMode('view');
                                      setVersionsOpen(false);
                                    }}
                                  >
                                    <span className="eb-picker__option">
                                      <span>
                                        Version {v.label}
                                        {i === 0 ? ' (current)' : ''}
                                      </span>
                                      <span className="eb-picker__sub">
                                        {v.date} · {v.note}
                                      </span>
                                    </span>
                                  </MenuItem>
                                ))}
                              </MenuContainer>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                        <span className="eb-meta__id">
                          ID: <strong>{BRIEF_ID}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="eb-canvas__actions">
                      {previous ? (
                        <>
                          <Button
                            variant="ghost"
                            underline={false}
                            onClick={() => {
                              const id = bumpVersion(`Restored from ${viewing}`);
                              showToast({ title: `Version ${viewing} restored`, description: `Saved as version ${id}.` });
                              setViewing(null);
                            }}
                          >
                            Revert
                          </Button>
                          <Button
                            variant="ghost"
                            underline={false}
                            onClick={() =>
                              showToast({
                                title: 'Saved as a new document',
                                description: briefFileName(meetingDate, '1.0'),
                              })
                            }
                          >
                            Save as a New Document
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" underline={false} onClick={viewDocs}>
                          View in Documents
                        </Button>
                      )}
                      <Button startIcon={<Download />} onClick={download}>
                        Download PPTX
                      </Button>
                    </div>
                  </div>

                  <div className="eb-canvas__tools">
                    <ContentSwitcher
                      aria-label="Canvas mode"
                      size="sm"
                      value={editing ? 'edit' : 'view'}
                      onValueChange={(v) => setMode(v as 'edit' | 'view')}
                      options={[
                        { value: 'edit', label: 'Edit', icon: <Pencil />, disabled: !canEdit },
                        { value: 'view', label: 'View', icon: <Eye /> },
                      ]}
                    />
                    {!previous && (dirty || saved) && (
                      <div className="eb-canvas__save">
                        {dirty ? (
                          <Badge color="amber" tone="subtle" role="status">
                            Unsaved changes
                          </Badge>
                        ) : (
                          <Badge color="green" tone="subtle" role="status">
                            Changes are saved
                          </Badge>
                        )}
                        <Button size="xs" disabled={!dirty} onClick={save}>
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="eb-canvas__stage">
                    <div className="eb-canvas__slide">
                      <SlideView
                        slide={slide}
                        editing={editing}
                        notes={notes}
                        onNoteChange={(id, field, value) => {
                          setNotes((n) => ({ ...n, [id]: { ...(n[id] ?? { bio: '', insights: '' }), [field]: value } }));
                          markDirty();
                        }}
                        lists={lists}
                        onListChange={(key, items) => {
                          setLists((l) => ({ ...l, [key]: items }));
                          markDirty();
                        }}
                      />
                    </div>

                  </div>
                <ol className="eb-thumbs" aria-label="Slides">
                  {deck.map((d, i) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        className="eb-thumb"
                        aria-current={d.id === slide.id ? 'true' : undefined}
                        aria-label={`Slide ${i + 1}: ${d.title}`}
                        onClick={() => setSelectedId(d.id)}
                      >
                        {THUMB_FOR[d.id] ? (
                          <img src={THUMB_FOR[d.id]} alt="" />
                        ) : (
                          <span className="eb-thumb__text">{d.title}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
                </section>
              </div>
            </div>

            <Modal
              open={confirmExit}
              onOpenChange={setConfirmExit}
              title="Save your changes?"
              
              footer={
                <ModalFooter
                  checkbox={<span />}
                  secondaryActionLabel="Exit without Saving"
                  onSecondaryAction={exitDiscarding}
                  primaryActionLabel="Save & Exit"
                  onPrimaryAction={exitSaving}
                />
              }
            >
              <ModalContent description="You have unsaved changes in this Executive Brief." />
            </Modal>
            <Modal
              open={timedOut}
              onOpenChange={(o) => !o && acknowledgeTimeout()}
              title="Session Timed Out"
              
              footer={
                <ModalFooter
                  checkbox={<span />}
                  actions={<Button onClick={acknowledgeTimeout}>Continue Editing</Button>}
                />
              }
            >
              <ModalContent description="Your session has timed out. Don’t worry — your unsaved changes have been automatically saved as a new version." />
            </Modal>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
