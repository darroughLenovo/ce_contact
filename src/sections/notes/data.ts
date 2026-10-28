// Mock data for the Notes tab (Figma group 14373:62457). Local only.

export type Contact = { id: string; name: string; title: string; initials: string };

export type Note = {
  id: string;
  title: string;
  body: string;
  type?: string;
  opportunityId?: string;
  opportunityName?: string;
  contactIds: string[];
  tags: string[];
  favorite: boolean;
  author: string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date — set once a note is edited
  updatedBy?: string;
};

/** The signed-in user — drives "My Notes" and authorship of new notes. */
export const CURRENT_USER = 'John Smith';

export const NOTE_TYPES = ['General', 'Meeting', 'Strategy', 'Follow-up', 'Call'];

export const CONTACTS: Contact[] = [
  { id: 'sj', name: 'Sarah Johnson', title: 'VP, Technology Strategy', initials: 'SJ' },
  { id: 'dl', name: 'David Lee', title: 'Director, IT Infrastructure', initials: 'DL' },
  { id: 'ew', name: 'Emily Wong', title: 'Procurement Manager', initials: 'EW' },
  { id: 'mr', name: 'Marcus Reed', title: 'CIO', initials: 'MR' },
];

export const INITIAL_TAGS = [
  'Strategy',
  'AI',
  'Meeting',
  'Budget',
  'Edge Computing',
  'Renewal',
  'Security',
  'Follow-up',
];

/** "AI Suggested Tags" (Figma 14373:62652) — offered under the Tags field. */
export const AI_SUGGESTED_TAGS = ['Digital Transformation', 'Infrastructure'];

const LOREM_1 =
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.';
const LOREM_2 =
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.';
const LOREM_3 =
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.';
const ROADMAP =
  'Discussed their AI roadmap for next 18 months. Sarah emphasized need for edge computing solutions for in-store analytics. Budget confirmed at $3.2M for initial phase.';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Q1 Strategy Meeting Notes',
    body: ROADMAP,
    type: 'Strategy',
    opportunityId: '4566874545',
    opportunityName: 'Nemo enim ipsam voluptatem quia psam voluptatem quia',
    contactIds: ['ew', 'dl', 'sj'],
    tags: ['Strategy', 'AI', 'Meeting'],
    favorite: true,
    author: 'John Smith',
    createdAt: '2026-08-20',
  },
  {
    id: 'n2',
    title:
      'Q1 Strategy Meeting Notes - At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti',
    body: `${ROADMAP} ${LOREM_3}`,
    opportunityId: '4566874545',
    opportunityName: 'In-store analytics edge rollout',
    contactIds: ['dl', 'sj'],
    tags: ['Strategy', 'AI', 'Meeting'],
    favorite: false,
    author: 'Sarah Johnson',
    createdAt: '2026-08-18',
    updatedAt: '2026-08-20',
  },
  {
    id: 'n3',
    title:
      'Vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti',
    body: `${LOREM_1}\n\n${LOREM_2}\n\n${LOREM_3}`,
    type: 'General',
    opportunityId: '4566874545',
    opportunityName: 'Data center refresh FY27',
    contactIds: ['dl', 'sj'],
    tags: ['Strategy', 'AI', 'Meeting'],
    favorite: false,
    author: 'Sarah Johnson',
    createdAt: '2026-08-12',
  },
  {
    id: 'n4',
    title: 'Renewal call with procurement',
    body: 'Emily confirmed the support renewal is on track. Requested a revised quote including three-year premier support before end of quarter.',
    type: 'Call',
    contactIds: ['ew'],
    tags: ['Renewal', 'Budget'],
    favorite: false,
    author: 'John Smith',
    createdAt: '2026-07-30',
  },
  {
    id: 'n5',
    title: 'Security review follow-up',
    body: 'Shared the zero-trust reference architecture. Marcus wants a workshop with the security team in September.',
    type: 'Follow-up',
    opportunityId: '4566871120',
    opportunityName: 'Endpoint security modernization',
    contactIds: ['mr'],
    tags: ['Security', 'Follow-up'],
    favorite: true,
    author: 'John Smith',
    createdAt: '2026-07-22',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-08-20" → "20 Aug 2026" (Figma date format). */
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const contactById = (id: string) => CONTACTS.find((c) => c.id === id);

/** Figma: "Updated on 20 Aug 2026 • By John Smith" (falls back to created). */
export const noteMeta = (n: Note) =>
  `${n.updatedAt ? 'Updated' : 'Created'} on ${formatDate(n.updatedAt ?? n.createdAt)} • By ${n.updatedAt ? n.updatedBy ?? n.author : n.author}`;

/** Design-review rule: missing data shows "NA", never "Null". */
export const orNA = (v?: string | null) => (v && v.trim() ? v : 'NA');
