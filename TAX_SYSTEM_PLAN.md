# Comprehensive Tax System Implementation Plan

## Overview
Implement a comprehensive tax calculation system with full federal progressive tax brackets, state-specific tax rates, retirement account withdrawal modeling, and integration of all income types (Social Security, supplemental income, rental income, capital gains).

## Requirements Summary
- **Federal Taxes**: Full IRS progressive brackets (7 brackets) with standard deductions
- **State Taxes**: Built-in rates/brackets for all 50 states
- **Withdrawals**: Model Traditional IRA (taxable), Roth IRA (tax-free), Investment Account (capital gains) drawdowns
  - Support both **Waterfall** and **Tax Bracket Fill** withdrawal strategies
  - **RMD Requirements**: Birth-year dependent per SECURE Act 2.0 (age 72 for pre-1951, age 73 for 1951-1959, age 75 for 1960+)
- **Income Integration**: Social Security, supplemental income sources, rental income, capital gains

## Current State Analysis
- Flat tax system: `(federalTaxRate + stateTaxRate) / 100 * totalGrossIncome`
- Only salary income taxed; retirement accounts grow indefinitely without withdrawals
- Social Security, supplemental income, rental income exist in DB but not calculated
- No differentiation between Traditional IRA (pre-tax) and Roth IRA (post-tax) withdrawals
- No standard deductions or progressive brackets

## Architecture Decisions

### 1. Tax Bracket Data Storage
**Decision**: Static JSON configuration files

**Rationale**:
- Tax brackets change annually but infrequently (once per year)
- Same brackets apply to all users (not user-specific data)
- Easier to version control and update
- No database migration needed for tax law updates
- Can reference historical brackets by year

**Structure**:
```
src/config/
  ├── federalTaxBrackets.js   // 2025+ federal brackets by filing status
  └── stateTaxConfig.js        // All 50 states + DC tax data
```

### 2. State Identification with Retirement State Change
**Database Changes**: Add state fields to `financial_data` table to support working in one state, retiring to another
- `workingState` TEXT (2-letter state code: 'CA', 'NY', 'TX', etc.) - State during working years
- `retirementState` TEXT DEFAULT NULL - State after retirement/relocation (optional)
- `stateChangeOption` TEXT DEFAULT 'at-retirement' - When to change: 'at-retirement' or 'at-age'
- `stateChangeAge` INTEGER DEFAULT NULL - Specific age to move (only used if stateChangeOption = 'at-age')

**Rationale**: Many people work in high-tax states (CA, NY, NJ) and retire to low/no-tax states (WY, FL, TX, NV) to minimize taxation on retirement withdrawals. This is a common and significant tax planning strategy.

### 3. Filing Status
**Database Change**: Replace `maritalStatus` enum with `filingStatus`
- Values: 'single', 'married-joint', 'married-separate', 'head-of-household'
- Derived from marital status but allows flexibility

### 4. Withdrawal Strategy
**Two initial strategies, framework for expansion:**

#### Strategy 1: Waterfall (Simple Tax-Efficient)
1. **First**: Draw from taxable investment accounts (capital gains treatment)
2. **Second**: Draw from Traditional IRA/401k (ordinary income)
3. **Third**: Draw from Roth IRA (tax-free, preserve as long as possible)
4. **RMDs**: Force Traditional IRA withdrawals starting at RMD age (72, 73, or 75 depending on birth year per SECURE Act 2.0)

**Rationale**: Simple approach - use taxable first (already taxed), then pre-tax (pay taxes), preserve tax-free last.

#### Strategy 2: Tax Bracket Fill (Optimized for Bracket Positioning)
1. **Calculate available bracket room**: Determine how much ordinary income can fit in each tax bracket before hitting the next bracket
   - Start with standard deduction applied
   - Account for Social Security taxation (up to 85% of SS benefits are taxable based on combined income thresholds)
   - Calculate remaining room in each bracket
2. **Fill brackets with Traditional IRA first**: Draw from Traditional IRA/401k up to the top of the lowest available bracket
3. **Supplement with other sources**: Once bracket is filled, draw additional needed funds from:
   - Taxable investment accounts (capital gains treatment, may fit in lower capital gains brackets)
   - Roth IRA (tax-free, no impact on bracket fill)
4. **Apply RMDs**: Must meet Required Minimum Distribution from Traditional IRA starting at RMD age (72, 73, or 75 depending on birth year per SECURE Act 2.0)

