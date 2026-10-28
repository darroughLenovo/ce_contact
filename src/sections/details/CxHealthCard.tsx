import { useState } from 'react';
import { Frown, Info, Smile } from 'lucide-react';
import { Dropdown, RichTooltip } from '@cake-admin/cakeand';
import { cxScores, ticketsByStatus, voiceOfCustomer, type BG } from './data';
import { CxScoresChart, LegendItem, StatusBarChart } from './charts';
import { AiSummaryButton, AiSummaryPanel, BgSwitch, SectionCard, Sources, ViewDetails, useAiSummary } from './parts';
import { TIME_OPTIONS } from './PurchaseHistoryCard';

const OSAT = { key: 'OSAT', label: 'OSAT', color: 'var(--color-badge-blue)' };
const EODB = { key: 'EoDB', label: 'EoDB', color: 'var(--color-badge-green)' };
const NPS = { key: 'NPS', label: 'NPS', color: 'var(--color-badge-orange)' };
const RESOLVED = { key: 'resolved', label: 'Resolved', color: 'var(--color-disabled-disabled-inverse)' };
const OPEN = { key: 'open', label: 'Open', color: 'var(--color-badge-blue)' };

/** Figma "CX Health 1 BG" (14373:61559). */
export function CxHealthCard({ onViewDetails }: { onViewDetails: (what: string) => void }) {
  const ai = useAiSummary();
  const [time, setTime] = useState('8');
  const [bg, setBg] = useState<'All' | BG>('All');
  const n = Number(time);
  // A single BG shows a scaled share of the account totals (mock).
  const scale = bg === 'All' ? 1 : bg === 'IDG' ? 0.6 : 0.4;
  const tickets = ticketsByStatus.slice(-n).map((t) => ({ ...t, resolved: +(t.resolved * scale).toFixed(1), open: +(t.open * scale).toFixed(1) }));
  const crit = tickets.map((t) => ({ ...t }));

  return (
    <SectionCard
      id="dt-cx"
      title="CX Health"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={
        <>
          <div className="dt-time">
            <Dropdown options={TIME_OPTIONS} value={time} onValueChange={setTime} name="cx-time" />
          </div>
          <BgSwitch label="Business group" value={bg} onChange={setBg} bgs={['IDG', 'ISG']} />
          <AiSummaryButton open={ai.open} onOpen={ai.onOpen} />
        </>
      }
      sources={<Sources label="CEA" prefix="Sources:" suffix="Generated: 05 Dec, 2026" />}
    >
      {ai.open && <AiSummaryPanel onClose={ai.onClose} />}
      <div className="dt-cx-grid">
        <section className="dt-panel dt-panel--outline" aria-labelledby="dt-cx-scores">
          <div className="dt-panel__head">
            <h3 className="dt-panel__title dt-inline" id="dt-cx-scores">
              CX Scores
              <RichTooltip
                triggerAriaLabel="About CX scores"
                trigger={
                  <span className="dt-infotip">
                    <Info aria-hidden />
                  </span>
                }
                title="CX score definitions"
                showFooter={false}
                side="top"
                align="start"
                width="calc(var(--space-1000) * 5)"
              >
                <dl className="dt-defs">
                  <dt>Satisfaction (OSAT)</dt>
                  <dd>How satisfied overall is customer with their experience and ability to complete their goal?</dd>
                  <dt>Emotion (NPS)</dt>
                  <dd>How customer felt about the experience?</dd>
                  <dt>Effort (EoDB)</dt>
                  <dd>How difficult or easy it was for customer to complete task?</dd>
                  <dt>Source</dt>
                  <dd>Multiple IDG &amp; ISG survey responses.</dd>
                </dl>
              </RichTooltip>
            </h3>
            <ViewDetails onClick={() => onViewDetails('CX Scores')} />
          </div>
          <div className="dt-panel dt-chartpanel">
            <div className="dt-legends">
              <span className="dt-inline">
                <LegendItem color={OSAT.color} label="OSAT" />
                <LegendItem color={EODB.color} label="EoDB" />
              </span>
              <LegendItem color={NPS.color} label="NPS" />
            </div>
            <CxScoresChart data={cxScores.slice(-n)} left={[OSAT, EODB]} right={NPS} />
          </div>
        </section>

        <section className="dt-panel dt-panel--outline" aria-labelledby="dt-voc">
          <div>
            <h3 className="dt-panel__title" id="dt-voc">
              Voice of Customer
            </h3>
            <p className="dt-card__desc">Based on multiple responses across Lenovo touchpoint collected over the last 4 quarters.</p>
          </div>
          <div className="dt-voc">
            <VocPanel tone="good" title="Keep Up: Top-rated" data={voiceOfCustomer.top} />
            <VocPanel tone="bad" title="Attention: Bottom-rated" data={voiceOfCustomer.bottom} />
          </div>
        </section>

        <StatusPanel title="Service Tickets By Status" axisTitle="Number of Tickets" data={tickets} onViewDetails={onViewDetails} />
        <StatusPanel title="CritSits By Status" axisTitle="Number of CritSits" data={crit} onViewDetails={onViewDetails} />
      </div>
    </SectionCard>
  );
}

function VocPanel({ tone, title, data }: { tone: 'good' | 'bad'; title: string; data: { repeated: string; recent: string[] } }) {
  return (
    <div className={`dt-vocpanel dt-vocpanel--${tone}`}>
      <h4 className="dt-vocpanel__head">
        {tone === 'good' ? <Smile aria-hidden /> : <Frown aria-hidden />}
        {title}
      </h4>
      <div className="dt-vocpanel__body">
        <div className="dt-vocpanel__block">
          <span className="dt-vocpanel__label">Repeated Themes</span>
          <p>{data.repeated}</p>
        </div>
        <div className="dt-vocpanel__block">
          <span className="dt-vocpanel__label">Recent Themes</span>
          <dl className="dt-vocpanel__list">
            {data.recent.map((r, i) => (
              <div key={i}>
                <dt>{r}</dt>
                <dd>OLS: FY26Q4</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  axisTitle,
  data,
  onViewDetails,
}: {
  title: string;
  axisTitle: string;
  data: Record<string, number | string>[];
  onViewDetails: (w: string) => void;
}) {
  return (
    <section className="dt-panel dt-panel--outline" aria-label={title}>
      <div className="dt-panel__head">
        <h3 className="dt-panel__title">{title}</h3>
        <ViewDetails onClick={() => onViewDetails(title)} />
      </div>
      <div className="dt-panel dt-chartpanel">
        <div className="dt-legends">
          <span className="dt-chartpanel__title">{axisTitle}</span>
          <span className="dt-inline dt-wrap">
            <span className="dt-chartpanel__total">T12M Total: 505,656</span>
            <LegendItem color={RESOLVED.color} label="Resolved" />
            <LegendItem color={OPEN.color} label="Open" />
          </span>
        </div>
        <StatusBarChart data={data} series={[RESOLVED, OPEN]} label={`${title}: resolved and open by quarter`} />
      </div>
    </section>
  );
}
