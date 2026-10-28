# Customer Engage — Cake& prototype

A clickable prototype of the Customer Engage account workspace (Sales Sphere),
built from the Figma file **Customer Engage (Review)**, canvas "Sprint 7: E2E
Experience and UI Consistency". It uses Lenovo's **Cake&** design system
(`@cake-admin/cakeand`) with Vite, React and TypeScript. All data is mock data;
nothing connects to a backend.

## Run it

You need [Node.js](https://nodejs.org/) LTS (version 20 or newer), which
includes `npm`. No GitHub token, `.npmrc` or registry setup is needed: Cake&
installs from a public release URL.

```bash
git clone https://github.com/darroughLenovo/ce_contact.git
cd ce_contact
npm install
npm run dev
```

`npm run dev` starts the app at <http://localhost:5173> and opens it in your
browser. Stop it with `Ctrl+C`.

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Type-checks and builds a static site into `dist/` |
| `npm run preview` | Serves the `dist/` build locally to check it |
| `npm run cake:update` | Moves Cake& to its newest release (see below) |

The build in `dist/` is plain static files with hash-based routes (`#/contacts`),
so it can be hosted on any static web server with no extra configuration.

## What's in it

The top nav, side rail and account header are shared. Each Figma section is a
page:

| Page | URL | Highlights |
| --- | --- | --- |
| Overview | `#/overview` | Account summary, insights, contact intelligence, share of wallet |
| Account Details | `#/details` | Account info, news, IT landscape, purchase history, pipeline, orders, CX health, credit drawer |
| Contacts | `#/contacts` | Customer / Prospects / Inactive / Sales Team tabs, filters, contact drawer, add / edit / connect contact |
| Documents | `#/documents` | Grid and list, archive, upload with naming rules, rename, share |
| Notes | `#/notes` | Create, edit, delete, favourite, tags |
| Customer Brief | `#/customer-brief` | AI chat that generates a 4-page brief with print preview |
| Account Search | `#/account-search` | Account results and typeahead (also in the top nav) |
| Executive Brief | `#/executive-brief` | AI-assisted executive brief editor with version history |

Most variants can be opened directly with `?state=…`, for example
`#/contacts?state=add` or `#/overview?state=empty`. The full list of states and
the Figma node behind each screen is in
[`docs/design-map.md`](docs/design-map.md).

## Project layout

```
src/
  App.tsx              CakeProvider, toasts, and the page for the current route
  shell/               Top nav, side rail, account header, router, useToast()
  sections/<name>/     One folder per Figma section; entry is <Name>Page.tsx
  assets/              Shared images (logo, avatar)
docs/
  design-map.md        Figma → route map, deep links, and design-system gaps
  verification.md      What has and hasn't been verified
```

Each section loads on demand, so a broken section only breaks its own page.

## Working on it

Read [`AGENTS.md`](AGENTS.md) first; coding agents load it automatically. The
short version:

- Build from Cake& components, imported from `@cake-admin/cakeand`. The API is
  in `node_modules/@cake-admin/cakeand/types/`; the live docs are the
  [Cake& Storybook](https://cake.lenovo.com/storybook/).
- Use Cake& tokens for every colour, space, radius and type size. Never hardcode
  hex, px or font names.
- Where Cake& has no component, build from tokens and add the gap to
  `docs/design-map.md`.

## Updating Cake&

```bash
npm run cake:update
```

This resolves the newest release and pins its exact version. `npm update` and
`npm outdated` do nothing here, because the package installs from a release URL
rather than a registry.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `npm install` fails on Windows | An `&` in the folder path breaks npm's `.bin` shims. Clone into a folder without one. |
| Everything unstyled, every token an empty string | The Cake& stylesheet did not load. Check the `@cake-admin/cakeand/cakeand.css` import at the top of `src/main.tsx`. |
| Components render but ignore the theme | Two copies of `styled-components`. Check `npm ls styled-components`; `resolve.dedupe` in `vite.config.ts` should prevent it. |
| Port 5173 already in use | Vite picks the next free port and prints it in the terminal. |
| `npm error EINTEGRITY` | Delete `package-lock.json` and `node_modules`, then run `npm install` again. |

Use **npm**. pnpm and yarn are not tested here.
