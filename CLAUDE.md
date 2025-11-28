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
Each entity type (financial, assets, savings accounts, income, expenses, social security) has its own API client:
- `src/api/client.js` - Main API client for financial data & auth (defines `apiCall()` helper)
- `src/api/assetClient.js` - Asset CRUD operations
- `src/api/savingsAccountClient.js` - Savings account CRUD operations
- `src/api/incomeClient.js` - Income sources CRUD operations
- `src/api/expensesClient.js` - Expenses CRUD operations
- `src/api/socialSecurityClient.js` - Social Security benefits CRUD operations

### Backend Structure

**Server Setup (`server/index.js`):**
- Express app with CORS enabled
- Routes mounted at `/api/{auth,financial,assets,savings-accounts,persons,income,expenses,social-security}`
- Health check endpoint at `/api/health`

**Route Files (`server/routes/`):**
- `auth.js` - User signup/login, JWT token generation
- `financial.js` - Financial data CRUD and scenario management
- `assets.js` - Asset management with type-specific fields
- `savingsAccounts.js` - Savings account CRUD operations
- `persons.js` - Individual person demographic and financial data
- `income.js` - Income sources CRUD operations
- `expenses.js` - Expenses CRUD operations
- `socialSecurity.js` - Social Security benefits CRUD operations

**Authentication:**
- Middleware in `server/middleware/auth.js` exports `verifyToken()` middleware
- Checks `Authorization: Bearer <token>` header
- Validates JWT signature using `JWT_SECRET` env var (defaults to `'your-secret-key-change-in-production'`)
- Attaches `req.userId` for use in route handlers

**Database (`server/db.js`):**
- SQLite3 wrapper with promisified callback API
- Auto-creates all tables on server startup
- Tables: `users`, `financial_data`, `assets`, `savings_accounts`, `persons`, `income_sources`, `expenses`, `social_security`, `scenarios`
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
- **Persons:** `PersonList.jsx`, `PersonForm.jsx`, `PersonTypeSelector.jsx` - Individual person management with demographic and financial data
- **Income:** `IncomeList.jsx`, `IncomeForm.jsx` - Income sources management (one or more income sources per user)
- **Expenses:** `ExpensesList.jsx`, `ExpensesForm.jsx` - Expenses management (persistent, with monthly amounts and phase tracking)
- **Social Security:** `SocialSecurityList.jsx`, `SocialSecurityForm.jsx` - Social Security benefits tracking per person
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

**Persons (flexible, one-to-many):**
Stored in `persons` table. Tracks individual people (self, spouse, future children) with their demographic and financial data. Fields include:
- Demographics: personType (self/spouse), firstName, birthMonth, birthYear
- Financial: current salary, salary increase, account balances, contributions
- Inclusion: `includeInCalculations` boolean flag for flexible scenario planning

**Income Sources (flexible, one-to-many):**
Stored in `income_sources` table. Tracks multiple income sources per user with:
- sourceName: Name of the income source
- annualSalary: Annual salary amount
- annualSalaryIncrease: Annual percentage increase for this income source

**Expenses (flexible, one-to-many):**
Stored in `expenses` table. Tracks custom expenses per user with:
- expenseName: Name of the expense
- monthlyAmount: Monthly amount in dollars (not annual)
- preRetirement: Boolean flag for whether this expense applies before retirement
- postRetirement: Boolean flag for whether this expense applies after retirement
- notes: Optional notes about the expense

**Social Security (flexible, one-to-many):**
Stored in `social_security` table. Tracks Social Security benefits per person with:
- personId: Reference to the person (self or spouse)
- estimatedAnnualBenefit: Estimated annual benefit at Full Retirement Age (FRA of 67)
- plannedClaimingAge: Age at which the person plans to claim benefits (default 67)

## Data Loading Architecture (Critical for Correct Calculations)

### Load Sequence in App.jsx

The order of data loading in `App.jsx` is **critical** for correct calculations. Respect this sequence:

1. **Load Financial Data** - Primary config from `financial_data` table
2. **Load Persons Data** - Person demographic data from `persons` table (BEFORE setting inputs)
3. **Migrate Home Assets** - Convert financial_data home fields to assets table if needed
4. **Load/Merge Assets** - Get assets and merge home asset data into inputs
5. **Set Inputs & Trigger Calculations** - Now all data is ready for useMemo calculations

**Why this matters:**
- `calculateRetirementProjection()` receives `inputs` and `persons` parameters
- The function prioritizes person data from the `persons` array over input fallbacks
- If inputs are set before persons load, useMemo will recalculate twice (once without persons, once with)
- This causes incorrect age calculations and other timing-related bugs

