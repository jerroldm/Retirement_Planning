/**
 * Core calculation engine for retirement planning
 */

import {
  calculateFederalTax,
  calculateStateTax,
  calculateTaxableSocialSecurity,
  applyStandardDeduction,
  calculateCapitalGainsTax,
  calculateRequiredWithdrawal,
  getRMDStartAge,
} from './taxCalculations.js';

import {
  initializeAccountStates,
  checkShouldContribute,
  allocateWithdrawals,
  computeAggregates,
  computeTotalBalance,
  validateAggregateConsistency,
} from './accountCalculations.js';

// Helper function to calculate age from birth month and year
export const calculateAge = (birthMonth, birthYear) => {
  if (!birthMonth || !birthYear) return 0;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  let age = currentYear - birthYear;

  // If birthday hasn't occurred this year yet, subtract 1
  if (currentMonth < birthMonth) {
    age--;
  }

  return age;
};

// Helper function to calculate how many months of mortgage payment are due this year
const calculateMonthsOfMortgagePayment = (yearIndex, currentMonth, payoffYear, payoffMonth, startCalendarYear) => {
  const projectedYear = startCalendarYear + yearIndex;

  // Current year (yearIndex 0): months from currentMonth to 12
  if (yearIndex === 0) {
    // If payoff is this year, count only months until payoff
    if (projectedYear === payoffYear) {
      return Math.max(0, payoffMonth - currentMonth + 1);
    }
    // Otherwise count remaining months in year
    return 12 - currentMonth + 1;
  }

  // Payoff year: months from January to payoffMonth
  if (projectedYear === payoffYear) {
    return payoffMonth;
  }

  // All other years: full 12 months
  return 12;
};

// Generate full month-by-month mortgage amortization schedule
export const generateMortgageAmortizationSchedule = (inputs, persons = []) => {
  const {
    homeMortgage,
    homeMortgageRate,
    homeMortgageMonthlyPayment,
    homeMortgagePayoffYear,
    homeMortgagePayoffMonth,
    birthMonth,
    birthYear,
    homeMortgageExtraPrincipalPayment,
  } = inputs;

  // Extract primary person's birth data from persons array if available
  let primaryBirthMonth = birthMonth;
  let primaryBirthYear = birthYear;

  if (persons && persons.length > 0) {
    const primaryPerson = persons.find(p => p.personType === 'self' || p.personType === 'primary') || persons[0];
    if (primaryPerson && primaryPerson.includeInCalculations) {
      primaryBirthMonth = primaryPerson.birthMonth || birthMonth;
      primaryBirthYear = primaryPerson.birthYear || birthYear;
    }
  }

  // Get current date information
  const today = new Date();
  const currentCalendarYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  const schedule = [];
  let remainingBalance = homeMortgage;
  const monthlyRateValue = homeMortgageRate / 100 / 12;
  const totalMonthlyPayment = (homeMortgageMonthlyPayment || 0) + (homeMortgageExtraPrincipalPayment || 0);

  // Start from current month
  let year = currentCalendarYear;
  let month = currentMonth;

  while (remainingBalance > 0.01) {
    const startBalance = remainingBalance;

    // Calculate interest for this month
    const interestPayment = startBalance * monthlyRateValue;

    // Determine principal payment (regular + extra)
    let regularPrincipal = 0;
    let additionalPrincipal = homeMortgageExtraPrincipalPayment || 0;
    let endBalance = 0;

    // Regular payment: payment amount minus interest
    regularPrincipal = (homeMortgageMonthlyPayment || 0) - interestPayment;
    endBalance = startBalance - regularPrincipal - additionalPrincipal;

    // If balance goes negative or this is the final payment month, adjust for final payment
    if (endBalance <= 0 || (year === homeMortgagePayoffYear && month === homeMortgagePayoffMonth)) {
      // Final payment: pay off remaining balance (split between regular and additional principal)
      const remainingToPayOff = startBalance - interestPayment;
      regularPrincipal = Math.min(remainingToPayOff, (homeMortgageMonthlyPayment || 0) - interestPayment);
      additionalPrincipal = Math.max(0, remainingToPayOff - regularPrincipal);
      endBalance = 0;
    }

    // Calculate exact age for this payment month/year
    // Must recalculate from birthMonth/birthYear, not from pre-calculated currentAge
    let age = 0;
    if (primaryBirthMonth && primaryBirthYear) {
      age = year - primaryBirthYear;
      if (month < primaryBirthMonth) {
        age--;
      }
    }

    schedule.push({
      month,
      year,
      age,
      startBalance: Math.round(startBalance),
      interestPayment: Math.round(interestPayment),
      principalPayment: Math.round(regularPrincipal),
      additionalPrincipal: Math.round(additionalPrincipal),
      totalPayment: Math.round(interestPayment + regularPrincipal + additionalPrincipal),
      endBalance: Math.round(endBalance),
    });

    remainingBalance = endBalance;

    // Move to next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }

    // Safety check to prevent infinite loops and ensure we stop after payoff
    if (schedule.length > 600 || remainingBalance === 0) break;
  }

  return schedule;
};

