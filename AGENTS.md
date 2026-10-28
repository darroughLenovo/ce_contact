# ce-contacts — agent instructions

This prototype builds UI with **Cake&**, Lenovo's design system. Everything
visual comes from the `@cake-admin/cakeand` package. Compose what is already
there; do not invent a parallel design system beside it.

## Before you write any UI

**The installed package is the source of truth.** Everything about a component's
API is in `node_modules/@cake-admin/cakeand/types/` — props, defaults, variants,
and which components exist at all. Read it, or let your editor autocomplete it.
Never guess a prop.

Token names come from the same place — this prototype's own stylesheet, which is
the only list that matches the version it pins:

```bash
grep -o -- '--[a-z0-9-]*:' node_modules/@cake-admin/cakeand/cakeand.css | tr -d ':' | sort -u
```

This prototype lives outside the ai-lab repo, but its rules still come from
there (`C:\Users\Darrough West\projects\ai-lab`, origin
`cake-admin/ai-lab`). One file in ai-lab covers what the package cannot:

| Read | For |
| --- | --- |
| `ai-lab/knowledge/components/<name>.cake.json` | When to reach for something else, accessibility the types do not enforce, and the mistakes the component invites |

A component missing from `knowledge/components/` has **not** been ruled out —
those records are hand-written judgment, not an inventory. Check the package and
the Storybook.

Storybook is canonical for anything still ambiguous:
<https://cake.lenovo.com/storybook/>

The build rules live in `ai-lab/skills/cake-prototyping/SKILL.md`; the audit
criteria in `ai-lab/skills/cake-design-check/SKILL.md`.

## Layout of this prototype

- `src/shell/` — top nav, side rail, account header, hash router, shared toasts
  (`useToast`). Every section uses these.
- `src/sections/<name>/` — one folder per Figma section; the entry is
  `<Name>Page.tsx`. App lazy-loads each, so a broken section only breaks its route.
- `docs/design-map.md` — Figma node → route map, `?state=` deep links, and gaps.

## Hard rules

1. **One import path.** `import { X } from '@cake-admin/cakeand'`. There are no
   deep paths — `@cake-admin/cakeand/Button` does not resolve.
2. **One `CakeProvider`.** Already mounted in `src/App.tsx`. Never add a second:
   it writes `data-theme` to `<html>`, and two of them fight over it.
3. **Never hardcode a color, spacing, radius, or type size.** Use
   `var(--color-…)`, `var(--space-…)`, `var(--radius-…)`, `var(--type-size-…)`.
4. **Token names are exact.** They map 1:1 from Figma variables. Do not guess by
   analogy — `--color-surfaces-canvas` exists, `--color-surfaces-background` does
   not, and the second one **fails silently as an empty string**. If you cannot
   find a token for what you need, say so; a missing token is a real finding, not
   a licence to write a hex value.
5. **Do not install another UI library.** No MUI, no Tailwind, no shadcn, no
   Chakra, no Bootstrap. If Cake& lacks something, compose it from Cake& parts,
   or build it with `styled-components` + `radix-ui` (both already dependencies)
   styled entirely with tokens.
6. **Icons come from `lucide-react`.** That is what Cake& itself uses.
7. **Keep `resolve.dedupe` in `vite.config.ts`.** Removing it lets a second copy
   of `styled-components` in, and Cake& components then render unstyled with no
   error at all.
8. **Keep the stylesheet import at the top of `src/main.tsx`.** It looks
   redundant because the package imports its own CSS, but it fixes cascade
   order: anything imported below it reliably overrides Cake& values.
9. **Theme changes touch two files.** `data-theme` on `<html>` in `index.html`
   and the `mode` passed to `CakeProvider` in `src/App.tsx` must agree, or the
   first paint flashes the wrong theme. Change both together.

## Portalled components

`Modal`, `Dropdown`, `SimpleTooltip`, `RichTooltip`, `Breadcrumb`,
`NumberDropdown` and `Pagination` render through a Radix portal into
`document.body`, outside the React tree. They are themed only because
`CakeProvider` puts `data-theme` on `<html>`. Do not pass `scope="subtree"`.

## Updating Cake&

From this folder:

```bash
npm run cake:update
```

A new Cake& version never reaches this prototype on its own — it pins one exact
version. `npm outdated` and `npm update` are silent here, because both compare
against a registry and this package installs from a release URL.

## Verify your work

```bash
npm run dev      # look at it in a browser
npm run build    # must exit 0 — typechecks and bundles
```

**A green build is not a verification.** Overflowing text, collapsed spacing and
wrong-coloured icons all compile perfectly. If you changed layout or styling,
look at the result before reporting success, and record what you checked in
`docs/verification.md`.