**Rationale**: More sophisticated approach that minimizes tax rate on withdrawals. By filling up lower tax brackets with Traditional IRA withdrawals, you avoid pushing yourself into higher brackets. This is especially valuable for people with significant traditional retirement account balances.

**Critical Detail - Social Security Impact**:
- When calculating bracket fill, must account for Social Security taxation
- SS taxation is complex: combined income = AGI + 1/2 of SS benefits; up to 85% of SS is taxable depending on combined income thresholds ($25k for single, $32k for married-joint)
- This affects how much room is available in each bracket
- Example: A married couple with $30k AGI + $40k SS benefits has combined income of $50k, pushing some SS into taxable range and reducing bracket fill capacity

#### Framework for Future Strategies
Withdrawal strategy should be extensible. Store strategy choice in database:
- `withdrawalStrategy` TEXT DEFAULT 'waterfall' - User selection: 'waterfall' or 'tax-bracket-fill'
- Calculate function should accept strategy parameter and dispatch accordingly
- This allows adding Roth Conversion, Bucketing, or other strategies later without major refactors

## Implementation Phases

### Phase 1: Tax Configuration Infrastructure

#### Files to Create:
1. **src/config/federalTaxBrackets.js**
```javascript
export const federalTaxBrackets2025 = {
  single: [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  'married-joint': [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  // ... other filing statuses
};

export const standardDeductions2025 = {
  single: 14600,
  'married-joint': 29200,
  'married-separate': 14600,
  'head-of-household': 21900
};
```

2. **src/config/stateTaxConfig.js**
```javascript
export const stateTaxData = {
  CA: {
    name: 'California',
    hasBrackets: true,
    brackets: {
      single: [
        { limit: 10412, rate: 0.01 },
        { limit: 24684, rate: 0.02 },
        // ... 9 brackets total
      ],
      'married-joint': [/* ... */]
    }
  },
  TX: {
    name: 'Texas',
    hasBrackets: false,
    flatRate: 0.00  // No state income tax
  },
  FL: {
    name: 'Florida',
    hasBrackets: false,
    flatRate: 0.00
  },
  // ... all 50 states + DC
};

export const stateList = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  // ... all states
];
```

#### Files to Modify:
1. **server/db.js** - Add columns to `financial_data`:
   - `workingState TEXT DEFAULT NULL` - State during working years
   - `retirementState TEXT DEFAULT NULL` - State after retirement (optional)
   - `stateChangeOption TEXT DEFAULT 'at-retirement'` - When to change states
   - `stateChangeAge INTEGER DEFAULT NULL` - Specific age for state change
   - `filingStatus TEXT DEFAULT 'single'`
   - `withdrawalStrategy TEXT DEFAULT 'waterfall'` - User's withdrawal strategy: 'waterfall' or 'tax-bracket-fill'
   - Remove: `federalTaxRate`, `stateTaxRate` (replaced by bracket calculations)

2. **src/components/InputForm.jsx** - Update Taxes tab:
   - Add working state dropdown (required)
   - Add retirement state dropdown (optional - only if planning to relocate)
   - Add state change trigger radio buttons ('at-retirement' or 'at-age')
   - Add state change age input (conditional - only show if 'at-age' selected)
   - Add filing status dropdown
   - Add withdrawal strategy dropdown ('waterfall' or 'tax-bracket-fill')
   - Remove flat rate inputs
   - Add standard deduction override (optional, defaults to IRS amounts)

### Phase 2: Tax Calculation Engine

#### Core Tax Functions (new file: src/utils/taxCalculations.js)

**Functions to implement**:
1. `calculateFederalTax(taxableIncome, filingStatus, year = 2025)`
   - Apply progressive brackets
   - Return total federal tax

2. `calculateStateTax(taxableIncome, stateCode, filingStatus)`
   - Look up state config
   - Apply state brackets or flat rate
   - Return total state tax

3. `calculateSocialSecurityTax(ssIncome, otherIncome, filingStatus)`
   - Apply combined income formula
   - Up to 85% of SS benefits taxable
   - Thresholds: $25k (single), $32k (married-joint)

4. `applyStandardDeduction(grossIncome, filingStatus, year = 2025)`
   - Subtract standard deduction
   - Return taxable income (minimum 0)

5. `calculateCapitalGainsTax(gains, ordinaryIncome, filingStatus)`
   - Long-term capital gains: 0%, 15%, 20% based on income
   - Short-term = ordinary income rates

