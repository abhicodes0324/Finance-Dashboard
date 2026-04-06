# Finance Dashboard UI

A React-based finance dashboard built for the frontend assignment. It focuses on clean UI, practical data interactions, and clear state handling using local component state and memoized selectors.

## Features

- **Dashboard Overview**
  - Summary cards for Total Balance, Income, and Expenses
  - Time-based chart for running balance trend
  - Categorical chart for expense breakdown by category

- **Transactions Section**
  - Transaction table with date, amount, category, type, and description
  - Search by category/description
  - Filters for category and transaction type
  - Advanced filters for date range (`from` / `to`)
  - Sorting by latest, oldest, highest amount, and lowest amount
  - Optional grouped view by category
  - Export filtered transactions to CSV or JSON
  - Import transactions from CSV or JSON
  - Admin-only inline edit and delete actions

- **Role-Based UI (Frontend Simulation)**
  - Switch between `viewer` and `admin` from a role dropdown
  - `viewer`: read-only dashboard and transactions view
  - `admin`: can add new transactions through an inline form

- **Insights Section**
  - Highest spending category
  - Month-over-month expense comparison
  - Net balance observation

- **Optional Enhancements Implemented**
  - Dark mode toggle (persisted)
  - Data persistence with localStorage (role, theme, transactions)
  - Mock API integration (simulated async load with loading state)
  - Card hover transitions for subtle UI motion
  - Export functionality (CSV/JSON)
  - Import functionality (CSV/JSON)
  - Advanced filtering + grouping support
  - Drill-down chart interaction (click pie category to filter table)
  - Admin transaction management (add/edit/delete)

- **UX Details**
  - Responsive layout for mobile/tablet/desktop
  - Empty-state handling for charts and transactions

## Tech Stack

- React (Vite)
- Recharts for visualizations
- Plain CSS (custom responsive styling)

## State Management Approach

Used React state with `useMemo`-based derived data:

- Source state:
  - transactions list
  - role selection
  - theme selection
  - transaction filters/search/sort/date range/group toggle
- Derived state:
  - summary metrics
  - balance trend data
  - spending category totals
  - insights and filtered transactions

This keeps the data flow simple and predictable while avoiding unnecessary recomputation.

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Notes / Assumptions

- Data is loaded via a simulated mock API for frontend demonstration.
- Added transactions persist in localStorage.
- Currency is formatted in USD for consistency.
