// Slide renderings for the Executive Brief canvas (Figma "Component 11", 10210:18596).
// The slide is PowerPoint content, not app chrome — it is drawn with tokens only.
import { Badge } from '@cake-admin/cakeand';
import lenovoLogo from './assets/lenovo-logo.png';
import { ACCOUNT_OWNER, CREATED_DATE, TEMPLATE_SLIDES, type Attendee } from './data';

export type AttendeeNotes = Record<string, { bio: string; insights: string }>;

export type Slide =
  | { id: string; kind: 'image'; img: keyof typeof TEMPLATE_SLIDES; title: string }
  | { id: string; kind: 'facts'; title: string }
  | { id: string; kind: 'attendees'; title: string; attendees: Attendee[] }
  | { id: string; kind: 'list'; title: string; lists: ('followUps' | 'outcomes')[] };

type Props = {
  slide: Slide;
  editing: boolean;
  notes: AttendeeNotes;
  onNoteChange: (id: string, field: 'bio' | 'insights', value: string) => void;
  lists: { followUps: string[]; outcomes: string[] };
  onListChange: (key: 'followUps' | 'outcomes', items: string[]) => void;
};

const LIST_TITLES = { followUps: 'Follow-up Actions', outcomes: 'Desired Outcomes' } as const;
const MAX = 500;

function Footer() {
  return (
    <footer className="eb-slide__footer">
      <span className="eb-slide__footer-left">
        <img className="eb-slide__logo" src={lenovoLogo} alt="Lenovo" />
        2026 Lenovo Internal. All rights reserved.
      </span>
      <span>
        Lenovo Account Owner: {ACCOUNT_OWNER} · Created Date: {CREATED_DATE}
      </span>
    </footer>
  );
}

