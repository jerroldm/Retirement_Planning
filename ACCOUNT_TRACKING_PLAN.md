# Savings Accounts Breakdown Table - Implementation Plan

## Overview

Add a granular **Savings Accounts Breakdown table** below the Expenses Breakdown on the Dashboard that tracks individual account balances, contributions, withdrawals, and growth over time.

### Requirements
- **Granularity**: Show individual accounts (each savings account created on the Savings tab gets its own row)
- **Columns**: Contributions, Withdrawals, Growth, Year-End Balance
- **Placement**: Below Expenses Breakdown table on Dashboard tab
- **Withdrawal Allocation**: Sequential smallest-first (drain smallest account first, then next smallest)

### Current Architecture Problem

The calculation engine currently **aggregates** all savings accounts by type before performing calculations:

```javascript
// Current code in calculations.js lines 320-373
for (const account of savingsAccounts) {
  if (account.accountType === 'traditional-ira') {
    totalTraditionalIRA += balance;  // Individual accounts merged!
  }
}
```

- Tracks only 3 aggregate balances: `traditionalIRABalance`, `rothIRABalance`, `investmentAccountsBalance`
- Individual account identities are lost after aggregation
- Withdrawal strategies operate on aggregates, not individual accounts
- Cannot implement "sequential smallest-first" allocation with current architecture

---

## Recommended Approach: Dual-Track Architecture

Maintain **both** aggregate and individual tracking:
1. Track individual account states throughout projection
2. Compute aggregates from individuals (for backward compatibility)
3. Return new structure: `{ years: [...], accountsBreakdown: [...] }`

**Key Insight**: Withdrawal allocation is a **two-phase process**:
- Phase 1: Existing strategies determine TYPE-level amounts (Traditional IRA, Roth IRA, Investment)
- Phase 2: New allocation logic distributes within types using smallest-first

---

## Implementation Steps

### Step 1: Create Account Calculation Helpers

**NEW FILE**: `src/utils/accountCalculations.js`

Create helper functions:

**`initializeAccountStates(savingsAccounts)`**
- Maps savings accounts to tracking objects with `currentBalance`, `yearlyHistory[]`, contribution settings
- Returns array of account state objects

**`checkShouldContribute(account, age, calendarYear, retirementAge, isRetirementYear)`**
- Respects three stop contributing modes: `'retirement'`, `'specific-age'`, `'specific-date'`
- Returns boolean for whether account receives contributions this year

**`allocateWithdrawals(accountStates, withdrawalByType)`**
- Takes TYPE-level withdrawal amounts from existing strategies
- Allocates to specific accounts using **sequential smallest-first** within each type
- Returns array of `{ accountId, accountType, amount }` allocations
- Key logic:
  ```javascript
  // Get accounts of this type, sorted SMALLEST to LARGEST
  const accountsOfType = accountStates
    .filter(a => a.accountType === accountType && a.currentBalance > 0)
    .sort((a, b) => a.currentBalance - b.currentBalance);

  // Drain accounts sequentially from smallest
  for (let account of accountsOfType) {
    const withdrawFromThisAccount = Math.min(remaining, account.currentBalance);
    allocations.push({ accountId: account.id, amount: withdrawFromThisAccount });
    remaining -= withdrawFromThisAccount;
  }
  ```

**`computeAggregates(accountStates)`**
- Sums balances by type for backward compatibility
- Returns `{ traditionalIRA, rothIRA, investmentAccounts }`

---

### Step 2: Refactor calculateRetirementProjection()

**FILE**: `src/utils/calculations.js`

**Lines 320-373** - Replace aggregation:
```javascript
import { initializeAccountStates, computeAggregates } from './accountCalculations.js';

// Initialize individual account tracking
const accountStates = initializeAccountStates(savingsAccounts);

// Compute aggregates for backward compatibility
const aggregates = computeAggregates(accountStates);
let currentTraditionalIRA = aggregates.traditionalIRA;
let currentRothIRA = aggregates.rothIRA;
let currentInvestmentAccounts = aggregates.investmentAccounts;
```

**In year loop (lines 496-975)** - Add three phases per year:

**Phase 1: Contribution Phase** (after line 741)
```javascript
for (let account of accountStates) {
  const shouldContribute = checkShouldContribute(
    account, age, projectedCalendarYear, primaryRetirementAge, isRetirementYear
  );

  if (shouldContribute) {
    let contribution = account.annualContribution;
    let companyMatch = account.companyMatch;

    // Prorate for retirement year
    if (isRetirementYear) {
      const monthsPreRetirement = primaryBirthMonth - 1;
      contribution *= (monthsPreRetirement / 12);
      companyMatch *= (monthsPreRetirement / 12);
    }

    account.pendingContribution = contribution;
    account.pendingMatch = companyMatch;
  }
}
```

