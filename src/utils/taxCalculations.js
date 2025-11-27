/**
 * Tax Calculation Utilities
 * Handles federal, state, and Social Security tax calculations
 */

import {
  federalTaxBrackets2025,
  standardDeductions2025,
  capitalGainsBrackets2025,
  socialSecurityThresholds2025
} from '../config/federalTaxBrackets.js';
import { stateTaxData } from '../config/stateTaxConfig.js';

/**
 * Calculate federal income tax using progressive brackets
 * @param {number} taxableIncome - Income after standard deduction
 * @param {string} filingStatus - 'single', 'married-joint', 'married-separate', 'head-of-household'
 * @param {number} year - Tax year (currently only 2025 supported)
 * @returns {number} Total federal tax owed
 */
export function calculateFederalTax(taxableIncome, filingStatus = 'single', year = 2025) {
  if (taxableIncome <= 0) return 0;

  const brackets = federalTaxBrackets2025[filingStatus] || federalTaxBrackets2025.single;
  let tax = 0;
  let previousLimit = 0;

  // Debug logging - DISABLED
  /*
  const isDebug = taxableIncome > 100000 && taxableIncome < 200000;
  if (isDebug) {
    console.log('calculateFederalTax debug:');
    console.log('  filingStatus:', filingStatus);
    console.log('  taxableIncome:', taxableIncome);
    console.log('  brackets:', brackets);
  }
  */

  for (const bracket of brackets) {
    const incomeInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
    if (incomeInBracket > 0) {
      tax += incomeInBracket * bracket.rate;
      /*
      if (isDebug) {
        console.log(`    Bracket ${bracket.rate*100}%: income=${incomeInBracket}, tax=${incomeInBracket * bracket.rate}`);
      }
      */
    }
    if (taxableIncome <= bracket.limit) {
      break;
    }
    previousLimit = bracket.limit;
  }

  /*
  if (isDebug) {
    console.log('  Total tax:', tax);
  }
  */

  return tax;
}

/**
 * Calculate state income tax using progressive brackets or flat rate
 * @param {number} taxableIncome - Income after standard deduction (if applicable)
 * @param {string} stateCode - Two-letter state code (e.g., 'CA', 'TX')
 * @param {string} filingStatus - Filing status for bracket calculation
 * @returns {number} Total state tax owed
 */
export function calculateStateTax(taxableIncome, stateCode = 'TX', filingStatus = 'single') {
  if (taxableIncome <= 0) return 0;

  const stateConfig = stateTaxData[stateCode];
  if (!stateConfig) {
    console.warn(`Unknown state code: ${stateCode}, defaulting to 0% tax`);
    return 0;
  }

  // Flat rate states
  if (!stateConfig.hasBrackets) {
    return taxableIncome * stateConfig.flatRate;
  }

  // Bracket-based states
  const brackets = stateConfig.brackets[filingStatus] || stateConfig.brackets.single;
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const incomeInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
    if (incomeInBracket > 0) {
      tax += incomeInBracket * bracket.rate;
    }
    if (taxableIncome <= bracket.limit) {
      break;
    }
    previousLimit = bracket.limit;
  }

  return tax;
}

/**
 * Calculate how much of Social Security benefits are taxable
 * Based on "combined income" which is AGI + 50% of SS benefits
 * @param {number} ssIncome - Gross Social Security benefits
 * @param {number} otherIncome - AGI (salary + supplemental + other non-SS income)
 * @param {string} filingStatus - Filing status
 * @returns {number} Amount of SS benefits that are taxable
 */
