// Mock data for the Account Details view, transcribed from the Figma frames
// (Details Cross BG Version 8/31, 10210:5592 and its variants).

export type BG = 'IDG' | 'ISG' | 'SSG';
export const BGS: BG[] = ['IDG', 'ISG', 'SSG'];

/** Chart / label colour per BG — cake& palette tokens (Figma uses CE purple/teal/amber). */
export const BG_COLOR: Record<BG, string> = {
  IDG: 'var(--color-badge-text-icon-on-violet-light)',
  ISG: 'var(--color-badge-teal)',
  SSG: 'var(--color-badge-amber)',
};

export const NA = 'NA';

/* ── Account Info (10210:5596, firm-enrich 10210:20058) ───────────────── */

export const VERTICALS = ['Retail', 'Healthcare', 'Financial Services', 'Manufacturing', 'Public Sector'];
export const SUBVERTICALS: Record<string, string[]> = {
  Retail: ['Grocery', 'Grocery & Shopping', 'Apparel', 'Convenience'],
  Healthcare: ['Hospitals', 'Clinics', 'Pharma'],
  'Financial Services': ['Banking', 'Insurance', 'Capital Markets'],
  Manufacturing: ['Automotive', 'Electronics', 'Industrial'],
  'Public Sector': ['Federal', 'State & Local', 'Education'],
};

export type AccountInfo = {
  vertical: string;
  subvertical: string;
  employees: string;
};

export const initialAccountInfo: AccountInfo = {
  vertical: 'Retail',
  subvertical: 'Grocery',
  employees: '23,000',
};

/* ── News (10210:5774) ────────────────────────────────────────────────── */

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  published: string; // ISO date
  kind: 'market' | 'company';
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non lorem vel neque iaculis dignissim vitae nec odio. Ut lobortis tortor non ipsum molestie volutpat. Proin ultrices mi mattis ex.';

export const news: NewsItem[] = [
  { id: 'n1', title: 'Kroger expands automated fulfilment network', summary: `News summary ${LOREM.slice(6)}`, source: 'New York Times', published: '2026-12-05', kind: 'company' },
  { id: 'n2', title: 'Kroger pilots AI-driven store analytics', summary: LOREM, source: 'Wall Street Journal', published: '2026-11-28', kind: 'company' },
  { id: 'n3', title: 'Q3 earnings beat expectations on digital sales', summary: LOREM, source: 'Reuters', published: '2026-11-14', kind: 'company' },
  { id: 'n4', title: 'Kroger renews multi-year cloud agreement', summary: LOREM, source: 'New York Times', published: '2026-10-30', kind: 'company' },
  { id: 'n5', title: 'New leadership appointed for technology division', summary: LOREM, source: 'Bloomberg', published: '2026-10-02', kind: 'company' },
];

/* ── Customer IT Landscape (10210:5838) ───────────────────────────────── */

export type ItRow = {
  id: string;
  vendor: string;
  category: string;
  product: string;
  family: string;
  firstDetected: string;
  lastVerified: string;
  delivery: string;
  source: string;
};

const itSeed: Omit<ItRow, 'id'>[] = [
  { vendor: 'Google, LLC', category: 'Marketing Technology', product: 'Google Marketing Platform', family: 'Marketing', firstDetected: '2021-03-29', lastVerified: '2026-07-01', delivery: 'Cloud', source: 'HGI' },
  { vendor: 'Google, LLC', category: 'Marketing Technology', product: 'Google Tag Manager', family: 'Marketing', firstDetected: '2021-03-29', lastVerified: '2026-07-01', delivery: 'Cloud', source: 'HGI' },
  { vendor: 'Microsoft Corporation', category: 'Productivity', product: 'Microsoft 365', family: 'Office Productivity Applications and Suites', firstDetected: '2016-02-17', lastVerified: '2025-01-31', delivery: 'Cloud and Mobile', source: 'HGI' },
  { vendor: 'Microsoft Corporation', category: 'Collaboration', product: 'Microsoft Exchange', family: 'Email', firstDetected: '2016-02-17', lastVerified: '2025-01-31', delivery: 'On-premise and Cloud', source: 'HGI' },
  { vendor: 'Microsoft Corporation', category: 'Collaboration', product: 'Microsoft Exchange Online', family: 'Email', firstDetected: '2021-03-29', lastVerified: '2025-01-31', delivery: 'On-premise and Cloud', source: 'HGI' },
  { vendor: 'Salesforce, Inc.', category: 'CRM', product: 'Sales Cloud', family: 'Customer Relationship Management', firstDetected: '2018-06-11', lastVerified: '2026-05-20', delivery: 'Cloud', source: 'HGI' },
  { vendor: 'VMware, Inc.', category: 'Infrastructure', product: 'vSphere', family: 'Virtualization', firstDetected: '2014-09-03', lastVerified: '2026-02-14', delivery: 'On-premise', source: 'ZoomInfo' },
  { vendor: 'Cisco Systems', category: 'Networking', product: 'Meraki', family: 'Network Management', firstDetected: '2019-11-21', lastVerified: '2026-04-08', delivery: 'Cloud', source: 'HGI' },
];

