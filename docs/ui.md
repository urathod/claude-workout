# UI Coding Standards

## Component Library

**ONLY shadcn/ui components must be used for all UI in this project.**

- Do NOT create custom UI components
- Do NOT use any other component library (MUI, Chakra, Ant Design, etc.)
- Do NOT write custom styled components or raw HTML elements where a shadcn/ui component exists
- All buttons, inputs, dialogs, cards, tables, forms, dropdowns, and other UI elements must come from shadcn/ui

### Adding Components

Install shadcn/ui components via the CLI:

```bash
npx shadcn@latest add <component-name>
```

Components are added to `src/components/ui/`. Do not modify these generated files.

### Composing UI

You may compose multiple shadcn/ui components together within page or feature files, but the building blocks must always be shadcn/ui primitives — never hand-rolled equivalents.

---

## Date Formatting

All date formatting must use **date-fns**.

### Required Format

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

This is: `do MMM yyyy` using date-fns format tokens.

### Usage

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
// => "1st Sep 2025"
// => "2nd Aug 2025"
// => "3rd Jan 2026"
// => "4th Jun 2024"
```

Do NOT use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach. Always use `date-fns`.
