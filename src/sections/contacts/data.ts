// Mock data for the Contacts section (Figma 01_Contact 10210:15165 and the
// drawer / form frames). Everything is local to this folder.

export const CURRENT_USER = 'John Smith';
export const TODAY = '20 Aug 2026';

/** Decision-making roles. The letter is what the table/card badge shows. */
export const DM_ROLES = [
  { code: 'A', label: 'Approver', hint: 'Signs off on the purchase decision.' },
  { code: 'B', label: 'Business Driver', hint: 'Owns the business case behind the purchase.' },
  { code: 'C', label: 'Champion', hint: 'Advocates for Lenovo inside the account.' },
  { code: 'D', label: 'Domino', hint: 'Influences other stakeholders when they move.' },
  { code: 'E', label: 'Evaluator', hint: 'This is an optional line to define Evaluator for sellers.' },
] as const;
export type DmCode = (typeof DM_ROLES)[number]['code'];
export const dmRole = (code: DmCode) => DM_ROLES.find((r) => r.code === code)!;

export const SENIORITIES = ['C-Level', 'Executive', 'Director', 'Senior', 'Manager', 'Other'];
export const COUNTRIES = ['USA', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'India', 'Japan'];
export const FUNCTIONAL_AREAS = [
  'Cloud',
  'AI',
  'Security',
  'Procurement',
  'Hardware',
  'Server',
  'IT Infrastructure',
  'Infrastructure',
  'Executive Leadership',
  'Engineering',
  'Data Engineering',
  'Digital Transformation',
  'Other',
];
export const INTERESTS = [
  'AWS',
  'FinOps',
  'Supply Chain',
  'ERP',
  'DevOps',
  'Cloud',
  'AI',
  'Digital Transformation',
  'GenAI',
  'Product',
  'Technology',
];
export const NOTIFICATION_FLAGS = ['Pending Review', 'Invalid Email', 'New'] as const;
export type Flag = (typeof NOTIFICATION_FLAGS)[number];

/* ── Relationship strength (Add Contact 10210:16741) ─────────────────── */

export const RATING_CATEGORIES = [
  { key: 'partnership', label: 'Partnership', levels: ['Avoidance of Interaction', 'None', 'Reactive', 'Proactive Input', 'Proactive Co-development'] },
  { key: 'value', label: 'Value', levels: ['Negative', 'Trivial to none', 'Some', 'Major', 'Breakthrough'] },
  { key: 'loss', label: 'Relationship Loss / Effect', levels: ['Benefits outweigh challenges', 'No challenges', 'Some challenges', 'Major challenges', 'Catastrophic challenges'] },
  { key: 'bidding', label: 'Competitive Bidding', levels: ['Benefits outweigh challenges', 'No challenges', 'Some challenges', 'Major challenges', 'Catastrophic challenges'] },
  { key: 'satisfaction', label: 'Satisfaction & Switching', levels: ['Dissatisfied', 'Dissatisfied', 'Indifferent', 'Generally Satisfied', 'Completely Satisfied'] },
  { key: 'recommend', label: 'Would Recommend', levels: ['No', 'Probably not', 'Maybe', 'Yes - reactively', 'Yes - proactively'] },
  { key: 'rapport', label: 'Personal Rapport', levels: ['Poor/negative', 'Trivial', 'Positive but not deep', 'Strong relationship', 'Deep & meaningful'] },
] as const;
export type RatingKey = (typeof RATING_CATEGORIES)[number]['key'];
/** 0 = N/A ("Unrated"), 1–5 = level, undefined = not yet chosen. */
export type Ratings = Partial<Record<RatingKey, number>>;

export const ratingScore = (r: Ratings | undefined): number => {
  const vals = Object.values(r ?? {}).filter((v): v is number => typeof v === 'number' && v > 0);
  if (!vals.length) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
};
export const ratingLabel = (score: number) =>
  score === 0 ? 'Not-rated' : score >= 4 ? 'Preferred Supplier' : score >= 3 ? 'Approved Supplier' : score >= 2 ? 'Transactional' : 'At Risk';
export const allRated = (r: Ratings | undefined) => RATING_CATEGORIES.every((c) => typeof r?.[c.key] === 'number');

const ratingsFor = (stars: number): Ratings => {
  const base = Math.max(1, Math.min(5, stars));
  return {
    partnership: 5,
    value: 4,
    loss: Math.max(1, base - 1),
    bidding: Math.max(1, base - 2),
    satisfaction: 5,
    recommend: Math.max(1, base),
    rapport: 0,
  };
};