export const itRows: ItRow[] = Array.from({ length: 32 }, (_, i) => ({
  id: `it${i}`,
  ...itSeed[i % itSeed.length],
}));

/* ── Lenovo Purchase History (10210:5915, 1 BG 10210:8087) ─────────────── */

export const QUARTERS = ['25 Q1', '25 Q2', '25 Q3', '25 Q4', '26 Q1', '26 Q2', '26 Q3', '26 Q4'];

export type RevenuePoint = { q: string; IDG: number; ISG: number; SSG: number; gp: number };

// Millions USD.
export const revenueTrend: RevenuePoint[] = [
  { q: '25 Q1', IDG: 11, ISG: 5, SSG: 2, gp: 5.5 },
  { q: '25 Q2', IDG: 4, ISG: 3, SSG: 1, gp: 6 },
  { q: '25 Q3', IDG: 3, ISG: 1.5, SSG: 0.8, gp: 7.5 },
  { q: '25 Q4', IDG: 17, ISG: 6, SSG: 2.2, gp: 9 },
  { q: '26 Q1', IDG: 11, ISG: 5.5, SSG: 1.8, gp: 14 },
  { q: '26 Q2', IDG: 6, ISG: 3, SSG: 1, gp: 5 },
  { q: '26 Q3', IDG: 5, ISG: 1.5, SSG: 0.9, gp: 5.5 },
  { q: '26 Q4', IDG: 15.5, ISG: 5.5, SSG: 2.1, gp: 12 },
];

export const revenueTotals = {
  total: '$123',
  yoy: '123% YoY',
  grossProfit: '$40K',
  byBg: {
    IDG: { value: '$54K', share: 3.9, shareSolo: 95 },
    ISG: { value: '$58K', share: 4.2, shareSolo: 4 },
    SSG: { value: '$60K', share: 4.3, shareSolo: 1 },
  } as Record<BG, { value: string; share: number; shareSolo: number }>,
  /** Proportions for the stacked revenue bar (Figma 60 / 27 / 13). */
  mix: { IDG: 60, ISG: 27, SSG: 13 } as Record<BG, number>,
};

export type CategorySpend = { name: string; value: string };

export const spendByCategory: Record<BG, CategorySpend[]> = {
  IDG: [
    { name: 'Category 1', value: '$123 (19.9%)' },
    { name: 'Category 2', value: '$111 (8.0%)' },
    { name: 'Category 3', value: '$12 (4.2%)' },
    { name: 'Category 4', value: '$5 (3.0%)' },
    { name: 'Category 5', value: '$4 (2.9%)' },
    { name: 'Category 6', value: '$3 (1.3%)' },
    { name: 'Category 7', value: '$2 (0.5%)' },
    { name: 'Category 8', value: '$1 (0.3%)' },
  ],
  ISG: [
    { name: 'Category 1', value: '$54K (73.9%)' },
    { name: 'Category 2', value: '$5 (56.2%)' },
    { name: 'Category 3', value: '$4 (45.3%)' },
    { name: 'Category 4', value: '$3 (26.8%)' },
    { name: 'Category 5', value: '$2 (8.0%)' },
  ],
  SSG: [
    { name: 'Category 1', value: '$279K (19.9%)' },
    { name: 'Category 2', value: '$113K (8.0%)' },
    { name: 'Category 3', value: '$48K (5.5%)' },
    { name: 'Category 4', value: '$6K (4.3%)' },
  ],
};

export type ProductRow = {
  id: string;
  bg: BG;
  category: string;
  name: string;
  pn: string;
  revenue: number;
  qty: number;
  quarter: string;
  partner: string;
};

