// Mock content for the generated Customer Brief PDF (Figma Page 1–4,
// 10210:10905 / 11059 / 11172 / 20783). Missing values render as "NA".

export const NA = 'NA';

export const briefMeta = {
  created: '4 Jun 2026',
  asOf: '4 Jun 2026',
};

export const outline = [
  'Who is Kroger',
  'Account Insights',
  'Account Actions',
  'CX Health',
  'Customer IT Landscape',
  'Lenovo Purchase History',
  'Pipeline Health',
  'Relationship Intelligence',
];

export const whoIs = {
  summary:
    'Largest pure-play grocery retailer in the US - 2,700+ stores, 35 states, 20+ banners (Harris Teeter, Ralphs, Fred Meyer, King Soopers). Fortune 20 company pivoting to standalone tech investment, supply chain automation, and organic growth following the blocked $25B Albertsons acquisition.',
  facts: [
    { label: 'Industry', value: 'Retail / Grocery' },
    { label: 'HQ', value: 'Cincinnati, OH' },
    { label: 'CEO', value: 'Rodney McMullen' },
    { label: 'NYSE: KR (USD)', value: '63.13', delta: '+5%' },
  ],
  stats: [
    { label: 'Annual Revenue (USD)', value: '147.7M', delta: '18.3% YoY', up: true },
    { label: 'Est. Annual IT Spend (USD)', value: '3.8-4B' },
    { label: 'Total Employees', value: '234K', delta: '18.3% YoY', up: true },
  ],
};

export const insights = [
  'Renewal due for 256,800 Absolute licenses with a historical value of $1.47M. It is recommended to create a renewal quote for 4ZK1P15678, 4ZK1U66237, 4ZN1P15674, 4ZK1P15678, 4ZK1U66237, 4ZN1P15674.',
  'Engage with customer to discuss the 59 expiring warranties across 5 products. Engage with customer to discuss the 59 expiring warranties across 5 products.',
  'Kroger has expanded its Lenovo ThinkPad deployment to 3 new distribution centers, signaling potential for enterprise-scale refresh orders in Q1.',
  "Kroger's recent earnings call highlighted a 15% increase in IT infrastructure spending, with a focus on edge computing and in-store automation.",
];

export const actions = [
  { count: 3, text: 'Open opportunities impacted by parts shortage - select new product to avoid ship delay.' },
  { count: 2, text: 'Credit issues - Coordinate with AR dept. to prevent order delays.' },
  { count: 5, text: 'Past due opportunities - Review deal to update state to prevent stalled or lost revenue.' },
];

export const cx = {
  scores: [
    { label: 'OSAT', value: '83%' },
    { label: 'EODB', value: '73%' },
    { label: 'NPS', value: '50' },
  ],
  themes: [
    { label: 'Top Rated Theme', value: 'Delivery Cost', score: '9.1' },
    { label: 'Bottom Rated Theme', value: 'Product Quality & Support Response', score: '6.5' },
  ],
  counts: [
    { label: 'Open Service Tickets', value: '2' },
    { label: 'Open CritSits', value: '3' },
  ],
};

export const itStats = [
  { label: 'Est. Annual IT Spend (USD)', value: '147.7M' },
  { label: 'Lenovo YTD Spend (USD)', value: '3.8B', delta: '18.3% YoY', up: false },
  { label: 'Lenovo Spend (%)', value: '12%' },
];

export const competitors = [
  {
    name: 'Microsoft Corporation',
    text: 'Dominant — Primary preferred vendor across PCs, Servers & Storage. Products including: Fusce dictum lorem Fusce dictum lorem Fusce dictum lorem.',
  },
  {
    name: 'Dell',
    text: 'Secondary — Strong in Networking & Servers. Products including: Fusce dictum lorem Fusce dictum lorem Fusce dictum lorem.',
  },
  {
    name: 'HP',
    text: 'Growing — Gaining share in Laptops, Workstations & Edge compute. Products including: Fusce dictum lorem Fusce dictum lorem Fusce dictum lorem.',
  },
];