/* ── Contacts ────────────────────────────────────────────────────────── */

export type Status = 'customer' | 'prospect' | 'inactive';

export type Suggestion = { id: string; field: string; from: string; to: string; source: string };

export type Note = { id: string; title: string; body: string; type: string; tags: string[]; updated: string; author: string; favorite?: boolean };

export type Contact = {
  id: string;
  first: string;
  last: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  country: string;
  seniority: string;
  dm: DmCode[];
  functional: string[];
  interests: string[];
  ratings: Ratings;
  updated: string;
  status: Status;
  flag?: Flag;
  reportsTo?: string;
  suggestions?: Suggestion[];
  /** Prospects: how many sellers disqualified, and whether I did. */
  disqualified?: { count: number; byMe: boolean };
  /** Prospects with any disqualification have a history tooltip. */
  disqHistory?: { reason: string; count: number; by: string }[];
  deactivated?: { on: string; by: string };
  l2: string[];
  notes: Note[];
};

export const fullName = (c: Pick<Contact, 'first' | 'last'>) => `${c.first} ${c.last}`.trim();
export const starsOf = (c: Contact) => Math.round(ratingScore(c.ratings));

const NOTES = (): Note[] => [
  {
    id: 'n1',
    title: 'Initial Strategy Discussion',
    body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
    type: 'Meeting',
    tags: ['Strategy', 'AI', 'Meeting'],
    updated: TODAY,
    author: CURRENT_USER,
  },
  {
    id: 'n2',
    title: 'Quarterly Infrastructure Review',
    body: 'Discussed refresh timelines for edge servers and the procurement window for Q4. Follow up with pricing for the hybrid cloud bundle.',
    type: 'Call',
    tags: ['Infrastructure', 'Meeting'],
    updated: '18 Aug 2026',
    author: CURRENT_USER,
  },
];

const L2 = ['Kroger Digital • IDG • PA00000870169', 'Kroger Digital • ISG • PA00000870168'];

type Seed = [first: string, last: string, title: string, dm: DmCode[], seniority: string, stars: number, functional: string[], interests: string[]];

const CUSTOMER_SEED: Seed[] = [
  ['Chen', 'Wei', 'Chief Technology Officer', ['C', 'E'], 'C-Level', 5, ['Cloud', 'AI', 'Security', 'Procurement'], []],
  ['Brielle', 'Santos', 'Director of Procurement', ['E'], 'Director', 2, ['Hardware', 'Server'], ['AWS', 'FinOps']],
  ['Sarah', 'Johnson', 'IT, Operations', ['B'], 'Executive', 3, ['IT Infrastructure', 'Cloud', 'AI', 'Security'], ['Supply Chain', 'ERP']],
  ['Ivan', 'Petrov', 'IT Solutions Architect', ['E'], 'Senior', 4, ['Other'], ['DevOps', 'Cloud']],
  ['George', 'Tanaka', 'Head of IT Procurement', ['B'], 'Director', 3, ['Cloud', 'AI', 'Security'], ['AI', 'Digital Transformation']],
  ['Dana', 'Kowalski', 'Marketing Specialist', ['E'], 'Other', 2, ['Procurement', 'Hardware', 'Server'], ['Supply Chain', 'ERP']],
  ['Quentin', 'Moreau', 'VP Engineering & Operations', ['E'], 'Executive', 2, ['IT Infrastructure'], ['AWS', 'FinOps']],
  ['Marcus', 'Thompson', 'Director of Cloud Operations', ['B'], 'Director', 3, ['Procurement', 'Hardware', 'Server'], ['AI', 'Digital Transformation']],
  ['Kai', 'Yamamoto', 'Infrastructure Lead', ['E'], 'Other', 4, ['AI', 'Security'], ['Supply Chain', 'ERP']],
  ['Oscar', 'Rivera', 'IT Procurement Lead', ['C', 'E'], 'Manager', 5, ['Hardware', 'Server'], ['AWS', 'FinOps']],
];

const email = (f: string, l: string) => `${f}.${l}`.toLowerCase().replace(/[^a-z.]/g, '') + '@krogers.com';
const phone = (i: number) => `+1 (123) 345 ${String(5600 + i * 13).padStart(4, '0')}`;

