import { useMemo, useState } from 'react';
import { FileSearch, ListFilter, Search } from 'lucide-react';
import { Button, Divider, HorizontalTabItem, HorizontalTabs, HorizontalTabsList, TextInput } from '@cake-admin/cakeand';
import { fmtDate, news as allNews, type NewsItem } from './data';
import { AiSummaryButton, AiSummaryPanel, SectionCard } from './parts';

type Tab = 'all' | 'market' | 'company';

type Props = {
  aiOpen: boolean;
  onAiOpenChange: (open: boolean) => void;
  /** Figma "no news" (14156:33512): render the empty state. */
  empty?: boolean;
};

/**
 * Figma "News" (10210:5774) with its AI summary (10210:7927) and empty state
 * (14156:33512). Gestures: 10210:9850 (Newest/Oldest sort), 14156:33611
 * (no data → drop tabs/search/sort; a tab with no data is disabled).
 */
export function NewsCard({ aiOpen, onAiOpenChange, empty }: Props) {
  const items: NewsItem[] = empty ? [] : allNews;
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);

  const counts = {
    all: items.length,
    market: items.filter((n) => n.kind === 'market').length,
    company: items.filter((n) => n.kind === 'company').length,
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((n) => tab === 'all' || n.kind === tab)
      .filter((n) => !s || `${n.title} ${n.summary} ${n.source}`.toLowerCase().includes(s))
      .sort((a, b) => (newestFirst ? b.published.localeCompare(a.published) : a.published.localeCompare(b.published)));
  }, [items, tab, q, newestFirst]);

  return (
    <SectionCard
      id="dt-news"
      className="dt-news"
      title="News"
      description="An optional brief description of the story this module tells and why it is useful."
      actions={<AiSummaryButton open={aiOpen} onOpen={() => onAiOpenChange(true)} />}
    >
      <div className="dt-news__scroll" tabIndex={0} aria-label="News list">
        {aiOpen && <AiSummaryPanel onClose={() => onAiOpenChange(false)} />}
        {items.length === 0 ? (
          <div className="dt-emptystate">
            <FileSearch aria-hidden className="dt-emptystate__icon" />
            <p className="dt-emptystate__title">No news yet</p>
            <p className="dt-emptystate__text">News for this account will appear here when available.</p>
          </div>
        ) : (
          <>
            <HorizontalTabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <HorizontalTabsList aria-label="News type">
                <HorizontalTabItem value="all">All</HorizontalTabItem>
                <HorizontalTabItem value="market" disabled={counts.market === 0}>
                  Market
                </HorizontalTabItem>
                <HorizontalTabItem value="company" disabled={counts.company === 0}>
                  Company
                </HorizontalTabItem>
              </HorizontalTabsList>
            </HorizontalTabs>
            <div className="dt-news__tools">
              <div className="dt-news__search">
                <TextInput
                  aria-label="Search for news"
                  placeholder="Search for news"
                  startIcon={<Search />}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                intent="secondary"
                size="sm"
                endIcon={<ListFilter className={newestFirst ? undefined : 'dt-flip'} />}
                onClick={() => setNewestFirst((v) => !v)}
              >
                {newestFirst ? 'Show Newest First' : 'Show Oldest First'}
              </Button>
            </div>
            {shown.length === 0 ? (
              <p className="dt-empty">No news matches “{q}”.</p>
            ) : (
              <ul className="dt-news__list">
                {shown.map((n, i) => (
                  <li key={n.id} className="dt-news__item">
                    <h3 className="dt-news__title">{n.title}</h3>
                    <p className="dt-news__summary">{n.summary}</p>
                    <p className="dt-sources">
                      Sources:{' '}
                      <a className="dt-link" href="#" onClick={(e) => e.preventDefault()}>
                        {n.source}
                      </a>{' '}
                      • Published {fmtDate(n.published).replace(/^(\d+) (\w+) /, '$1 $2, ')}
                    </p>
                    {i < shown.length - 1 && <Divider />}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </SectionCard>
  );
}
