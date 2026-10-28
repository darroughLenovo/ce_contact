// Mock data for the Overview dashboard. Two datasets mirror the two Figma
// frames: Overview 8/31 (10210:4904) and Overview Empty Version 8/31 (10210:9869).
import type { RouteId } from '../../shell/router';

export type Metric = {
  label: string;
  value: string;
  /** Optional tooltip on the label's info icon (Figma Tooltip 10210:10782). */
  info?: { title: string; body: string };
  sub?: string;
  trend?: { dir: 'up' | 'down'; text: string };
};

export type Insight = {
  id: string;
  /** Text before / link / text after — Figma inlines a link in some insights. */
  text: string;
  link?: { label: string; after: string };
  action: { label: string; kind: 'details' | 'task'; external?: boolean };
  sources: string[];
  generated: string;
};

export type AccountAction = { id: string; count: number; title: string; detail: string };

/** Chart series keys map 1:1 to a cake& categorical token. */
export type StrengthGroup = 'strong' | 'moderate' | 'weak';
export const STRENGTH_COLOR: Record<StrengthGroup, string> = {
  strong: 'var(--color-badge-green)',
  moderate: 'var(--color-badge-amber)',
  weak: 'var(--color-badge-pink)',
};
export const STRENGTH_LABEL: Record<StrengthGroup, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
};

export type StrengthRow = { label: string; count: number; group: StrengthGroup };

export type StatCard = { value: string; title: string; body: string; action: string; to: RouteId };

export type BusinessGroup = 'IDG' | 'ISG' | 'SSG';
export const BG_COLOR: Record<BusinessGroup, string> = {
  IDG: 'var(--color-badge-violet)',
  ISG: 'var(--color-badge-teal)',
  SSG: 'var(--color-badge-amber)',
};
export const BG_TINT: Record<BusinessGroup, string> = {
  IDG: 'var(--color-badge-violet-light)',
  ISG: 'var(--color-badge-teal-light)',
  SSG: 'var(--color-badge-amber-light)',
};
export const BG_TEXT: Record<BusinessGroup, string> = {
  IDG: 'var(--color-badge-text-icon-on-violet-light)',
  ISG: 'var(--color-badge-text-icon-on-teal-light)',
  SSG: 'var(--color-badge-text-icon-on-amber-light)',
};

export type SpendSlice = {
  group: BusinessGroup;
  /** USD, raw — formatted in the view. */
  amount: number;
  categories: { name: string; amount: number }[];
};

export type Competitor = { name: string; body: string; source: string };

export type OverviewData = {
  accountName: string;
  summarySubtitle?: string;
  whoIs: string;
  tags: string[];
  metrics: Metric[];
  summarySource: string;
  insights: Insight[];
  actions: AccountAction[];
  contactInsight?: string;
  strength: StrengthRow[];
  statCards: StatCard[];
  contactSource: string;
  wallet?: {
    itSpend: Metric[];
    slices: SpendSlice[];
    suggestions: { title: string; body: string }[];
    competitors: Competitor[];
  };
};

const FISCAL = { title: 'Customer Fiscal Year', body: '12 Jun 26 - 12 Jun 27' };