const make = (s: Seed, i: number, status: Status, extra: Partial<Contact> = {}): Contact => ({
  id: `${status}-${i}`,
  first: s[0],
  last: s[1],
  title: s[2],
  email: email(s[0], s[1]),
  phone: phone(i),
  linkedin: `@${s[0]}.${s[1]}`.toLowerCase(),
  country: 'USA',
  seniority: s[4],
  dm: s[3],
  functional: s[6],
  interests: s[7],
  ratings: ratingsFor(s[5]),
  updated: TODAY,
  status,
  reportsTo: i % 3 === 0 ? undefined : 'David Lee',
  l2: L2,
  notes: NOTES(),
  ...extra,
});

/** Force the star count the Figma table shows by tuning one category. */
const withStars = (c: Contact, stars: number): Contact => {
  const order: RatingKey[] = ['partnership', 'value', 'loss', 'bidding', 'satisfaction', 'recommend'];
  const r: Ratings = { rapport: 0 };
  order.forEach((k) => (r[k] = stars));
  return { ...c, ratings: r };
};

export const INITIAL_CONTACTS: Contact[] = [
  ...CUSTOMER_SEED.map((s, i) => {
    const flags: Partial<Contact> =
      i === 0
        ? {
            flag: 'Pending Review',
            suggestions: [
              { id: 's1', field: 'Functional Area', from: 'Other', to: 'Infrastructure', source: '3rd Party Suggestion' },
              { id: 's2', field: 'Job Title', from: 'Chief Technology Officer', to: 'Chief Technology & Digital Officer', source: '3rd Party' },
            ],
          }
        : i === 1
          ? { flag: 'Invalid Email' }
          : i === 8 || i === 9
            ? { flag: 'New' }
            : {};
    return withStars(make(s, i, 'customer', flags), s[5]);
  }),
  // Prospects (03_Prospect 10210:14012)
  make(['Stefan', 'Müller', 'Chief Digital Officer', ['B'], 'C-Level', 5, ['Digital Transformation'], ['Cybersecurity', 'Analytics']], 20, 'prospect', {
    disqualified: { count: 10, byMe: false },
    disqHistory: [
      { reason: 'No Longer with the Company', count: 7, by: 'Alex Smith, Jamie Lee, Miley Tanner…' },
      { reason: 'Not Relevant', count: 2, by: 'Sarah Johnson, Renkun Huang' },
      { reason: 'A reorg is completed last month, but not updated yet.', count: 1, by: 'Stefan Muller' },
    ],
  }),
  make(['Oscar', 'Rivera', 'IT Procurement Lead', [], 'Manager', 0, ['Procurement'], []], 21, 'prospect', { disqualified: { count: 0, byMe: false } }),
  make(['Nadia', 'Volkov', 'Senior Data Engineer', [], 'Senior', 3, ['Data Engineering'], []], 22, 'prospect', {
    disqualified: { count: 10, byMe: true },
    disqHistory: [
      { reason: 'Not Relevant', count: 6, by: 'John Smith, Jamie Lee, Renkun Huang…' },
      { reason: 'Invalid Email', count: 4, by: 'Alex Smith, Miley Tanner' },
    ],
  }),
  make(['Lena', 'Fischer', 'Head of Workplace Technology', ['E'], 'Director', 0, ['IT Infrastructure'], []], 23, 'prospect', { disqualified: { count: 0, byMe: false } }),
  make(['Rahul', 'Mehta', 'Cloud Platform Manager', [], 'Manager', 0, ['Cloud'], []], 24, 'prospect', {
    disqualified: { count: 1, byMe: false },
    disqHistory: [{ reason: 'Incorrect Job Title', count: 1, by: 'Jamie Lee' }],
  }),
  // Inactive (05_Inactive 10210:13511)
  make(['Stefan', 'Müller', 'Chief Digital Officer', ['B'], 'C-Level', 5, ['Digital Transformation'], ['Cybersecurity', 'Analytics', 'Digital Twins']], 30, 'inactive', {
    deactivated: { on: TODAY, by: CURRENT_USER },
  }),
  withStars(
    make(['Oscar', 'Rivera', 'IT Procurement Lead', ['E'], 'Manager', 2, ['Procurement'], ['Software Licensing', 'Vendor Management']], 31, 'inactive', {
      deactivated: { on: TODAY, by: CURRENT_USER },
    }),
    2,
  ),
  withStars(
    make(['Nadia', 'Volkov', 'Senior Data Engineer', ['E'], 'Senior', 3, ['Data Engineering'], ['Data Lakes', 'Spark', 'Hadoop', 'ML Ops']], 32, 'inactive', {
      deactivated: { on: TODAY, by: CURRENT_USER },
    }),
    3,
  ),
];

