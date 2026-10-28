import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Lock } from 'lucide-react';
import { Accordion, AccordionItem, Button, Card } from '@cake-admin/cakeand';
import { RATING_CATEGORIES, ratingLabel, ratingScore, type Ratings } from './data';
import { RatingPicker, Stars, toneFor } from './parts';

/** Score + stars + label strip (drawer "RELATIONSHIP STRENGTH", 10210:12754). */
export function StrengthSummary({ ratings, end }: { ratings: Ratings; end?: React.ReactNode }) {
  const score = ratingScore(ratings);
  return (
    <div className="ct-strength">
      <span className={`ct-strength__score ct-tone--${toneFor(Math.round(score))}`}>{score.toFixed(1)}</span>
      <Stars value={score} size="lg" />
      <span className={score ? 'ct-strength__label' : 'ct-strength__label ct-na'}>{ratingLabel(score)}</span>
      {end && <span className="ct-strength__end">{end}</span>}
    </div>
  );
}

/** Read-only view with "View Details" expanding the category cards. */
export function StrengthView({ ratings, meta }: { ratings: Ratings; meta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="ct-sec" aria-labelledby="ct-rs-h">
      <h3 id="ct-rs-h" className="ct-overline">
        Relationship Strength
      </h3>
      <StrengthSummary
        ratings={ratings}
        end={
          <Button size="sm" variant="ghost" underline={false} endIcon={open ? <ChevronUp /> : <ChevronDown />} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            View Details
          </Button>
        }
      />
      {open && (
        <ul className="ct-rs-list">
          {RATING_CATEGORIES.map((c) => {
            const v = ratings[c.key];
            const text = v ? c.levels[v - 1] : 'N/A';
            return (
              <li key={c.key}>
                <Card>
                  <div className="ct-rs-item">
                    <span>
                      <strong>{c.label}:</strong>{' '}
                      <span className={`ct-tone-text--${v ? toneFor(v) : 'none'}`}>{text}</span>
                    </span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <p className="ct-caption">{meta}</p>
    </section>
  );
}

/** Editable assessment (Add Contact 10210:16741 / 10210:16376). */
export function StrengthEdit({ ratings, onChange }: { ratings: Ratings; onChange: (r: Ratings) => void }) {
  return (
    <section className="ct-sec" aria-labelledby="ct-rse-h">
      <h3 id="ct-rse-h" className="ct-overline">
        Relationship Strength
      </h3>
      <StrengthSummary ratings={ratings} />
      <p className="ct-note">
        <Info aria-hidden /> Rate all categories to save your assessment.
      </p>
      <Accordion type="multiple" defaultValue={RATING_CATEGORIES.map((c) => c.key)} className="ct-rs-acc">
        {RATING_CATEGORIES.map((c) => (
          <AccordionItem key={c.key} value={c.key} title={c.label}>
            <RatingPicker label={c.label} levels={c.levels} value={ratings[c.key]} onChange={(v) => onChange({ ...ratings, [c.key]: v })} />
          </AccordionItem>
        ))}
      </Accordion>
      <p className="ct-note ct-note--center">
        <Lock aria-hidden /> All ratings are required to enable save
      </p>
    </section>
  );
}
