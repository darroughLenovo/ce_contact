import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { Accordion, AccordionItem, Badge, Button, Card, Chip, Divider, Scrollbar } from '@cake-admin/cakeand';
import { navigate } from '../../shell/router';
import type { Insight, OverviewData } from './data';
import { CardHeader, EmptyState, MetricView } from './parts';

/* ── Left column: Account Summary + Account Insights (Figma "Ai Summary" 10210:4907) ── */

export function AccountSummaryCard({ data }: { data: OverviewData }) {
  return (
    <Card className="ov-card" role="region" aria-labelledby="ov-summary-h">
      <div className="ov-card__body">
        <header className="ov-head">
          <div className="ov-head__row">
            <h2 id="ov-summary-h" className="ov-h2">
              Account Summary
            </h2>
            <Button size="sm" variant="ghost" endIcon={<ChevronRight />} onClick={() => navigate('details')}>
              View Account Info
            </Button>
          </div>
          {data.summarySubtitle && <p className="ov-subtitle">{data.summarySubtitle}</p>}
        </header>

        <section className="ov-panel ov-panel--roomy" aria-label="Firmographics">
          <Accordion type="single" collapsible defaultValue="who" className="ov-who">
            <AccordionItem value="who" title={`Who is ${data.accountName}?`} icon={<Sparkles />}>
              <p className="ov-body1">{data.whoIs}</p>
            </AccordionItem>
          </Accordion>

          <div className="ov-tags">
            {data.tags.map((t) => (
              <Chip key={t} size="sm" type="secondary">
                {t}
              </Chip>
            ))}
          </div>

          <div className="ov-metrics">
            {data.metrics.map((m) => (
              <MetricView key={m.label} m={m} />
            ))}
          </div>

          <p className="ov-caption ov-muted">{data.summarySource}</p>
        </section>

        <section className="ov-panel ov-panel--roomy ov-insights" aria-labelledby="ov-insights-h">
          <CardHeader
            title="Account Insights"
            id="ov-insights-h"
            level="h3"
            subtitle="AI-generated observations and trends for this account."
          />
          {data.insights.length === 0 ? (
            <EmptyState
              title="No account insights yet"
              hint="Insights will appear here automatically if any available."
            />
          ) : (
            <Scrollbar maxHeight="calc(var(--space-1000) * 7)">
              <ul className="ov-insight-list">
                {data.insights.map((ins, i) => (
                  <Fragment key={ins.id}>
                    <InsightRow ins={ins} />
                    {i < data.insights.length - 1 && <Divider weight="weak" />}
                  </Fragment>
                ))}
              </ul>
            </Scrollbar>
          )}
        </section>
      </div>
    </Card>
  );
}

function InsightRow({ ins }: { ins: Insight }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const srcId = `${ins.id}-sources`;

  return (
    <li className="ov-insight">
      <div className="ov-insight__row">
        <p className="ov-insight__text">
          {ins.text}
          {ins.link && (
            <>
              <a className="ov-link" href="#/details">
                {ins.link.label}
                <ExternalLink className="ov-inline-icon" aria-hidden />
              </a>
              {ins.link.after}
            </>
          )}
        </p>
        <div className="ov-insight__action">
          {done ? (
            <Badge color="green" tone="subtle" role="status">
              Task created
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              endIcon={ins.action.external ? <ExternalLink /> : undefined}
              onClick={() => (ins.action.kind === 'task' ? setDone(true) : navigate('details'))}
            >
              {ins.action.label}
            </Button>
          )}
        </div>
      </div>
      <div className="ov-insight__meta">
        <span>Sources:</span>
        <Button
          size="xs"
          variant="ghost"
          endIcon={open ? <ChevronUp /> : <ChevronDown />}
          aria-expanded={open}
          aria-controls={srcId}
          onClick={() => setOpen((o) => !o)}
        >
          {ins.sources.length} Sources
        </Button>
        <span>• Generated: {ins.generated}</span>
      </div>
      {open && (
        <div id={srcId} className="ov-tags">
          {ins.sources.map((s) => (
            <Badge key={s} color="blue" tone="subtle" dot={false}>
              {s}
            </Badge>
          ))}
        </div>
      )}
    </li>
  );
}

/* ── Account Actions (Figma "Top priority alerts" 10210:5106) ── */

export function AccountActionsCard({ data }: { data: OverviewData }) {
  return (
    <Card className="ov-card" role="region" aria-labelledby="ov-actions-h">
      <div className="ov-card__body">
        <header className="ov-head">
          <h2 id="ov-actions-h" className="ov-h2">
            Account Actions
          </h2>
          <p className="ov-subtitle">Recommended next steps to advance this account.</p>
        </header>
        {data.actions.length === 0 ? (
          <EmptyState title="No account actions right now" hint="Account actions will appear here if any available." />
        ) : (
          <ul className="ov-actions">
            {data.actions.map((a, i) => (
              <li key={a.id}>
                <button type="button" className="ov-action" onClick={() => navigate('details')}>
                  <span className="ov-action__count" aria-label={`${a.count} items`}>
                    {a.count}
                  </span>
                  <span className="ov-action__text">
                    <span className="ov-action__title">{a.title}</span>
                    <span className="ov-caption">{a.detail}</span>
                  </span>
                  <ChevronRight className="ov-action__chev" aria-hidden />
                </button>
                {i < data.actions.length - 1 && <Divider weight="weak" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