/** Contacts held by OTHER accounts — an Add Contact email that matches one offers "Connect" (10210:17108). */
export const OTHER_ACCOUNT_CONTACTS: Contact[] = [
  {
    ...make(['Sarah', 'Johnson', 'IT, Operations', ['C', 'E'], 'Executive', 4, ['IT Infrastructure'], ['Cloud', 'AI', 'Security']], 90, 'customer'),
    email: 'sarah.johnson@kroger.com',
    phone: '+1(123)456 789',
    linkedin: '@sarah.johnson',
    notes: [],
  },
];

export const SALES_TEAM = [
  { id: 'st1', name: 'John Smith', role: 'Account Manager', email: 'jsmith@lenovo.com', phone: '+1 (919) 555 0101', region: 'US/NA' },
  { id: 'st2', name: 'Alex Smith', role: 'Inside Sales Representative', email: 'asmith@lenovo.com', phone: '+1 (919) 555 0102', region: 'US/NA' },
  { id: 'st3', name: 'Jamie Lee', role: 'Solutions Architect', email: 'jlee@lenovo.com', phone: '+1 (919) 555 0103', region: 'US/NA' },
  { id: 'st4', name: 'Miley Tanner', role: 'Channel Manager', email: 'mtanner@lenovo.com', phone: '+1 (919) 555 0104', region: 'US/NA' },
  { id: 'st5', name: 'Renkun Huang', role: 'Services Sales Specialist', email: 'rhuang@lenovo.com', phone: '+1 (919) 555 0105', region: 'APAC' },
];

export const DIRECTORY = ['David Lee', 'David Louis', 'David Lawson', 'David Lloyd', 'Diana Park', 'Elena Rossi', 'Frank Osei', 'Grace Kim'];

export const DISQUALIFY_REASONS = ['Invalid Email', 'Invalid Phone', 'No Longer with Company', 'Not Relevant', 'Incorrect Job Title', 'Other (Please Specify Below)'];

export const NOTE_TYPES = ['Meeting', 'Call', 'Email', 'General'];
export const NOTE_TAGS = ['Strategy', 'AI', 'Meeting', 'Infrastructure', 'Pricing', 'Follow-up'];

export type HistoryEvent = { id: string; date: string; title: string; detail?: string; changes?: { text: string; tone: 'success' | 'error' }[] };

export const historyFor = (c: Contact): HistoryEvent[] => {
  const name = fullName(c);
  return [
    { id: 'h1', date: TODAY, title: 'David Johnson Updated Seniority', detail: 'Senior Manager → Director' },
    { id: 'h2', date: TODAY, title: 'David Johnson Updated Invalid Email', detail: `${c.email.replace('@', '.old@')} → ${c.email}` },
    {
      id: 'h3',
      date: TODAY,
      title: 'David Johnson Processed 3rd Party Suggestions',
      changes: [
        { text: 'Seniority: Senior Manager → Director', tone: 'success' },
        { text: 'Functional Area: Senior Manager → Director', tone: 'success' },
        { text: 'Area of Interest: Added Digital Transformation', tone: 'success' },
        { text: 'Decision-Making Role: Champion', tone: 'error' },
      ],
    },
    { id: 'h4', date: TODAY, title: 'David Johnson Processed 3rd Party Suggestion', detail: 'Senior Manager → Director' },
    { id: 'h5', date: TODAY, title: 'David Johnson Reactivated Contact', detail: `Contact Name: ${name}` },
    { id: 'h6', date: TODAY, title: 'David Johnson Deactivated Contact', detail: `Contact Name: ${name}` },
    { id: 'h7', date: TODAY, title: 'David Johnson Rejected Prospect: John Doe', detail: 'Reason: Not Relevant to Account' },
    { id: 'h8', date: TODAY, title: 'David Johnson Rejected Prospect: John Denver', detail: 'Reason: Not Relevant to Account' },
    { id: 'h9', date: TODAY, title: 'David Johnson Updated Hierarchy', detail: 'Senior Manager → Director' },
    { id: 'h10', date: TODAY, title: 'David Johnson Created Contact', detail: `Contact Name: ${name}` },
  ];
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
