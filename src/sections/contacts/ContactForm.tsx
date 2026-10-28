import { useMemo, useState } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { Button, Card, Dropdown, TextInput } from '@cake-admin/cakeand';
import {
  COUNTRIES,
  DM_ROLES,
  EMAIL_RE,
  FUNCTIONAL_AREAS,
  INTERESTS,
  SENIORITIES,
  TODAY,
  CURRENT_USER,
  allRated,
  fullName,
  starsOf,
  type Contact,
  type DmCode,
} from './data';
import { DmBadges, MultiSelect, SideDrawer, Stars } from './parts';
import { StrengthEdit } from './RelationshipStrength';

export type FormMode = 'add' | 'edit' | 'connect';

type Props = {
  mode: FormMode;
  initial?: Contact;
  /** Contacts already on this account (duplicate check). */
  existing: Contact[];
  /** Contacts on other accounts (connect offer). */
  others: Contact[];
  onCancel: () => void;
  onSave: (c: Contact) => void;
  onConnect: (c: Contact) => void;
};

const blank = (): Contact => ({
  id: `new-${Date.now()}`,
  first: '',
  last: '',
  title: '',
  email: '',
  phone: '',
  linkedin: '',
  country: '',
  seniority: '',
  dm: [],
  functional: [],
  interests: [],
  ratings: {},
  updated: TODAY,
  status: 'customer',
  l2: [],
  notes: [],
});

const opts = (xs: readonly string[]) => xs.map((x) => ({ label: x, value: x }));
const dmLabels = DM_ROLES.map((r) => r.label);

/**
 * Add Contact (10210:16741 empty, 10210:16376 valid email, 10210:17108 existing
 * email → connect), Edit Contact (10210:15665) and Connect contact (10210:16022).
 */
