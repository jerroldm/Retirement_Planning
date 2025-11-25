/**
 * Core calculation engine for retirement planning
 */

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
export const generateMortgageAmortizationSchedule = (inputs) => {
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
    if (birthMonth && birthYear) {
      age = year - birthYear;
      if (month < birthMonth) {
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

export const calculateRetirementProjection = (inputs) => {
  const {
    maritalStatus,
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
    spouse2CurrentAge,
    spouse2RetirementAge,
    spouse2CurrentSalary,
    spouse2AnnualSalaryIncrease,
    spouse2TraditionalIRA,
    spouse2RothIRA,
    spouse2InvestmentAccounts,
    spouse2TraditionalIRAContribution,
    spouse2TraditionalIRACompanyMatch,
    spouse2RothIRAContribution,
    spouse2RothIRACompanyMatch,
    spouse2InvestmentAccountsContribution,
    spouse2ContributionStopAge,
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
  } = inputs;

  const isMarried = maritalStatus === 'married';

  // Recalculate current age from birth month/year for accuracy
  // If birthMonth/birthYear are not provided in inputs, they might be in the defaultInputs
  const actualBirthMonth = birthMonth !== undefined && birthMonth !== null ? birthMonth : 6;
  const actualBirthYear = birthYear !== undefined && birthYear !== null ? birthYear : 1989;

  const recalculatedCurrentAge = calculateAge(actualBirthMonth, actualBirthYear);

  // Generate amortization schedule to get exact mortgage payments
  const amortizationSchedule = generateMortgageAmortizationSchedule(inputs);

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

  const years = [];

  // Person 1 variables
  let currentTraditionalIRA = traditionalIRA;
  let currentRothIRA = rothIRA;
  let currentInvestmentAccounts = investmentAccounts;
  let currentSaleProceeds = 0;
  let currentSalaryValue = currentSalary;

  // Person 2 variables (spouse)
  let currentSpouse2TraditionalIRA = spouse2TraditionalIRA || 0;
  let currentSpouse2RothIRA = spouse2RothIRA || 0;
  let currentSpouse2InvestmentAccounts = spouse2InvestmentAccounts || 0;
  let spouse2SalaryValue = spouse2CurrentSalary || 0;

  let currentMortgage = homeMortgage;

  for (let age = recalculatedCurrentAge; age <= deathAge; age++) {
    const yearIndex = age - recalculatedCurrentAge;
    const projectedCalendarYear = currentCalendarYear + yearIndex;
    const isRetired = age >= retirementAge;

    // For married couples, check if spouse is retired based on their age
    let spouse2IsRetired = false;
    if (isMarried) {
      const spouse2YearIndex = age - spouse2CurrentAge;
      spouse2IsRetired = spouse2YearIndex >= 0 && age >= spouse2RetirementAge;
    }

    // Get mortgage payment and balance from the amortization schedule
    let annualMortgagePayment = mortgagePaymentsByYear[projectedCalendarYear] || 0;
    let remainingMortgage = mortgagePaymentsByYear[`${projectedCalendarYear}_balance`] || 0;

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

    // Calculate income for both people
    let grossIncome = 0;
    if (!isRetired) {
      currentSalaryValue = currentSalary * Math.pow(1 + annualSalaryIncrease / 100, yearIndex);
      grossIncome = currentSalaryValue;
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

    // Calculate expenses based on retirement status
    const baseExpenses = isRetired ? postRetirementAnnualExpenses : preRetirementAnnualExpenses;
    // Apply inflation only for years after the current year (yearIndex > 0)
    const livingExpenses = baseExpenses * Math.pow(1 + inflationRate / 100, Math.max(0, yearIndex - 1));

    // Total spending includes living expenses and mortgage
    const annualSpending = livingExpenses + annualMortgagePayment;

    // Calculate taxes
    let taxableIncome = totalGrossIncome;
    const totalTaxRate = (federalTaxRate + stateTaxRate) / 100;
    const totalTaxes = Math.max(0, taxableIncome * totalTaxRate);

    // Calculate net income
    const netIncome = totalGrossIncome - totalTaxes;

    // Calculate contributions - stop at contribution stop age
    let traditionalContribution = 0;
    let rothContribution = 0;
    let investmentContribution = 0;
    let spouse2TraditionalContribution = 0;
    let spouse2RothContribution = 0;
    let spouse2InvestmentContribution = 0;

    const shouldMakeContributions = age < contributionStopAge;
    const spouse2ShouldMakeContributions = isMarried && age < spouse2ContributionStopAge;

    if (shouldMakeContributions) {
      traditionalContribution = (traditionalIRAContribution || 0) + (traditionIRACompanyMatch || 0);
      rothContribution = (rothIRAContribution || 0) + (rothIRACompanyMatch || 0);
      investmentContribution = investmentAccountsContribution || 0;
    }

    if (spouse2ShouldMakeContributions) {
      spouse2TraditionalContribution = (spouse2TraditionalIRAContribution || 0) + (spouse2TraditionalIRACompanyMatch || 0);
      spouse2RothContribution = (spouse2RothIRAContribution || 0) + (spouse2RothIRACompanyMatch || 0);
      spouse2InvestmentContribution = spouse2InvestmentAccountsContribution || 0;
    }

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

    // Total portfolio value
    const totalRetirementSavings = Math.max(
      0,
      currentTraditionalIRA + currentRothIRA + currentInvestmentAccounts +
      (isMarried ? currentSpouse2TraditionalIRA + currentSpouse2RothIRA + currentSpouse2InvestmentAccounts : 0)
    );
    const homeEquity = Math.max(0, homeValue - remainingMortgage);
    const totalNetWorth = totalRetirementSavings + homeEquity + otherAssets;

    // Calculate total contributions
    const totalContributions = traditionalContribution + rothContribution + investmentContribution +
      (isMarried ? spouse2TraditionalContribution + spouse2RothContribution + spouse2InvestmentContribution : 0);

    years.push({
      age: age,
      year: projectedCalendarYear,
      isRetired,
      salary: Math.round(grossIncome),
      spouse2Salary: isMarried ? Math.round(spouse2Income) : 0,
      totalSalary: Math.round(totalGrossIncome),
      taxes: Math.round(totalTaxes),
      netIncome: Math.round(netIncome),
      livingExpenses: Math.round(livingExpenses),
      mortgagePayment: Math.round(annualMortgagePayment),
      expenses: Math.round(annualSpending),
      totalContributions: Math.round(totalContributions),
      traditionalIRA: Math.round(currentTraditionalIRA),
      rothIRA: Math.round(currentRothIRA),
      investmentAccounts: Math.round(currentInvestmentAccounts),
      spouse2TraditionalIRA: isMarried ? Math.round(currentSpouse2TraditionalIRA) : 0,
      spouse2RothIRA: isMarried ? Math.round(currentSpouse2RothIRA) : 0,
      spouse2InvestmentAccounts: isMarried ? Math.round(currentSpouse2InvestmentAccounts) : 0,
      totalRetirementSavings: Math.round(totalRetirementSavings),
      homeValue: Math.round(homeValue),
      mortgageBalance: Math.round(remainingMortgage),
      homeEquity: Math.round(homeEquity),
      otherAssets: Math.round(otherAssets),
      totalNetWorth: Math.round(totalNetWorth),
      cashFlow: Math.round(netIncome - annualSpending),
    });
  }

  return years;
};

export const defaultInputs = {
  // Marital Status
  maritalStatus: 'single',

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
  traditionalIRAContribution: 10000,
  traditionIRACompanyMatch: 5000,
  rothIRAContribution: 5000,
  rothIRACompanyMatch: 0,
  investmentAccountsContribution: 5000,

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
  spouse2TraditionalIRAContribution: 8000,
  spouse2TraditionalIRACompanyMatch: 4000,
  spouse2RothIRAContribution: 5000,
  spouse2RothIRACompanyMatch: 0,
  spouse2InvestmentAccountsContribution: 4000,
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
};