export function calculateTaxableSocialSecurity(ssIncome, otherIncome, filingStatus = 'single') {
  const thresholds = socialSecurityThresholds2025[filingStatus] || socialSecurityThresholds2025.single;

  // Combined income = AGI + 50% of SS
  const combinedIncome = otherIncome + (ssIncome * 0.5);

  let taxableSS = 0;

  // Step 1: Check if combined income exceeds first threshold
  if (combinedIncome > thresholds.firstThreshold) {
    // Portion above first threshold: up to 50% of SS is taxable
    const excessOverFirst = combinedIncome - thresholds.firstThreshold;
    const taxableUnderRule1 = Math.min(excessOverFirst * 0.5, ssIncome * 0.5);
    taxableSS = taxableUnderRule1;

    // Step 2: Check if combined income exceeds second threshold
    if (combinedIncome > thresholds.secondThreshold) {
      // Additional excess: up to 85% of SS is taxable
      const excessOverSecond = combinedIncome - thresholds.secondThreshold;
      const taxableUnderRule2 = Math.min(excessOverSecond * 0.85, ssIncome * 0.85 - taxableUnderRule1);
      taxableSS += taxableUnderRule2;
    }
  }

  // Cap at 85% of total SS benefits
  return Math.min(taxableSS, ssIncome * 0.85);
}

/**
 * Apply standard deduction and return taxable income
 * @param {number} grossIncome - Gross income before deduction
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @param {number} customDeduction - Optional custom deduction to use instead of standard
 * @returns {number} Taxable income (minimum 0)
 */
export function applyStandardDeduction(grossIncome, filingStatus = 'single', year = 2025, customDeduction = null) {
  const standardDeduction = customDeduction !== null ? customDeduction : (standardDeductions2025[filingStatus] || standardDeductions2025.single);
  return Math.max(0, grossIncome - standardDeduction);
}

/**
 * Get standard deduction amount for filing status
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @returns {number} Standard deduction amount
 */
export function getStandardDeduction(filingStatus = 'single', year = 2025) {
  return standardDeductions2025[filingStatus] || standardDeductions2025.single;
}

/**
 * Calculate federal long-term capital gains tax
 * @param {number} capitalGains - Amount of capital gains
 * @param {number} ordinaryIncome - Ordinary income that fills lower brackets
 * @param {string} filingStatus - Filing status
 * @returns {number} Capital gains tax owed
 */
export function calculateCapitalGainsTax(capitalGains, ordinaryIncome, filingStatus = 'single') {
  if (capitalGains <= 0) return 0;

  const brackets = capitalGainsBrackets2025[filingStatus] || capitalGainsBrackets2025.single;
  const totalIncome = ordinaryIncome + capitalGains;

  let tax = 0;
  let gainsRemaining = capitalGains;

  // Find which brackets the capital gains fall into
  for (const bracket of brackets) {
    if (gainsRemaining <= 0) break;

    // Determine how much of this bracket is available for capital gains
    const incomeAboveThreshold = Math.max(0, totalIncome - bracket.threshold);
    const gainsInThisBracket = Math.min(gainsRemaining, incomeAboveThreshold);

    tax += gainsInThisBracket * bracket.rate;
    gainsRemaining -= gainsInThisBracket;
  }

  return tax;
}

/**
 * Determine RMD start age based on birth year per SECURE Act 2.0
 * @param {number} birthYear - Birth year of account owner
 * @returns {number} Age at which RMDs must begin
 */
export function getRMDStartAge(birthYear) {
  if (birthYear < 1951) {
    return 72; // Born before 1951: RMD at 72
  } else if (birthYear <= 1959) {
    return 73; // Born 1951-1959: RMD at 73
  } else {
    return 75; // Born 1960 or later: RMD at 75
  }
}

/**
 * Calculate Required Minimum Distribution from Traditional IRA
 * Based on IRS Uniform Lifetime Table
 * @param {number} accountBalance - Balance of Traditional IRA/401k
 * @param {number} age - Current age of account owner
 * @param {number} birthYear - Birth year to determine RMD start age
 * @returns {number} RMD amount
 */