#### Modified: src/utils/calculations.js - calculateRetirementProjection()

**Major changes needed**:

**Line ~175**: Extract state configuration from inputs
```javascript
const {
  workingState,
  retirementState,
  stateChangeOption = 'at-retirement',
  stateChangeAge,
  filingStatus = 'single'
} = inputs;
```

**NEW FUNCTION**: Determine current state based on age
```javascript
function getCurrentState(age, isRetired, workingState, retirementState, stateChangeOption, stateChangeAge) {
  // If no retirement state specified, always use working state
  if (!retirementState) {
    return workingState;
  }

  // Check if state change has occurred
  if (stateChangeOption === 'at-retirement' && isRetired) {
    return retirementState;
  } else if (stateChangeOption === 'at-age' && age >= stateChangeAge) {
    return retirementState;
  }

  // Default to working state
  return workingState;
}
```

**Lines ~360-377**: Expand income calculation to include ALL sources
```javascript
// 1. Salary income (existing)
let salaryIncome = !isRetired ? currentSalaryValue : 0;
let spouse2SalaryIncome = !spouse2IsRetired ? spouse2SalaryValue : 0;

// 2. Social Security income (NEW)
let ssIncome = calculateSocialSecurityIncome(age, persons, socialSecurityRecords);

// 3. Supplemental income sources (NEW)
let supplementalIncome = calculateSupplementalIncome(incomeSources, age, isRetired);

// 4. Rental income (NEW)
let rentalIncome = calculateRentalIncome(assets, yearIndex);

// 5. Retirement account withdrawals (NEW - CRITICAL)
const withdrawal = calculateRequiredWithdrawal(
  currentTraditionalIRA,
  currentRothIRA,
  currentInvestmentAccounts,
  annualSpending,
  netIncome,
  age
);
```

**Lines ~387-390**: Replace flat tax with comprehensive calculation
```javascript
// Determine current state for this year (accounts for state changes)
const currentState = getCurrentState(age, isRetired, workingState, retirementState, stateChangeOption, stateChangeAge);

// Calculate taxable income by category
const ordinaryIncome = salaryIncome + spouse2SalaryIncome + supplementalIncome + rentalIncome + withdrawal.traditionalIRA;
const capitalGainsIncome = withdrawal.investmentAccounts + currentSaleProceeds;
const socialSecurityIncome = ssIncome;

// Apply standard deduction to ordinary income
const taxableOrdinaryIncome = applyStandardDeduction(
  ordinaryIncome + calculateTaxableSocialSecurity(socialSecurityIncome, ordinaryIncome + capitalGainsIncome, filingStatus),
  filingStatus
);

// Calculate taxes by category (using currentState which changes based on age/retirement)
const federalOrdinaryTax = calculateFederalTax(taxableOrdinaryIncome, filingStatus);
const federalCapitalGainsTax = calculateCapitalGainsTax(capitalGainsIncome, taxableOrdinaryIncome, filingStatus);
const stateTax = calculateStateTax(taxableOrdinaryIncome + capitalGainsIncome, currentState, filingStatus);

const totalTaxes = federalOrdinaryTax + federalCapitalGainsTax + stateTax;
```