const productNames: Record<BG, { cat: string; names: string[] }> = {
  IDG: { cat: 'Laptops', names: ['ThinkStation P530', 'ThinkPad X1 Carbon', 'ThinkPad T14s', 'ThinkCentre M90q'] },
  ISG: { cat: 'Servers', names: ['ThinkSystem SR650 V3', 'ThinkAgile HX', 'ThinkSystem ST250'] },
  SSG: { cat: 'Services', names: ['Premier Support', 'Lenovo TruScale', 'Deployment Services'] },
};

export const productRows: ProductRow[] = Array.from({ length: 32 }, (_, i) => {
  const bg = BGS[i % 5 === 4 ? 2 : i % 3 === 2 ? 1 : 0];
  const p = productNames[bg];
  return {
    id: `p${i}`,
    bg,
    category: p.cat,
    name: p.names[i % p.names.length],
    pn: `PN-${(20450 + i * 37).toString()}`,
    revenue: 123 + ((i * 53) % 400),
    qty: 10 + ((i * 17) % 140),
    quarter: QUARTERS[7 - (i % 8)],
    partner: i % 4 === 0 ? '' : ['TechDist Inc.', 'CDW', 'SHI International'][i % 3],
  };
});

/* ── Pipeline Health (10210:7050, 1 BG 13075:16856) ───────────────────── */

export type Opp = {
  id: string;
  name: string;
  oppId: string;
  stage: 'Develop' | 'Execute' | 'Qualify' | 'Closed Won' | 'Closed Lost';
  alerts: string[];
  type: 'Project' | 'Renewal';
  bg: BG;
  revenue: number;
  closeDate: string;
  owner: string;
  open: boolean;
};

export const opportunities: Opp[] = Array.from({ length: 40 }, (_, i) => {
  const even = i % 2 === 0;
  const open = i < 28;
  return {
    id: `o${i}`,
    name: even ? 'Kroger Data Center' : 'Northwest Health System',
    oppId: even ? `OPPO43568${4500 + i}` : `OPPO32687${4300 + i}`,
    stage: open ? (even ? 'Develop' : 'Execute') : i % 3 ? 'Closed Won' : 'Closed Lost',
    alerts: [[ 'Past Due' ], [ 'ATS' ], [], [ 'Past Due', 'ATS' ], [ 'Past Due' ]][i % 5],
    type: even ? 'Project' : 'Renewal',
    bg: BGS[i % 5 < 2 ? 0 : i % 5 < 4 ? 1 : 2],
    revenue: 123 + ((i * 41) % 600),
    closeDate: even ? '2026-09-20' : '2026-11-15',
    owner: even ? 'John Smith' : 'Steve Smith',
    open,
  };
});

export const oppStats = [
  { label: 'Pipeline Value (USD)', value: '$50M', yoy: '18.3% YoY' },
  { label: 'Pipeline Count', value: '123', yoy: '18.3% YoY' },
  { label: 'Won Value (USD)', value: '$5M', yoy: '18.3% YoY' },
  { label: 'Won Count', value: '32', yoy: '18.3% YoY' },
  { label: 'Lost Value (USD)', value: '$5M', yoy: '18.3% YoY' },
  { label: 'Lost Count', value: '32', yoy: '18.3% YoY' },
];

/* ── Recent Orders (13075:14908) ──────────────────────────────────────── */

export type OrderStatus = 'Released to Manufacturing' | 'Order Received' | 'Delivered' | 'Order Processing' | 'Customer Action';

export type OrderLine = {
  family: string;
  name: string;
  productId: string;
  status: string;
  delivery: string;
  qty: number;
  revenue: number;
  alerts: string[];
};

export type Order = {
  id: string;
  date: string;
  orderId: string;
  products: number;
  bg: BG;
  category: string;
  reseller: string;
  qty: number;
  revenue: number;
  status: OrderStatus;
  alerts: string[];
  lines: OrderLine[];
};

const ORDER_STATUSES: OrderStatus[] = ['Released to Manufacturing', 'Order Received', 'Delivered', 'Order Processing', 'Customer Action'];
const ORDER_IDS = ['K000368757', 'G000928789', '4403864829', '4225540924', 'K000765655'];
const ALERTS = ['Credit Block', 'Stop Shipment', 'Customer Hold'];