export type Bg = 'idg' | 'isg' | 'ssg';

export const spend = {
  total: '90M',
  delta: '18.3% YoY',
  groups: [
    {
      id: 'idg' as Bg,
      name: 'IDG',
      value: 70,
      amount: '70M',
      share: '80%',
      delta: '18.3% YoY',
      lines: [
        { name: 'Laptops', share: '80%', delta: '18.3%' },
        { name: 'Workstations', share: '10%', delta: '18.3%' },
        { name: 'Desktops', share: '10%', delta: '18.3%' },
      ],
    },
    {
      id: 'isg' as Bg,
      name: 'ISG',
      value: 15,
      amount: '15M',
      share: '15%',
      delta: '18.3 YoY',
      lines: [
        { name: 'Servers', share: '90%', delta: '18.3%' },
        { name: 'Storage', share: '5%', delta: '18.3%' },
        { name: 'Edge/IoT', share: '5%', delta: '18.3%' },
      ],
    },
    {
      id: 'ssg' as Bg,
      name: 'SSG',
      value: 5,
      amount: '5M',
      share: '5%',
      delta: '18.3% YoY',
      lines: [{ name: 'Premier Support', share: '100%', delta: '18.3%' }],
    },
  ],
};

export const peak = {
  window: 'Oct 2026 - Jan 2027 (Q4).',
  text: 'Quisque faucibus ex sapien vitae pellentesque sem placerat. Tempus leo eu tempor.',
  crossSell: ['Fusce dictum lorem', 'Quis turpis efficitur accumsan.', 'Quis turpis efficitur accumsan.'],
  route: ['Dusce dictum lorem', 'Fusce dictum lorem', 'Quis turpis efficitur accumsan.'],
};

export const pipelineStats = [
  { label: 'Pipeline Value (USD)', value: '123M', delta: '1.49% YoY', sub: '5 Open Opportunities' },
  { label: 'Won Value (USD)', value: '123M', delta: '1.49% YoY', sub: '19 Won Opportunities' },
  { label: 'Lost Value (USD)', value: '123M', delta: '1.49% YoY', sub: '9 Lost Opportunities' },
];

export const opportunities = [
  { name: 'Kroger DC Modernization — ThinkSystem SR650 Refresh', stage: 'Propose', type: 'Project', value: '12.5M', close: '31 Dec 2026' },
  { name: 'Enterprise PC Fleet Refresh — 8,000 ThinkPad Units', stage: 'Qualify', type: 'Project', value: '6.8M', close: '30 Sept 2026' },
  { name: 'ThinkStation Workstation Refresh — DC Engineering', stage: 'Propose', type: 'Run-Rate', value: '', close: '15 Aug 2026' },
  { name: 'ThinkEdge IoT Edge Computing Pilot — 3 CFC Facilities', stage: 'Qualify', type: 'Project', value: '3.1M', close: '31 Oct 2026' },
  { name: 'Managed Device Services Expansion — 5yr Contract', stage: 'Execute', type: 'Contract', value: '1.2M', remaining: '0.4M', close: '31 Jul 2026' },
];

export const relationship = {
  strength:
    'Relationship strength has improved 12% this quarter, driven by increased engagement with procurement and IT leadership contacts.',
  suggested: [
    'Engage and approve 8 prospects.',
    'Catch up with 23 newly added and updated contacts.',
    'Validate 3 contacts with invalid email alerts and suggestions from 3rd party data.',
  ],
};

export type Stakeholder = {
  name: string;
  title: string;
  ai?: boolean;
  stars: number;
  email: string;
  phone: string;
  linkedin: string;
  interests: string;
  updated: string;
};

const base = {
  email: 'walkerj@kroger.com',
  phone: '19199009999',
  linkedin: '@james.walker',
  interests: 'Hybrid Cloud, Cloud, Infra.',
  updated: '20 Aug 2026',
};

