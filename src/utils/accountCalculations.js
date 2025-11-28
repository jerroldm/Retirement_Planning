/**
 * Account Calculation Helpers
 *
 * Manages individual savings account tracking throughout retirement projections.
 * Supports per-account contributions, withdrawals, and growth calculations.
 */

/**
 * Initialize individual account state tracking
 * @param {Array} savingsAccounts - Array of savings accounts from database
 * @returns {Array} Array of account state objects with tracking properties
 */
export function initializeAccountStates(savingsAccounts) {
  if (!savingsAccounts || savingsAccounts.length === 0) {
    return [];
  }

  return savingsAccounts.map(account => ({
    id: account.id,
    accountName: account.accountName,
    accountType: account.accountType,
    personId: account.personId,
    currentBalance: parseFloat(account.currentBalance) || 0,
    annualContribution: parseFloat(account.annualContribution) || 0,
    companyMatch: parseFloat(account.companyMatch) || 0,
    stopContributingMode: account.stopContributingMode || 'retirement',
    stopContributingAge: account.stopContributingAge,
    stopContributingMonth: account.stopContributingMonth,
    stopContributingYear: account.stopContributingYear,
    yearlyHistory: [], // Year-by-year breakdown of this account
    yearlyWithdrawal: 0, // Accumulated withdrawals for current year
    pendingContribution: 0, // Pending contribution for current year
    pendingMatch: 0 // Pending company match for current year
  }));
}

/**
 * Check if account should receive contributions this year
 * Respects three stop contributing modes:
 * - 'retirement': Stop contributions at retirement age
 * - 'specific-age': Stop at specified age
 * - 'specific-date': Stop at specified month/year
 *
 * @param {Object} account - Account state object
 * @param {number} age - Current age in projection
 * @param {number} calendarYear - Calendar year of projection
 * @param {number} retirementAge - Age at which person retires
 * @param {boolean} isRetirementYear - Whether this is the year of retirement
 * @returns {boolean} Whether account should receive contributions
 */
export function checkShouldContribute(account, age, calendarYear, retirementAge, isRetirementYear) {
  const mode = account.stopContributingMode;

  if (mode === 'retirement') {
    // Stop at retirement age, but allow contributions during retirement year
    return age < retirementAge || isRetirementYear;
  }

  if (mode === 'specific-age') {
    // Stop at specified age
    const stopAge = account.stopContributingAge;
    return age < (stopAge || 999);
  }

  if (mode === 'specific-date') {
    // Stop at specified month/year
    const stopYear = account.stopContributingYear;
    if (calendarYear < stopYear) return true;
    if (calendarYear > stopYear) return false;
    // Same year - conservatively assume contributions for full year
    return true;
  }

  // Default: allow contributions
  return true;
}

/**
 * Allocate withdrawals across accounts using sequential smallest-first strategy
 *
 * This function bridges TYPE-level withdrawal strategies (from existing tax logic)
 * with ACCOUNT-level allocation. It determines which specific accounts to withdraw from.
 *
 * Sequential smallest-first means: drain the smallest account completely, then the next
 * smallest, etc. This is useful for consolidating small accounts over time.
 *
 * @param {Array} accountStates - Array of account state objects
 * @param {Object} withdrawalByType - Object with withdrawal amounts by type
 *   Example: { 'investment-account': 10000, 'traditional-ira': 5000, 'roth-ira': 0 }
 * @returns {Array} Array of allocation objects with { accountId, accountType, amount }
 */
export function allocateWithdrawals(accountStates, withdrawalByType) {
  const allocations = [];

  // Process each account type in standard order (matching withdrawal strategy)
  const accountTypes = ['investment-account', 'traditional-ira', 'roth-ira', 'savings-account', 'other-account'];

  for (const accountType of accountTypes) {
    const amountNeeded = withdrawalByType[accountType] || 0;
    if (amountNeeded <= 0.01) continue; // Skip if no withdrawal needed

    // Get accounts of this type, sorted SMALLEST to LARGEST
    const accountsOfType = accountStates
      .filter(a => a.accountType === accountType && a.currentBalance > 0.01)
      .sort((a, b) => a.currentBalance - b.currentBalance);

    if (accountsOfType.length === 0) continue;

    let remaining = amountNeeded;

    // Drain accounts sequentially from smallest to largest
    for (const account of accountsOfType) {
      if (remaining <= 0.01) break;

      const withdrawFromThisAccount = Math.min(remaining, account.currentBalance);

      allocations.push({
        accountId: account.id,
        accountType: account.accountType,
        amount: withdrawFromThisAccount
      });

      remaining -= withdrawFromThisAccount;
    }

    // Log warning if we couldn't allocate full withdrawal amount
    if (remaining > 0.01) {
      console.warn(`[allocateWithdrawals] Unable to allocate full ${accountType} withdrawal. ` +
        `Requested: ${amountNeeded}, Remaining unallocated: ${remaining}`);
    }
  }

  return allocations;
}

/**
 * Compute aggregate balances from individual accounts
 * Used for backward compatibility with existing dashboard and calculations
 *
 * @param {Array} accountStates - Array of account state objects
 * @returns {Object} Object with aggregated balances by type
 *   Example: { traditionalIRA: 150000, rothIRA: 100000, investmentAccounts: 250000 }
 */
export function computeAggregates(accountStates) {
  const aggregates = {
    traditionalIRA: 0,
    rothIRA: 0,
    investmentAccounts: 0
  };

  for (const account of accountStates) {
    if (account.accountType === 'traditional-ira') {
      aggregates.traditionalIRA += account.currentBalance;
    } else if (account.accountType === 'roth-ira') {
      aggregates.rothIRA += account.currentBalance;
    } else if (account.accountType === 'investment-account') {
      aggregates.investmentAccounts += account.currentBalance;
    }
    // Note: savings-account and other-account types are not aggregated into main categories
    // They may be handled separately or included in investmentAccounts depending on strategy
  }

  return aggregates;
}

/**
 * Compute total balance across all accounts
 * @param {Array} accountStates - Array of account state objects
 * @returns {number} Total balance across all accounts
 */
export function computeTotalBalance(accountStates) {
  return accountStates.reduce((sum, account) => sum + account.currentBalance, 0);
}

/**
 * Validate that individual account balances match aggregate totals
 * Used for debugging and ensuring calculation consistency
 *
 * @param {Array} accountStates - Array of account state objects
 * @param {Object} expectedAggregates - Expected aggregate totals
 * @returns {boolean} Whether individual accounts sum to expected aggregates
 */
export function validateAggregateConsistency(accountStates, expectedAggregates) {
  const computed = computeAggregates(accountStates);

  const tolerance = 0.01; // Allow 1 cent rounding difference

  const isConsistent =
    Math.abs(computed.traditionalIRA - (expectedAggregates.traditionalIRA || 0)) < tolerance &&
    Math.abs(computed.rothIRA - (expectedAggregates.rothIRA || 0)) < tolerance &&
    Math.abs(computed.investmentAccounts - (expectedAggregates.investmentAccounts || 0)) < tolerance;

  if (!isConsistent) {
    console.warn('[validateAggregateConsistency] Mismatch detected:', {
      computed,
      expected: expectedAggregates
    });
  }

  return isConsistent;
}