export function ContactForm({ mode, initial, existing, others, onCancel, onSave, onConnect }: Props) {
  const [c, setC] = useState<Contact>(() => initial ?? blank());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = <K extends keyof Contact>(k: K, v: Contact[K]) => setC((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  /* Email check: format → this account → other accounts → new. */
  const emailState = useMemo(() => {
    const e = c.email.trim().toLowerCase();
    if (!e) return { kind: 'empty' as const };
    if (!EMAIL_RE.test(e)) return { kind: 'invalid' as const };
    const dup = existing.find((x) => x.id !== c.id && x.email.toLowerCase() === e);
    if (dup) return { kind: 'duplicate' as const, contact: dup };
    if (mode === 'add') {
      const other = others.find((x) => x.email.toLowerCase() === e);
      if (other) return { kind: 'other' as const, contact: other };
      return { kind: 'new' as const };
    }
    return { kind: 'ok' as const };
  }, [c.email, c.id, existing, others, mode]);

  const showEmail = touched.email || mode !== 'add' ? emailState.kind : emailState.kind === 'invalid' ? 'empty' : emailState.kind;
  const emailStatus = showEmail === 'invalid' || showEmail === 'duplicate' || showEmail === 'other' ? 'error' : showEmail === 'new' ? 'success' : 'default';
  const emailHelper =
    showEmail === 'invalid'
      ? 'Enter a valid email address, e.g. name@company.com.'
      : showEmail === 'duplicate'
        ? `This email already belongs to ${fullName((emailState as { contact: Contact }).contact)} on this account.`
        : showEmail === 'other'
          ? 'An existing email found in a contact. Connect this contact to this account?'
          : showEmail === 'new'
            ? 'This email does not match with any existing emails.'
            : mode === 'add'
              ? 'Provide an email first to instantly load available contact information.'
              : undefined;

  const req = {
    first: !c.first.trim(),
    last: !c.last.trim(),
    country: !c.country,
    seniority: !c.seniority,
    dm: c.dm.length === 0,
    functional: c.functional.length === 0,
  };
  const emailOk = emailState.kind === 'new' || emailState.kind === 'ok';
  const valid = emailOk && !Object.values(req).some(Boolean) && allRated(c.ratings);
  const err = (k: keyof typeof req, msg = 'This field is required.') => (touched[k] && req[k] ? msg : undefined);

  const title = mode === 'add' ? 'Add Contact' : 'Contact Details';
  const meta = `Updated on 18 Aug 2026 • By ${CURRENT_USER}`;

  const emailField = (
    <TextInput
      label="Email"
      required
      type="email"
      autoFocus={mode === 'add' || mode === 'edit'}
      value={c.email}
      status={emailStatus}
      helperText={emailHelper}
      endIcon={emailStatus === 'success' ? <Check /> : emailStatus === 'error' ? <CircleAlert /> : undefined}
      onChange={(e) => set('email', e.target.value)}
      onBlur={() => touch('email')}
      onKeyDown={(e) => e.key === 'Enter' && touch('email')}
    />
  );

  return (
    <SideDrawer
      open
      onOpenChange={(o) => !o && onCancel()}
      title={title}
      actions={
        <>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" startIcon={<Check />} disabled={!valid} onClick={() => onSave({ ...c, updated: TODAY, flag: c.flag === 'Invalid Email' && emailOk ? undefined : c.flag })}>
            {mode === 'add' ? 'Add Contact' : 'Save'}
          </Button>
        </>
      }
    >
      <form className="ct-form" onSubmit={(e) => e.preventDefault()} noValidate>
        <h3 className="ct-overline">Contact Information</h3>

        {mode === 'add' && emailField}
        {mode === 'add' && emailState.kind === 'other' && (
          <ConnectPreview contact={emailState.contact} onConnect={() => onConnect(emailState.contact)} />
        )}

        <TextInput label="First Name" required value={c.first} status={err('first') ? 'error' : 'default'} helperText={err('first')} onChange={(e) => set('first', e.target.value)} onBlur={() => touch('first')} />
        <TextInput label="Last Name" required value={c.last} status={err('last') ? 'error' : 'default'} helperText={err('last')} onChange={(e) => set('last', e.target.value)} onBlur={() => touch('last')} />
        {mode === 'add' ? (
          <>
            <TextInput label="Phone" type="tel" value={c.phone} onChange={(e) => set('phone', e.target.value)} />
            <TextInput label="Job Title" value={c.title} onChange={(e) => set('title', e.target.value)} />
          </>
        ) : (
          <>
            <TextInput label="Job Title" value={c.title} onChange={(e) => set('title', e.target.value)} />
            {emailField}
            <TextInput label="Phone" type="tel" value={c.phone} onChange={(e) => set('phone', e.target.value)} />
          </>
        )}
        <TextInput label="Linkedin" value={c.linkedin} onChange={(e) => set('linkedin', e.target.value)} />

        <div className="ct-field">
          <Dropdown label="Country of Residence" showLabelInfo required placeholder="Select" options={opts(COUNTRIES)} value={c.country || undefined} onValueChange={(v) => set('country', v)} helperText={mode !== 'add' ? meta : undefined} />
        </div>
        <div className="ct-field">
          <Dropdown label="Seniority" showLabelInfo required placeholder="Select" options={opts(SENIORITIES)} value={c.seniority || undefined} onValueChange={(v) => set('seniority', v)} helperText={mode !== 'add' ? meta : undefined} />
        </div>
        <MultiSelect
          label="Decision-Making Role"
          hint="(Select all that apply)"
          info
          required
          options={dmLabels}
          value={c.dm.map((d) => DM_ROLES.find((r) => r.code === d)!.label)}
          onChange={(labels) => {
            set('dm', labels.map((l) => DM_ROLES.find((r) => r.label === l)!.code as DmCode));
            touch('dm');
          }}
          error={err('dm')}
          helper={mode !== 'add' ? meta : undefined}
        />
        <MultiSelect
          label="Functional Area"
          hint="(Select all that apply)"
          info
          required
          options={FUNCTIONAL_AREAS}
          value={c.functional}
          onChange={(v) => {
            set('functional', v);
            touch('functional');
          }}
          error={err('functional')}
          helper={mode !== 'add' ? meta : undefined}
        />
        <MultiSelect
          label="Areas of Interest"
          hint="(Select all that apply)"
          info
          options={INTERESTS}
          value={c.interests}
          onChange={(v) => set('interests', v)}
          helper={mode !== 'add' ? 'Updated on 18 Aug 2026 • By 3rd Party' : undefined}
        />

        <StrengthEdit ratings={c.ratings} onChange={(r) => set('ratings', r)} />
      </form>
    </SideDrawer>
  );
}

/** Existing-email match preview with "Yes, connect it." (10210:17108). */
function ConnectPreview({ contact, onConnect }: { contact: Contact; onConnect: () => void }) {
  return (
    <div className="ct-connect">
      <Card className="ct-connect__card">
        <div className="ct-card__in">
          <h4 className="ct-card__name">
            <span className="ct-ellipsis">{fullName(contact)}</span>
            <DmBadges roles={contact.dm} />
          </h4>
          <dl className="ct-card__rows">
            {(
              [
                ['Job Title', contact.title],
                ['Email', contact.email],
                ['Phone', contact.phone],
                ['LinkedIn', contact.linkedin],
                ['Seniority', contact.seniority],
              ] as const
            ).map(([k, v]) => (
              <div className="ct-kv" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="ct-kv">
              <dt>Relationship Strength</dt>
              <dd>
                <Stars value={starsOf(contact)} />
              </dd>
            </div>
            <div className="ct-kv">
              <dt>Functional Area</dt>
              <dd>{contact.functional.join(', ')}</dd>
            </div>
            <div className="ct-kv">
              <dt>Areas of Interest</dt>
              <dd>{contact.interests.join(', ')}</dd>
            </div>
            <div className="ct-kv">
              <dt>Associated L2 Accounts</dt>
              <dd>
                {contact.l2.map((l) => (
                  <span key={l} className="ct-block">
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <p className="ct-caption">Latest Updated on {contact.updated}</p>
        </div>
      </Card>
      <div className="ct-connect__act">
        <Button size="sm" onClick={onConnect}>
          Yes, connect it.
        </Button>
      </div>
    </div>
  );
}
