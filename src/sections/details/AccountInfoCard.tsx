import { useState, type ReactNode } from 'react';
import { Check, Flag, Info, X } from 'lucide-react';
import { Badge, Button, Dropdown, IconButton, SimpleTooltip, TextInput } from '@cake-admin/cakeand';
import { SUBVERTICALS, VERTICALS, initialAccountInfo, type AccountInfo } from './data';
import { SectionCard, Sources, Trend, ViewDetails } from './parts';
import { ReviewTicketModal } from './ReviewTicketModal';
import dynamicsLogo from './assets/dynamics.png';
import googleLogo from './assets/google.png';
import tileBg from './assets/logo-tile.svg';
import linkedinLogo from './assets/linkedin.svg';
import zoominfoLogo from './assets/zoominfo.svg';

type FieldKey = keyof AccountInfo;

type Props = {
  onViewCredit: () => void;
  onTicketSubmitted: () => void;
  /** Review hook: open straight into a firm-enrich step. */
  initial?: 'edit' | 'modal' | 'review';
};

/**
 * Figma "Company Info" / Account Info (10210:5596) with the firm-enrich flow:
 * view (Firm enrich 1, 10210:20058) → edit (Firm enrich 2, 10210:19862) →
 * justification Modal (10292:35645) → success Toast + "Data Under Review"
 * flags on edited fields (Firm enrich 3, 10210:20238).
 */