**Phase 2: Withdrawal Phase** (after line 723, replace withdrawal logic)
```javascript
if (isRetired) {
  // Get TYPE-level amounts from existing strategy
  const withdrawalByType = calculateRequiredWithdrawal(...);

  // Allocate to specific accounts
  const withdrawalAllocations = allocateWithdrawals(accountStates, {
    'investment-account': withdrawalByType.investmentAccounts,
    'traditional-ira': withdrawalByType.traditionalIRA,
    'roth-ira': withdrawalByType.rothIRA
  });

  // Apply withdrawals
  for (let allocation of withdrawalAllocations) {
    const account = accountStates.find(a => a.id === allocation.accountId);
    account.currentBalance -= allocation.amount;
    account.yearlyWithdrawal = (account.yearlyWithdrawal || 0) + allocation.amount;
  }

  // Update aggregates for existing logic
  const updatedAggregates = computeAggregates(accountStates);
  currentTraditionalIRA = updatedAggregates.traditionalIRA;
  currentRothIRA = updatedAggregates.rothIRA;
  currentInvestmentAccounts = updatedAggregates.investmentAccounts;
}
```

**Phase 3: Growth & Contribution Phase** (replace lines 866-898)
```javascript
for (let account of accountStates) {
  const startBalance = account.currentBalance;
  const withdrawal = account.yearlyWithdrawal || 0;

  // Growth on remaining balance
  let growth = 0;
  if (yearIndex > 0) {
    growth = account.currentBalance * (investmentReturn / 100);
    account.currentBalance += growth;
  }

  // Add contributions
  const totalContribution = (account.pendingContribution || 0) + (account.pendingMatch || 0);
  account.currentBalance += totalContribution;

  // Record in yearly history
  account.yearlyHistory.push({
    age,
    year: projectedCalendarYear,
    startingBalance: startBalance + withdrawal,
    contributions: account.pendingContribution || 0,
    companyMatch: account.pendingMatch || 0,
    withdrawals: withdrawal,
    growth,
    endingBalance: account.currentBalance
  });

  // Reset yearly tracking
  account.yearlyWithdrawal = 0;
  account.pendingContribution = 0;
  account.pendingMatch = 0;
}
```

**Return new structure** (after line 977):
```javascript
const accountsBreakdown = accountStates.map(account => ({
  accountId: account.id,
  accountName: account.accountName,
  accountType: account.accountType,
  yearlyData: account.yearlyHistory
}));

return {
  years,  // Existing year-by-year data
  accountsBreakdown  // NEW: per-account breakdown
};
```

---

### Step 3: Create SavingsAccountsTable Component

**NEW FILE**: `src/components/SavingsAccountsTable.jsx`

Display component showing per-account breakdown:

```javascript
import React from 'react';
import { ACCOUNT_TYPES } from '../config/savingsAccountConfig';
import './DataTable.css';

export const SavingsAccountsTable = ({ accountsBreakdown }) => {
  if (!accountsBreakdown || accountsBreakdown.length === 0) {
    return <div className="data-table empty">No savings accounts to display</div>;
  }

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="data-table">
      <div className="table-header">
        <h2>Savings Accounts Breakdown</h2>
        <p className="table-description">Individual account balances and transactions over time</p>
      </div>

      {accountsBreakdown.map(account => {
        const accountConfig = ACCOUNT_TYPES[account.accountType];

        return (
          <div key={account.accountId} className="account-breakdown-section">
            <h3>
              <span className="account-icon">{accountConfig?.icon}</span>
              {account.accountName}
              <span className="account-type-label">({accountConfig?.label})</span>
            </h3>

            <table className="year-table">
              <thead>
                <tr>
                  <th>Age</th>
                  <th>Contributions</th>
                  <th>Withdrawals</th>
                  <th>Growth</th>
                  <th>Year-End Balance</th>
                </tr>
              </thead>
              <tbody>
                {account.yearlyData.map((year, idx) => (
                  <tr key={idx} className={year.age >= 65 ? 'retired' : ''}>
                    <td>{year.age}</td>
                    <td>{formatCurrency((year.contributions || 0) + (year.companyMatch || 0))}</td>
                    <td className={year.withdrawals > 0 ? 'negative' : ''}>
                      {formatCurrency(year.withdrawals || 0)}
                    </td>
                    <td className="positive">{formatCurrency(year.growth || 0)}</td>
                    <td className="net-worth-cell">{formatCurrency(year.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};
```

**Design**: Separate section per account (easier to read than one giant table), reuses existing DataTable CSS

---