export const populated: OverviewData = {
  accountName: 'Kroger',
  whoIs:
    'Kroger is one of the largest grocery retailers in the US operating 2,700+ stores across 35 states with 20+ banners including Kroger, Fred Meyer, Ralphs and King Scoopers. The Company is investing in digital commerce, supply chain automation and organic growth.',
  tags: ['Industry: Retail/Grocery', 'Fortune 20', 'HQ: Cincinnati, OH', 'CEO: Rodney McMullen'],
  metrics: [
    { label: 'Annual Revenue (USD)', value: '$147.7B', info: FISCAL, trend: { dir: 'up', text: '18.3% YoY' } },
    { label: 'Est. Annual IT Spend (USD)', value: '$3.8B', info: FISCAL },
    { label: 'Stock Price (USD)', value: '$58.41', sub: 'NYSE: KR', trend: { dir: 'down', text: '0.44% Today' } },
  ],
  summarySource: 'Source: 3rd Party, D365, AI · Updated 05 Dec, 2026',
  insights: [
    {
      id: 'i1',
      text: 'Renewal due for 256,800 ',
      link: {
        label: 'Absolute licenses',
        after:
          ' with a historical value of $1.47M. It is recommended to create a renewal quote for 4ZK1P15678, 4ZK1U66237, 4ZN1P15674, 4ZK1P15678, 4ZK1U66237, 4ZN1P15674.',
      },
      action: { label: 'LBP Task', kind: 'task', external: true },
      sources: ['D365 Opportunities', 'Absolute Console', 'Install Base', 'Contract Registry', 'Quote History', 'Partner Portal'],
      generated: '03 Dec, 2026',
    },
    {
      id: 'i2',
      text: 'Engage with customer to discuss the 59 expiring warranties across 5 products.',
      action: { label: 'View Details', kind: 'details' },
      sources: ['Warranty Service', 'Install Base', 'D365 Cases', 'Entitlements', 'Service Contracts'],
      generated: '04 Dec, 2026',
    },
    {
      id: 'i3',
      text: 'Kroger has expanded its Lenovo ThinkPad deployment to 3 new distribution centers, signaling potential for enterprise-scale refresh orders in Q1.',
      action: { label: 'View Details', kind: 'details' },
      sources: Array.from({ length: 19 }, (_, i) => `Source ${i + 1}`),
      generated: '01 Dec, 2026',
    },
    {
      id: 'i4',
      text: "Kroger's recent earnings call highlighted a 15% increase in IT infrastructure spending, with a focus on edge computing and in-store automation.",
      action: { label: 'View Details', kind: 'details', external: true },
      sources: Array.from({ length: 19 }, (_, i) => `Source ${i + 1}`),
      generated: '02 Dec, 2026',
    },
    {
      id: 'i5',
      text: 'Competitor Dell has won a recent RFP for point-of-sale hardware at 200 Kroger locations. Consider proactive outreach to protect installed base.',
      action: { label: 'Take Action', kind: 'task', external: true },
      sources: Array.from({ length: 19 }, (_, i) => `Source ${i + 1}`),
      generated: '02 Dec, 2026',
    },
    {
      id: 'i6',
      text: "Kroger's CTO was quoted in a recent interview discussing plans to modernize warehouse management systems — a potential ISG opportunity.",
      action: { label: 'View Details', kind: 'details', external: true },
      sources: Array.from({ length: 19 }, (_, i) => `Source ${i + 1}`),
      generated: '02 Dec, 2026',
    },
  ],
  actions: [
    { id: 'a1', count: 5, title: 'Past due opportunities', detail: 'Total Potential revenue impact: USD $1.2M' },
    { id: 'a2', count: 2, title: 'Credit issues', detail: 'Invalid payment methods' },
    { id: 'a3', count: 1, title: 'Blocked orders', detail: 'Total order value: USD $1M' },
    { id: 'a4', count: 2, title: 'Expiring contracts', detail: 'Total contract value: USD $1.8M' },
    { id: 'a5', count: 5, title: 'Open CX feedback cases', detail: 'Root causes: delivery, purchase, technical support' },
  ],
  contactInsight:
    'Relationship strength has improved 12% this quarter, driven by increased engagement with procurement and IT leadership contacts.',
  strength: [
    { label: 'Trusted Partner', count: 8, group: 'strong' },
    { label: 'Strategic Supplier', count: 17, group: 'strong' },
    { label: 'Preferred Supplier', count: 25, group: 'moderate' },
    { label: 'Supplier', count: 32, group: 'moderate' },
    { label: 'Negative Relationship', count: 3, group: 'weak' },
    { label: 'No Relationship', count: 15, group: 'weak' },
  ],
  statCards: [
    { value: '8', title: 'Prospects', body: "Prospects who haven't been engaged yet.", action: 'Approve', to: 'contacts' },
    { value: '21', title: "What's New", body: 'New contacts and updates to this account.', action: 'Catch Up', to: 'contacts' },
    { value: '3', title: 'Needs Attention', body: 'Invalid emails and suggestions from 3rd party data.', action: 'Validate', to: 'contacts' },
  ],
  contactSource: 'Source: 3rd party, D365 · Updated 05 Dec, 2026',
  wallet: {
    itSpend: [
      { label: 'Est. Annual Spend (USD)', value: '$3.8B', info: FISCAL },
      { label: 'Lenovo YTD Spend (USD)', value: '$412M', trend: { dir: 'up', text: '12.4% YoY' } },
      { label: 'Lenovo Spend (%)', value: '10.8%' },
    ],
    slices: [
      {
        group: 'IDG',
        amount: 318_000_000,
        categories: [
          { name: 'ThinkPad Notebooks', amount: 142_000_000 },
          { name: 'ThinkCentre Desktops', amount: 71_000_000 },
          { name: 'Tablets & Handhelds', amount: 48_000_000 },
          { name: 'Monitors & Accessories', amount: 35_000_000 },
          { name: 'Workstations', amount: 22_000_000 },
        ],
      },
      {
        group: 'ISG',
        amount: 64_000_000,
        categories: [
          { name: 'ThinkSystem Servers', amount: 31_000_000 },
          { name: 'Edge Servers', amount: 18_000_000 },
          { name: 'Storage', amount: 11_000_000 },
          { name: 'Networking', amount: 4_000_000 },
        ],
      },
      {
        group: 'SSG',
        amount: 30_000_000,
        categories: [
          { name: 'Premier Support', amount: 14_000_000 },
          { name: 'Managed Services', amount: 9_000_000 },
          { name: 'Deployment Services', amount: 7_000_000 },
        ],
      },
    ],
    suggestions: [
      {
        title: 'Suggested engagement strategies:',
        body: "Focus on ISG refresh cycle in Q1 — Kroger's data center contracts are approaching renewal, presenting a $2.1M expansion opportunity.",
      },
      {
        title: 'Route to market recommendation:',
        body: 'Shift 10% of indirect volume to direct for ISG deals to improve margin. Coordinate with top partners on joint proposals for IDG fleet refresh.',
      },
    ],
    competitors: [
      {
        name: 'Dell Technologies',
        body: 'Primary competitor across IDG and ISG. Strong presence in point-of-sale and edge computing. 8-year relationship with the account.',
        source: 'HGI, as of 03 Jun 2026',
      },
      {
        name: 'HP Inc.',
        body: "Competes on commercial PCs and printing. Recent wins in Kroger's corporate office refresh. 5-year relationship with the account.",
        source: 'HGI, as of 03 Jun 2026',
      },
      {
        name: 'Cisco Systems',
        body: 'Whitespace vendor. Strong in networking and security infrastructure. No current business with the account.',
        source: 'HGI, as of 03 Jun 2026',
      },
      {
        name: 'Aruba Networks',
        body: 'Competes on in-store Wi-Fi and networking. Active in 400+ Kroger locations. 3-year relationship with the account.',
        source: 'HGI, as of 03 Jun 2026',
      },
    ],
  },
};

export const empty: OverviewData = {
  accountName: 'Blue Moon Cafe',
  summarySubtitle: 'Key firmographic and financial data for this account.',
  whoIs:
    'Blue Moon Cafe is a local restaurant in Raleigh, NC. It is investing in digital order system, automation, and growth.',
  tags: ['Food & Beverage', 'HQ: Raleigh, NC', 'CEO: Riley Somers'],
  metrics: [
    { label: 'Annual Revenue (USD)', value: '$150,382', trend: { dir: 'up', text: '18.3% YoY' } },
    { label: 'Est. Annual IT Spend (USD)', value: '$85,000' },
    { label: 'Domestic Employee Size', value: 'Not Available' },
  ],
  summarySource: 'Source: Data pending · Updated 05 Dec, 2026',
  insights: [],
  actions: [],
  strength: [],
  statCards: [
    {
      value: '1',
      title: 'Prospects',
      body: "Contacts identified as prospects who haven't been engaged yet.",
      action: 'Approve',
      to: 'contacts',
    },
  ],
  contactSource: 'Sources: Source/link • As of 05 Dec, 2026',
};

export const formatUsd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${n.toLocaleString('en-US')}`;