export function AccountInfoCard({ onViewCredit, onTicketSubmitted, initial }: Props) {
  const [info, setInfo] = useState<AccountInfo>(initialAccountInfo);
  const [draft, setDraft] = useState<AccountInfo>(initialAccountInfo);
  const [editing, setEditing] = useState(initial === 'edit' || initial === 'modal');
  const [modalOpen, setModalOpen] = useState(initial === 'modal');
  const [underReview, setUnderReview] = useState<Set<FieldKey>>(new Set(initial === 'review' ? ['employees'] : []));
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(info);
    setEmployeeError(null);
    setEditing(true);
  };

  const changed = (Object.keys(draft) as FieldKey[]).filter((k) => draft[k] !== info[k]);

  const requestSubmit = () => {
    if (!/^[\d,]+$/.test(draft.employees.trim())) {
      setEmployeeError('Enter a whole number, e.g. 23,000');
      return;
    }
    if (changed.length === 0) {
      setEditing(false);
      return;
    }
    setModalOpen(true);
  };

  const confirmSubmit = () => {
    setUnderReview((prev) => new Set([...prev, ...changed]));
    setInfo(draft);
    setModalOpen(false);
    setEditing(false);
    onTicketSubmitted();
  };

  const actions = editing ? (
    <div className="dt-inline">
      <Button size="xs" startIcon={<Check />} onClick={requestSubmit}>
        Submit
      </Button>
      <IconButton size="sm" variant="ghost" intent="secondary" label="Cancel editing" icon={<X />} onClick={() => setEditing(false)} />
    </div>
  ) : (
    <Button size="xs" variant="ghost" startIcon={<Flag />} onClick={startEdit}>
      Create Account Review Ticket
    </Button>
  );

  const reviewFlag = (k: FieldKey) =>
    underReview.has(k) && !editing ? (
      <SimpleTooltip
        triggerAriaLabel="Data under review"
        trigger={
          <span className="dt-flag">
            <Flag aria-hidden />
          </span>
        }
      >
        <strong>Data Under Review</strong>
        <br />
        Account data tickets under review in D365.
      </SimpleTooltip>
    ) : null;

  return (
    <SectionCard
      id="dt-account-info"
      className="dt-account"
      title="Account Info"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={actions}
      sources={<Sources />}
    >
      <div className="dt-fields">
        <div className="dt-fields__col">
          <Field label="RAD">
            IDG: Retention - Big
            <br />
            ISG: Retention - Big
          </Field>
          {editing ? (
            <>
              <Dropdown
                label="Business Vertical"
                options={VERTICALS.map((v) => ({ value: v, label: v }))}
                value={draft.vertical}
                onValueChange={(v) => setDraft((d) => ({ ...d, vertical: v, subvertical: SUBVERTICALS[v][0] }))}
              />
              <Dropdown
                label="Business Subvertical"
                options={SUBVERTICALS[draft.vertical].map((v) => ({ value: v, label: v }))}
                value={draft.subvertical}
                onValueChange={(v) => setDraft((d) => ({ ...d, subvertical: v }))}
              />
            </>
          ) : (
            <>
              <Field label="Business Vertical" flag={reviewFlag('vertical')}>
                {info.vertical}
              </Field>
              <Field label="Business Subvertical" flag={reviewFlag('subvertical')}>
                {info.subvertical}
              </Field>
            </>
          )}
          <Field label="Address">
            Ermyn House, Ermyn Way,
            <br />
            San Francisco, CA 94111 US
          </Field>
          <Field label="Location/Territory">
            <span className="dt-inline">
              North America, 35 States
              <InfoTip label="About location">Headquarters region, with sites in 35 US states.</InfoTip>
            </span>
          </Field>
        </div>
        <div className="dt-fields__col">
          <Field label="Parent Company">The Kroger Co.</Field>
          <Field label="Year Founded">1988</Field>
          <Field label="Legal Entities">
            <span className="dt-inline">
              23
              <InfoTip label="About legal entities">Registered legal entities under this account.</InfoTip>
            </span>
          </Field>
          {editing ? (
            <TextInput
              label="Domestic Employee Size"
              value={draft.employees}
              inputMode="numeric"
              status={employeeError ? 'error' : 'default'}
              helperText={employeeError ?? undefined}
              onChange={(e) => {
                setDraft((d) => ({ ...d, employees: e.target.value }));
                setEmployeeError(null);
              }}
            />
          ) : (
            <Field label="Domestic Employee Size" flag={reviewFlag('employees')}>
              {info.employees}
            </Field>
          )}
          <Field label="Fiscal Year End">31 Dec 2026</Field>
          <Field label="Website URL">
            <a className="dt-link dt-link--strong" href="https://www.kroger.com" target="_blank" rel="noreferrer">
              www.kroger.com
            </a>
            <span className="dt-logos">
              <a className="dt-logo" href="#" aria-label="Open in Dynamics 365" onClick={(e) => e.preventDefault()}>
                <img src={tileBg} alt="" className="dt-logo__tile" />
                <img src={dynamicsLogo} alt="" className="dt-logo__mark" />
              </a>
              <a className="dt-logo" href="#" aria-label="Search on Google" onClick={(e) => e.preventDefault()}>
                <img src={tileBg} alt="" className="dt-logo__tile" />
                <img src={googleLogo} alt="" className="dt-logo__mark" />
              </a>
              <a className="dt-logo" href="#" aria-label="Open on LinkedIn" onClick={(e) => e.preventDefault()}>
                <img src={linkedinLogo} alt="" className="dt-logo__tile" />
              </a>
              <a className="dt-logo" href="#" aria-label="Open on ZoomInfo" onClick={(e) => e.preventDefault()}>
                <img src={zoominfoLogo} alt="" className="dt-logo__tile" />
              </a>
            </span>
          </Field>
        </div>
      </div>

      <section className="dt-panel dt-fin" aria-labelledby="dt-fin-title">
        <h3 className="dt-panel__title" id="dt-fin-title">
          Financial Status
        </h3>
        <div className="dt-stats">
          <Stat
            label={
              <>
                Annual Revenue (USD)
                <InfoTip label="About annual revenue">Reported revenue for the last fiscal year.</InfoTip>
              </>
            }
            value="$5.7B"
          >
            <Trend>18.3% YoY</Trend>
          </Stat>
          <Stat
            label={
              <>
                Est. Annual IT Spend (USD)
                <InfoTip label="About IT spend">Estimated from HG Insights technographics.</InfoTip>
              </>
            }
            value="$914M"
          />
          <Stat label="Stock Price (USD)" value="$58.41">
            <span className="dt-caption">NYSE: KR</span>
            <Trend dir="down">0.44% Today</Trend>
          </Stat>
        </div>
        <div className="dt-credit">
          <span className="dt-label">Credit Status</span>
          <div className="dt-credit__row">
            <Badge color="destructive" tone="subtle" dot={false}>
              R<span className="ce-sr-only"> (red)</span>
            </Badge>
            <p className="dt-credit__text">Credit line or overdue AR needs attention, orders may be blocked.</p>
            <ViewDetails onClick={onViewCredit} />
          </div>
        </div>
      </section>

      <ReviewTicketModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={confirmSubmit} />
    </SectionCard>
  );
}

function Field({ label, children, flag }: { label: ReactNode; children: ReactNode; flag?: ReactNode }) {
  return (
    <div className="dt-field">
      <span className="dt-label dt-inline">
        {label}
        {flag}
      </span>
      <span className="dt-value">{children}</span>
    </div>
  );
}

function Stat({ label, value, children }: { label: ReactNode; value: ReactNode; children?: ReactNode }) {
  return (
    <div className="dt-stat">
      <span className="dt-label dt-inline">{label}</span>
      <span className="dt-stat__value">{value}</span>
      {children && <span className="dt-stat__meta">{children}</span>}
    </div>
  );
}

export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SimpleTooltip
      triggerAriaLabel={label}
      trigger={
        <span className="dt-infotip">
          <Info aria-hidden />
        </span>
      }
    >
      {children}
    </SimpleTooltip>
  );
}