**NEW FUNCTION**: calculateRequiredWithdrawal()
```javascript
function calculateRequiredWithdrawal(
  traditionalIRA,
  rothIRA,
  investmentAccounts,
  annualSpending,
  salaryIncome,
  supplementalIncome,
  socialSecurityIncome,
  age,
  birthYear,
  filingStatus,
  withdrawalStrategy = 'waterfall'
) {
  const shortfall = annualSpending - (salaryIncome + supplementalIncome);

  if (shortfall <= 0) {
    // No withdrawal needed; still earning enough
    return { traditionalIRA: 0, rothIRA: 0, investmentAccounts: 0, total: 0 };
  }

  // Check for RMD requirement (age depends on birth year per SECURE Act 2.0)
  const rmdStartAge = getRMDStartAge(birthYear);
  const rmdAmount = age >= rmdStartAge ? calculateRMD(traditionalIRA, age, birthYear) : 0;

  if (withdrawalStrategy === 'waterfall') {
    return calculateWaterfallWithdrawal(
      traditionalIRA,
      rothIRA,
      investmentAccounts,
      shortfall,
      rmdAmount
    );
  } else if (withdrawalStrategy === 'tax-bracket-fill') {
    return calculateTaxBracketFillWithdrawal(
      traditionalIRA,
      rothIRA,
      investmentAccounts,
      shortfall,
      rmdAmount,
      salaryIncome,
      supplementalIncome,
      socialSecurityIncome,
      filingStatus
    );
  }

  // Default to waterfall if unknown strategy
  return calculateWaterfallWithdrawal(
    traditionalIRA,
    rothIRA,
    investmentAccounts,
    shortfall,
    rmdAmount
  );
}

function calculateWaterfallWithdrawal(traditionalIRA, rothIRA, investmentAccounts, shortfall, rmdAmount) {
  let remaining = Math.max(shortfall, rmdAmount);
  let fromInvestment = 0;
  let fromTraditional = 0;
  let fromRoth = 0;

  // Waterfall strategy:
  // 1. Investment accounts first (capital gains treatment)
  if (remaining > 0 && investmentAccounts > 0) {
    fromInvestment = Math.min(remaining, investmentAccounts);
    remaining -= fromInvestment;
  }

  // 2. Traditional IRA second (ordinary income)
  if (remaining > 0 && traditionalIRA > 0) {
    fromTraditional = Math.min(remaining, traditionalIRA);
    remaining -= fromTraditional;
  }

  // Ensure RMD is met
  if (rmdAmount > fromTraditional && traditionalIRA > 0) {
    fromTraditional = Math.min(rmdAmount, traditionalIRA);
  }

  // 3. Roth IRA last (tax-free, preserve)
  if (remaining > 0 && rothIRA > 0) {
    fromRoth = Math.min(remaining, rothIRA);
  }

  return {
    investmentAccounts: fromInvestment,
    traditionalIRA: fromTraditional,
    rothIRA: fromRoth,
    total: fromInvestment + fromTraditional + fromRoth
  };
}

function calculateTaxBracketFillWithdrawal(
  traditionalIRA,
  rothIRA,
  investmentAccounts,
  shortfall,
  rmdAmount,
  salaryIncome,
  supplementalIncome,
  socialSecurityIncome,
  filingStatus
) {
  // This strategy fills available bracket room with Traditional IRA withdrawals before other sources
  // Step 1: Calculate available bracket room considering Social Security taxation
  const standardDeduction = getStandardDeduction(filingStatus);

  // Combined income for SS taxation threshold: AGI + 1/2 of SS benefits
  const combinedIncomeForSS = salaryIncome + supplementalIncome + socialSecurityIncome * 0.5;

  // Calculate taxable SS (complex formula, depends on combined income and filing status)
  const taxableSS = calculateTaxableSocialSecurity(socialSecurityIncome, combinedIncomeForSS, filingStatus);

  // Current non-withdrawal income that affects bracket fill
  const baseIncome = salaryIncome + supplementalIncome + taxableSS;

  // Room available in current bracket before hitting next bracket
  // This is a simplified calculation; in production, iterate through all brackets
  const brackets = getFederalBrackets(filingStatus);
  let availableBracketRoom = 0;
  let taxableIncomeWithoutWithdrawal = Math.max(0, baseIncome - standardDeduction);

  // Find current bracket and available room to top of it
  for (let i = 0; i < brackets.length; i++) {
    if (taxableIncomeWithoutWithdrawal < brackets[i].limit) {
      availableBracketRoom = brackets[i].limit - taxableIncomeWithoutWithdrawal;
      break;
    }
  }

  // Step 2: Fill available bracket room with Traditional IRA first
  let fromTraditional = 0;
  let remaining = shortfall;
  let fromInvestment = 0;
  let fromRoth = 0;

  // Take what we can from Traditional IRA to fill bracket room
  if (availableBracketRoom > 0 && traditionalIRA > 0) {
    fromTraditional = Math.min(availableBracketRoom, traditionalIRA);
    remaining -= fromTraditional;
  }

  // Enforce RMD if required
  if (rmdAmount > fromTraditional && traditionalIRA > 0) {
    fromTraditional = Math.min(rmdAmount, traditionalIRA);
    remaining = Math.max(0, remaining - (rmdAmount - fromTraditional));
  }

  // Step 3: Supplement with investment accounts (capital gains rate may be lower)
  if (remaining > 0 && investmentAccounts > 0) {
    fromInvestment = Math.min(remaining, investmentAccounts);
    remaining -= fromInvestment;
  }

  // Step 4: Roth last (tax-free)
  if (remaining > 0 && rothIRA > 0) {
    fromRoth = Math.min(remaining, rothIRA);
  }

  return {
    investmentAccounts: fromInvestment,
    traditionalIRA: fromTraditional,
    rothIRA: fromRoth,
    total: fromInvestment + fromTraditional + fromRoth
  };
}
```

