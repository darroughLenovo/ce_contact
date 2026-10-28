import { Fragment } from 'react';
import { terms } from './accounts';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Bolds every part of `text` that matches a word of the query (Figma 10210:10326 / 10632). */
export function Highlight({ text, query }: { text: string; query: string }) {
  const words = terms(query);
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map(escape).join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** True when the query names this field ("Kroger ISG" bolds the ISG label). */
export const queriesField = (query: string, field: string) => terms(query).includes(field.toLowerCase());