export const calculateRetirementProjection = (inputs, persons = [], incomeSources = [], savingsAccounts = [], expenses = []) => {
  const {
    currentAge,
    retirementAge,
    deathAge,
    contributionStopAge,
    currentSalary,
    annualSalaryIncrease,
    traditionalIRA,
    rothIRA,
    investmentAccounts,
    traditionalIRAContribution,
    traditionIRACompanyMatch,
    rothIRAContribution,
    rothIRACompanyMatch,
    investmentAccountsContribution,
    homeValue,
    homeMortgage,
    homeMortgageRate,
    homeMortgageMonthlyPayment,
    homeMortgagePayoffYear,
    homeMortgagePayoffMonth,
    homePropertyTaxInsurance,
    otherAssets,
    preRetirementAnnualExpenses,
    postRetirementAnnualExpenses,
    investmentReturn,
    inflationRate,
    federalTaxRate,
    stateTaxRate,
    allAssets,
    birthMonth,
    birthYear,
    homeSalePlanEnabled,
    homeSaleYear,
    homeSaleMonth,
    workingState = 'TX',
    retirementState = null,
    stateChangeOption = 'at-retirement',
    stateChangeAge = null,
    filingStatus = 'single',
    withdrawalStrategy = 'waterfall',
  } = inputs;

  // Determine if there's a spouse based on persons list
  const isMarried = persons && persons.some(p => p.personType === 'spouse' && p.includeInCalculations);

  // Extract person data from persons array
  let primaryBirthMonth = birthMonth;
  let primaryBirthYear = birthYear;
  let primaryRetirementAge = retirementAge;
  let primaryCurrentSalary = currentSalary;
  let primaryAnnualSalaryIncrease = annualSalaryIncrease;
  let primaryTraditionalIRA = traditionalIRA;
  let primaryRothIRA = rothIRA;
  let primaryInvestmentAccounts = investmentAccounts;
  let primaryTraditionalIRAContribution = traditionalIRAContribution;
  let primaryTraditionalIRACompanyMatch = traditionIRACompanyMatch;
  let primaryRothIRAContribution = rothIRAContribution;
  let primaryRothIRACompanyMatch = rothIRACompanyMatch;
  let primaryInvestmentAccountsContribution = investmentAccountsContribution;
  // Contribution stop age defaults to retirement age (contributions stop when you retire)
  let primaryContributionStopAge = retirementAge;
  let primaryCurrentAge = calculateAge(birthMonth, birthYear);
  let primaryDeathAge = null;

  let spouse2BirthMonth = null;
  let spouse2BirthYear = null;
  let spouse2CurrentAge = 0;
  let spouse2RetirementAge = retirementAge;
  let spouse2CurrentSalary = 0;
  let spouse2AnnualSalaryIncrease = 0;
  let spouse2TraditionalIRA = 0;
  let spouse2RothIRA = 0;
  let spouse2InvestmentAccounts = 0;
  let spouse2TraditionalIRAContribution = 0;
  let spouse2TraditionalIRACompanyMatch = 0;
  let spouse2RothIRAContribution = 0;
  let spouse2RothIRACompanyMatch = 0;
  let spouse2InvestmentAccountsContribution = 0;
  let spouse2ContributionStopAge = retirementAge;
  let spouse2DeathAge = null;

  // Extract data from persons array if available
  console.log('[calculateRetirementProjection] Persons array:', persons);
  if (persons && persons.length > 0) {
    // Find primary person (self/primary)
    const primaryPerson = persons.find(p => p.personType === 'self' || p.personType === 'primary');
    console.log('[calculateRetirementProjection] Primary person found:', primaryPerson);
    if (primaryPerson && primaryPerson.includeInCalculations) {
      if (primaryPerson.birthMonth) primaryBirthMonth = primaryPerson.birthMonth;
      if (primaryPerson.birthYear) primaryBirthYear = primaryPerson.birthYear;
      if (primaryPerson.retirementAge) primaryRetirementAge = primaryPerson.retirementAge;
      if (primaryPerson.deathAge) {
        console.log('[calculateRetirementProjection] Setting primaryDeathAge from person:', primaryPerson.deathAge);
        primaryDeathAge = primaryPerson.deathAge;
      }
      if (primaryPerson.currentSalary) primaryCurrentSalary = primaryPerson.currentSalary;
      if (primaryPerson.annualSalaryIncrease) primaryAnnualSalaryIncrease = primaryPerson.annualSalaryIncrease;
      if (primaryPerson.traditionalIRA) primaryTraditionalIRA = primaryPerson.traditionalIRA;
      if (primaryPerson.rothIRA) primaryRothIRA = primaryPerson.rothIRA;
      if (primaryPerson.investmentAccounts) primaryInvestmentAccounts = primaryPerson.investmentAccounts;
      if (primaryPerson.traditionalIRAContribution) primaryTraditionalIRAContribution = primaryPerson.traditionalIRAContribution;
      if (primaryPerson.traditionIRACompanyMatch) primaryTraditionalIRACompanyMatch = primaryPerson.traditionIRACompanyMatch;
      if (primaryPerson.rothIRAContribution) primaryRothIRAContribution = primaryPerson.rothIRAContribution;
      if (primaryPerson.rothIRACompanyMatch) primaryRothIRACompanyMatch = primaryPerson.rothIRACompanyMatch;
      if (primaryPerson.investmentAccountsContribution) primaryInvestmentAccountsContribution = primaryPerson.investmentAccountsContribution;
      if (primaryPerson.contributionStopAge) primaryContributionStopAge = primaryPerson.contributionStopAge;
      primaryCurrentAge = calculateAge(primaryBirthMonth, primaryBirthYear);
    }

    // Find spouse (if married and spouse exists)
    if (isMarried) {
      const spousePerson = persons.find(p => p.personType === 'spouse');
      if (spousePerson && spousePerson.includeInCalculations) {
        spouse2BirthMonth = spousePerson.birthMonth;
        spouse2BirthYear = spousePerson.birthYear;
        spouse2CurrentAge = calculateAge(spouse2BirthMonth, spouse2BirthYear);
        if (spousePerson.retirementAge) spouse2RetirementAge = spousePerson.retirementAge;
        if (spousePerson.deathAge) spouse2DeathAge = spousePerson.deathAge;
        if (spousePerson.currentSalary) spouse2CurrentSalary = spousePerson.currentSalary;
        if (spousePerson.annualSalaryIncrease) spouse2AnnualSalaryIncrease = spousePerson.annualSalaryIncrease;
        if (spousePerson.traditionalIRA) spouse2TraditionalIRA = spousePerson.traditionalIRA;
        if (spousePerson.rothIRA) spouse2RothIRA = spousePerson.rothIRA;
        if (spousePerson.investmentAccounts) spouse2InvestmentAccounts = spousePerson.investmentAccounts;
        if (spousePerson.traditionalIRAContribution) spouse2TraditionalIRAContribution = spousePerson.traditionalIRAContribution;
        if (spousePerson.traditionIRACompanyMatch) spouse2TraditionalIRACompanyMatch = spousePerson.traditionIRACompanyMatch;
        if (spousePerson.rothIRAContribution) spouse2RothIRAContribution = spousePerson.rothIRAContribution;
        if (spousePerson.rothIRACompanyMatch) spouse2RothIRACompanyMatch = spousePerson.rothIRACompanyMatch;
        if (spousePerson.investmentAccountsContribution) spouse2InvestmentAccountsContribution = spousePerson.investmentAccountsContribution;
        if (spousePerson.contributionStopAge) spouse2ContributionStopAge = spousePerson.contributionStopAge;
      }
    }
  }

  // Fallback to a reasonable default if persons array didn't provide death ages
  // NOTE: We prefer person data over inputs.deathAge because persons table is the source of truth
  const DEFAULT_DEATH_AGE = 95;
  if (primaryDeathAge === null) {
    primaryDeathAge = DEFAULT_DEATH_AGE;
  }
  if (spouse2DeathAge === null && isMarried) {
    spouse2DeathAge = DEFAULT_DEATH_AGE;
  }
  // For single person, spouse2DeathAge should NOT be used in calculations
  // Only set it if married
  if (spouse2DeathAge === null && !isMarried) {
    spouse2DeathAge = primaryDeathAge;  // Use same as primary for consistency, but won't be used in max()
  }

  // Determine projection end age
  let projectionEndAge = primaryDeathAge;
  if (isMarried) {
    projectionEndAge = Math.max(primaryDeathAge, spouse2DeathAge);
  }

  console.log('[calculateRetirementProjection] Final death ages:', {
    isMarried,
    primaryDeathAge,
    spouse2DeathAge,
    projectionEndAge
  });

  // Initialize individual account states for per-account tracking
  // These are used to track the breakdown of withdrawals and contributions by individual account
  let accountStates = initializeAccountStates(savingsAccounts);

  // Also compute aggregates from accounts for use in calculation logic
  // This maintains backward compatibility with existing withdrawal strategies
  if (savingsAccounts && savingsAccounts.length > 0) {
    // Sum up balances and contributions by account type
    let totalTraditionalIRA = 0;
    let totalRothIRA = 0;
    let totalInvestmentAccounts = 0;
    let totalTraditionalIRAContribution = 0;
    let totalRothIRAContribution = 0;
    let totalInvestmentAccountsContribution = 0;
    let totalTraditionalIRACompanyMatch = 0;
    let totalRothIRACompanyMatch = 0;

    for (const account of savingsAccounts) {
      const balance = parseFloat(account.currentBalance) || 0;
      const contribution = parseFloat(account.annualContribution) || 0;
      const companyMatch = parseFloat(account.companyMatch) || 0;

      if (account.accountType === 'traditional-ira') {
        totalTraditionalIRA += balance;
        totalTraditionalIRAContribution += contribution;
        totalTraditionalIRACompanyMatch += companyMatch;
      } else if (account.accountType === 'roth-ira') {
        totalRothIRA += balance;
        totalRothIRAContribution += contribution;
        totalRothIRACompanyMatch += companyMatch;
      } else if (account.accountType === 'investment-account') {
        totalInvestmentAccounts += balance;
        totalInvestmentAccountsContribution += contribution;
      }
      // Note: 'savings-account' and 'other-account' types are not added to retirement calculations
    }

    // Override with actual savings account data if balances exist
    if (totalTraditionalIRA > 0) primaryTraditionalIRA = totalTraditionalIRA;
    if (totalRothIRA > 0) primaryRothIRA = totalRothIRA;
    if (totalInvestmentAccounts > 0) primaryInvestmentAccounts = totalInvestmentAccounts;

    // Override contributions if savings accounts have any data (even if contribution is $0)
    // The presence of a savings account record means the user explicitly set this value
    if (savingsAccounts.some(a => a.accountType === 'traditional-ira')) {
      primaryTraditionalIRAContribution = totalTraditionalIRAContribution;
      primaryTraditionalIRACompanyMatch = totalTraditionalIRACompanyMatch;
    }
    if (savingsAccounts.some(a => a.accountType === 'roth-ira')) {
      primaryRothIRAContribution = totalRothIRAContribution;
      primaryRothIRACompanyMatch = totalRothIRACompanyMatch;
    }
    if (savingsAccounts.some(a => a.accountType === 'investment-account')) {
      primaryInvestmentAccountsContribution = totalInvestmentAccountsContribution;
    }

    console.log('Savings accounts loaded - Traditional IRA:', totalTraditionalIRA, 'Roth IRA:', totalRothIRA, 'Investment:', totalInvestmentAccounts);
    console.log('Savings contributions loaded - Traditional Contrib:', totalTraditionalIRAContribution, 'Roth Contrib:', totalRothIRAContribution, 'Investment Contrib:', totalInvestmentAccountsContribution);
  }

  // Extract expense amounts from expenses array if available
  let calculatedPreRetirementExpenses = preRetirementAnnualExpenses;
  let calculatedPostRetirementExpenses = postRetirementAnnualExpenses;

  if (expenses && expenses.length > 0) {
    // Sum up expenses by pre/post retirement phase
    let totalPreRetirementExpenses = 0;
    let totalPostRetirementExpenses = 0;

    for (const expense of expenses) {
      const monthlyAmount = parseFloat(expense.monthlyAmount) || 0;
      const annualAmount = monthlyAmount * 12;

      // Debug expense loading - DISABLED
      // console.log(`Expense: ${expense.expenseName} - Monthly: ${monthlyAmount} Annual: ${annualAmount}, Pre: ${expense.preRetirement}, Post: ${expense.postRetirement}`);

      if (expense.preRetirement) {
        totalPreRetirementExpenses += annualAmount;
      }
      if (expense.postRetirement) {
        totalPostRetirementExpenses += annualAmount;
      }
    }

    // Override with actual expense data if expenses exist
    if (totalPreRetirementExpenses > 0) calculatedPreRetirementExpenses = totalPreRetirementExpenses;
    if (totalPostRetirementExpenses > 0) calculatedPostRetirementExpenses = totalPostRetirementExpenses;

    // Debug expense totals - DISABLED
    // console.log('Expenses loaded - Pre-retirement:', totalPreRetirementExpenses, 'Post-retirement:', totalPostRetirementExpenses);
  }

  const recalculatedCurrentAge = primaryCurrentAge;
  // Debug calculation start - DISABLED
  // console.log('calculateRetirementProjection - birthMonth:', primaryBirthMonth, 'birthYear:', primaryBirthYear, 'recalculatedCurrentAge:', recalculatedCurrentAge);

  // Generate amortization schedule to get exact mortgage payments
  const amortizationSchedule = generateMortgageAmortizationSchedule(inputs, persons);

  // Create a map of year/month -> annual payment for easy lookup
  const mortgagePaymentsByYearMonth = {};
  const today = new Date();
  const currentCalendarYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Group amortization schedule by year and aggregate payments
  for (const payment of amortizationSchedule) {
    const key = `${payment.year}-${payment.month}`;
    if (!mortgagePaymentsByYearMonth[key]) {
      mortgagePaymentsByYearMonth[key] = {
        month: payment.month,
        year: payment.year,
        annualPayment: 0,
        remainingBalance: 0
      };
    }
  }

  // Aggregate monthly payments into annual totals
  const mortgagePaymentsByYear = {};
  for (const payment of amortizationSchedule) {
    const year = payment.year;
    if (!mortgagePaymentsByYear[year]) {
      mortgagePaymentsByYear[year] = 0;
    }
    mortgagePaymentsByYear[year] += payment.totalPayment;
  }

  // Track the last balance for each year
  for (const payment of amortizationSchedule) {
    const year = payment.year;
    mortgagePaymentsByYear[`${year}_balance`] = payment.endBalance;
  }

  // Debug: Show mortgage schedule around age 60 - DISABLED
  /*
  const debugYearsToCheck = [2028, 2029, 2030];
  console.log('=== MORTGAGE SCHEDULE DEBUG ===');
  for (const year of debugYearsToCheck) {
    const payment = mortgagePaymentsByYear[year];
    const balance = mortgagePaymentsByYear[`${year}_balance`];
    if (payment !== undefined) {
      console.log(`Mortgage Year ${year}: Payment=$${payment.toFixed(2)}, Balance=$${(balance || 0).toFixed(2)}`);
    }
  }

  // Show all 2029 payments by month
  console.log('2029 Monthly Payments:');
  const paymentsIn2029 = amortizationSchedule.filter(p => p.year === 2029);
  for (const payment of paymentsIn2029) {
    console.log(`  ${payment.month}/2029: $${payment.totalPayment}, Balance=$${payment.endBalance}`);
  }
  */

  const years = [];

  // Extract home appreciation rate from home asset if available
  let homeAppreciationRate = 0;
  if (allAssets && allAssets.length > 0) {
    const homeAsset = allAssets.find(a => a.assetType === 'primary-residence');
    if (homeAsset && homeAsset.appreciationRate !== undefined && homeAsset.appreciationRate !== null) {
      homeAppreciationRate = parseFloat(homeAsset.appreciationRate) || 0;
    }
  }

  // Person 1 variables
  let currentTraditionalIRA = primaryTraditionalIRA;
  let currentRothIRA = primaryRothIRA;
  let currentInvestmentAccounts = primaryInvestmentAccounts;
  let currentSaleProceeds = 0;
  let currentSalaryValue = primaryCurrentSalary;

  // Person 2 variables (spouse)
  let currentSpouse2TraditionalIRA = spouse2TraditionalIRA || 0;
  let currentSpouse2RothIRA = spouse2RothIRA || 0;
  let currentSpouse2InvestmentAccounts = spouse2InvestmentAccounts || 0;
  let spouse2SalaryValue = spouse2CurrentSalary || 0;

  let currentMortgage = homeMortgage;
  let currentHomeValue = homeValue;

  for (let age = recalculatedCurrentAge; age <= projectionEndAge; age++) {
    const yearIndex = age - recalculatedCurrentAge;
    const projectedCalendarYear = currentCalendarYear + yearIndex;
    const isRetired = age >= primaryRetirementAge;

    // Debug for age 60 - DISABLED
    /*
    if (age === 60) {
      console.log('=== AGE 60 CALCULATION START ===');
      console.log('  currentMonth:', currentMonth);
      console.log('  primaryBirthMonth:', primaryBirthMonth);
      console.log('  This year (2029), retirement occurs in month:', primaryBirthMonth);
      console.log('  Pre-retirement months (Jan-May):', primaryBirthMonth - 1);
      console.log('  Post-retirement months (June-Dec):', 13 - primaryBirthMonth);
    }
    */

    // For married couples, check if spouse is retired based on their age
    let spouse2IsRetired = false;
    if (isMarried) {
      const spouse2YearIndex = age - spouse2CurrentAge;
      spouse2IsRetired = spouse2YearIndex >= 0 && age >= spouse2RetirementAge;
    }

    // Get mortgage payment and balance from the amortization schedule
    let annualMortgagePayment = mortgagePaymentsByYear[projectedCalendarYear] || 0;
    let remainingMortgage = mortgagePaymentsByYear[`${projectedCalendarYear}_balance`] || 0;

    // Apply home appreciation (applies for all years after year 0)
    if (yearIndex > 0 && homeAppreciationRate !== 0) {
      currentHomeValue = currentHomeValue * (1 + homeAppreciationRate / 100);
    }

    // Check for asset sales and deposit proceeds
    if (allAssets && allAssets.length > 0) {
      for (const asset of allAssets) {
        if (asset.sellPlanEnabled && asset.sellYear === projectedCalendarYear && asset.expectedSaleProceeds) {
          currentSaleProceeds += asset.expectedSaleProceeds;
        }
      }
    }

    // Also check for primary residence sale (legacy home asset)
    if (homeSalePlanEnabled && homeSaleYear === projectedCalendarYear) {
      // Check if there are expected proceeds in the home asset from allAssets
      if (allAssets && allAssets.length > 0) {
        const homeAsset = allAssets.find(a => a.assetType === 'primary-residence');
        if (homeAsset && homeAsset.expectedSaleProceeds) {
          currentSaleProceeds += homeAsset.expectedSaleProceeds;
        }
      }
    }

    // Zero out home value and mortgage in the sale year and after
    // (proceeds are added to investments, so we don't double-count by including home equity)
    if (homeSalePlanEnabled && projectedCalendarYear >= homeSaleYear) {
      currentHomeValue = 0;
      currentMortgage = 0;
    }

    // Also check if any other assets are being sold in this year or previous years
    if (allAssets && allAssets.length > 0) {
      for (const asset of allAssets) {
        if (asset.sellPlanEnabled && asset.assetType === 'primary-residence' && projectedCalendarYear >= asset.sellYear) {
          currentHomeValue = 0;
          currentMortgage = 0;
        }
      }
    }

    // Calculate income for primary person
    // If income sources are defined, use ONLY those (they're the source of truth)
    // Otherwise, fall back to currentSalary from financial_data (legacy)
    let grossIncome = 0;
    if (!isRetired) {
      if (incomeSources && incomeSources.length > 0) {
        // Use only income sources - they replace currentSalary
        grossIncome = incomeSources.reduce((total, source) => {
          const sourceIncome = (source.annualSalary || 0) * Math.pow(1 + ((source.annualSalaryIncrease || 0) / 100), yearIndex);
          return total + sourceIncome;
        }, 0);
      } else {
        // Fall back to currentSalary if no income sources defined
        currentSalaryValue = primaryCurrentSalary * Math.pow(1 + primaryAnnualSalaryIncrease / 100, yearIndex);
        grossIncome = currentSalaryValue;
      }
    }

    // Add spouse 2 income
    let spouse2Income = 0;
    if (isMarried && !spouse2IsRetired) {
      const spouse2YearIndex = age - spouse2CurrentAge;
      if (spouse2YearIndex >= 0) {
        spouse2SalaryValue = spouse2CurrentSalary * Math.pow(1 + spouse2AnnualSalaryIncrease / 100, spouse2YearIndex);
        spouse2Income = spouse2SalaryValue;
      }
    }

    const totalGrossIncome = grossIncome + spouse2Income;

    // Handle partial-year retirement: if this is the year you turn 60 (retirement age),
    // split the year into pre-retirement and post-retirement portions
    let finalGrossIncome = totalGrossIncome;
    let finalLivingExpenses = 0;
    let finalAnnualMortgagePayment = annualMortgagePayment;

    // Check if this is the retirement year (age equals retirement age for first time)
    const isRetirementYear = age === primaryRetirementAge;

    if (isRetirementYear) {
      // This is the year of retirement - need to split by month
      const monthsPreRetirement = primaryBirthMonth - 1;  // Jan-May = 5 months (months 1-5)
      const monthsPostRetirement = 12 - primaryBirthMonth + 1;  // June-Dec = 7 months (months 6-12)

      // Pre-retirement portion: use pre-retirement settings for months 1-5
      const preRetirementInflation = Math.pow(1 + inflationRate / 100, Math.max(0, yearIndex - 1));
      const preRetirementExpenses = (calculatedPreRetirementExpenses * preRetirementInflation) * (monthsPreRetirement / 12);

      // For pre-retirement income, recalculate what income would have been before retirement
      // Use the salary/income from before the retirement transition
      let preRetirementIncome = 0;
      if (incomeSources && incomeSources.length > 0) {
        preRetirementIncome = incomeSources.reduce((total, source) => {
          const sourceIncome = (source.annualSalary || 0) * Math.pow(1 + ((source.annualSalaryIncrease || 0) / 100), yearIndex);
          return total + sourceIncome;
        }, 0);
      } else {
        preRetirementIncome = currentSalaryValue;
      }
      preRetirementIncome = preRetirementIncome * (monthsPreRetirement / 12);

      // Post-retirement portion: use post-retirement settings for months 6-12
      const postRetirementExpenses = (calculatedPostRetirementExpenses * preRetirementInflation) * (monthsPostRetirement / 12);
      const postRetirementIncome = 0; // No income after retirement

      // Combine for the full year
      finalLivingExpenses = preRetirementExpenses + postRetirementExpenses;
      finalGrossIncome = preRetirementIncome + postRetirementIncome;

      // Mortgage is trickier - need to account for it being paid off in November
      // For now, use the calculated annual payment (it already includes only through Nov)
      finalAnnualMortgagePayment = annualMortgagePayment;

      // Debug for retirement year split - DISABLED
      /*
      if (age === 60) {
        console.log('=== RETIREMENT YEAR SPLIT DEBUG - AGE 60 ===');
        console.log('  monthsPreRetirement:', monthsPreRetirement);
        console.log('  monthsPostRetirement:', monthsPostRetirement);
        console.log('  preRetirementExpenses (5 months):', preRetirementExpenses);
        console.log('  postRetirementExpenses (7 months):', postRetirementExpenses);
        console.log('  finalLivingExpenses (total):', finalLivingExpenses);
        console.log('  preRetirementIncome:', preRetirementIncome);
        console.log('  finalGrossIncome:', finalGrossIncome);
      }
      */
    } else {
      // Normal year - not retirement year
      const baseExpenses = isRetired ? calculatedPostRetirementExpenses : calculatedPreRetirementExpenses;
      // Apply inflation only for years after the current year (yearIndex > 0)
      finalLivingExpenses = baseExpenses * Math.pow(1 + inflationRate / 100, Math.max(0, yearIndex - 1));
    }

    // Debug expense inflation - DISABLED
    /*
    if (age === 60 && !isRetirementYear) {
      console.log('=== EXPENSE INFLATION DEBUG - AGE 60 (non-retirement year) ===');
      console.log('  baseExpenses:', isRetired ? calculatedPostRetirementExpenses : calculatedPreRetirementExpenses);
      console.log('  inflationRate:', inflationRate);
      console.log('  yearIndex:', yearIndex);
      console.log('  livingExpenses (after inflation):', finalLivingExpenses);
    }
    */

    // Total spending includes living expenses and mortgage
    const annualSpending = finalLivingExpenses + finalAnnualMortgagePayment;

    // Determine current state based on age, retirement status, and state change options
    // For retirement year (partial year), use working state since income was earned there
    let currentState = workingState || 'TX';
    if (retirementState && isRetired && !isRetirementYear) {
      // Only switch to retirement state for full retirement years (not the partial retirement year)
      if (stateChangeOption === 'at-retirement') {
        currentState = retirementState;
      } else if (stateChangeOption === 'at-age' && stateChangeAge && age >= stateChangeAge) {
        currentState = retirementState;
      }
    }

    // Calculate withdrawal from retirement accounts (only if retired)
    // For now, using simplified approach - will integrate full withdrawal strategy later
    let withdrawalFromRetirements = { investmentAccounts: 0, traditionalIRA: 0, rothIRA: 0, total: 0 };
    if (isRetired) {
      withdrawalFromRetirements = calculateRequiredWithdrawal(
        primaryTraditionalIRA,
        primaryRothIRA,
        primaryInvestmentAccounts,
        annualSpending,
        finalGrossIncome || 0,
        0, // supplemental income - would come from incomeSources
        0, // social security income - would come from socialSecurityRecords
        age,
        primaryBirthYear,
        filingStatus,
        withdrawalStrategy
      );

      // Debug logging for withdrawal calculation - DISABLED
      /*
      if (age === 60) {
        console.log('=== WITHDRAWAL DEBUG - AGE 60 ===');
        console.log('  projectedCalendarYear:', projectedCalendarYear);
        console.log('  yearIndex:', yearIndex);
        console.log('  primaryRetirementAge:', primaryRetirementAge);
        console.log('  age:', age);
        console.log('  isRetired:', isRetired);
        console.log('  isRetirementYear:', isRetirementYear);
        console.log('  grossIncome (full year):', grossIncome);
        console.log('  finalGrossIncome (after split):', finalGrossIncome);
        console.log('  annualMortgagePayment:', annualMortgagePayment);
        console.log('  totalGrossIncome (before split):', totalGrossIncome);
        console.log('  annualSpending:', annualSpending);
        console.log('  shortfall (spending - finalIncome):', annualSpending - finalGrossIncome);
        console.log('  withdrawalStrategy:', withdrawalStrategy);
        console.log('  Withdrawal breakdown:', withdrawalFromRetirements);
      }
      */
    }

    // Total income including withdrawals
    const totalIncomeWithWithdrawals = finalGrossIncome + withdrawalFromRetirements.total;

    // Calculate contributions early so they can be used for tax calculations - stop at contribution stop age
    // Note: We track employee contributions and company match separately
    // Only EMPLOYEE contributions reduce AGI/taxable income (company match doesn't come from employee's gross salary)
    let primaryTraditionalEmployeeContribution = 0;
    let primaryTraditionalCompanyMatch = 0;
    let primaryRothEmployeeContribution = 0;
    let primaryRothCompanyMatch = 0;
    let primaryInvestmentEmployeeContribution = 0;
    let spouse2TraditionalEmployeeContribution = 0;
    let spouse2TraditionalCompanyMatch = 0;
    let spouse2RothEmployeeContribution = 0;
    let spouse2RothCompanyMatch = 0;
    let spouse2InvestmentEmployeeContribution = 0;

    // For retirement year, allow contributions for months worked before retirement
    const shouldMakeContributions = age <= primaryContributionStopAge;
    const spouse2ShouldMakeContributions = isMarried && age <= spouse2ContributionStopAge;

    if (shouldMakeContributions) {
      primaryTraditionalEmployeeContribution = primaryTraditionalIRAContribution || 0;
      primaryTraditionalCompanyMatch = primaryTraditionalIRACompanyMatch || 0;
      primaryRothEmployeeContribution = primaryRothIRAContribution || 0;
      primaryRothCompanyMatch = primaryRothIRACompanyMatch || 0;
      primaryInvestmentEmployeeContribution = primaryInvestmentAccountsContribution || 0;
    }

    if (spouse2ShouldMakeContributions) {
      spouse2TraditionalEmployeeContribution = spouse2TraditionalIRAContribution || 0;
      spouse2TraditionalCompanyMatch = spouse2TraditionalIRACompanyMatch || 0;
      spouse2RothEmployeeContribution = spouse2RothIRAContribution || 0;
      spouse2RothCompanyMatch = spouse2RothIRACompanyMatch || 0;
      spouse2InvestmentEmployeeContribution = spouse2InvestmentAccountsContribution || 0;
    }

    // Calculate totals for account growth (includes both employee and company match)
    let traditionalContribution = primaryTraditionalEmployeeContribution + primaryTraditionalCompanyMatch;
    let rothContribution = primaryRothEmployeeContribution + primaryRothCompanyMatch;
    let investmentContribution = primaryInvestmentEmployeeContribution;
    let spouse2TraditionalContribution = spouse2TraditionalEmployeeContribution + spouse2TraditionalCompanyMatch;
    let spouse2RothContribution = spouse2RothEmployeeContribution + spouse2RothCompanyMatch;
    let spouse2InvestmentContribution = spouse2InvestmentEmployeeContribution;

    // Adjust contributions for retirement year (only for months worked)
    if (isRetirementYear) {
      const monthsPreRetirement = primaryBirthMonth - 1;  // months before retirement
      traditionalContribution = traditionalContribution * (monthsPreRetirement / 12);
      rothContribution = rothContribution * (monthsPreRetirement / 12);
      investmentContribution = investmentContribution * (monthsPreRetirement / 12);
      // Spouse contributions not adjusted - they continue working all year
    }

    // Calculate taxes using progressive brackets
    // During working years: subtract ONLY employee Traditional IRA contributions from AGI (company match doesn't reduce employee's AGI)
    // During retirement years: add Traditional IRA withdrawals (taxable)
    // For partial-year retirement: adjust contributions for months worked
    let ordinaryIncome = finalGrossIncome;

    if (!isRetired) {
      // Working years: subtract ONLY employee Traditional IRA contributions (pre-tax)
      // Company match doesn't reduce employee's AGI - it's additional employer contribution
      const totalTraditionalEmployeeContributions = primaryTraditionalEmployeeContribution +
        (isMarried ? spouse2TraditionalEmployeeContribution : 0);
      ordinaryIncome = Math.max(0, finalGrossIncome - totalTraditionalEmployeeContributions);
    } else if (isRetirementYear) {
      // Retirement year: need to adjust contributions for only the months worked (pre-retirement portion)
      const monthsPreRetirement = primaryBirthMonth - 1;  // months before retirement in June
      const adjustedTraditionalEmployeeContribution = primaryTraditionalEmployeeContribution * (monthsPreRetirement / 12);
      const adjustedSpouse2Contribution = isMarried ? spouse2TraditionalEmployeeContribution : 0; // Spouse may still be working all year
      const totalAdjustedContributions = adjustedTraditionalEmployeeContribution + adjustedSpouse2Contribution;

      ordinaryIncome = Math.max(0, finalGrossIncome - totalAdjustedContributions + withdrawalFromRetirements.traditionalIRA);
    } else {
      // Full retirement years: add Traditional IRA withdrawals (taxable)
      ordinaryIncome = finalGrossIncome + withdrawalFromRetirements.traditionalIRA;
    }

    const capitalGains = withdrawalFromRetirements.investmentAccounts;

    // Apply standard deduction
    const taxableOrdinaryIncome = applyStandardDeduction(ordinaryIncome, filingStatus);

    // Debug logging for tax calculation (before calculating taxes)
    // DISABLED FOR NOW - re-enable to debug tax calculations
    /*
    const isDebugYear = yearIndex === 0 && age === recalculatedCurrentAge;
    if (isDebugYear) {
      console.log('=== AGI CALCULATION DEBUG - YEAR 1 ===');
      console.log('PRIMARY INCOME:');
      console.log('  grossIncome (from incomeSources):', grossIncome);
      console.log('  totalGrossIncome (primary + spouse):', totalGrossIncome);
      console.log('CONTRIBUTIONS:');
      console.log('  primaryTraditionalEmployeeContribution:', primaryTraditionalEmployeeContribution);
      console.log('  primaryTraditionalCompanyMatch:', primaryTraditionalCompanyMatch);
      console.log('  traditionalContribution (employee+match for growth):', traditionalContribution);
      console.log('WITHDRAWALS:');
      console.log('  isRetired:', isRetired);
      console.log('  withdrawalFromRetirements.investmentAccounts:', withdrawalFromRetirements.investmentAccounts);
      console.log('  withdrawalFromRetirements.traditionalIRA:', withdrawalFromRetirements.traditionalIRA);
      console.log('  withdrawalFromRetirements.total:', withdrawalFromRetirements.total);
      console.log('TAX CALCULATION:');
      console.log('  ordinaryIncome (gross - employee contributions):', ordinaryIncome);
      console.log('  capitalGains (from investment withdrawals):', capitalGains);
      console.log('  filingStatus:', filingStatus);
      console.log('  standardDeduction:', applyStandardDeduction(0, filingStatus) ? 'applied' : 'check function');
      console.log('  taxableOrdinaryIncome (after standard deduction):', taxableOrdinaryIncome);
      console.log('TOTALS:');
      console.log('  totalIncomeWithWithdrawals:', totalIncomeWithWithdrawals);
    }
    */

    // Calculate federal and state taxes
    const federalOrdinaryTax = calculateFederalTax(taxableOrdinaryIncome, filingStatus);

    const federalCapitalGainsTax = calculateCapitalGainsTax(capitalGains, taxableOrdinaryIncome, filingStatus);
    // State tax should also use taxable income (after standard deduction), plus capital gains
    const stateCapitalGains = capitalGains; // Capital gains are not reduced by standard deduction
    const stateTaxableIncome = taxableOrdinaryIncome + stateCapitalGains;
    const stateTax = calculateStateTax(stateTaxableIncome, currentState, filingStatus);

    // Debug state tax at age 60 - DISABLED
    /*
    if (age === 60) {
      console.log('=== STATE TAX DEBUG - AGE 60 ===');
      console.log('  ordinaryIncome:', ordinaryIncome);
      console.log('  taxableOrdinaryIncome (after std deduction):', taxableOrdinaryIncome);
      console.log('  capitalGains:', capitalGains);
      console.log('  stateTaxableIncome:', stateTaxableIncome);
      console.log('  currentState:', currentState);
      console.log('  stateTax:', stateTax);
    }
    */


    const totalTaxes = Math.max(0, federalOrdinaryTax + federalCapitalGainsTax + stateTax);

    // Calculate net income
    const netIncome = totalIncomeWithWithdrawals - totalTaxes;

    // ===== PHASE 1: CONTRIBUTION PHASE (Per-Account Tracking) =====
    // Apply annual contributions to individual accounts if they exist
    if (accountStates && accountStates.length > 0) {
      for (const account of accountStates) {
        // Check if this account should receive contributions this year
        const shouldContribute = checkShouldContribute(
          account,
          age,
          projectedCalendarYear,
          primaryRetirementAge,
          isRetirementYear
        );

        if (shouldContribute) {
          // Determine contribution amount based on account type
          let annualContributionAmount = 0;
          if (account.accountType === 'traditional-ira') {
            annualContributionAmount = primaryTraditionalIRAContribution || 0;
          } else if (account.accountType === 'roth-ira') {
            annualContributionAmount = primaryRothIRAContribution || 0;
          } else if (account.accountType === 'investment-account') {
            annualContributionAmount = primaryInvestmentAccountsContribution || 0;
          }

          // For retirement year, prorate contributions for months worked
          if (isRetirementYear) {
            const monthsPreRetirement = primaryBirthMonth - 1;
            annualContributionAmount = annualContributionAmount * (monthsPreRetirement / 12);
          }

          // Accumulate pending contribution for this account
          account.pendingContribution += annualContributionAmount;

          // Also add company match for eligible account types
          if (account.companyMatch > 0) {
            let companyMatchAmount = account.companyMatch || 0;
            if (isRetirementYear) {
              const monthsPreRetirement = primaryBirthMonth - 1;
              companyMatchAmount = companyMatchAmount * (monthsPreRetirement / 12);
            }
            account.pendingMatch += companyMatchAmount;
          }
        }
      }
    }

    // ===== PHASE 2: WITHDRAWAL ALLOCATION PHASE (Per-Account Tracking) =====
    // Allocate TYPE-level withdrawals to individual accounts using sequential smallest-first
    if (accountStates && accountStates.length > 0 && isRetired) {
      // Prepare withdrawal amounts by type from the calculated withdrawals
      const withdrawalByType = {
        'investment-account': withdrawalFromRetirements.investmentAccounts || 0,
        'traditional-ira': withdrawalFromRetirements.traditionalIRA || 0,
        'roth-ira': withdrawalFromRetirements.rothIRA || 0,
        'savings-account': 0,
        'other-account': 0
      };

      // Allocate withdrawals to individual accounts
      const allocations = allocateWithdrawals(accountStates, withdrawalByType);

      // Apply allocations to individual accounts
      for (const allocation of allocations) {
        const account = accountStates.find(a => a.id === allocation.accountId);
        if (account) {
          account.yearlyWithdrawal += allocation.amount;
        }
      }
    }

    // Apply withdrawals from retirement accounts (reduce balances before growth)
    currentTraditionalIRA = Math.max(0, currentTraditionalIRA - withdrawalFromRetirements.traditionalIRA);
    currentRothIRA = Math.max(0, currentRothIRA - withdrawalFromRetirements.rothIRA);
    currentInvestmentAccounts = Math.max(0, currentInvestmentAccounts - withdrawalFromRetirements.investmentAccounts);

    // Investment accounts growth - only apply growth starting from next year
    if (yearIndex > 0) {
      currentTraditionalIRA = currentTraditionalIRA * (1 + investmentReturn / 100) + traditionalContribution;
      currentRothIRA = currentRothIRA * (1 + investmentReturn / 100) + rothContribution;
      currentInvestmentAccounts =
        currentInvestmentAccounts * (1 + investmentReturn / 100) +
        investmentContribution +
        currentSaleProceeds;

      if (isMarried) {
        currentSpouse2TraditionalIRA = currentSpouse2TraditionalIRA * (1 + investmentReturn / 100) + spouse2TraditionalContribution;
        currentSpouse2RothIRA = currentSpouse2RothIRA * (1 + investmentReturn / 100) + spouse2RothContribution;
        currentSpouse2InvestmentAccounts =
          currentSpouse2InvestmentAccounts * (1 + investmentReturn / 100) +
          spouse2InvestmentContribution;
      }
    } else {
      // Current year: only add new contributions, no investment growth on existing balance
      currentTraditionalIRA = currentTraditionalIRA + traditionalContribution;
      currentRothIRA = currentRothIRA + rothContribution;
      currentInvestmentAccounts = currentInvestmentAccounts + investmentContribution + currentSaleProceeds;

      if (isMarried) {
        currentSpouse2TraditionalIRA = currentSpouse2TraditionalIRA + spouse2TraditionalContribution;
        currentSpouse2RothIRA = currentSpouse2RothIRA + spouse2RothContribution;
        currentSpouse2InvestmentAccounts = currentSpouse2InvestmentAccounts + spouse2InvestmentContribution;
      }
    }

    // Reset sale proceeds after adding to investment accounts
    currentSaleProceeds = 0;

    // ===== PHASE 3: GROWTH & FINALIZATION PHASE (Per-Account Tracking) =====
    // Apply growth and contributions to individual account balances, then record yearly history
    if (accountStates && accountStates.length > 0) {
      for (const account of accountStates) {
        let yearlyGrowth = 0;
        let yearlyContribution = 0;
        let yearlyWithdrawal = account.yearlyWithdrawal || 0;

        // Apply growth to account balance if this is not the first year
        if (yearIndex > 0) {
          yearlyGrowth = account.currentBalance * (investmentReturn / 100);
          account.currentBalance = account.currentBalance * (1 + investmentReturn / 100);
        }

        // Add pending contribution and match to the account
        const totalContributionThisYear = account.pendingContribution + account.pendingMatch;
        yearlyContribution = totalContributionThisYear;
        account.currentBalance += totalContributionThisYear;

        // Apply withdrawals (reduce balance)
        account.currentBalance = Math.max(0, account.currentBalance - yearlyWithdrawal);

        // Record yearly history for this account
        account.yearlyHistory.push({
          age,
          year: projectedCalendarYear,
          beginningBalance: account.currentBalance - yearlyGrowth - yearlyContribution + yearlyWithdrawal,
          contributions: yearlyContribution,
          withdrawals: yearlyWithdrawal,
          growth: yearlyGrowth,
          endingBalance: account.currentBalance
        });

        // Reset yearly accumulators for next year
        account.yearlyWithdrawal = 0;
        account.pendingContribution = 0;
        account.pendingMatch = 0;
      }
    }

    // Total portfolio value
    const totalRetirementSavings = Math.max(
      0,
      currentTraditionalIRA + currentRothIRA + currentInvestmentAccounts +
      (isMarried ? currentSpouse2TraditionalIRA + currentSpouse2RothIRA + currentSpouse2InvestmentAccounts : 0)
    );
    const homeEquity = Math.max(0, currentHomeValue - remainingMortgage);
    const totalNetWorth = totalRetirementSavings + homeEquity + otherAssets;

    // Calculate total contributions
    const totalContributions = traditionalContribution + rothContribution + investmentContribution +
      (isMarried ? spouse2TraditionalContribution + spouse2RothContribution + spouse2InvestmentContribution : 0);

    // Calculate AGI (Adjusted Gross Income) for display
    // AGI = Gross Income - Traditional IRA Contributions (pre-tax deduction)
    // For retirement years with Traditional IRA withdrawals, add those back (they're taxable)
    let agi = finalGrossIncome;

    if (!isRetired) {
      // Working years: subtract employee Traditional IRA contributions
      const totalTraditionalEmployeeContributions = primaryTraditionalEmployeeContribution +
        (isMarried ? spouse2TraditionalEmployeeContribution : 0);
      agi = Math.max(0, finalGrossIncome - totalTraditionalEmployeeContributions);
    } else if (isRetirementYear) {
      // Retirement year: adjust contributions for only months worked
      const monthsPreRetirement = primaryBirthMonth - 1;
      const adjustedTraditionalEmployeeContribution = primaryTraditionalEmployeeContribution * (monthsPreRetirement / 12);
      const adjustedSpouse2Contribution = isMarried ? spouse2TraditionalEmployeeContribution : 0;
      const totalAdjustedContributions = adjustedTraditionalEmployeeContribution + adjustedSpouse2Contribution;

      agi = Math.max(0, finalGrossIncome - totalAdjustedContributions + withdrawalFromRetirements.traditionalIRA);
    } else {
      // Full retirement years: add Traditional IRA withdrawals (they're taxable)
      agi = finalGrossIncome + withdrawalFromRetirements.traditionalIRA;
    }

    years.push({
      age: age,
      year: projectedCalendarYear,
      isRetired,
      salary: Math.round(finalGrossIncome),
      agi: Math.round(agi),
      spouse2Salary: isMarried ? Math.round(spouse2Income) : 0,
      totalSalary: Math.round(finalGrossIncome + spouse2Income),
      taxes: Math.round(totalTaxes),
      federalOrdinaryTax: Math.round(federalOrdinaryTax),
      federalCapitalGainsTax: Math.round(federalCapitalGainsTax),
      stateTax: Math.round(stateTax),
      netIncome: Math.round(netIncome),
      livingExpenses: Math.round(finalLivingExpenses),
      mortgagePayment: Math.round(annualMortgagePayment),
      expenses: Math.round(annualSpending),
      totalContributions: Math.round(totalContributions),
      traditionalIRAWithdrawal: Math.round(withdrawalFromRetirements.traditionalIRA),
      rothIRAWithdrawal: Math.round(withdrawalFromRetirements.rothIRA),
      investmentAccountsWithdrawal: Math.round(withdrawalFromRetirements.investmentAccounts),
      totalWithdrawals: Math.round(withdrawalFromRetirements.total),
      traditionalIRA: Math.round(currentTraditionalIRA),
      rothIRA: Math.round(currentRothIRA),
      investmentAccounts: Math.round(currentInvestmentAccounts),
      spouse2TraditionalIRA: isMarried ? Math.round(currentSpouse2TraditionalIRA) : 0,
      spouse2RothIRA: isMarried ? Math.round(currentSpouse2RothIRA) : 0,
      spouse2InvestmentAccounts: isMarried ? Math.round(currentSpouse2InvestmentAccounts) : 0,
      totalRetirementSavings: Math.round(totalRetirementSavings),
      homeValue: Math.round(currentHomeValue),
      mortgageBalance: Math.round(remainingMortgage),
      homeEquity: Math.round(homeEquity),
      otherAssets: Math.round(otherAssets),
      totalNetWorth: Math.round(totalNetWorth),
      cashFlow: Math.round(netIncome - annualSpending),
      currentState: currentState,
    });
  }

  // Generate accountsBreakdown from account states for display
  // Convert account states into a structure suitable for table display
  const accountsBreakdown = accountStates.map(account => ({
    id: account.id,
    accountName: account.accountName,
    accountType: account.accountType,
    yearlyHistory: account.yearlyHistory,
    finalBalance: account.currentBalance
  }));

  return {
    years,
    accountsBreakdown
  };
};