**Note**: The Tax Bracket Fill strategy requires several helper functions:
- `getStandardDeduction(filingStatus)` - Returns standard deduction amount
- `getFederalBrackets(filingStatus)` - Returns bracket array for the year
- `calculateTaxableSocialSecurity(ssIncome, combinedIncome, filingStatus)` - Complex SS taxation logic

**NEW FUNCTION**: getRMDStartAge()
```javascript
// Determine RMD start age based on birth year (SECURE Act 2.0)
function getRMDStartAge(birthYear) {
  if (birthYear < 1951) {
    return 72; // Born before 1951: RMD at 72
  } else if (birthYear <= 1959) {
    return 73; // Born 1951-1959: RMD at 73
  } else {
    return 75; // Born 1960 or later: RMD at 75
  }
}
```

**NEW FUNCTION**: calculateRMD()
```javascript
// RMD calculation based on IRS Uniform Lifetime Table
// birthYear: person's birth year to determine RMD start age
function calculateRMD(accountBalance, age, birthYear) {
  const rmdStartAge = getRMDStartAge(birthYear);

  const distributionPeriods = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
    78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5,
    83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
    88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
    93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8,
    98: 7.3, 99: 6.8, 100: 6.4
  };

  if (age < rmdStartAge) return 0;

  const period = distributionPeriods[Math.min(age, 100)] || 6.4;
  return accountBalance / period;
}
```

### Phase 3: Income Integration

#### Social Security Integration
**NEW FUNCTION**: calculateSocialSecurityIncome()
```javascript
function calculateSocialSecurityIncome(currentAge, persons, socialSecurityRecords) {
  let totalSSIncome = 0;

  persons.forEach(person => {
    if (!person.includeInCalculations) return;

    const personAge = calculateAge(person.birthMonth, person.birthYear);
    const ssRecord = socialSecurityRecords.find(r => r.personId === person.id);

    if (!ssRecord) return;

    // Check if this person has reached claiming age
    if (personAge >= ssRecord.plannedClaimingAge) {
      // Apply actuarial adjustment for early/late claiming
      const adjustment = calculateSSAdjustment(ssRecord.plannedClaimingAge, ssRecord.estimatedAnnualBenefit);
      totalSSIncome += adjustment;
    }
  });

  return totalSSIncome;
}

function calculateSSAdjustment(claimingAge, benefitAtFRA) {
  // FRA = 67
  // Early claiming (62-66): reduce by ~6-7% per year
  // Late claiming (68-70): increase by 8% per year
  const FRA = 67;
  const yearsDiff = claimingAge - FRA;

  if (yearsDiff < 0) {
    // Early claiming penalty: ~6.67% per year
    return benefitAtFRA * Math.pow(0.9333, Math.abs(yearsDiff));
  } else if (yearsDiff > 0) {
    // Delayed retirement credits: 8% per year
    return benefitAtFRA * (1 + (yearsDiff * 0.08));
  } else {
    return benefitAtFRA;
  }
}
```

#### Supplemental Income Integration
**NEW FUNCTION**: calculateSupplementalIncome()
```javascript
function calculateSupplementalIncome(incomeSources, yearIndex, isRetired) {
  // Option: user can mark income sources as "pre-retirement only" or "continues in retirement"
  return incomeSources.reduce((total, source) => {
    // Apply annual growth
    const currentAmount = source.annualSalary * Math.pow(1 + (source.annualSalaryIncrease || 0) / 100, yearIndex);
    return total + currentAmount;
  }, 0);
}
```

#### Rental Income Integration
**NEW FUNCTION**: calculateRentalIncome()
```javascript
function calculateRentalIncome(assets, yearIndex) {
  return assets.reduce((total, asset) => {
    if (!asset.rentalIncome) return total;

    // Apply annual growth to rental income
    const currentRent = asset.rentalIncome * Math.pow(1 + (asset.rentalIncomeAnnualIncrease || 0) / 100, yearIndex);
    return total + currentRent;
  }, 0);
}
```

### Phase 4: Account Balance Updates

**CRITICAL**: Update account balances to reflect withdrawals

