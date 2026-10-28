import { buildFileName, type CategoryId } from './naming';
import thumbCustomerBrief from './assets/thumb-customer-brief.png';
import thumbExecutiveBrief from './assets/thumb-executive-brief.png';
import thumbExecutiveBrief2 from './assets/thumb-executive-brief-2.png';
import thumbBcb from './assets/thumb-bcb.png';
import iconPdf from './assets/icon-pdf.png';
import iconPptx from './assets/icon-pptx.png';

export type Doc = {
  id: string;
  name: string;
  category: CategoryId;
  version: number;
  modifiedBy: string;
  modifiedOn: Date;
  createdBy: string;
  thumb: string;
  archived?: { by: string; on: Date };
};

/** The signed-in user (the Figma avatar). */
export const CURRENT_USER = 'Alex Johnson';

export const fileIcon = (name: string) => (name.toLowerCase().endsWith('.pdf') ? iconPdf : iconPptx);

export const thumbFor = (category: CategoryId, i = 0) => {
  switch (category) {
    case 'customer-brief':
      return thumbCustomerBrief;
    case 'bcb':
      return thumbBcb;
    case 'executive-brief':
      return i % 2 ? thumbExecutiveBrief2 : thumbExecutiveBrief;
    case 'product-rec':
      return thumbExecutiveBrief2;
  }
};

type Seed = {
  category: CategoryId;
  oppoId?: string;
  meeting?: string;
  req?: string;
  version?: number;
  date: string;
  modifiedBy: string;
  createdBy: string;
  archivedBy?: string;
  archivedOn?: string;
};

const SEEDS: Seed[] = [
  { category: 'customer-brief', date: '2026-07-07', modifiedBy: 'Alex Johnson', createdBy: 'Casey Brown' },
  { category: 'executive-brief', meeting: '2026-07-14', version: 3, date: '2026-07-07', modifiedBy: 'Alex Carter', createdBy: 'Quinn Harper' },
  { category: 'bcb', oppoId: 'OPP-0048213', version: 2, date: '2026-07-07', modifiedBy: 'Sam Taylor', createdBy: 'Ava Thompson' },
  { category: 'bcb', oppoId: 'OPP-0048213', version: 1, date: '2026-06-22', modifiedBy: 'Sam Taylor', createdBy: 'Ava Thompson' },
  { category: 'customer-brief', date: '2026-06-02', modifiedBy: 'Alex Johnson', createdBy: 'Casey Brown' },
  { category: 'executive-brief', meeting: '2026-06-18', version: 1, date: '2026-06-10', modifiedBy: 'Alex Carter', createdBy: 'Quinn Harper' },
  { category: 'product-rec', req: 'Store Edge Compute', date: '2026-05-29', modifiedBy: 'Casey Brown', createdBy: 'Casey Brown' },
  { category: 'executive-brief', meeting: '2026-07-14', version: 2, date: '2026-07-02', modifiedBy: 'Alex Carter', createdBy: 'Quinn Harper' },
  { category: 'bcb', oppoId: 'OPP-0051177', version: 1, date: '2026-05-29', modifiedBy: 'Ava Thompson', createdBy: 'Ava Thompson' },
  { category: 'customer-brief', date: '2026-05-04', modifiedBy: 'Quinn Harper', createdBy: 'Casey Brown' },
  { category: 'product-rec', req: 'Pharmacy Kiosk Refresh', date: '2026-05-21', modifiedBy: 'Sam Taylor', createdBy: 'Sam Taylor' },
  { category: 'executive-brief', meeting: '2026-05-27', version: 1, date: '2026-05-20', modifiedBy: 'Alex Johnson', createdBy: 'Alex Johnson' },
  { category: 'bcb', oppoId: 'OPP-0049920', version: 3, date: '2026-05-18', modifiedBy: 'Sam Taylor', createdBy: 'Ava Thompson' },
  { category: 'customer-brief', date: '2026-04-06', modifiedBy: 'Alex Johnson', createdBy: 'Casey Brown' },
  { category: 'product-rec', req: 'Distribution Center Rugged Tablets', date: '2026-04-29', modifiedBy: 'Casey Brown', createdBy: 'Quinn Harper' },
  // Archived (11)
  { category: 'customer-brief', date: '2026-03-02', modifiedBy: 'Alex Johnson', createdBy: 'Casey Brown', archivedBy: 'Alex Johnson', archivedOn: '2026-05-29' },
  { category: 'executive-brief', meeting: '2026-03-12', version: 2, date: '2026-03-05', modifiedBy: 'Alex Carter', createdBy: 'Quinn Harper', archivedBy: 'Alex Carter', archivedOn: '2026-05-29' },
  { category: 'bcb', oppoId: 'OPP-0041002', version: 1, date: '2026-02-20', modifiedBy: 'Sam Taylor', createdBy: 'Ava Thompson', archivedBy: 'Sam Taylor', archivedOn: '2026-05-29' },
  { category: 'bcb', oppoId: 'OPP-0041002', version: 2, date: '2026-03-01', modifiedBy: 'Sam Taylor', createdBy: 'Ava Thompson', archivedBy: 'Sam Taylor', archivedOn: '2026-05-29' },
  { category: 'customer-brief', date: '2026-02-02', modifiedBy: 'Alex Johnson', createdBy: 'Casey Brown', archivedBy: 'Alex Johnson', archivedOn: '2026-05-12' },
  { category: 'executive-brief', meeting: '2026-02-19', version: 1, date: '2026-02-10', modifiedBy: 'Alex Carter', createdBy: 'Quinn Harper', archivedBy: 'Alex Carter', archivedOn: '2026-05-12' },
  { category: 'product-rec', req: 'Self-Checkout Pilot', date: '2026-01-28', modifiedBy: 'Casey Brown', createdBy: 'Casey Brown', archivedBy: 'Casey Brown', archivedOn: '2026-04-30' },
  { category: 'customer-brief', date: '2026-01-05', modifiedBy: 'Quinn Harper', createdBy: 'Casey Brown', archivedBy: 'Quinn Harper', archivedOn: '2026-04-30' },
  { category: 'executive-brief', meeting: '2026-01-22', version: 1, date: '2026-01-15', modifiedBy: 'Alex Johnson', createdBy: 'Alex Johnson', archivedBy: 'Alex Johnson', archivedOn: '2026-04-02' },
  { category: 'bcb', oppoId: 'OPP-0038554', version: 1, date: '2026-01-09', modifiedBy: 'Ava Thompson', createdBy: 'Ava Thompson', archivedBy: 'Ava Thompson', archivedOn: '2026-04-02' },
  { category: 'product-rec', req: 'Back Office Workstations', date: '2025-12-11', modifiedBy: 'Sam Taylor', createdBy: 'Sam Taylor', archivedBy: 'Sam Taylor', archivedOn: '2026-03-18' },
];

const day = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const SEED_DOCS: Doc[] = SEEDS.map((s, i) => ({
  id: `doc-${i + 1}`,
  name: buildFileName({
    category: s.category,
    oppoId: s.oppoId,
    meetingDate: s.meeting ? day(s.meeting) : null,
    requirements: s.req,
    version: s.version,
    date: day(s.date),
  }),
  category: s.category,
  version: s.version ?? 1,
  modifiedBy: s.modifiedBy,
  modifiedOn: day(s.date),
  createdBy: s.createdBy,
  thumb: thumbFor(s.category, i),
  archived: s.archivedBy ? { by: s.archivedBy, on: day(s.archivedOn!) } : undefined,
}));
