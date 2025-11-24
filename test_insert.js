// Count columns in the INSERT
const sql = `INSERT INTO financial_data (
    userId, maritalStatus, currentAge, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
    currentSalary, annualSalaryIncrease,
    traditionalIRA, rothIRA, investmentAccounts,
    traditionalIRAContribution, traditionIRACompanyMatch,
    rothIRAContribution, rothIRACompanyMatch,
    investmentAccountsContribution,
    spouse2CurrentAge, spouse2BirthMonth, spouse2BirthYear, spouse2RetirementAge,
    spouse2CurrentSalary, spouse2AnnualSalaryIncrease,
    spouse2TraditionalIRA, spouse2RothIRA, spouse2InvestmentAccounts,
    spouse2TraditionalIRAContribution, spouse2TraditionalIRACompanyMatch,
    spouse2RothIRAContribution, spouse2RothIRACompanyMatch,
    spouse2InvestmentAccountsContribution, spouse2ContributionStopAge,
    homeValue, homeMortgage, homeMortgageRate,
    homeMortgageMonthlyPayment, homeMortgagePayoffYear, homeMortgagePayoffMonth, homePropertyTaxInsurance, homePropertyTax, homePropertyTaxAnnualIncrease, homeInsurance, homeInsuranceAnnualIncrease, homeSalePlanEnabled, homeSaleYear, homeSaleMonth, homeMortgageExtraPrincipalPayment, otherAssets,
    preRetirementAnnualExpenses, postRetirementAnnualExpenses, investmentReturn,
    inflationRate, federalTaxRate, stateTaxRate
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

// Extract columns
const colMatch = sql.match(/\(([\s\S]*?)\)\s*VALUES/);
const colsStr = colMatch[1].trim();
const columns = colsStr.split(',').map(c => c.trim());

// Extract placeholders
const valMatch = sql.match(/VALUES\s*\(([\s\S]*?)\)/);
const valStr = valMatch[1].trim();
const placeholders = valStr.split(',').length;

console.log('Number of columns:', columns.length);
console.log('Number of placeholders:', placeholders);
console.log('Match:', columns.length === placeholders);
console.log('\nColumns:');
columns.forEach((c, i) => console.log(`${i+1}. ${c}`));
