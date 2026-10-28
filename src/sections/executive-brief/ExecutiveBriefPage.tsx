// Executive Brief (Figma Desktop - 2 … 8, Previous versions, Master Exe Brief,
// executive brief - no account plan, Gesture 10210:20782).
//
// Flow per the Gesture note: the seller asks Pin for an Executive Brief → Pin
// looks for an account plan on D365 → (a) none: Pin answers in the small chat
// window and points to D365; (b) found: Pin opens the large co-edit window,
// pre-fills slides from the plan and walks the seller through attendees →
// follow-up actions → desired outcomes, then offers View in Documents /
// Download.
//
// Prototype deep links: #/executive-brief?state=no-plan | timeout | closed
import { useState } from 'react';
import { ChevronDown, ExternalLink, Sparkles, TimerOff, X } from 'lucide-react';
import { Button, Card, IconButton, Switch } from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { AiBubble } from './Chat';
import { Workspace } from './Workspace';
import './executive-brief.css';

const hashState = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('state');

function NoPlanChat({ onClose }: { onClose: () => void }) {
  const [thoughts, setThoughts] = useState(false);
  return (
    <section
      className="eb-mini"
      role="dialog"
      aria-modal="false"
      aria-labelledby="eb-mini-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <header className="eb-mini__bar">
        <span className="eb-avatar" aria-hidden="true">
          <Sparkles />
        </span>
        <h2 id="eb-mini-title" className="eb-window__title">
          Pin
        </h2>
        <IconButton size="sm" variant="ghost" intent="secondary" label="Close Pin" icon={<X />} onClick={onClose} autoFocus />
      </header>
      <div className="eb-mini__log">
        <div className="eb-msg eb-msg--user">
          <p className="eb-msg__user">Generate an Executive Brief for Kroger.</p>
        </div>
        <div className="eb-mini__thoughts">
          <Button
            size="xs"
            variant="ghost"
            intent="secondary"
            underline={false}
            endIcon={<ChevronDown />}
            aria-expanded={thoughts}
            onClick={() => setThoughts((t) => !t)}
          >
            Thought Process
          </Button>
          {thoughts && <p className="eb-mini__thought">Searched D365 for an account plan for The Kroger Co. — none found.</p>}
        </div>
        <AiBubble>
          <p>Oops, you need to create an account plan on D365 first.</p>
          <div className="eb-msg__actions eb-msg__actions--end">
            <Button
              size="sm"
              endIcon={<ExternalLink />}
              onClick={() => window.open('https://www.microsoft.com/dynamics-365', '_blank', 'noopener')}
            >
              Create Account Plan
            </Button>
          </div>
        </AiBubble>
      </div>
    </section>
  );
}

type View = 'workspace' | 'mini' | 'minimized' | 'closed';

export default function ExecutiveBriefPage() {
  const initial = hashState();
  const [hasPlan, setHasPlan] = useState(initial !== 'no-plan');
  const [view, setView] = useState<View>(initial === 'no-plan' ? 'mini' : initial === 'closed' ? 'closed' : 'workspace');
  const [session, setSession] = useState(0);
  const [timedOut, setTimedOut] = useState(initial === 'timeout');
  const [summary, setSummary] = useState('');

  const generate = (timeout = false) => {
    setSummary('');
    if (!hasPlan) {
      setView('mini');
      return;
    }
    setTimedOut(timeout);
    if (view !== 'minimized' || timeout) setSession((s) => s + 1);
    setView('workspace');
  };

  return (
    <>
      <AccountHeader onAskAi={() => generate()} />
      <div className="ce-page">
        <Card>
          <div className="eb-launch">
            <div className="eb-launch__text">
              <h2 className="eb-launch__title">Executive Brief</h2>
              <p className="eb-launch__body">
                Ask Pin to generate an Executive Brief for an upcoming meeting with The Kroger Co. Pin pre-fills the slides from
                your D365 account plan, then asks for the meeting attendees, follow-up actions and desired outcomes.
              </p>
              {summary && (
                <p className="eb-launch__summary" role="status">
                  {summary}
                </p>
              )}
            </div>
            <div className="eb-launch__actions">
              <Switch label="Account plan available on D365" checked={hasPlan} onCheckedChange={setHasPlan} />
              <div className="eb-launch__buttons">
                <Button variant="outline" startIcon={<TimerOff />} disabled={!hasPlan} onClick={() => generate(true)}>
                  Simulate session time-out
                </Button>
                <Button startIcon={<Sparkles />} onClick={() => generate()}>
                  Generate Executive Brief
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {(view === 'workspace' || view === 'minimized') && (
        <Workspace
          key={session}
          open={view === 'workspace'}
          startTimedOut={timedOut}
          onMinimize={() => setView('minimized')}
          onClose={(s) => {
            setSummary(s);
            setTimedOut(false);
            setView('closed');
          }}
        />
      )}

      {view === 'minimized' && (
        <div className="eb-restore">
          <Button startIcon={<Sparkles />} onClick={() => setView('workspace')}>
            Executive Brief for Kroger
          </Button>
        </div>
      )}

      {view === 'mini' && <NoPlanChat onClose={() => setView('closed')} />}
    </>
  );
}