export const orders: Order[] = Array.from({ length: 32 }, (_, i) => ({
  id: `ord${i}`,
  date: '2026-05-24',
  orderId: i < 5 ? ORDER_IDS[i] : `K000${(368757 + i * 911).toString().slice(0, 6)}`,
  products: 123,
  bg: i % 6 === 5 ? 'IDG' : 'ISG',
  category: i % 2 ? 'Networking' : 'Servers',
  reseller: i % 2 ? 'TechDist Inc.' : 'Direct',
  qty: 123,
  revenue: 123,
  status: ORDER_STATUSES[i % 5],
  alerts: i % 7 === 6 ? [] : ALERTS,
  lines: [
    { family: 'ThinkSystem', name: 'ThinkSystem SR650 V3', productId: 'TS-SR630V3-002', status: 'Delivered', delivery: '2026-06-12', qty: 140, revenue: 123, alerts: ALERTS },
    { family: 'ThinkAgile', name: 'ThinkSystem SR650 V3', productId: 'TS-SR630V3-002', status: 'Approved', delivery: '2026-06-12', qty: 100, revenue: 123, alerts: ALERTS },
    { family: 'ThinkSystem', name: 'ThinkSystem SR650 V3', productId: 'TS-SR630V3-002', status: 'Shipping', delivery: '2026-06-12', qty: 40, revenue: 123, alerts: [] },
  ],
}));

/* ── CX Health (14373:61559) ──────────────────────────────────────────── */

export const cxScores = [
  { q: '25 Q1', OSAT: 5.8, EoDB: 7, NPS: 25 },
  { q: '25 Q2', OSAT: 5.1, EoDB: 7.4, NPS: 10 },
  { q: '25 Q3', OSAT: 5.8, EoDB: 7, NPS: 2 },
  { q: '25 Q4', OSAT: 5.2, EoDB: 6.4, NPS: 10 },
  { q: '26 Q1', OSAT: 5.6, EoDB: 6.1, NPS: 32 },
  { q: '26 Q2', OSAT: 6.6, EoDB: 5.9, NPS: 50 },
  { q: '26 Q3', OSAT: 7.9, EoDB: 5.2, NPS: 52 },
  { q: '26 Q4', OSAT: 8.6, EoDB: 7.4, NPS: 80 },
];

export const ticketsByStatus = [
  { q: '25 Q1', resolved: 10.5, open: 0 },
  { q: '25 Q2', resolved: 3.8, open: 0 },
  { q: '25 Q3', resolved: 2.8, open: 0 },
  { q: '25 Q4', resolved: 16.5, open: 0 },
  { q: '26 Q1', resolved: 10.5, open: 0 },
  { q: '26 Q2', resolved: 6, open: 0 },
  { q: '26 Q3', resolved: 5, open: 1.5 },
  { q: '26 Q4', resolved: 16.5, open: 6 },
];

export const voiceOfCustomer = {
  top: {
    repeated: 'Product Quality, Warranty Extension, Warranty Extension',
    recent: [
      'Delivery OSAT', 'Warranty Extension', 'Delivery OSAT', 'Warranty Extension', 'Delivery OSAT',
      'Delivery OSAT', 'Delivery OSAT', 'Delivery OSAT', 'Delivery OSAT', 'Delivery OSAT',
    ],
  },
  bottom: {
    repeated: 'Product Quality, Warranty Extension, Warranty Extension, Product Quality, Warranty Extension, Warranty Extension',
    recent: ['Delivery OSAT', 'Warranty Extension', 'Warranty Extension', 'Delivery OSAT'],
  },
};

/* ── Credit detail drawer (10210:10294) ───────────────────────────────── */

export const creditRows = [
  { payerId: '12346567', totalLine: '6,000.00', expires: '05-11-2025', available: '4,506.49', arOverdue: '$1,493.51', status: 'R' },
];

/* ── Formatting ───────────────────────────────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

/** 2026-05-24 → "24 May 2026" */
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** 2021-03-29 → "29-Mar-21" (IT landscape style) */
export const fmtShortDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}-${MONTHS[m - 1].slice(0, 3)}-${String(y).slice(2)}`;
};

/** 2026-09-20 → "20 Sept, 2026" (pipeline style) */
export const fmtCommaDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}, ${y}`;
};

export const fmtUsd = (n: number) => `$${n.toLocaleString('en-US')}`;

export const orNA = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === '' ? NA : String(v);
