import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Filter, LayoutGrid, List, Plus, Search, TriangleAlert } from 'lucide-react';
import {
  Button,
  Card,
  Chip,
  ContentSwitcher,
  Divider,
  Dropdown,
  HorizontalTabItem,
  HorizontalTabs,
  HorizontalTabsList,
  Modal,
  ModalContent,
  ModalFooter,
  Notification,
  TextInput,
} from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { useToast } from '../../shell/toast';
import { ContactDrawer, type DrawerTab } from './ContactDrawer';
import { ContactForm, type FormMode } from './ContactForm';
import { ContactTable, CustomerCard, InactiveCard, ProspectCard, SalesTeamTable } from './ContactViews';
import { CURRENT_USER, DISQUALIFY_REASONS, DM_ROLES, INITIAL_CONTACTS, OTHER_ACCOUNT_CONTACTS, SALES_TEAM, TODAY, fullName, type Contact } from './data';
import { FILTER_LABELS, FiltersPanel, NO_FILTERS, applyFilters, countFilters, type Filters } from './FiltersPanel';
import './contacts.css';

type Tab = 'customer' | 'prospect' | 'inactive' | 'sales';
type View = 'list' | 'grid';
type Sort = 'az' | 'za' | 'updated';
type DrawerState = { kind: 'details'; id: string; tab: DrawerTab } | { kind: 'form'; mode: FormMode; id?: string; seed?: Contact } | null;

/**
 * Review deep links — `#/contacts?state=<s>` (+ `&seller=non-na` for the
 * non-NA prospect rules, 03_Prospect_Non NA 14215:36896):
 * grid · filters · filtered · prospects · disqualify · convert · inactive ·
 * drawer · invalid · suggestions · hierarchy · hierarchy-edit · notes ·
 * note-edit · history · deactivate · add · add-valid · add-exists · edit · connect
 */
const params = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '');

