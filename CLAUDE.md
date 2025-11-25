# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Retirement Planning Visualizer** is a full-stack web application for comprehensive retirement financial planning. It features detailed financial projections, asset tracking, savings account management, and mortgage amortization schedules.

**Stack:**
- Frontend: React 19 + Vite (with HMR)
- Backend: Express.js
- Database: SQLite3
- Authentication: JWT tokens with bcryptjs
- UI Charts: Recharts
- Icons: Lucide-react

## Development Setup and Commands

### Starting Development

```bash
npm run dev
```

This runs both frontend (Vite on port 5173) and backend (Express on port 3001) concurrently using the `concurrently` package.

**Individual commands:**
- `npm run dev:frontend` - Run Vite dev server only (port 5173)
- `npm run dev:backend` - Run Express server only (port 3001)

### Building and Linting

```bash
npm run build       # Production build with Vite
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

### Database

SQLite database is stored at `/data/retirement.db`. The database is auto-initialized on server startup if it doesn't exist. No migrations tool is used; schema is created directly in `server/db.js`.

## Architecture Overview

### Frontend-Backend Communication

**API Base URLs:**
- Vite proxy routes all `/api/*` requests to `http://localhost:3001`
- Frontend API clients are in `src/api/` directory
- All API calls use `localStorage.getItem('authToken')` for JWT token (stored under key `'authToken'`, not `'token'`)

**Key Pattern - API Clients:**
Each entity type (financial, assets, savings accounts) has its own API client:
- `src/api/client.js` - Main API client for financial data & auth (defines `apiCall()` helper)
- `src/api/assetClient.js` - Asset CRUD operations
- `src/api/savingsAccountClient.js` - Savings account CRUD operations

### Backend Structure

**Server Setup (`server/index.js`):**
- Express app with CORS enabled
- Routes mounted at `/api/{auth,financial,assets,savings-accounts}`
- Health check endpoint at `/api/health`

**Route Files (`server/routes/`):**
- `auth.js` - User signup/login, JWT token generation
- `financial.js` - Financial data CRUD and scenario management
- `assets.js` - Asset management with type-specific fields
- `savingsAccounts.js` - Savings account CRUD operations

**Authentication:**
- Middleware in `server/middleware/auth.js` exports `verifyToken()` middleware
- Checks `Authorization: Bearer <token>` header
- Validates JWT signature using `JWT_SECRET` env var (defaults to `'your-secret-key-change-in-production'`)
- Attaches `req.userId` for use in route handlers

**Database (`server/db.js`):**
- SQLite3 wrapper with promisified callback API
- Auto-creates all tables on server startup
- Tables: `users`, `financial_data`, `assets`, `savings_accounts`, `scenarios`
- No migrations framework; schema updates happen in this file

### Frontend Structure

**Core Files:**
- `src/App.jsx` - Main application component, handles auth state, financial data loading, tab navigation
- `src/components/InputForm.jsx` - Central form component for all input tabs (Personal, Income, Savings, Assets, Expenses, Economic, Taxes)
- `src/context/AuthContext.jsx` - Auth state management with login/signup/logout
- `src/utils/calculations.js` - All financial projection logic (retirement calculations, amortization schedules)

**Components by Feature:**
- **Assets:** `AssetList.jsx`, `AssetForm.jsx`, `AssetTypeSelector.jsx` - Generic asset management (supports multiple asset types)
- **Savings Accounts:** `SavingsAccountList.jsx`, `SavingsAccountForm.jsx`, `SavingsAccountTypeSelector.jsx` - Savings account management
- **Views:** `Dashboard.jsx`, `DataTable.jsx`, `ExpensesTable.jsx`, `MortgageAmortizationTable.jsx`
- **Auth:** `AuthPage.jsx` - Login/signup page

**Configuration:**
- `src/config/assetConfig.js` - Defines asset types and their field schemas
- `src/config/savingsAccountConfig.js` - Defines savings account types and their field schemas

### Data Models

**Financial Data (single record per user):**
Stored in `financial_data` table. Contains:
- Personal: marital status, birth month/year for both spouses, current age (calculated), retirement age, death age
- Income: current salary, annual salary increase (for both spouses)
- Retirement accounts: Traditional IRA, Roth IRA, Investment Accounts balances & contributions
- Home: value, mortgage details, property tax, insurance, sale plans
- Expenses: pre-retirement and post-retirement annual amounts
- Economic assumptions: investment return, inflation rate, tax rates

**Assets (flexible, one-to-many):**
Stored in `assets` table. Supports types: primary-residence, secondary-residence, vehicle, collectible, generic. Each has type-specific fields defined in config.

**Savings Accounts (flexible, one-to-many):**
Stored in `savings_accounts` table. Supports types: 401k, traditional-ira, roth-ira, investment-account, other. Each has type-specific fields defined in config.

## Critical Implementation Details

### Authentication Token Key

The application uses `'authToken'` as the localStorage key for JWT tokens. This is critical:
- Set in: `src/api/client.js:setAuthToken()` - stores with key `'authToken'`
- Retrieved in: All API clients must use `localStorage.getItem('authToken')`
- **Bug to avoid:** Using `localStorage.getItem('token')` instead will fail with null token errors

### Financial Data Schema Consistency

The `financial_data` table has 55 columns total. When updating INSERT/UPDATE statements in `server/routes/financial.js`:
- Column count MUST match the number of `?` placeholders in VALUES clause
- Both INSERT and UPDATE statements must include ALL fields in the same order
- Test with: Count actual columns in config vs placeholder count

### Asset/Account Type Configuration Pattern

Both assets and savings accounts use a configuration-driven pattern:
- Type definitions in `src/config/*.js` files
- Each type specifies required fields and their input type (text, number, select, etc.)
- Backend stores all fields in a single table with flexible schema
- Frontend form component dynamically renders based on selected type config
- Modal selector ensures user picks type before form opens

### Mortgage Amortization

Calculations in `src/utils/calculations.js`:
- Supports extra principal payments tracked separately
- Generates month-by-month schedule with exact payment amounts
- Handles final payment precision (avoids overpayment)
- Includes tax/insurance amounts

### Auto-Saving

Form changes trigger auto-save via `App.jsx:handleInputsChange()`:
- Saves financial data to `/api/financial` on every form field change
- Debouncing NOT implemented - fires on every keystroke
- Shows "Saving..." indicator in header

## Common Development Tasks

### Adding a New Input Field to Financial Data

1. Add column to `financial_data` table schema in `server/db.js`
2. Add column name to INSERT/UPDATE statements in `server/routes/financial.js` (count placeholders!)
3. Add field to form in `src/components/InputForm.jsx`
4. Add field to `src/utils/calculations.js:defaultInputs` object
5. Include in `App.jsx:handleInputsChange()` dataToSave object

### Adding a New Asset Type

1. Add type definition to `src/config/assetConfig.js` with icon, label, and field config
2. Backend automatically supports it - `assets.js` route stores all fields as JSON
3. Test with `AssetForm.jsx` to ensure all fields render correctly

### Adding a New API Endpoint

1. Create route in `server/routes/{feature}.js`
2. Wrap protected routes with `verifyToken` middleware
3. Create corresponding client method in `src/api/{feature}Client.js`
4. Ensure localStorage key is `'authToken'` in client

### Debugging API Calls

- Frontend logs API calls in `src/api/client.js:apiCall()` - shows endpoint and method
- Backend logs auth issues in `server/middleware/auth.js` - shows received token and verification result
- Check browser console and server terminal output in parallel
- Verify token exists in localStorage before making requests

## File Patterns and Conventions

**API Response Format:**
```javascript
// Success
{ id: 123, message: "...", data: {} }

// Error
{ error: "error message" } or { details: "error details" }
```

**Component Structure:**
- One main component per feature (e.g., `AssetList`, `SavingsAccountForm`)
- Props passed from parent (`InputForm`) to manage state
- Each component handles its own loading and error states

**Database Callback Pattern:**
Uses callback-based sqlite3 API, not promises:
```javascript
db.run(sql, params, function(err) {
  if (err) return handleError();
  this.lastID; // for inserts
});
```

## Production Considerations

- Set `JWT_SECRET` environment variable in production (default is insecure)
- Implement debouncing for auto-save to reduce server load
- Consider adding database backups for user data
- Review SQLite limitations for concurrent writes if scaling beyond single-user
- The `concurrently` package should not be used in production; separate frontend and backend deployments

## Known Issues and Gotchas

1. **Token Key Mismatch:** API clients must use `'authToken'` key, not `'token'` - this caused "jwt malformed" errors in past
2. **Column Count Mismatch:** Financial data INSERT statements must match exact column count (currently 55) or SQLite will error
3. **Concurrent Writes:** SQLite can struggle with multiple simultaneous writes - consider PostgreSQL if multi-user access increases
4. **No Form Validation:** Input forms don't validate before saving - garbage in = garbage in calculations
5. **Scenario Feature:** Partially implemented - creates financial data snapshots but incomplete CRUD UI
