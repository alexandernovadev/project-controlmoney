# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Platform-specific start
npx expo start --android
npx expo start --ios
npx expo start --web

# Lint
npx expo lint

# EAS builds
eas build --profile development
eas build --profile preview
eas build --profile production
```

There is no test suite configured.

## Architecture Overview

**Control Money** is a personal finance tracking app (React Native + Expo) for logging income and expenses. It is 100% dark mode and uses Firebase as its sole backend.

### Routing

Expo Router (file-based). Protected routes live under `app/(home)/`. The root `app/_layout.tsx` reads `AuthContext` and redirects unauthenticated users to `/login`.

```
app/
├── _layout.tsx         # Root stack: auth guard + login/home routing
├── login.tsx
└── (home)/
    ├── _layout.tsx     # Bottom tabs (Home, Income, Expenses, Config)
    ├── index.tsx       # Main dashboard with stats/reports
    ├── (income)/
    ├── (expenses)/
    └── (config)/
```

### State & Data

- **Auth state:** `context/auth.tsx` — a React Context that wraps Firebase Auth `onAuthStateChanged`. Use `useAuth()` to access the current user.
- **Remote data:** No global store. Screens subscribe directly to Firestore via `onSnapshot` for real-time updates. All collections are scoped to `users/{userId}/*`.
- **Forms:** React Hook Form + Zod validation throughout.

### Firebase Collections (`users/{userId}/`)

| Collection | Purpose |
|---|---|
| `transactions/{id}` | Income and expense records |
| `categories/{id}` | Income/expense categories (user-defined) |
| `income-payment-methods/{id}` | Payment method labels for income |

CRUD helpers live in `lib/firebase/` (one file per collection). Platform-specific Firebase auth persistence is in `lib/firebase/config.native.ts` vs `lib/firebase/config.ts`.

### Data Models (`lib/models/`)

- **Transaction** — shared fields: `id, userId, amount, type ("income"|"expense"), description, date, categoryId`; expense extras: `store, brand, quantity, unit, unitPrice, rating, comment`; income extras: `source, paymentMethodId`
- **Category** — `id, userId, name, type, icon, color, order`
- **IncomePaymentMethod** — `id, userId, name`
- **Unit** — enum of measure units (kg, L, unidad, etc.)

### Theme (`lib/theme/`)

Dark-only palette. Import from `lib/theme` for colors, typography, and spacing constants. Never use hardcoded color values — reference `lib/theme/colors.ts`. Brand accent: `#0A84FF`.

### UI Components (`components/ui/`)

Reusable primitives: `Button`, `Input`, `AmountInput`, `DateInput`, `Select`, `SelectModal`, `Card`, `Badge`, `ListItem`, `Divider`, `FilterModal`, `ExpenseFilterModal`. Prefer these over building new primitives.

`IconSymbol` maps SF Symbols (iOS) to MaterialIcons (Android/web) — use it for all icons.

### Path Aliases

`@/*` resolves to the repo root. Example: `import { colors } from '@/lib/theme'`.

### Platform Variants

Files with `.native.ts`, `.web.ts`, or `.ios.tsx` suffixes are loaded by the bundler for those platforms. Follow this pattern when platform behavior must diverge.

### Dates

Use **Luxon** (`luxon`) for all date manipulation and formatting. Utilities in `lib/utils/format-date.ts` handle period logic (current month, week, etc.) used by the HomeScreen filter.