export default function ContactsPage() {
  const boot = useMemo(() => params().get('state') ?? '', []);
  const nonNA = useMemo(() => params().get('seller') === 'non-na', []);
  const showToast = useToast();

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [tab, setTab] = useState<Tab>(['prospects', 'disqualify', 'convert'].includes(boot) ? 'prospect' : boot === 'inactive' ? 'inactive' : 'customer');
  const [view, setView] = useState<View>(['grid', 'filtered', 'prospects', 'disqualify', 'convert', 'inactive'].includes(boot) ? 'grid' : 'list');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('az');
  const [filters, setFilters] = useState<Filters>(boot === 'filtered' ? { ...NO_FILTERS, notifications: ['New'] } : NO_FILTERS);
  const [draft, setDraft] = useState<Filters | null>(boot === 'filters' ? { ...NO_FILTERS, dm: 'E', notifications: ['Pending Review', 'Invalid Email', 'New'] } : null);
  // Gesture 14215:36894: shown by default the first time Prospects opens; once closed, only via the button.
  const [instructions, setInstructions] = useState(nonNA);
  const [instructionsSeen, setInstructionsSeen] = useState(false);

  const byId = (id: string) => contacts.find((c) => c.id === id);
  const [drawer, setDrawer] = useState<DrawerState>(() => {
    const tabFor: Record<string, DrawerTab> = { hierarchy: 'hierarchy', 'hierarchy-edit': 'hierarchy', notes: 'notes', 'note-edit': 'notes', history: 'history' };
    if (['drawer', 'deactivate', ...Object.keys(tabFor)].includes(boot)) return { kind: 'details', id: 'customer-2', tab: tabFor[boot] ?? 'overview' };
    if (boot === 'invalid') return { kind: 'details', id: 'customer-1', tab: 'overview' };
    if (boot === 'suggestions') return { kind: 'details', id: 'customer-0', tab: 'overview' };
    if (boot === 'add') return { kind: 'form', mode: 'add' };
    if (boot === 'add-valid') return { kind: 'form', mode: 'add', seed: { ...blankSeed(), email: 'sara.john@krogers.com' } };
    if (boot === 'add-exists') return { kind: 'form', mode: 'add', seed: { ...blankSeed(), email: OTHER_ACCOUNT_CONTACTS[0].email } };
    if (boot === 'edit') return { kind: 'form', mode: 'edit', id: 'customer-2' };
    if (boot === 'connect') return { kind: 'form', mode: 'connect', seed: connectFrom(OTHER_ACCOUNT_CONTACTS[0]) };
    return null;
  });

  const [convertId, setConvertId] = useState<string | null>(boot === 'convert' ? 'prospect-21' : null);
  const [disqId, setDisqId] = useState<string | null>(boot === 'disqualify' ? 'prospect-21' : null);
  const [deactivateId, setDeactivateId] = useState<string | null>(boot === 'deactivate' ? 'customer-2' : null);

  /* ── State changes with Undo toasts (Toasts 10210:18512–18516, Gesture 10210:11587) ── */
  const commit = (next: Contact[], title?: string) => {
    const prev = contacts;
    setContacts(next);
    if (title) showToast({ status: 'success', title, actionLabel: 'Undo', onAction: () => setContacts(prev), duration: 3000 });
  };
  const patch = (c: Contact, title?: string) => commit(contacts.map((x) => (x.id === c.id ? c : x)), title);

  const byStatus = (s: Contact['status']) => contacts.filter((c) => c.status === s);
  const counts = { customer: byStatus('customer').length, prospect: byStatus('prospect').length, inactive: byStatus('inactive').length, sales: SALES_TEAM.length };

  const rows = useMemo(() => {
    if (tab === 'sales') return [];
    const q = query.trim().toLowerCase();
    let r = contacts.filter((c) => c.status === tab);
    if (q) r = r.filter((c) => `${fullName(c)} ${c.title} ${c.email}`.toLowerCase().includes(q));
    r = applyFilters(r, filters);
    const cmp = (a: Contact, b: Contact) => fullName(a).localeCompare(fullName(b));
    return [...r].sort(sort === 'za' ? (a, b) => cmp(b, a) : sort === 'updated' ? (a, b) => b.updated.localeCompare(a.updated) || cmp(a, b) : cmp);
  }, [contacts, tab, query, filters, sort]);

  const titles = useMemo(() => Array.from(new Set(contacts.map((c) => c.title))).sort(), [contacts]);
  const nFilters = countFilters(filters);

  const changeTab = (t: Tab) => {
    setTab(t);
    if (t === 'prospect' && nonNA && !instructionsSeen) setInstructions(true);
  };

  /* ── Prospect actions ── */
  const addProspect = (id: string) => {
    const c = byId(id)!;
    commit(
      contacts.map((x) => (x.id === id ? { ...x, status: 'customer', flag: 'New', updated: TODAY, disqualified: undefined, disqHistory: undefined } : x)),
      `${fullName(c)} has been added to Customer.`,
    );
  };
  const onAddProspect = (id: string) => (nonNA ? setConvertId(id) : addProspect(id));

  const clearFilter = (k: keyof Filters) => setFilters((f) => ({ ...f, [k]: NO_FILTERS[k] }));
  const filterValue = (k: keyof Filters) =>
    k === 'notifications'
      ? filters.notifications.join(', ')
      : k === 'dm'
        ? DM_ROLES.find((r) => r.code === filters.dm)?.label
        : k === 'rating'
          ? `${filters.rating} stars`
          : (filters[k] as string);

  const empty = (
    <div className="ct-empty">
      <p>{nFilters || query ? 'No contacts match your search or filters.' : 'No contacts in this tab yet.'}</p>
      {(nFilters > 0 || query) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setFilters(NO_FILTERS);
            setQuery('');
          }}
        >
          Clear search and filters
        </Button>
      )}
    </div>
  );

  const openContact = (c: Contact) => setDrawer({ kind: 'details', id: c.id, tab: 'overview' });
  const drawerContact = drawer?.kind === 'details' ? byId(drawer.id) : undefined;
  const thisAccount = contacts.filter((c) => c.status !== 'prospect');
  const deactivateName = deactivateId ? fullName(byId(deactivateId)!) : '';

  return (
    <>
      <AccountHeader active="contacts" />
      <div className="ce-page ct">
        {/* Top (10210:15167) */}
        <div className="ct-top">
          <h2 className="ct-top__title">Contacts</h2>
          <div className="ct-top__search">
            <TextInput aria-label="Search contacts" placeholder="Search contacts" startIcon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button startIcon={<Plus />} onClick={() => setDrawer({ kind: 'form', mode: 'add' })}>
            Add Contact
          </Button>
        </div>

        {/* Tabs (10210:15175) */}
        <Card className="ct-tabs">
          <div className="ct-tabs__in">
            <HorizontalTabs value={tab} onValueChange={(v) => changeTab(v as Tab)}>
              <HorizontalTabsList aria-label="Contact lists">
                <HorizontalTabItem value="customer">Customer ({counts.customer})</HorizontalTabItem>
                <HorizontalTabItem value="prospect">Prospects ({counts.prospect})</HorizontalTabItem>
                <HorizontalTabItem value="inactive">Inactive ({counts.inactive})</HorizontalTabItem>
                <Divider direction="vertical" className="ct-tabs__div" />
                <HorizontalTabItem value="sales">Sales Team ({counts.sales})</HorizontalTabItem>
              </HorizontalTabsList>
            </HorizontalTabs>
            {tab === 'prospect' && nonNA && (
              <Button size="sm" variant="outline" startIcon={<TriangleAlert />} onClick={() => setInstructions(true)} aria-expanded={instructions}>
                Important Instructions
              </Button>
            )}
          </div>
        </Card>

        {tab === 'prospect' && nonNA && instructions && (
          // 03_Prospect_Non NA 14215:36896
          <Notification
            status="error"
            className="ct-instructions"
            title="Important Instructions: Read before converting or disqualifying a prospect"
            description={
              <span className="ct-instructions__body">
                <span>
                  <strong>Conversion Basis</strong>: Prospects are sourced from external providers. Only when received an approved basis for continued engagement, you can convert the
                  Prospect to a Contact.
                </span>
                <span>
                  <strong>Privacy Compliance</strong>: Must follow Lenovo’s applicable privacy and consent requirements in all future communications.
                </span>
                <span>
                  <strong>Disqualification</strong>: If a Prospect is incorrect or irrelevant to the account, disqualify it to provide feedback and help improve prospect quality.
                </span>
              </span>
            }
            dismissLabel="Close important instructions"
            onDismiss={() => {
              setInstructions(false);
              setInstructionsSeen(true);
            }}
          />
        )}

        {tab === 'sales' ? (
          <SalesTeamTable query={query} />
        ) : (
          <>
            {/* Filter / Sort row (10210:15197) */}
            <div className="ct-bar">
              <div className="ct-bar__left">
                <Button size="sm" variant="outline" startIcon={<Filter />} endIcon={draft ? <ChevronUp /> : <ChevronDown />} aria-expanded={!!draft} onClick={() => setDraft(draft ? null : filters)}>
                  Filters ({nFilters})
                </Button>
                {(Object.keys(FILTER_LABELS) as (keyof Filters)[])
                  .filter((k) => (k === 'notifications' ? filters.notifications.length > 0 : filters[k] !== 'all'))
                  .map((k) => (
                    <Chip key={k} onRemove={() => clearFilter(k)} removeLabel={`Remove ${FILTER_LABELS[k]} filter`}>
                      {`${FILTER_LABELS[k]}: ${filterValue(k)}`}
                    </Chip>
                  ))}
              </div>
              <div className="ct-bar__right">
                <div className="ct-sort">
                  <Dropdown
                    options={[
                      { label: 'Sort by A-Z', value: 'az' },
                      { label: 'Sort by Z-A', value: 'za' },
                      { label: 'Sort by Last Updated', value: 'updated' },
                    ]}
                    value={sort}
                    onValueChange={(v) => setSort(v as Sort)}
                  />
                </div>
                <ContentSwitcher
                  aria-label="View"
                  size="sm"
                  iconOnly
                  options={[
                    { value: 'grid', label: 'Grid view', icon: <LayoutGrid /> },
                    { value: 'list', label: 'List view', icon: <List /> },
                  ]}
                  value={view}
                  onValueChange={(v) => setView(v as View)}
                />
              </div>
            </div>

            <div className="ct-results">
              {draft && (
                <FiltersPanel
                  draft={draft}
                  onDraft={setDraft}
                  titles={titles}
                  onCancel={() => setDraft(null)}
                  onClear={() => setDraft(NO_FILTERS)}
                  onApply={() => {
                    setFilters(draft);
                    setDraft(null);
                  }}
                />
              )}

              {view === 'list' ? (
                <ContactTable rows={rows} onOpen={tab === 'customer' ? openContact : undefined} empty={empty} />
              ) : rows.length === 0 ? (
                <Card>{empty}</Card>
              ) : (
                <ul className="ct-grid">
                  {rows.map((c) => (
                    <li key={c.id}>
                      {tab === 'customer' && <CustomerCard c={c} onOpen={() => openContact(c)} />}
                      {tab === 'prospect' && (
                        <ProspectCard
                          c={c}
                          onAdd={() => onAddProspect(c.id)}
                          onDisqualify={() => setDisqId(c.id)}
                          onUndo={() => patch({ ...c, disqualified: { count: Math.max(0, (c.disqualified?.count ?? 1) - 1), byMe: false } }, 'Disqualification has been undone.')}
                        />
                      )}
                      {tab === 'inactive' && (
                        <InactiveCard c={c} onReactivate={() => patch({ ...c, status: 'customer', deactivated: undefined, updated: TODAY }, `${fullName(c)} has been reactivated.`)} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Drawer: details (06_ContactDrawer 10210:12754) */}
      {drawer?.kind === 'details' && drawerContact && (
        <ContactDrawer
          key={drawerContact.id}
          contact={drawerContact}
          tab={drawer.tab}
          onTab={(t) => setDrawer({ ...drawer, tab: t })}
          onClose={() => setDrawer(null)}
          onEdit={() => setDrawer({ kind: 'form', mode: 'edit', id: drawerContact.id })}
          onDeactivate={() => setDeactivateId(drawerContact.id)}
          onUpdate={patch}
          initialHierarchyEdit={boot === 'hierarchy-edit'}
          initialNoteEdit={boot === 'note-edit'}
        />
      )}

      {/* Drawer: add / edit / connect forms */}
      {drawer?.kind === 'form' && (
        <ContactForm
          key={`${drawer.mode}-${drawer.id ?? drawer.seed?.id ?? 'new'}`}
          mode={drawer.mode}
          initial={drawer.id ? byId(drawer.id) : drawer.seed}
          existing={thisAccount}
          others={OTHER_ACCOUNT_CONTACTS}
          onCancel={() => setDrawer(drawer.id ? { kind: 'details', id: drawer.id, tab: 'overview' } : null)}
          onConnect={(o) => setDrawer({ kind: 'form', mode: 'connect', seed: connectFrom(o) })}
          onSave={(c) => {
            if (drawer.mode === 'edit') {
              patch(c, 'Contact changes have been saved.');
              setDrawer({ kind: 'details', id: c.id, tab: 'overview' });
            } else {
              commit([{ ...c, status: 'customer', flag: 'New', l2: c.l2.length ? c.l2 : ['Kroger Digital • IDG • PA00000870169'] }, ...contacts], 'New contact has been created.');
              setTab('customer');
              setDrawer({ kind: 'details', id: c.id, tab: 'overview' });
            }
          }}
        />
      )}

      {/* Deactivate confirm (04_ContactDetails 10210:17531). Delta: Figma's Deactivate is a red fill; cake& Button has no destructive intent. */}
      <Modal
        open={!!deactivateId}
        onOpenChange={(o) => !o && setDeactivateId(null)}
        title="Are you sure?"
        footer={
          <ModalFooter
            checkbox={<span />}
            secondaryActionLabel="Cancel"
            onSecondaryAction={() => setDeactivateId(null)}
            primaryActionLabel="Deactivate"
            onPrimaryAction={() => {
              const c = byId(deactivateId!)!;
              patch({ ...c, status: 'inactive', deactivated: { on: TODAY, by: CURRENT_USER } }, `${fullName(c)} has been deactivated.`);
              setDeactivateId(null);
              setDrawer(null);
            }}
          />
        }
      >
        <ModalContent
          description={`Once deactivated, ${deactivateName} will only be removed from this account, all other account connections remain active. You can still find ${deactivateName} in the Inactive tab under Contacts and reactivate it anytime.`}
        />
      </Modal>

      {/* Convert to Contact (non-NA, 14215:36895 + Gesture 14215:37085) */}
      <Modal
        open={!!convertId}
        onOpenChange={(o) => !o && setConvertId(null)}
        title="Convert to Contact"
        footer={
          <ModalFooter
            checkbox={<span />}
            secondaryActionLabel="Cancel"
            onSecondaryAction={() => setConvertId(null)}
            primaryActionLabel="Confirm"
            onPrimaryAction={() => {
              addProspect(convertId!);
              setConvertId(null);
            }}
          />
        }
      >
        <ModalContent
          description={
            <>
              By moving the prospect to contact, you confirm that you have <strong>had approved basis for continued engagement</strong>, and{' '}
              <strong>will follow applicable privacy and consent requirements</strong> for all future communications.
            </>
          }
        />
      </Modal>

      {disqId && (
        <DisqualifyModal
          onCancel={() => setDisqId(null)}
          onConfirm={() => {
            const c = byId(disqId)!;
            patch({ ...c, disqualified: { count: (c.disqualified?.count ?? 0) + 1, byMe: true } }, `${fullName(c)} has been disqualified.`);
            setDisqId(null);
          }}
        />
      )}
    </>
  );
}

const blankSeed = (): Contact => ({
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

/** Gesture 10210:17530: connecting loads the contact with relationship strength empty for new input. */
const connectFrom = (o: Contact): Contact => ({ ...o, id: `conn-${Date.now()}`, ratings: {}, notes: [], status: 'customer' });

/** 04_PropectModel 10210:13742 — reason choice; "Other" requires text. */
function DisqualifyModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState('');
  const [tried, setTried] = useState(false);
  const isOther = reason === DISQUALIFY_REASONS[DISQUALIFY_REASONS.length - 1];
  const missing = !reason ? 'Select a reason.' : isOther && !other.trim() ? 'Must provide a reason.' : null;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onCancel()}
      title="Disqualify Prospect"
      footer={
        <ModalFooter
          checkbox={<span />}
          secondaryActionLabel="Cancel"
          onSecondaryAction={onCancel}
          primaryActionLabel="Confirm"
          onPrimaryAction={() => {
            setTried(true);
            if (!missing) onConfirm();
          }}
        />
      }
    >
      <ModalContent description="Select a reason that best explains why this prospect should not be added as a contact.">
        {/* Delta: Figma draws selectable reason pills; cake& Chip has no selected state, so these are Buttons (tonal = selected). */}
        <div className="ct-reasons" role="radiogroup" aria-label="Disqualification reason">
          {DISQUALIFY_REASONS.map((r) => (
            <Button
              key={r}
              size="sm"
              role="radio"
              aria-checked={reason === r}
              variant={reason === r ? 'tonal' : 'outline'}
              intent={reason === r ? 'primary' : 'secondary'}
              onClick={() => setReason(r)}
            >
              {r}
            </Button>
          ))}
        </div>
        <TextInput
          aria-label="Reason"
          placeholder="Type a reason"
          value={other}
          disabled={!isOther}
          status={tried && missing ? 'error' : 'default'}
          helperText={tried && missing ? missing : undefined}
          onChange={(e) => setOther(e.target.value)}
        />
      </ModalContent>
    </Modal>
  );
}
