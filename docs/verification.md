# Verification

**Prototype:** ce-contacts
**Platform:** web
**Last verified:** 2026-10-28 (partial)
**Verifier:** Claude Code (automated screenshots), pending human review

## Checklist

### Build

- [x] Dev server starts (`npm run dev`)
- [x] Production build succeeds (`npm run build`, includes `tsc --noEmit`)

### Interaction

- [x] Primary navigation and flows work: route changes and every `?state=` variant were screenshot in headless Chrome at 1440 (most also at 1024). Executive Brief's flow was clicked through over the DevTools protocol.
- [ ] Hover, focus-visible, open menus, toasts: not captured; the headless screenshots only show a page as it first loads
- [ ] Keyboard: tab order, Escape closes overlays, focus return. Implemented but not exercised

### Accessibility

- [x] Labels on icon-only controls (IconButton `label`)
- [ ] No color-only status meaning: spot-check pending
- [x] Visible focus indicators (Cake& defaults kept)
- [ ] WCAG 2.1 AA contrast spot-check pending

### Design fidelity

- [x] Figma nodes in [`design-map.md`](./design-map.md) are implemented
- [x] Tokens only: scan finds no hex, px, rem or font literals outside the screen-reader-only pattern (recharts sizing numbers excepted)
- [ ] Side-by-side visual parity review with Figma by a human

## Issues found

| Severity | Issue | Status |
|----------|-------|--------|
| minor | Three separate drawer implementations (contacts, details, notes) should be consolidated | open |
| minor | Account Search page repeats the typeahead now that it lives in the top nav | open |
| minor | Avatar stack in Notes is cramped (32px minimum) | open |