export function calculateRMD(accountBalance, age, birthYear) {
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

/**
 * Waterfall withdrawal strategy: Investment → Traditional → Roth
 * @param {number} traditionalIRA - Traditional IRA/401k balance
 * @param {number} rothIRA - Roth IRA balance
 * @param {number} investmentAccounts - Taxable investment account balance
 * @param {number} shortfall - Amount needed from withdrawals
 * @param {number} rmdAmount - Required Minimum Distribution amount
 * @returns {object} Withdrawal amounts: { investmentAccounts, traditionalIRA, rothIRA, total }
 */
export function calculateWaterfallWithdrawal(
  traditionalIRA,
  rothIRA,
  investmentAccounts,
  shortfall,
  rmdAmount
) {
  let remaining = Math.max(shortfall, rmdAmount);
  let fromInvestment = 0;
  let fromTraditional = 0;
  let fromRoth = 0;

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

/**
 * Tax bracket fill withdrawal strategy: Fill brackets with Traditional IRA first
 * @param {number} traditionalIRA - Traditional IRA/401k balance
 * @param {number} rothIRA - Roth IRA balance
 * @param {number} investmentAccounts - Taxable investment account balance
 * @param {number} shortfall - Amount needed from withdrawals
 * @param {number} rmdAmount - Required Minimum Distribution amount
 * @param {number} salaryIncome - Current salary income
 * @param {number} supplementalIncome - Supplemental income sources
 * @param {number} socialSecurityIncome - Social Security benefits
 * @param {string} filingStatus - Filing status
 * @returns {object} Withdrawal amounts: { investmentAccounts, traditionalIRA, rothIRA, total }
 */
export function calculateTaxBracketFillWithdrawal(
  traditionalIRA,
  rothIRA,
  investmentAccounts,
  shortfall,
  rmdAmount,
  salaryIncome,
  supplementalIncome,
  socialSecurityIncome,
  filingStatus = 'single'
) {
  // Step 1: Calculate available bracket room considering Social Security taxation
  const standardDeduction = getStandardDeduction(filingStatus);

  // Combined income for SS taxation threshold: AGI + 1/2 of SS benefits
  const combinedIncomeForSS = salaryIncome + supplementalIncome + socialSecurityIncome * 0.5;

  // Calculate taxable SS
  const taxableSS = calculateTaxableSocialSecurity(socialSecurityIncome, salaryIncome + supplementalIncome, filingStatus);

  // Current non-withdrawal income that affects bracket fill
  const baseIncome = salaryIncome + supplementalIncome + taxableSS;

  // Get federal brackets
  const brackets = federalTaxBrackets2025[filingStatus] || federalTaxBrackets2025.single;
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

/**
 * Calculate required withdrawal based on selected strategy
 * @param {number} traditionalIRA - Traditional IRA/401k balance
 * @param {number} rothIRA - Roth IRA balance
 * @param {number} investmentAccounts - Taxable investment account balance
 * @param {number} annualSpending - Annual spending needed
 * @param {number} salaryIncome - Salary income
 * @param {number} supplementalIncome - Supplemental income
 * @param {number} socialSecurityIncome - Social Security income
 * @param {number} age - Current age
 * @param {number} birthYear - Birth year for RMD determination
 * @param {string} filingStatus - Filing status
 * @param {string} withdrawalStrategy - Strategy to use: 'waterfall' or 'tax-bracket-fill'
 * @returns {object} Withdrawal breakdown
 */
export function calculateRequiredWithdrawal(
  traditionalIRA,
  rothIRA,
  investmentAccounts,
  annualSpending,
  salaryIncome,
  supplementalIncome,
  socialSecurityIncome,
  age,
  birthYear,
  filingStatus = 'single',
  withdrawalStrategy = 'waterfall'
) {
  const shortfall = annualSpending - (salaryIncome + supplementalIncome);

  if (shortfall <= 0) {
    // No withdrawal needed; still earning enough
    return { investmentAccounts: 0, traditionalIRA: 0, rothIRA: 0, total: 0 };
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
