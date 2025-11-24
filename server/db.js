import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'retirement.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial data table
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      maritalStatus TEXT DEFAULT 'single',
      currentAge INTEGER,
      birthMonth INTEGER,
      birthYear INTEGER,
      retirementAge INTEGER,
      deathAge INTEGER,
      contributionStopAge INTEGER,
      currentSalary REAL,
      annualSalaryIncrease REAL,
      traditionalIRA REAL,
      rothIRA REAL,
      investmentAccounts REAL,
      traditionalIRAContribution REAL,
      traditionIRACompanyMatch REAL,
      rothIRAContribution REAL,
      rothIRACompanyMatch REAL,
      investmentAccountsContribution REAL,
      spouse2CurrentAge INTEGER,
      spouse2BirthMonth INTEGER,
      spouse2BirthYear INTEGER,
      spouse2RetirementAge INTEGER,
      spouse2CurrentSalary REAL,
      spouse2AnnualSalaryIncrease REAL,
      spouse2TraditionalIRA REAL,
      spouse2RothIRA REAL,
      spouse2InvestmentAccounts REAL,
      spouse2TraditionalIRAContribution REAL,
      spouse2TraditionalIRACompanyMatch REAL,
      spouse2RothIRAContribution REAL,
      spouse2RothIRACompanyMatch REAL,
      spouse2InvestmentAccountsContribution REAL,
      spouse2ContributionStopAge INTEGER,
      homeValue REAL,
      homeMortgage REAL,
      homeMortgageRate REAL,
      homeMortgageMonthlyPayment REAL,
      homeMortgagePayoffYear INTEGER,
      homeMortgagePayoffMonth INTEGER,
      homePropertyTaxInsurance REAL,
      homePropertyTax REAL,
      homePropertyTaxAnnualIncrease REAL,
      homeInsurance REAL,
      homeInsuranceAnnualIncrease REAL,
      homeSalePlanEnabled BOOLEAN DEFAULT 0,
      homeSaleYear INTEGER,
      homeSaleMonth INTEGER,
      homeMortgageExtraPrincipalPayment REAL,
      otherAssets REAL,
      preRetirementAnnualExpenses REAL,
      postRetirementAnnualExpenses REAL,
      investmentReturn REAL,
      inflationRate REAL,
      federalTaxRate REAL,
      stateTaxRate REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Assets table (for managing individual assets)
  db.run(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      assetType TEXT NOT NULL,
      assetName TEXT NOT NULL,
      currentValue REAL DEFAULT 0,

      -- Mortgage/Loan fields (for homes, vehicles)
      loanBalance REAL,
      loanRate REAL,
      monthlyPayment REAL,
      payoffYear INTEGER,
      payoffMonth INTEGER,
      extraPrincipalPayment REAL DEFAULT 0,

      -- Tax/Insurance fields (for homes)
      propertyTax REAL,
      propertyTaxAnnualIncrease REAL,
      insurance REAL,
      insuranceAnnualIncrease REAL,

      -- Expenses
      annualExpenses REAL,
      annualExpensesAnnualIncrease REAL,

      -- Rental income (for investment properties)
      rentalIncome REAL,
      rentalIncomeAnnualIncrease REAL,

      -- Appreciation/Depreciation
      appreciationRate REAL DEFAULT 0,

      -- Sell plan
      sellPlanEnabled BOOLEAN DEFAULT 0,
      sellYear INTEGER,
      sellMonth INTEGER,

      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Scenarios table (for saving different scenarios)
  db.run(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      financialDataId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (financialDataId) REFERENCES financial_data(id)
    )
  `);
};

export default db;
