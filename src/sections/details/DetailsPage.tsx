import { useState } from 'react';
import { AccountHeader } from '../../shell/AccountHeader';
import { useToast } from '../../shell/toast';
import { AccountInfoCard } from './AccountInfoCard';
import { CreditDetailDrawer } from './CreditDetailDrawer';
import { CxHealthCard } from './CxHealthCard';
import { ItLandscapeCard } from './ItLandscapeCard';
import { NewsCard } from './NewsCard';
import { PipelineCard } from './PipelineCard';
import { PurchaseHistoryCard } from './PurchaseHistoryCard';
import { RecentOrdersCard } from './RecentOrdersCard';
import './details.css';
import './modules.css';

/** `#/details?state=credit|ai|nonews|edit|modal|review|idg` opens a variant directly (for review/screenshots). */
const initialState = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('state');

/**
 * Account Details tab — Figma "Details Cross BG Version 8/31" (10210:5592).
 * Ask AI (AccountHeader) opens the News AI summary (10210:7927).
 */
export default function DetailsPage() {
  const [state] = useState(initialState);
  const [creditOpen, setCreditOpen] = useState(state === 'credit');
  const [newsAi, setNewsAi] = useState(state === 'ai');
  const showToast = useToast();

  const askAi = () => {
    setNewsAi(true);
    document.getElementById('dt-news')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const rowAction = (action: string, row: string) =>
    showToast({ status: 'info', title: action, description: `Prototype: “${action}” for ${row}.`, duration: 3000 });

  return (
    <>
      <AccountHeader active="details" onAskAi={askAi} />
      <div className="ce-page dt-page">
        <div className="dt-row">
          <AccountInfoCard
            initial={state === 'edit' || state === 'modal' || state === 'review' ? state : undefined}
            onViewCredit={() => setCreditOpen(true)}
            onTicketSubmitted={() =>
              showToast({
                status: 'success',
                title: 'Account review ticket has been submitted to D365. You will receive an email confirmation.',
                duration: 3000,
              })
            }
          />
          <NewsCard aiOpen={newsAi} onAiOpenChange={setNewsAi} empty={state === 'nonews'} />
        </div>
        <ItLandscapeCard />
        <PurchaseHistoryCard initialBg={state === 'idg' ? 'IDG' : 'All'} />
        <PipelineCard onRowAction={rowAction} initialBg={state === 'idg' ? 'IDG' : 'All'} />
        <RecentOrdersCard onRowAction={rowAction} />
        <CxHealthCard
          onViewDetails={(what) =>
            showToast({ status: 'info', title: `${what} details`, description: 'Opens the detail report (not part of this prototype).', duration: 3000 })
          }
        />
      </div>
      <CreditDetailDrawer open={creditOpen} onOpenChange={setCreditOpen} />
    </>
  );
}
