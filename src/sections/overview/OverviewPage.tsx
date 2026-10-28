import { useEffect, useState } from 'react';
import { ContentSwitcher } from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { empty, populated } from './data';
import { ContactIntelCard, ShareOfWalletCard } from './InsightCards';
import { AccountActionsCard, AccountSummaryCard } from './SummaryCards';
import './overview.css';

type DataState = 'populated' | 'empty';

const readState = (): DataState =>
  new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('state') === 'empty' ? 'empty' : 'populated';

/**
 * Overview dashboard — Figma "Overview 8/31" (10210:4904) and
 * "Overview Empty Version 8/31" (10210:9869). The empty variant is reachable
 * at #/overview?state=empty or via the prototype-only switcher at the top.
 */
export default function OverviewPage() {
  const [state, setState] = useState<DataState>(readState);

  useEffect(() => {
    const on = () => setState(readState());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const choose = (v: string) => {
    window.location.hash = v === 'empty' ? '/overview?state=empty' : '/overview';
  };

  const data = state === 'empty' ? empty : populated;

  return (
    <>
      <AccountHeader active="overview" />
      <div className="ce-page ov-page">
        <div className="ov-proto">
          <span className="ov-caption ov-muted" id="ov-proto-l">
            Prototype data
          </span>
          <ContentSwitcher
            aria-labelledby="ov-proto-l"
            size="sm"
            intent="secondary"
            options={[
              { value: 'populated', label: 'Populated' },
              { value: 'empty', label: 'Empty' },
            ]}
            value={state}
            onValueChange={choose}
          />
        </div>

        <div className="ov-top">
          <AccountSummaryCard data={data} />
          <div className="ov-side">
            <AccountActionsCard data={data} />
            <ContactIntelCard data={data} />
          </div>
        </div>

        <ShareOfWalletCard data={data} />
      </div>
    </>
  );
}