function EditableText({
  label,
  value,
  placeholder,
  editing,
  emptyText,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  emptyText: string;
  onChange: (v: string) => void;
}) {
  if (!editing) {
    return value ? <p className="eb-slide__text">{value}</p> : <p className="eb-slide__text eb-slide__text--empty">{emptyText}</p>;
  }
  return (
    <textarea
      className="eb-slide__field"
      aria-label={label}
      placeholder={placeholder}
      maxLength={MAX}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SlideView({ slide, editing, notes, onNoteChange, lists, onListChange }: Props) {
  if (slide.kind === 'image') {
    const t = TEMPLATE_SLIDES[slide.img];
    return (
      <div className="eb-slide eb-slide--image">
        <img src={t.src} alt={t.alt} />
      </div>
    );
  }

  if (slide.kind === 'facts') {
    return (
      <article className="eb-slide" aria-label={slide.title}>
        <div className="eb-slide__body">
          <section className="eb-facts">
            <h3 className="eb-facts__label">Company Facts &amp; Figures</h3>
            <div className="eb-facts__content">
              <div>
                <p className="eb-slide__strong">Customer Perspectives</p>
                <p className="eb-slide__text">
                  DSV views itself as a key player in global logistics, dedicated to sustainable growth. Their values emphasize
                  customer focus, high performance, and collaboration.
                </p>
              </div>
              <dl className="eb-facts__grid">
                {[
                  ['Industry', 'Engineering & Architecture'],
                  ['Annual Earning', 'USD $123M'],
                  ['RAD', 'Development - Small'],
                  ['Location', 'Buffalo, NY - Northeastern'],
                  ['Employee Size', '1234'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="eb-slide__strong">{k}</dt>
                    <dd className="eb-slide__text">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <div className="eb-slide__cols">
            <section className="eb-panel eb-panel--purple">
              <h3 className="eb-panel__head">Company Insights</h3>
              <div className="eb-panel__body">
                <p className="eb-slide__strong">Strategic Goals</p>
                <p className="eb-slide__text">
                  DSV's key objectives focus on expanding market share, optimizing operational efficiency, and integrating
                  technology-driven so meet customer demand for fast, sustainable, and transparent logistics services. Top
                  priorities are:
                </p>
                <ol className="eb-slide__list">
                  <li>Digital Transformation and Automation</li>
                  <li>Sustainability and Green Logistics Initiatives</li>
                  <li>Expansion through Acquisitions and strategic Partnerships</li>
                  <li>Enhancing Supply Chain Visibility and Customer Experience</li>
                  <li>Improving Operational Efficiency and Cost</li>
                </ol>
                <p className="eb-slide__strong">Technology Initiatives</p>
                <ol className="eb-slide__list">
                  <li>Implementation of AI and Machine Learning for Predictive Analytics</li>
                  <li>Automation of Warehouse and supply chain operations</li>
                  <li>Rollout of IoT Devices for Real-time Tracking and Monitoring</li>
                  <li>Cloud Migration and IT Infrastructure Modernization</li>
                  <li>Development of Blockchain Solutions for Secure and Transparent Transactions</li>
                </ol>
                <p className="eb-slide__strong">Market Intelligence for Customer’s Industry</p>
                <p className="eb-slide__text">Maintaining Top Quartile Performance with an Intense Focus on our Vectors of Success:</p>
                <ol className="eb-slide__list">
                  <li>Sustaining a deep underwriting culture</li>
                  <li>Optimizing distribution engagement</li>
                  <li>Attracting, developing &amp; retaining top talent</li>
                  <li>Institutionalizing deep specialization</li>
                </ol>
              </div>
            </section>
            <section className="eb-panel eb-panel--blue">
              <h3 className="eb-panel__head">Relationship Summary</h3>
              <div className="eb-panel__body">
                <p className="eb-slide__strong">Lenovo Relation Summary</p>
                <p className="eb-slide__text">
                  Lenovo has a great relationship with Day, according to their Deputy CIO a true partnership. Great relationship
                  with senior management including Vice president, Senior Directors and more. Very positive towards Lenovo, and
                  happy to look our way for new opportunities.
                </p>
                <p className="eb-slide__strong">Lenovo Growth Priorities</p>
                <p className="eb-slide__text">
                  DSV investment freeze due to their acquisition strategy, is coming to an end, and normal investments
                  operations are planned for 2025.
                </p>
                <p className="eb-slide__text">
                  One Lenovo incentive part of contract extension negotiations to expand overall business with Day to 20-24+
                  MusD, also in case obscener acquisition.
                </p>
                <p className="eb-slide__text">Grow in IDG with AI enabled clients, exchange Wyse clients to fat clients.</p>
                <p className="eb-slide__text">Grow in SSG with advanced services (Iaas, Daas), Das, LDI+, security.</p>
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </article>
    );
  }

  if (slide.kind === 'attendees') {
    return (
      <article className="eb-slide" aria-label={slide.title}>
        <div className="eb-slide__body eb-slide__cols eb-slide__cols--fill">
          {slide.attendees.map((a, i) => {
            const n = notes[a.id] ?? { bio: '', insights: '' };
            return (
              <section key={a.id} className={`eb-panel ${i % 2 ? 'eb-panel--blue' : 'eb-panel--purple'}`}>
                <header className="eb-panel__head eb-contact">
                  <div className="eb-contact__id">
                    <h3 className="eb-contact__name">{a.name}</h3>
                    <Badge color="secondary" dot={false}>
                      {a.role}
                    </Badge>
                  </div>
                  <dl className="eb-contact__meta">
                    <div>
                      <dt>Job Title:</dt> <dd>{a.title}</dd>
                    </div>
                    <div>
                      <dt>Seniority:</dt> <dd>{a.seniority}</dd>
                    </div>
                    <div>
                      <dt>Relationship Strength:</dt> <dd>{a.relationship}</dd>
                    </div>
                    <div>
                      <dt>Email:</dt> <dd>{a.email}</dd>
                    </div>
                    <div>
                      <dt>Phone:</dt> <dd>{a.phone || 'NA'}</dd>
                    </div>
                  </dl>
                </header>
                <div className="eb-panel__body eb-panel__body--grow">
                  <p className="eb-slide__strong">Bio</p>
                  <EditableText
                    label={`Bio for ${a.name}`}
                    value={n.bio}
                    editing={editing}
                    placeholder="Click here to add a brief bio (up to 500 characters)"
                    emptyText="Not available."
                    onChange={(v) => onNoteChange(a.id, 'bio', v)}
                  />
                  <p className="eb-slide__strong">Personal Insights</p>
                  <EditableText
                    label={`Personal insights for ${a.name}`}
                    value={n.insights}
                    editing={editing}
                    placeholder="Enter personal insights, e.g., Family, Hobbies, Pastimes (up to 500 characters)"
                    emptyText="Not available."
                    onChange={(v) => onNoteChange(a.id, 'insights', v)}
                  />
                </div>
              </section>
            );
          })}
        </div>
        <Footer />
      </article>
    );
  }

  return (
    <article className="eb-slide" aria-label={slide.title}>
      <div className="eb-slide__body">
        {slide.lists.map((key) => (
          <section key={key} className="eb-listblock">
            <h3 className="eb-slide__title">{LIST_TITLES[key]}</h3>
            {editing ? (
              <textarea
                className="eb-slide__field eb-slide__field--list"
                aria-label={`${LIST_TITLES[key]}, one per line`}
                value={lists[key].join('\n')}
                onChange={(e) => onListChange(key, e.target.value.split('\n'))}
              />
            ) : (
              <ul className="eb-slide__list eb-slide__list--bullets">
                {lists[key].filter(Boolean).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <Footer />
    </article>
  );
}
