import { account } from '../../data/account';

/**
 * Document naming rules — Figma "Document Naming (7/14)", node 14195:36774.
 *
 *   Customer Brief          Customer Brief_<Account Name>_07Jul2026.pdf
 *   Buyer Change Blueprint  BCB_<Oppo ID>_<Account Name>_v1_07Jul2026.pptx
 *   Executive Brief         Executive Brief_<Meeting Date>_<Account Name>_v1_07Jul2026.pptx
 *   Product Recommendation  Product Rec for [Requirements]_<Account Name>_07Jul2026.pdf
 *
 * `_` is the segment separator, so no user-supplied segment may contain one.
 */

export type CategoryId = 'customer-brief' | 'bcb' | 'executive-brief' | 'product-rec';

export type Category = {
  id: CategoryId;
  label: string;
  /** cake& Badge palette hue (Figma label-badges green / yellow / purple). */
  badge: 'green' | 'amber' | 'purple' | 'blue';
  ext: 'pdf' | 'pptx';
  versioned: boolean;
};

export const CATEGORIES: Category[] = [
  { id: 'customer-brief', label: 'Customer Brief', badge: 'green', ext: 'pdf', versioned: false },
  { id: 'executive-brief', label: 'Executive Brief', badge: 'purple', ext: 'pptx', versioned: true },
  { id: 'bcb', label: 'Buyer Change Blueprint', badge: 'amber', ext: 'pptx', versioned: true },
  { id: 'product-rec', label: 'Product Recommendation', badge: 'blue', ext: 'pdf', versioned: false },
];

export const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `07Jul2026` — the compact date used inside file names. */
export const fileDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}${MONTHS[d.getMonth()]}${d.getFullYear()}`;

/** `29 May 2026` — the date shown on cards and in the table. */
export const displayDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** File-system-unsafe characters plus the `_` segment separator. */
const ILLEGAL = /[\\/:*?"<>|_]/;
const ILLEGAL_IN_NAME = /[\\/:*?"<>|]/;

/** Account name as a file-name segment: no trailing dots, no illegal characters. */
export const accountSegment = account.name.replace(/[\\/:*?"<>|_]/g, '').replace(/\.+$/, '').trim();

export type NamingInput = {
  category: CategoryId;
  oppoId?: string;
  meetingDate?: Date | null;
  requirements?: string;
  version?: number;
  date?: Date;
};

export function buildFileName({ category, oppoId, meetingDate, requirements, version = 1, date = new Date() }: NamingInput) {
  const c = categoryOf(category);
  const d = fileDate(date);
  switch (category) {
    case 'customer-brief':
      return `Customer Brief_${accountSegment}_${d}.${c.ext}`;
    case 'bcb':
      return `BCB_${oppoId?.trim() || 'Oppo ID'}_${accountSegment}_v${version}_${d}.${c.ext}`;
    case 'executive-brief':
      return `Executive Brief_${meetingDate ? fileDate(meetingDate) : 'Meeting Date'}_${accountSegment}_v${version}_${d}.${c.ext}`;
    case 'product-rec':
      return `Product Rec for ${requirements?.trim() || '[Requirements]'}_${accountSegment}_${d}.${c.ext}`;
  }
}

/** The name with its `_v<n>` segment removed — documents sharing it are versions of one another. */
export const versionKey = (name: string) => name.replace(/_v\d+_/, '_');

export const nextVersion = (name: string, existing: string[]) => {
  const key = versionKey(name);
  const versions = existing
    .filter((n) => versionKey(n) === key)
    .map((n) => Number(/_v(\d+)_/.exec(n)?.[1] ?? 1));
  return versions.length ? Math.max(...versions) + 1 : 1;
};

export const extOf = (name: string) => /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? '';

/** Validates one user-supplied segment (Oppo ID, Requirements). */
export function validateSegment(value: string, label: string, max = 40): string | undefined {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (ILLEGAL.test(v)) return `${label} can't contain _ \\ / : * ? " < > |`;
  if (v.length > max) return `${label} must be ${max} characters or fewer`;
  return undefined;
}

export function validateOppoId(value: string): string | undefined {
  const base = validateSegment(value, 'Oppo ID', 20);
  if (base) return base;
  if (!/^[A-Za-z0-9-]+$/.test(value.trim())) return 'Use letters, numbers and hyphens only';
  return undefined;
}

/** Validates a rename. The extension is fixed by the document type. */
export function validateRename(value: string, ext: string, taken: string[]): string | undefined {
  const v = value.trim();
  if (!v) return 'File name is required';
  if (ILLEGAL_IN_NAME.test(v)) return 'File name can\'t contain \\ / : * ? " < > |';
  if (extOf(v) !== ext) return `File name must end in .${ext}`;
  if (v.length > 150) return 'File name must be 150 characters or fewer';
  if (taken.some((n) => n.toLowerCase() === v.toLowerCase())) return 'A document with this name already exists';
  return undefined;
}
