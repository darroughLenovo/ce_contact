import type { ReactNode } from 'react';
import {
  CalendarClock,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  Star,
  Swords,
  TrendingDown,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';
import { Avatar, DataCell, DataRow, HeaderCell, HeaderRow, Table } from '@cake-admin/cakeand';
import { account, accountMeta } from '../../data/account';
import lenovoLogo from './assets/lenovo-logo.png';
import {
  NA,
  actions,
  briefMeta,
  competitors,
  cx,
  insights,
  itStats,
  opportunities,
  peak,
  pipelineStats,
  relationship,
  sources,
  spend,
  stakeholders,
  whoIs,
} from './briefData';

export const PAGE_COUNT = 4;

const na = (v?: string) => (v && v.trim() ? v : NA);

/* ── Building blocks ──────────────────────────────────────────────── */

function Page({ n, children, label }: { n: number; children: ReactNode; label: string }) {
  return (
    <article className="cb-sheet" aria-label={`${label}, page ${n} of ${PAGE_COUNT}`}>
      <div className="cb-sheet__body">{children}</div>
      <footer className="cb-sheet__foot">
        <span>
          Created with AI: {briefMeta.created} | <span className="cb-confidential">Confidential — Internal Sales Tool Only</span>
        </span>
        <span>
          {n}/{PAGE_COUNT}
        </span>
      </footer>
    </article>
  );
}

function SectionTitle({ title, meta, ai }: { title: string; meta?: string; ai?: boolean }) {
  return (
    <div className="cb-sec">
      <h2 className="cb-sec__title">
        {title}
        {ai && <Sparkles className="cb-ai" aria-label="AI generated" />}
      </h2>
      {meta && <span className="cb-sec__meta">{meta}</span>}
    </div>
  );
}

function Delta({ value, up = true }: { value?: string; up?: boolean }) {
  if (!value) return null;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`cb-delta ${up ? 'cb-delta--up' : 'cb-delta--down'}`}>
      <Icon aria-hidden />
      <span className="ce-sr-only">{up ? 'up' : 'down'}</span>
      {value}
    </span>
  );
}

function Stat({ label, value, delta, up, sub }: { label: string; value?: string; delta?: string; up?: boolean; sub?: string }) {
  return (
    <div className="cb-box cb-stat">
      <span className="cb-label">{label}</span>
      <span className="cb-stat__row">
        <strong className="cb-stat__value">{na(value)}</strong>
        <Delta value={delta} up={up} />
      </span>
      {sub && <span className="cb-label">{sub}</span>}
    </div>
  );
}

const Note = ({ children }: { children: ReactNode }) => <p className="cb-note">{children}</p>;

/* ── Page 1: Who is / Insights / Actions / CX ─────────────────────── */