export const stakeholders: Stakeholder[] = [
  { ...base, name: 'Sarah Chen', title: 'Chief Technology Officer', stars: 2 },
  { ...base, name: 'Sarah Chen', title: 'Chief Technology Officer', stars: 2 },
  { ...base, name: 'Ethan Carter', title: 'Director of Procurement', stars: 5 },
  { ...base, name: 'Ethan Carter', title: 'Director of Procurement', stars: 5 },
  { ...base, name: 'Lawrence Harper', title: 'CTO • IT • ISG', ai: true, stars: 5 },
  { ...base, name: 'Lawrence Harper', title: 'CTO • IT • ISG', ai: true, stars: 5 },
];

const SOURCE_ROWS: [string, string, string][] = [
  ['Ahold Delhaize', 'Ahold Q4/FY25 Earnings Results', '10 Mar 2026'],
  ['Albertsons Companies', 'Albertsons Q4/FY25 Earnings Results', '11 Mar 2026'],
  ['Aldi', 'Aldi Q4/FY25 Earnings Results', '15 Mar 2026'],
  ['Costco Wholesale', 'Costco Q2/FY25 Earnings Results', '09 Mar 2026'],
  ['Dollar General', 'Dollar General Q4/FY25 Earnings Results', '25 Mar 2026'],
  ['Family Dollar', 'Family Dollar Q4/FY25 Earnings Results', '24 Mar 2026'],
  ['Food Lion', 'Food Lion Q4/FY25 Earnings Results', '31 Mar 2026'],
  ['Giant Food', 'Giant Food Q4/FY25 Earnings Results', '28 Mar 2026'],
  ['Grocery Outlet', 'Grocery Outlet Q4/FY25 Earnings Results', '06 Apr 2026'],
  ['H-E-B Grocery', 'H-E-B Q1/FY25 Earnings Results', '22 Mar 2026'],
  ['Hy-Vee, Inc.', 'Hy-Vee Q4/FY25 Earnings Results', '26 Mar 2026'],
  ['Iceland Foods', 'Iceland Q4/FY25 Earnings Results', '30 Mar 2026'],
  ['Kmart', 'Kmart Q4/FY25 Earnings Results', '29 Mar 2026'],
  ['Kroger IR', 'Kroger Q4/FY25 Earnings Results', '06 Mar 2026'],
  ['Loblaw Companies', 'Loblaw Q4/FY25 Earnings Results', '12 Mar 2026'],
  ['Marks & Spencer', 'M&S Q4/FY25 Earnings Results', '16 Mar 2026'],
  ['Meijer, Inc.', 'Meijer Q4/FY25 Earnings Results', '23 Mar 2026'],
  ['Metro AG', 'Metro Q4/FY25 Earnings Results', '17 Mar 2026'],
  ['Piggly Wiggly', 'Piggly Wiggly Q4/FY25 Earnings Results', '03 Apr 2026'],
  ['Publix Super Markets', 'Publix Q1/FY25 Earnings Results', '20 Mar 2026'],
  ["Sainsbury's", "Sainsbury's Q4/FY25 Earnings Results", '13 Mar 2026'],
  ['Save Mart Supermarkets', 'Save Mart Q4/FY25 Earnings Results', '21 Mar 2026'],
  ['Schnucks', 'Schnucks Q4/FY25 Earnings Results', '05 Apr 2026'],
  ['ShopRite', 'ShopRite Q4/FY25 Earnings Results', '27 Mar 2026'],
  ['Stop & Shop', 'Stop & Shop Q4/FY25 Earnings Results', '01 Apr 2026'],
  ['SuperValu', 'SuperValu Q4/FY25 Earnings Results', '04 Apr 2026'],
  ['Target Corp', 'Target Q4/FY25 Earnings Results', '08 Mar 2026'],
  ['Tesco PLC', 'Tesco Q4/FY25 Earnings Results', '14 Mar 2026'],
  ["Trader Joe's", "Trader Joe's Q1/FY25 Earnings Results", '19 Mar 2026'],
  ['Walmart Inc', 'Walmart Q4/FY25 Earnings Results', '07 Mar 2026'],
];

export const sources = SOURCE_ROWS.map(([org, title, date], i) => ({ n: i + 1, org, title, date }));
