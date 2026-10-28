import { useEffect, useRef, useState } from 'react';
import { Download, FileText, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { navigate } from '../../shell/router';
import { useToast } from '../../shell/toast';
import { account } from '../../data/account';
import { BriefPages, PAGE_COUNT } from './BriefPages';
import { PinPanel, type BriefStatus } from './PinPanel';
import './customer-brief.css';

// `#/customer-brief?state=ready` opens straight on the generated brief.
const initialStatus = (): BriefStatus =>
  /[?&]state=ready\b/.test(window.location.hash) ? 'ready' : 'idle';

/**
 * Customer Brief (Gesture 10210:10786): the user asks PIN for a brief, PIN
 * shows the outline (10210:11456) and a Generate button; once generated the
 * four letter-size pages (10210:10905 / 11059 / 11172 / 20783) appear in a
 * print preview with View in Documents and Download.
 */
export default function CustomerBriefPage() {
  const [status, setStatus] = useState<BriefStatus>(initialStatus);
  const [pinOpen, setPinOpen] = useState(true);
  const pinInput = useRef<HTMLInputElement>(null);
  const showToast = useToast();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const generate = () => {
    setStatus('generating');
    timer.current = window.setTimeout(() => {
      setStatus('ready');
      showToast({
        status: 'success',
        title: 'Customer Brief generated',
        description: 'Saved to Documents. Lenovo Purchase History and Account Actions were unavailable.',
        actionLabel: 'View in Documents',
        onAction: () => navigate('documents'),
      });
    }, 1400);
  };

  const download = () => {
    document.body.classList.add('cb-printing');
    const done = () => {
      document.body.classList.remove('cb-printing');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };

  const openPin = () => {
    setPinOpen(true);
    requestAnimationFrame(() => pinInput.current?.focus());
  };

  return (
    <>
      <AccountHeader onAskAi={openPin} />
      <div className={`ce-page cb-layout ${pinOpen ? '' : 'cb-layout--solo'}`}>
        {pinOpen && (
          <PinPanel
            status={status}
            onGenerate={generate}
            onDownload={download}
            onViewDocuments={() => navigate('documents')}
            onMinimize={() => setPinOpen(false)}
            inputRef={pinInput}
          />
        )}

        <section className="cb-preview" aria-label="Customer Brief preview">
          {status === 'ready' ? (
            <>
              <div className="cb-preview__bar">
                <div className="cb-preview__title">
                  <FileText aria-hidden />
                  <div>
                    <h2>Customer Brief — {account.name}</h2>
                    <p>PDF • {PAGE_COUNT} pages • Letter</p>
                  </div>
                </div>
                <div className="cb-preview__actions">
                  {!pinOpen && (
                    <Button size="sm" variant="outline" intent="secondary" startIcon={<Sparkles />} onClick={openPin}>
                      Open PIN
                    </Button>
                  )}
                  <Button size="sm" variant="outline" startIcon={<FolderOpen />} onClick={() => navigate('documents')}>
                    View in Documents
                  </Button>
                  <Button size="sm" startIcon={<Download />} onClick={download}>
                    Download
                  </Button>
                </div>
              </div>
              <div className="cb-preview__canvas">
                <BriefPages />
              </div>
            </>
          ) : (
            <div className="cb-empty">
              <FileText aria-hidden className="cb-empty__icon" />
              <h2>{status === 'generating' ? 'Generating your Customer Brief…' : 'No Customer Brief yet'}</h2>
              <p>
                {status === 'generating'
                  ? 'PIN is pulling insights, CX health, pipeline and relationship data into a 4-page PDF.'
                  : 'Ask PIN for a Customer Brief and choose Generate. The PDF preview will appear here.'}
              </p>
              {!pinOpen && (
                <Button size="sm" startIcon={<Sparkles />} onClick={openPin}>
                  Open PIN
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
