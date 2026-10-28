# Design map

**Prototype:** ce-contacts (Customer Engage)
**Design system:** cake (@cake-admin/cakeand 4.2.4)
**Figma file:** Customer Engage (Review), key `Tyfv9iC2Jyh7KU7lZMZMIA`, canvas "Sprint 7: E2E Experience and UI Consistency" (8987:21936), section "9/23" (10210:2836)

Each section supports `?state=` deep links to its variants (see the section entry file).

## Screens

| Route | Figma nodes | Entry | Notes |
|-------|-------------|-------|-------|
| shell | Navbar 10210:15595, Account Header 10210:15607, Side Bar 10210:15608 | `src/shell/*` | Top nav uses the Account Search typeahead (10210:10326/10456/10502) |
| `#/overview` | 10210:4904, empty 10210:9869 | `sections/overview/OverviewPage.tsx` | `?state=empty` |
| `#/details` | 10210:5592, 10210:10264, 10210:10294, 10210:7927, 10210:8087, 13075:16856, 14572:18414, firm enrich 10210:20058/19862/20238, modal 10292:35645 | `sections/details/DetailsPage.tsx` | `?state=credit\|ai\|nonews\|edit\|modal\|review\|idg` |
| `#/customer-brief` | PIN 10210:11456, pages 10210:10905/11059/11172/20783 | `sections/customer-brief/CustomerBriefPage.tsx` | `?state=ready` |
| `#/account-search` | 10210:10524/10632/10714, typeahead 10210:10326/10456/10502 | `sections/account-search/AccountSearchPage.tsx` | `?q=`, `?ta=` |
| `#/contacts` | 10210:15165, 14630, 10312:48477, 14351, 14012, 14199, 14215:36896, 13742, 13511, 12754, 17531, 12167, 12584, 14373:62344, 12346, 12426, 16741, 16376, 17108, 15665, 16022, 11588, 11763, 11949 | `sections/contacts/ContactsPage.tsx` | `?state=grid\|filters\|prospects\|disqualify\|inactive\|drawer\|invalid\|suggestions\|hierarchy\|notes\|history\|add\|add-exists\|edit\|connect`, `&seller=non-na` |
| `#/documents` | 10210:2855, 3737, 3058, 3570, 3243, archived 3943, modal 20984, menus 20970/20976, naming 14195:36774 | `sections/documents/DocumentsPage.tsx` | `?view=list`, `?tab=archived`, `?modal=share\|archive\|upload` |
| `#/notes` | group 14373:62457 (62894, 62458, 62601, 62663, 62710, 63030, 63101, 62814) | `sections/notes/NotesPage.tsx` | `?state=add\|tags\|newtag\|view\|edit\|delete\|empty\|nomatch` |
| `#/executive-brief` | Desktop-2…8 10210:18526/18847/19011/19299/19155/19460/19602/19730/18685, versions 14376:68197, 10210:19861, 10210:20423, 14376:68003/68152/68165, naming 14158:35823 | `sections/executive-brief/ExecutiveBriefPage.tsx` | `?state=timeout\|no-plan` |

Not built: Stat Cards Row 10210:20993 (renders blank in Figma), Example/Regular 10210:34404 (table-header spec, not a screen). The Pilot (14005:21425) and Ramp (14227:37671) sections are later copies of the 9/23 frames and were used only as reference.

## Gaps

None of these has been filed in `reports/inbox/` yet (filing waits on the owner's go-ahead).

| Gap | Workaround | Escalation |
|-----|------------|------------|
| Side drawer (768px panel) | Token-styled Radix Dialog; built separately in contacts, details and notes | component-gap |
| Textarea / multi-line input | Native textarea with InputLabel, HelperString and TextInput tokens | component-gap |
| Anchored menu / popover trigger | Radix DropdownMenu/Popover wrapping MenuContainer | component-gap |
| Multi-select dropdown with chips; combobox | Composed from TextInput, Chip, MenuItem checkboxes, Popover | component-gap |
| Scored rating picker | Custom radiogroup (contacts) | component-gap |
| Destructive Button intent | Primary/secondary used for Delete, Archive, Deactivate, Disqualify | component-gap |
| AI gradient (Ask AI, AI panels) | Primary fill, or `--color-info-info-overlay` / `--color-badge-indigo-light` | token-gap |
| 24px heading size; sub-12px document type | Nearest `--type-size-*` | token-gap |
| Dark scrim (Figma black 50%) | `--color-overlay-scrim` (white wash) | token-gap / docs |
| Card radius 24px vs Figma 4–12px | Kept Cake& Card | docs-problem (Figma vs Storybook) |
| Avatar smallest 32px vs Figma 24px stack | Kept 32px; stack is cramped | component-gap |
| Dropdown has no aria-label prop | Self-describing option labels | component-bug |
| SimpleTooltip can't wrap an interactive trigger | aria-label on the control instead | component-bug |
| ModalFooter shows "Don't remind me" by default | Empty `checkbox` slot | component-bug |
| Accordion / Notification max-width caps | CSS override in contacts and overview | component-bug |
| DataRow centres cells (ragged multi-line rows) | `alignSelf: stretch` per cell | component-bug |
| Table keeps a checkbox column with `selectable={false}` | Widened name column | component-bug |