**Implementation pattern in App.jsx:**
```javascript
// 1. Load financial data
const data = await financialAPI.getFinancialData();
const baseInputs = { ...create inputs from data... };

// 2. Load persons BEFORE setting inputs
let personsList = [];
try {
  personsList = await personClient.getPersons();
} catch (e) { /* handle error */ }

// 3. Migrate home assets
try {
  await assetAPI.migrateHomeData();
} catch (e) { /* already migrated */ }

// 4. Load and merge assets
const assets = await assetAPI.getAssets();
const mergedInputs = mergeAssetDataIntoInputs(baseInputs, assets);
setInputs(mergedInputs);

// 5. Set persons (now calculation will use persons data from start)
setPersons(personsList);
```

### Person Data Extraction in Calculations

In `src/utils/calculations.js`, person data is extracted with fallbacks:
```javascript
// Start with inputs fallback values
let primaryBirthMonth = birthMonth;
let primaryBirthYear = birthYear;

// Override with persons array data if available
if (persons && persons.length > 0) {
  const primaryPerson = persons.find(p => p.personType === 'self' || p.personType === 'primary');
  if (primaryPerson && primaryPerson.includeInCalculations) {
    if (primaryPerson.birthMonth) primaryBirthMonth = primaryPerson.birthMonth;
    if (primaryPerson.birthYear) primaryBirthYear = primaryPerson.birthYear;
    // ... extract other fields
  }
}
```

**Key point:** The `includeInCalculations` flag allows flexible scenario planning - you can exclude people from calculations without deleting their records.

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
2. **Column Count Mismatch:** Financial data INSERT statements must match exact column count (currently 40 fields after person data moved to persons table) or SQLite will error
3. **Data Loading Timing:** The order of data loading in App.jsx is critical - persons must load BEFORE inputs are set, otherwise age calculations use stale data. See "Data Loading Architecture" section above.
4. **Asset Migration Timing:** Home data migration to assets table must complete BEFORE asset merge happens, otherwise mortgage amortization shows default values. Migration is now triggered in App.jsx before asset loading.
5. **Person Data Syncing:** When a user edits their person record and changes fields like retirement age, those values must be synced back to the form inputs so they get auto-saved to financial_data table. Example: `handlePersonFormSubmit` in InputForm.jsx syncs birthMonth/birthYear/retirementAge back to formData. If adding new person fields, ensure they're synced here.
6. **Concurrent Writes:** SQLite can struggle with multiple simultaneous writes - consider PostgreSQL if multi-user access increases
7. **No Form Validation:** Input forms don't validate before saving - garbage in = garbage in calculations
8. **SQLite Boolean Handling:** SQLite returns `0` and `1` for boolean columns instead of `true` and `false`. When comparing booleans from the database, use the `!!` operator to convert: `const bool = !!dbValue`. Example: In ExpensesList, phase conversion uses `const pre = !!expense.preRetirement` to properly handle SQLite's 0/1 values.
9. **Scenario Feature:** Partially implemented - creates financial data snapshots but incomplete CRUD UI
10. **Table Column Alignment:** When creating new data tables that need proper column alignment between headers and data rows:
    - Use `table-layout: fixed;` on the table element to force equal column width distribution
    - Ensure matching padding on header (`th`) and data (`td`) cells
    - Use `.year-table` class from DataTable.css as the standard table class for consistency
    - Avoid `position: sticky;` on table headers as it interferes with `table-layout: fixed` column calculations
    - Both header and body cells need `box-sizing: border-box;` to include padding in width calculations
    - Apply special rules for first-child (`.year-table th:first-child, .year-table td:first-child`) and age-cell alignment
    - Example: See DataTable.css (lines 46-123) for the proven pattern used by Expenses Breakdown and Savings Breakdown tables

## Development Progress and Phase Status

### Phase 4: Testing & Verification - COMPLETE ✅

**Completed:** November 27, 2025

All critical bugs in the retirement projection calculations have been identified, fixed, and verified:

#### Bugs Fixed (11 Total)

1. **Contribution Override Bug** - Fixed handling of zero contribution values. Previously checked `if (totalTraditionalIRAContribution > 0)` causing $0 contributions to fall back to $10k defaults. Now checks for account existence.

2. **State Tax Calculation** - State taxes were calculated against raw income instead of taxable income. Fixed to apply standard deduction before state tax calculation.

3. **Partial-Year Retirement Logic** - Major architectural fix for users retiring mid-year. Previously treated entire year as either pre-retirement or post-retirement. Now:
   - Splits year based on birth month
   - Calculates 5 months pre-retirement, 7 months post-retirement (for June birthday)
   - Adjusts income, expenses, and contributions proportionally

