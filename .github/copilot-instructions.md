## Overview

This is a small Create React App demo that visualizes the Bully Election algorithm.
Primary entry: `src/index.js` → renders `src/BullyElectionDemo.jsx`.

Keep answers tightly focused: this repo is a UI demo, not a backend/service mesh. Changes usually touch components in `src/` and styling in `src/index.css` + Tailwind config.

## Quick dev commands

- Install deps: `npm install`
- Run dev server: `npm start` (CRA: opens at http://localhost:3000)
- Run tests: `npm test` (CRA test runner)
- Build for production: `npm run build`

Note: Tailwind/PostCSS are configured via `tailwind.config.js` and `postcss.config.js` (devDependencies in `package.json`). No extra build steps are required beyond CRA scripts.

## Architecture & important files

- `src/BullyElectionDemo.jsx` — the entire app lives here: state, animation (Framer Motion), and the core election logic.
  - Key function: `stepsForElection(starterId, nodes)` — returns an ordered array of message objects with shapes like `{ type: 'send'|'reply'|'announce', from, to, label, alt? }`. Use this to reason about message flow and to write tests or change semantics.
  - UI constants: `NODE_SIZE`, `initialNodes`. Layout is computed in a local `layout` useMemo and is a simple horizontal row.
  - Visual primitives: the `Arrow` component is in-file and renders SVG + animated token when `active`.

- `src/ui.js` — small local design system (Card, Button, etc.). Use these for consistent styling rather than adding new global classes.

- `src/index.css` and `tailwind.config.js` — Tailwind is the styling system. Global visual defaults are applied in `index.css` via `@apply`.

## Patterns & conventions (project-specific)

- Minimal local component library: prefer `src/ui.js` components for controls and cards. They expect Tailwind classes and simple props like `variant` for `Button`.
- All app logic and demo state are colocated in `BullyElectionDemo.jsx`. When modifying logic, look for these areas:
  - state hooks at the top (`nodes`, `coordinator`, `timeline`, `starterId`, etc.)
  - `useEffect` rebuilds the `timeline` when `starterId` or `nodes` change
  - `visibleMsgs = timeline.slice(0, stepIndex)` controls rendering progression
- Message rendering uses `m.type` values: `send`, `reply`, `announce`. Keep those exact strings when producing or consuming messages.
- Animation uses `framer-motion` (see `motion.div` usage). When adding new animations mirror the current `initial`/`animate`/`transition` patterns.

## Editing and testing tips

- Small UI changes: edit `src/ui.js` or component classNames in `BullyElectionDemo.jsx` and verify in `npm start`.
- Logic changes: update `stepsForElection` inside `BullyElectionDemo.jsx`. The function is pure and deterministic for given inputs; run the app or add unit tests by extracting it to a utility file if needed.
  - The file currently contains a basic console `useEffect` with `console.assert` checks. You can use these assertions as quick sanity checks during refactors.
- To add unit tests: create a util file (e.g., `src/lib/election.js`) that exports `stepsForElection` and write Jest tests (CRA includes test runner). Keep tests focused on message shapes and ordering (sends → replies → announce).

## Integration & dependencies

- Frontend-only demo: no backend integrations.
- Key runtime deps: `react`, `react-dom`, `framer-motion`. Dev-time: `tailwindcss`, `postcss`, `autoprefixer`.

## When editing, prefer these patterns

- Keep UI primitives in `src/ui.js` for consistency.
- Preserve existing message `type` strings and `label` semantics when changing election behavior — other code depends on them for rendering and label placement.
- If making layout changes, adjust `NODE_SIZE` and the `layout` calculation together so positions and arrow paths remain correct.

## Example snippets to reference

- Determine timeline for starter 3: `stepsForElection(3, initialNodes)` — returns `send` messages to higher IDs, `reply` messages back, and a final `announce` from the highest alive ID.
- Toggle node up/down by toggling `nodes` state (see `toggleNode(id)` handler).

If anything in this summary is unclear or you'd like more detail (for example, a short test file for `stepsForElection` or extraction of election logic to `src/lib/`), tell me which part and I'll update this file.