After withdrawal calculation (around line 420):
```javascript
// Apply withdrawals (reduce balances)
currentInvestmentAccounts = Math.max(0, currentInvestmentAccounts - withdrawal.investmentAccounts);
currentTraditionalIRA = Math.max(0, currentTraditionalIRA - withdrawal.traditionalIRA);
currentRothIRA = Math.max(0, currentRothIRA - withdrawal.rothIRA);

// Then apply growth and contributions
if (yearIndex > 0) {
  currentTraditionalIRA = currentTraditionalIRA * (1 + investmentReturn / 100) + traditionalContribution;
  currentRothIRA = currentRothIRA * (1 + investmentReturn / 100) + rothContribution;
  currentInvestmentAccounts = currentInvestmentAccounts * (1 + investmentReturn / 100) + investmentContribution;
}
```

### Phase 5: UI Updates

#### Tax Tab Enhancements (InputForm.jsx lines 665-695)

**Replace existing tax inputs with**:
```javascript
{activeTab === 'taxes' && (
  <section className="form-section">
    <h3>Tax Configuration</h3>

    {/* Filing Status */}
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="filingStatus">Filing Status</label>
        <select
          id="filingStatus"
          name="filingStatus"
          value={formData.filingStatus || 'single'}
          onChange={handleChange}
        >
          <option value="single">Single</option>
          <option value="married-joint">Married Filing Jointly</option>
          <option value="married-separate">Married Filing Separately</option>
          <option value="head-of-household">Head of Household</option>
        </select>
      </div>
    </div>

    {/* State Configuration */}
    <h4>State Tax Configuration</h4>
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="workingState">Working State (Current/Pre-Retirement)</label>
        <select
          id="workingState"
          name="workingState"
          value={formData.workingState || ''}
          onChange={handleChange}
          required
        >
          <option value="">-- Select State --</option>
          {stateList.map(state => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="retirementState">Retirement State (Optional)</label>
        <select
          id="retirementState"
          name="retirementState"
          value={formData.retirementState || ''}
          onChange={handleChange}
        >
          <option value="">-- No state change --</option>
          {stateList.map(state => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        <small>Select a different state if you plan to relocate upon retirement</small>
      </div>
    </div>

    {/* State Change Timing - only show if retirementState is selected */}
    {formData.retirementState && (
      <>
        <h4>When to change states?</h4>
        <div className="form-group">
          <label>
            <input
              type="radio"
              name="stateChangeOption"
              value="at-retirement"
              checked={formData.stateChangeOption === 'at-retirement'}
              onChange={handleChange}
            />
            At retirement age ({formData.retirementAge || 65})
          </label>
          <label>
            <input
              type="radio"
              name="stateChangeOption"
              value="at-age"
              checked={formData.stateChangeOption === 'at-age'}
              onChange={handleChange}
            />
            At specific age
          </label>
        </div>

        {formData.stateChangeOption === 'at-age' && (
          <div className="form-group">
            <label htmlFor="stateChangeAge">Age to move to {getStateName(formData.retirementState)}</label>
            <input
              type="number"
              id="stateChangeAge"
              name="stateChangeAge"
              value={formData.stateChangeAge || ''}
              onChange={handleChange}
              min={formData.currentAge}
              max={formData.deathAge}
            />
          </div>
        )}
      </>
    )}

    <div className="info-section">
      <p><strong>Federal Tax Brackets:</strong> 2025 IRS progressive rates (10%, 12%, 22%, 24%, 32%, 35%, 37%)</p>
      <p><strong>Standard Deduction:</strong> ${getStandardDeduction(formData.filingStatus).toLocaleString()}</p>
      <p><strong>Working State Tax:</strong> {getStateTaxInfo(formData.workingState)}</p>
      {formData.retirementState && (
        <p><strong>Retirement State Tax:</strong> {getStateTaxInfo(formData.retirementState)}</p>
      )}
    </div>
  </section>
)}
```

#### Dashboard Updates (Dashboard.jsx)

**Add tax breakdown visualization**:
- Federal ordinary income tax
- Federal capital gains tax
- State tax
- Total taxes
- Effective tax rate percentage

**Add withdrawal breakdown**:
- From Traditional IRA
- From Roth IRA
- From Investment Accounts
- Total withdrawals

### Phase 6: Data Migration