export const defaultInputs = {
  // Person 1 Information
  firstName: '',
  birthMonth: 6,
  birthYear: 1989,
  currentAge: calculateAge(6, 1989),
  retirementAge: 65,
  deathAge: 95,
  contributionStopAge: 65,
  currentSalary: 100000,
  annualSalaryIncrease: 3,
  traditionalIRA: 50000,
  rothIRA: 25000,
  investmentAccounts: 100000,
  traditionalIRAContribution: 0,
  traditionIRACompanyMatch: 0,
  rothIRAContribution: 0,
  rothIRACompanyMatch: 0,
  investmentAccountsContribution: 0,

  // Person 2 Information (for married couples)
  spouse2FirstName: '',
  spouse2BirthMonth: 6,
  spouse2BirthYear: 1989,
  spouse2CurrentAge: calculateAge(6, 1989),
  spouse2RetirementAge: 65,
  spouse2CurrentSalary: 80000,
  spouse2AnnualSalaryIncrease: 3,
  spouse2TraditionalIRA: 40000,
  spouse2RothIRA: 20000,
  spouse2InvestmentAccounts: 80000,
  spouse2TraditionalIRAContribution: 0,
  spouse2TraditionalIRACompanyMatch: 0,
  spouse2RothIRAContribution: 0,
  spouse2RothIRACompanyMatch: 0,
  spouse2InvestmentAccountsContribution: 0,
  spouse2ContributionStopAge: 65,

  // Joint Assets
  homeValue: 500000,
  homeMortgage: 300000,
  homeMortgageRate: 4.5,
  homeMortgageMonthlyPayment: 1520,
  homeMortgagePayoffYear: 2055,
  homeMortgagePayoffMonth: 12,
  homePropertyTaxInsurance: 5000,
  homePropertyTax: 3000,
  homePropertyTaxAnnualIncrease: 2,
  homeInsurance: 2000,
  homeInsuranceAnnualIncrease: 3,
  homeSalePlanEnabled: false,
  homeSaleYear: null,
  homeSaleMonth: null,
  homeMortgageExtraPrincipalPayment: 0,
  otherAssets: 50000,

  // Expenses (separate from mortgage)
  preRetirementAnnualExpenses: 60000,
  postRetirementAnnualExpenses: 45000,

  // Economic Assumptions
  investmentReturn: 7,
  inflationRate: 3,
  federalTaxRate: 22,
  stateTaxRate: 5,

  // Tax Configuration
  workingState: 'TX',
  retirementState: null,
  stateChangeOption: 'at-retirement',
  stateChangeAge: null,
  filingStatus: 'single',
  withdrawalStrategy: 'waterfall',
};
