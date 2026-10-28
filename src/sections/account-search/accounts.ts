// Mock account directory for Account Search (Figma 10210:10524 / 10632 / 10714
// and the typeahead states 10210:10326 / 10456 / 10502).

export type Region = 'US/NA' | 'EMEA' | 'AP' | 'LA';

export type AccountRecord = {
  id: string;
  name: string;
  region: Region;
  idg?: string;
  isg?: string;
  alias?: string;
};

export const ACCOUNTS: AccountRecord[] = [
  { id: 'kroger', name: 'The Kroger Co.', region: 'US/NA', idg: 'PA000000870169', isg: 'PA000000870167', alias: 'LoremIpsm' },
  { id: 'kroger-health', name: 'Kroger Health', region: 'US/NA', idg: 'PA000000870171', isg: 'PA000000870173', alias: 'LoremIpsm' },
  { id: 'kroger-tech', name: 'Kroger Technology Service', region: 'US/NA', idg: 'PA000000870175', alias: 'LoremIpsm' },
  { id: 'techcorp', name: 'TechCorp Ltd', region: 'US/NA', idg: 'PA00005464353', isg: 'PA00005464354', alias: 'LoremIpsm' },
  { id: 'acme', name: 'Acme Corporation', region: 'US/NA', idg: 'PA00005464355', isg: 'PA00005464356', alias: 'LoremIpsm' },
  { id: 'national', name: 'National Industries', region: 'US/NA', idg: 'PA00005464357', isg: 'PA00005464358', alias: 'LoremIpsm' },
  { id: 'nordwind', name: 'Nordwind Logistik GmbH', region: 'EMEA', idg: 'PA00007712001', isg: 'PA00007712002', alias: 'Nordwind' },
  { id: 'harbour', name: 'Harbour Retail Group plc', region: 'EMEA', isg: 'PA00007712010', alias: 'HRG' },
  { id: 'sakura', name: 'Sakura Electronics K.K.', region: 'AP', idg: 'PA00009934501', isg: 'PA00009934502' },
  { id: 'andes', name: 'Andes Mining S.A.', region: 'LA', idg: 'PA00004410022', alias: 'Andes' },
];

/** The account the prototype is drawn against — "currently viewing" (Gesture 10210:10785). */
export const CURRENT_ACCOUNT_ID = 'kroger';

export const REGIONS: Region[] = ['US/NA', 'EMEA', 'AP', 'LA'];

export const terms = (q: string) =>
  q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const FIELD_WORDS = ['idg', 'isg', 'alias'];

/**
 * Every query word must hit the name, an ID, the alias, the region, or a field
 * keyword ("Kroger ISG" → Kroger accounts that have an ISG ID).
 */
export function matches(a: AccountRecord, q: string) {
  const words = terms(q);
  if (!words.length) return true;
  const hay = [a.name, a.idg, a.isg, a.alias, a.region].filter(Boolean).join(' ').toLowerCase();
  return words.every((w) => {
    if (FIELD_WORDS.includes(w)) return Boolean(a[w as 'idg' | 'isg' | 'alias']);
    return hay.includes(w);
  });
}

export const search = (q: string, list = ACCOUNTS) => list.filter((a) => matches(a, q));