**Migration script** (run on server startup in server/db.js):
```javascript
// Check if migration needed
db.get('SELECT workingState FROM financial_data LIMIT 1', (err, row) => {
  if (err) {
    // Column doesn't exist, run migration
    db.run('ALTER TABLE financial_data ADD COLUMN workingState TEXT DEFAULT NULL');
    db.run('ALTER TABLE financial_data ADD COLUMN retirementState TEXT DEFAULT NULL');
    db.run('ALTER TABLE financial_data ADD COLUMN stateChangeOption TEXT DEFAULT "at-retirement"');
    db.run('ALTER TABLE financial_data ADD COLUMN stateChangeAge INTEGER DEFAULT NULL');
    db.run('ALTER TABLE financial_data ADD COLUMN filingStatus TEXT DEFAULT "single"');
    db.run('ALTER TABLE financial_data ADD COLUMN withdrawalStrategy TEXT DEFAULT "waterfall"');

    // Optional: Drop old columns (or keep for backward compatibility)
    // db.run('ALTER TABLE financial_data DROP COLUMN federalTaxRate');
    // db.run('ALTER TABLE financial_data DROP COLUMN stateTaxRate');

    console.log('Tax system migration completed');
  }
});
```

## Implementation Sequence

1. **Create tax config files** (federalTaxBrackets.js, stateTaxConfig.js)
2. **Create tax calculation utilities** (taxCalculations.js with all tax functions)
3. **Update database schema** (add workingState, retirementState, stateChangeOption, stateChangeAge, filingStatus, withdrawalStrategy to financial_data)
4. **Update Tax tab UI** (state dropdowns, filing status selector, withdrawal strategy dropdown)
5. **Implement withdrawal logic** (calculateRequiredWithdrawal with both waterfall and tax-bracket-fill strategies, calculateRMD)
6. **Implement bracket fill helpers** (getStandardDeduction, getFederalBrackets, calculateTaxableSocialSecurity)
7. **Integrate income sources** (Social Security, supplemental, rental)
8. **Update calculation engine** (replace flat tax with progressive calculations, account for state changes)
9. **Update account balance logic** (apply withdrawals before growth)
10. **Update Dashboard/DataTable** (show new tax and withdrawal breakdowns)
11. **Test thoroughly** (various scenarios: single/married, different states, retirement phases, both withdrawal strategies)

## Critical Files to Modify

### New Files:
- `src/config/federalTaxBrackets.js`
- `src/config/stateTaxConfig.js`
- `src/utils/taxCalculations.js`

### Modified Files:
- `server/db.js` (schema changes)
- `server/routes/financial.js` (handle new fields)
- `src/utils/calculations.js` (calculateRetirementProjection - MAJOR refactor)
- `src/components/InputForm.jsx` (Tax tab UI)
- `src/components/Dashboard.jsx` (tax/withdrawal display)
- `src/components/DataTable.jsx` (add tax columns)
- `src/App.jsx` (pass socialSecurityRecords, incomeSources to calculations)

## Testing Scenarios

1. **Single filer in California**: High state tax, full federal brackets
2. **Married filing jointly in Texas**: No state tax, higher federal deduction
3. **Early retirement (age 55)**: Withdrawal strategy before Social Security
4. **RMD enforcement**: Test at RMD start ages (72, 73, 75) based on birth year per SECURE Act 2.0
5. **Multiple income sources**: Salary + Social Security + rental income
6. **Asset sale**: Capital gains tax calculation

## Success Criteria

- [ ] Progressive federal tax brackets applied correctly
- [ ] State-specific tax rates applied based on residenceState
- [ ] Retirement accounts decrease each year during retirement (withdrawals working)
- [ ] Traditional IRA withdrawals taxed as ordinary income
- [ ] Roth IRA withdrawals not taxed
- [ ] Investment account withdrawals taxed as capital gains
- [ ] Social Security taxation applied (up to 85% taxable)
- [ ] RMDs enforced at correct age based on birth year (72, 73, or 75 per SECURE Act 2.0)
- [ ] All income sources integrated (salary, SS, supplemental, rental)
- [ ] Tax breakdown visible in Dashboard and DataTable
- [ ] Withdrawal strategy visible in output data

## Notes

- This is a MAJOR refactor of the calculation engine
- Test extensively with real-world scenarios
- Consider adding a tax summary component showing bracket breakdown
- May want to add ability to override standard deduction for itemizers
- Consider adding state-specific deductions (e.g., CA allows some federal deductions)
- Capital gains cost basis tracking would require storing purchase price/date for assets