### Step 4: Update App.jsx

**FILE**: `src/App.jsx`

**Add state** (after line 28):
```javascript
const [accountsBreakdown, setAccountsBreakdown] = useState([])
```

**Update useMemo** (around line 235):
```javascript
const calculatedData = useMemo(() => {
  const result = calculateRetirementProjection(
    inputs, persons, incomeSources, savingsAccounts, expenses
  );

  // Extract breakdown if available
  if (result && result.accountsBreakdown) {
    setAccountsBreakdown(result.accountsBreakdown);
    return result.years;  // Backward compatibility
  }

  // Fallback for old return structure
  return Array.isArray(result) ? result : (result?.years || []);
}, [inputs, persons, incomeSources, savingsAccounts, expenses])
```

**Pass to Dashboard** (around line 340):
```javascript
{activeView === 'dashboard' && (
  <Dashboard
    data={calculatedData}
    accountsBreakdown={accountsBreakdown}  // NEW PROP
  />
)}
```

---

### Step 5: Update Dashboard Component

**FILE**: `src/components/Dashboard.jsx`

**Update imports** (line 1):
```javascript
import { SavingsAccountsTable } from './SavingsAccountsTable';
```

**Update component signature** (line 8):
```javascript
export const Dashboard = ({ data, accountsBreakdown }) => {
```

**Add new tab button** (after line 83):
```javascript
<button
  className={`tab ${activeTab === 'savings-breakdown' ? 'active' : ''}`}
  onClick={() => setActiveTab('savings-breakdown')}
>
  Savings Breakdown
</button>
```

**Render component** (after line 220, after ExpensesTable):
```javascript
{activeTab === 'savings-breakdown' && (
  <SavingsAccountsTable accountsBreakdown={accountsBreakdown} />
)}
```

---

## Edge Cases Handling

### RMDs from Traditional IRAs
In `allocateWithdrawals()`, ensure RMD amount is enforced:
```javascript
if (accountType === 'traditional-ira' && rmdAmount > 0) {
  amountNeeded = Math.max(amountNeeded, rmdAmount);
}
```

### Account Depleted Mid-Year
Handled automatically by `Math.min(remaining, account.currentBalance)` in allocation logic

### No Savings Accounts (Legacy Mode)
Add fallback in calculations.js line 320:
```javascript
if (!savingsAccounts || savingsAccounts.length === 0) {
  // Use legacy aggregate values from financial_data
  const accountStates = [];
  const aggregates = {
    traditionalIRA: primaryTraditionalIRA,
    rothIRA: primaryRothIRA,
    investmentAccounts: primaryInvestmentAccounts
  };
}
```

### Stop Contributing Modes
Already handled by `checkShouldContribute()` function:
- `'retirement'`: Stop at retirement age
- `'specific-age'`: Stop at specified age
- `'specific-date'`: Stop at specified month/year

---

## Testing Scenarios

1. **Single Account Validation**
   - Create 1 Traditional IRA: $50k balance, $10k contribution
   - Verify breakdown matches aggregate calculations

2. **Sequential Smallest-First Withdrawal**
   - Create 3 Traditional IRAs: $10k, $50k, $100k
   - Verify $10k depletes first, then $50k, then $100k

3. **Stop Contributing at Different Ages**
   - Account A: stop at age 55
   - Account B: stop at retirement (65)
   - Verify contributions stop correctly

4. **RMD Scenario**
   - User born in 1960 (RMD at 75)
   - 2 Traditional IRA accounts
   - Verify RMD allocated across accounts at age 75

5. **Retirement Year Partial Contributions**
   - Retirement age 60, birth month June
   - Verify contributions only for Jan-May

---

## Critical Files to Modify

1. **`src/utils/accountCalculations.js`** (NEW) - Helper functions for account tracking and withdrawal allocation
2. **`src/utils/calculations.js`** (MODIFY) - Lines 320-373 (aggregation) and 496-975 (year loop) for individual account tracking
3. **`src/components/SavingsAccountsTable.jsx`** (NEW) - Display component for account breakdown
4. **`src/App.jsx`** (MODIFY) - Line ~235 (useMemo), add accountsBreakdown state, pass to Dashboard
5. **`src/components/Dashboard.jsx`** (MODIFY) - Add tab, import component, render table

---

## Summary

This dual-track architecture:
- Tracks individual accounts with full granularity
- Maintains backward compatibility via computed aggregates
- Implements sequential smallest-first withdrawal allocation
- Handles all edge cases (RMDs, depletion, stop contributing)
- Presents clear per-account breakdown UI

Performance: O(Y × A) where Y=60 years, A=10 accounts = 600 iterations (<10ms on modern JS)