4. **Gross Salary in Year-by-Year Table** - Showed $0 instead of partial-year income. Fixed to use `finalGrossIncome` which includes partial-year calculations.

5. **AGI Calculation** - Was showing $0 instead of properly deducting contributions. Now correctly calculates: Gross Income - Standard Deduction - Traditional IRA Contributions (adjusted for partial year).

6. **State Tax During Retirement Year** - Was applying retirement state (WY) taxes to income earned in working state (CA). Fixed to use working state during retirement year, switching to retirement state only after retirement completes.

7. **Home Sale Double-Counting** - Net worth jumped when home sale proceeds were added without removing home equity in same year. Fixed by zeroing out home in sale year using `>=` instead of `>`.

8. **Contribution Stop Age Default** - Was defaulting to 65 instead of retirement age. Now defaults to retirement age (60).

9. **Contribution Eligibility** - Changed from `age < primaryContributionStopAge` to `age <= primaryContributionStopAge` to include retirement year.

10. **Contribution Amount Adjustment** - Retirement year contributions now adjusted: `$24k × (5 months / 12) = $10k` instead of $0.

11. **Default Contribution Values** - All defaults changed from $10,000 to $0 per user specification.

#### Key Implementation Changes

**src/utils/calculations.js:**
- Lines 57-155: Updated mortgage amortization to handle partial-year retirement
- Lines 319-331: Fixed contribution loading by checking account existence
- Lines 453-551: Implemented partial-year retirement logic with month-based splitting
- Lines 511-526: Fixed home sale handling to zero out in sale year
- Lines 650-651: Fixed state tax to use taxable income
- Lines 705-739: Added contribution eligibility and amount adjustment for retirement year
- Lines 741-756: Updated ordinary income calculation with retirement year adjustments
- Lines 834-837: Fixed Year-by-Year table to use `finalGrossIncome`
- Lines 869-887: Updated AGI calculation with deduction and contribution adjustments
- Line 219: Changed contribution stop age default to `retirementAge`

**src/utils/taxCalculations.js:**
- Lines 28-59: Disabled federal tax bracket debug logging

**Tax System Foundation (For Phase 5):**
- Created `src/config/federalTaxBrackets.js` - 2025 federal tax brackets by filing status
- Created `src/config/stateTaxConfig.js` - State tax configuration for all 50 states
- Created `src/utils/taxCalculations.js` - Tax calculation functions (infrastructure)
- Updated database schema in `server/db.js` - Added columns for workingState, retirementState, stateChangeOption, stateChangeAge, filingStatus, withdrawalStrategy

#### Test Scenario

User configuration: Self, birth June 1969, retires at age 60 (June 2029), CA working state, WY retirement state

Verification at age 60:
- Pre-retirement months: 5 (Jan-May)
- Post-retirement months: 7 (June-Dec)
- Income: $168,400 (partial year)
- Expenses: $54,000 total ($22,500 pre + $31,500 post)
- Contributions: $10,000 ($24,000 × 5/12)
- Federal Tax: Correctly calculated on taxable income
- State Tax: Correctly applied CA taxes on income earned before retirement

### Phase 5: Tax System Implementation - PENDING

**Status:** Foundation prepared, not yet implemented

Comprehensive tax system implementation will include:
- Federal progressive tax brackets (7 brackets)
- State-specific tax rates for all 50 states
- Withdrawal strategy modeling (Waterfall and Tax Bracket Fill)
- Required Minimum Distribution (RMD) calculations per SECURE Act 2.0
- Social Security taxation integration
- Capital gains tax treatment
- Multiple income source integration

See `TAX_SYSTEM_PLAN.md` for full detailed plan.

### Known Limitations (Phase 4)

1. Tax calculations remain simplified (flat rates) - will be enhanced in Phase 5
2. No RMD enforcement yet - will be implemented in Phase 5
3. Withdrawal strategy logic exists but not fully integrated into projections
4. Capital gains tracking not yet implemented
5. Social Security claiming strategies not yet modeled

### Next Steps

Phase 5 implementation should follow the detailed plan in `TAX_SYSTEM_PLAN.md`. Recommended sequence:
1. Create tax configuration infrastructure (already done)
2. Create tax calculation engine functions (already done)
3. Update database schema (partially done - needs routes update)
4. Update UI for tax configuration (Taxes tab in InputForm.jsx)
5. Integrate withdrawal strategies into calculations
6. Add Social Security benefits and claiming age modeling
7. Implement RMD logic with birth-year dependent thresholds
8. Update Dashboard and DataTable to show tax/withdrawal breakdowns
9. Comprehensive testing with various scenarios