function Page1() {
  return (
    <Page n={1} label="Customer Brief">
      <header className="cb-docheader">
        <div className="cb-docheader__top">
          <div className="cb-docheader__id">
            <h1 className="cb-docheader__name">{account.name}</h1>
            <p className="cb-docheader__meta">{accountMeta}</p>
          </div>
          <div className="cb-docheader__brand">
            <img src={lenovoLogo} alt="Lenovo" className="cb-docheader__logo" />
            <span>Customer Brief</span>
          </div>
        </div>
        <div className="cb-docheader__bottom">
          <span>
            Created with AI: {briefMeta.created} | <span className="cb-confidential--inverse">Confidential — Internal Sales Tool Only</span>
          </span>
          <span>All data as of {briefMeta.asOf}, unless otherwise noted.</span>
        </div>
      </header>

      <section className="cb-block">
        <SectionTitle title="Who is Kroger" meta="Sources: 3rd Party • Updated: 1 Jun 2026" />
        <div className="cb-grid cb-grid--who">
          <div className="cb-box cb-who">
            <p className="cb-body">{whoIs.summary}</p>
            <Note>Sources: [1], [2] • Generated: 03 Dec, 2026</Note>
            <dl className="cb-facts">
              {whoIs.facts.map((f) => (
                <div key={f.label}>
                  <dt className="cb-label">{f.label}</dt>
                  <dd>
                    <strong>{na(f.value)}</strong> {f.delta && <span>{f.delta}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="cb-stack">
            {whoIs.stats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      <section className="cb-block">
        <SectionTitle title="Account Insights" ai />
        <ul className="cb-box cb-insights">
          {insights.map((t, i) => (
            <li key={i}>
              <p className="cb-body">{t}</p>
              <Note>Sources: [1], [2] • Generated: 3 Dec, 2026</Note>
            </li>
          ))}
        </ul>
      </section>

      <div className="cb-grid cb-grid--half">
        <section className="cb-block">
          <SectionTitle title="Account Actions" meta="Sources: D365, CEA, OVP" />
          <ul className="cb-box cb-actions">
            {actions.map((a) => (
              <li key={a.text}>
                <strong className="cb-actions__n">{a.count}</strong>
                <span className="cb-body">{a.text}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="cb-block">
          <SectionTitle title="CX Health" meta="Sources: CEA, Forsta" />
          <div className="cb-cx">
            <div className="cb-grid cb-grid--3">
              {cx.scores.map((s) => (
                <div key={s.label} className="cb-box cb-cx__score">
                  <span className="cb-label">{s.label}</span>
                  <strong>{na(s.value)}</strong>
                </div>
              ))}
            </div>
            <div className="cb-grid cb-grid--2">
              {cx.themes.map((t) => (
                <div key={t.label} className="cb-box cb-stat">
                  <span className="cb-label">{t.label}</span>
                  <strong className="cb-stat__value">{na(t.value)}</strong>
                  <span className="cb-label">{na(t.score)}</span>
                </div>
              ))}
            </div>
            <div className="cb-grid cb-grid--2">
              {cx.counts.map((c) => (
                <Stat key={c.label} label={c.label} value={c.value} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}

/* ── Page 2: IT landscape / Purchase history / Pipeline ───────────── */

const BG_CLASS = { idg: 'cb-bg--idg', isg: 'cb-bg--isg', ssg: 'cb-bg--ssg' } as const;

function SpendBar() {
  const total = spend.groups.reduce((s, g) => s + g.value, 0);
  return (
    <div
      className="cb-spendbar"
      role="img"
      aria-label={`Spend split: ${spend.groups.map((g) => `${g.name} ${g.amount}`).join(', ')}`}
    >
      {spend.groups.map((g) => (
        <span key={g.id} className={`cb-spendbar__seg ${BG_CLASS[g.id]}`} style={{ flexGrow: g.value / total }} />
      ))}
    </div>
  );
}

function Page2() {
  return (
    <Page n={2} label="Customer Brief">
      <section className="cb-block">
        <SectionTitle title="Customer IT Landscape" meta="Sources: 3rd Party • Updated: 1 Jun 2026" />
        <div className="cb-grid cb-grid--it">
          <div className="cb-stack">
            {itStats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
          <div className="cb-box cb-competitors">
            <h3 className="cb-h4">
              <Swords aria-hidden /> Top 3 Competitors <Sparkles className="cb-ai" aria-label="AI generated" />
            </h3>
            <ol>
              {competitors.map((c, i) => (
                <li key={c.name}>
                  <span className="cb-rank">{i + 1}</span>
                  <div>
                    <strong className="cb-small">{c.name}</strong>
                    <p className="cb-small">{c.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="cb-block">
        <SectionTitle title="Lenovo Purchase History" meta="Sources: D365, LBP" />
        <div className="cb-grid cb-grid--history">
          <div className="cb-box cb-spend">
            <h3 className="cb-h4">
              <CircleDollarSign aria-hidden /> Lenovo Spend Breakdown (USD)
            </h3>
            <p className="cb-spend__total">
              <strong>{spend.total}</strong> Total Spend <Delta value={spend.delta} />
            </p>
            <SpendBar />
            {spend.groups.map((g) => (
              <div key={g.id} className={`cb-group ${BG_CLASS[g.id]}-light`}>
                <div className="cb-group__head">
                  <strong className={`cb-group__name ${BG_CLASS[g.id]}-text`}>{g.name}</strong>
                  <span className="cb-small">
                    <strong>{g.amount}</strong> {g.share} <Delta value={g.delta} />
                  </span>
                </div>
                <p className="cb-group__lines cb-small">
                  {g.lines.map((l) => (
                    <span key={l.name}>
                      {l.name} <strong>{l.share}</strong> <Delta value={l.delta} />
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          <aside className="cb-box cb-peak">
            <h3 className="cb-h4">
              <CalendarClock aria-hidden /> Next Peak Window
            </h3>
            <p className="cb-small">
              {peak.window}
              <br />
              {peak.text}
            </p>
            <h3 className="cb-h4">Cross-Sell Gaps</h3>
            <ul className="cb-bullets cb-small">
              {peak.crossSell.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <h3 className="cb-h4">Route-to-Market</h3>
            <ul className="cb-bullets cb-small">
              {peak.route.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="cb-block">
        <SectionTitle title="Pipeline Activity" meta="Sources: D365" />
        <div className="cb-grid cb-grid--pipeline">
          <div className="cb-stack">
            {pipelineStats.map((s) => (
              <Stat key={s.label} {...s} up />
            ))}
          </div>
          <div className="cb-box cb-pipeline">
            <Table
              aria-label="Top opportunities ranked by value"
              header={
                <HeaderRow>
                  <HeaderCell className="cb-col-wide">Top Opportunities (Ranked by Value)</HeaderCell>
                  <HeaderCell>Stage</HeaderCell>
                  <HeaderCell>Type</HeaderCell>
                  <HeaderCell>Value</HeaderCell>
                  <HeaderCell>Close Date</HeaderCell>
                </HeaderRow>
              }
            >
              {opportunities.map((o, i) => (
                <DataRow key={o.name} selectable={false} stripe={i % 2 ? 'inverse' : 'default'}>
                  <DataCell className="cb-col-wide">
                    <a className="cb-link" href="#/overview">
                      {o.name}
                    </a>
                  </DataCell>
                  <DataCell>{o.stage}</DataCell>
                  <DataCell>{o.type}</DataCell>
                  <DataCell>
                    {na(o.value)}
                    {o.remaining && (
                      <>
                        <br />
                        Rem. {o.remaining}
                      </>
                    )}
                  </DataCell>
                  <DataCell>{o.close}</DataCell>
                </DataRow>
              ))}
            </Table>
          </div>
        </div>
      </section>
    </Page>
  );
}

/* ── Page 3: Relationship intelligence ────────────────────────────── */

function Stars({ n }: { n: number }) {
  return (
    <span className={`cb-stars ${n >= 4 ? 'cb-stars--high' : 'cb-stars--low'}`} role="img" aria-label={`Relationship ${n} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={i < n ? 'is-on' : ''} />
      ))}
    </span>
  );
}

function Page3() {
  return (
    <Page n={3} label="Customer Brief">
      <section className="cb-block">
        <SectionTitle title="Relationship Intelligence" meta="Sources: D365" />
        <div className="cb-box cb-strength">
          <h3 className="cb-h4">
            <Sparkles className="cb-ai" aria-label="AI generated" /> Relationship Strength
          </h3>
          <p className="cb-small">{relationship.strength}</p>
          <h3 className="cb-h4">Suggested Actions</h3>
          <ul className="cb-bullets cb-small">
            {relationship.suggested.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <h3 className="cb-h4">Key Stakeholders</h3>
        <div className="cb-grid cb-grid--3">
          {stakeholders.map((s, i) => (
            <div key={i} className="cb-box cb-person">
              <div className="cb-person__head">
                <div className="cb-person__id">
                  <strong className="cb-person__name">{s.name}</strong>
                  <span className="cb-small">
                    {s.ai && <Sparkles className="cb-ai" aria-label="AI inferred" />} {s.title}
                  </span>
                  <Stars n={s.stars} />
                </div>
                <span className="cb-person__src" aria-label="Sources: CRM, Enrichment">
                  <Avatar initials="C" size="sm" />
                  <Avatar initials="E" size="sm" />
                </span>
              </div>
              <ul className="cb-person__contact cb-small">
                <li>
                  <Mail aria-hidden /> {na(s.email)}
                </li>
                <li>
                  <Phone aria-hidden /> {na(s.phone)}
                </li>
                <li>
                  <Linkedin aria-hidden /> {na(s.linkedin)}
                </li>
                <li>{na(s.interests)}</li>
                <li className="cb-label">Last Updated on {s.updated}</li>
              </ul>
            </div>
          ))}
        </div>
        <Note>
          Note: AI-optimized, verify before outreach. Ranked based on title seniority level. Top 6 are displayed, view more on
          the contacts page.
        </Note>
      </section>
    </Page>
  );
}

/* ── Page 4: Sources ──────────────────────────────────────────────── */

function Page4() {
  return (
    <Page n={4} label="Customer Brief">
      <section className="cb-block">
        <SectionTitle title="Sources" meta="Sort: A to Z" />
        <ol className="cb-sources">
          {sources.map((s) => (
            <li key={s.n}>
              <span className="cb-sources__n">[{s.n}]</span>
              <a className="cb-link" href="#/customer-brief" onClick={(e) => e.preventDefault()}>
                {s.org} — {s.title}
              </a>
              <span className="cb-label">{s.date}</span>
            </li>
          ))}
        </ol>
      </section>
    </Page>
  );
}

export function BriefPages() {
  return (
    <div className="cb-pages">
      <Page1 />
      <Page2 />
      <Page3 />
      <Page4 />
    </div>
  );
}
