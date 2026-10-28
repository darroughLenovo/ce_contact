import { Sparkles } from 'lucide-react';
import { Button, HorizontalTabItem, HorizontalTabs, HorizontalTabsList } from '@cake-admin/cakeand';
import { account, accountMeta } from '../data/account';
import { navigate, type RouteId } from './router';

export type AccountTab = 'overview' | 'contacts' | 'details' | 'documents' | 'notes';

const TABS: { value: AccountTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'contacts', label: 'Contact' },
  { value: 'details', label: 'Account Details' },
  { value: 'documents', label: 'Documents' },
  { value: 'notes', label: 'Notes' },
];

type Props = {
  /** Which account view is showing. Omit on pages outside the five account views. */
  active?: AccountTab;
  /** Ask AI handler — opens the page's AI drawer where one exists. */
  onAskAi?: () => void;
};

/**
 * Figma "Account Header" (10210:15607): account identity, Ask AI, and the
 * account view tabs. Rendered by each page that sits under an account.
 *
 * Delta: Figma paints Ask AI with the CE AI gradient. cake& has no gradient
 * token, so it is a primary fill Button (token gap recorded in reports/inbox).
 */
export function AccountHeader({ active, onAskAi }: Props) {
  return (
    <section className="ce-account" aria-label="Account">
      <div className="ce-account__top">
        <div className="ce-account__id">
          <h1 className="ce-account__name">{account.name}</h1>
          <p className="ce-account__meta">{accountMeta}</p>
        </div>
        <Button startIcon={<Sparkles />} onClick={onAskAi}>
          Ask AI
        </Button>
      </div>
      {active && (
        <div className="ce-account__tabs">
          <HorizontalTabs value={active} onValueChange={(v) => navigate(v as RouteId)}>
            <HorizontalTabsList aria-label="Account views">
              {TABS.map((t) => (
                <HorizontalTabItem key={t.value} value={t.value}>
                  {t.label}
                </HorizontalTabItem>
              ))}
            </HorizontalTabsList>
          </HorizontalTabs>
        </div>
      )}
    </section>
  );
}
