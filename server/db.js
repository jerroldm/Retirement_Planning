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

  // Persons table (created early so it's available for foreign keys)
  db.run(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      personType TEXT NOT NULL,
      firstName TEXT NOT NULL,
      birthMonth INTEGER,
      birthYear INTEGER,
      retirementAge INTEGER,
      deathAge INTEGER,
      contributionStopAge INTEGER,
      currentSalary REAL DEFAULT 0,
      annualSalaryIncrease REAL DEFAULT 0,
      traditionalIRA REAL DEFAULT 0,
      rothIRA REAL DEFAULT 0,
      investmentAccounts REAL DEFAULT 0,
      traditionalIRAContribution REAL DEFAULT 0,
      traditionIRACompanyMatch REAL DEFAULT 0,
      rothIRAContribution REAL DEFAULT 0,
      rothIRACompanyMatch REAL DEFAULT 0,
      investmentAccountsContribution REAL DEFAULT 0,
      includeInCalculations BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating persons table:', err);
    } else {
      console.log('Persons table created or already exists');
    }
  });

  // Financial data table (person data moved to persons table)
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      maritalStatus TEXT DEFAULT 'single',
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
      personId INTEGER,
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
      expectedSaleProceeds REAL,

      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (personId) REFERENCES persons(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating assets table:', err);
    } else {
      console.log('Assets table created or already exists');
    }
  });

  // Savings accounts table (for managing individual savings/investment accounts)
  db.run(`
    CREATE TABLE IF NOT EXISTS savings_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      personId INTEGER,
      accountType TEXT NOT NULL,
      accountName TEXT NOT NULL,
      owner TEXT NOT NULL,
      currentBalance REAL DEFAULT 0,
      rothBalance REAL DEFAULT 0,
      traditionalMatchBalance REAL DEFAULT 0,
      annualContribution REAL DEFAULT 0,
      companyMatch REAL DEFAULT 0,
      stopContributingMode TEXT DEFAULT 'retirement',
      stopContributingAge INTEGER DEFAULT 0,
      stopContributingMonth INTEGER DEFAULT 0,
      stopContributingYear INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (personId) REFERENCES persons(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating savings_accounts table:', err);
    } else {
      console.log('Savings accounts table created or already exists');

      // Add rothBalance column if it doesn't exist (for existing databases)
      // Run AFTER table creation completes
      db.run(`
        ALTER TABLE savings_accounts ADD COLUMN rothBalance REAL DEFAULT 0
      `, (altErr) => {
        if (altErr && !altErr.message.includes('duplicate column')) {
          console.error('Error adding rothBalance column:', altErr);
        }
      });

      // Add traditionalMatchBalance column if it doesn't exist (for existing databases)
      db.run(`
        ALTER TABLE savings_accounts ADD COLUMN traditionalMatchBalance REAL DEFAULT 0
      `, (altErr) => {
        if (altErr && !altErr.message.includes('duplicate column')) {
          console.error('Error adding traditionalMatchBalance column:', altErr);
        }
      });
    }
  });

  // Income sources table (for managing individual income sources)
  db.run(`
    CREATE TABLE IF NOT EXISTS income_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      sourceName TEXT NOT NULL,
      annualSalary REAL DEFAULT 0,
      annualSalaryIncrease REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating income_sources table:', err);
    } else {
      console.log('Income sources table created or already exists');
    }
  });

  // Expenses table (for managing individual expenses)
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      expenseName TEXT NOT NULL,
      monthlyAmount REAL DEFAULT 0,
      preRetirement BOOLEAN DEFAULT 1,
      postRetirement BOOLEAN DEFAULT 1,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating expenses table:', err);
    } else {
      console.log('Expenses table created or already exists');
    }
  });

  // Social Security table (for managing social security benefits per person)
  db.run(`
    CREATE TABLE IF NOT EXISTS social_security (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      personId INTEGER,
      estimatedAnnualBenefit REAL DEFAULT 0,
      plannedClaimingAge INTEGER DEFAULT 67,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (personId) REFERENCES persons(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating social_security table:', err);
    } else {
      console.log('Social security table created or already exists');
    }
  });

  // Economic Assumptions table (for market return and inflation assumptions)
  db.run(`
    CREATE TABLE IF NOT EXISTS economic_assumptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      investmentReturn REAL DEFAULT 7,
      inflationRate REAL DEFAULT 3,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating economic_assumptions table:', err);
    } else {
      console.log('Economic assumptions table created or already exists');
    }
  });

  // Tax Configuration table (for tax rates and withdrawal strategy)
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_configuration (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      federalTaxRate REAL DEFAULT 22,
      stateTaxRate REAL DEFAULT 5,
      workingState TEXT DEFAULT 'TX',
      retirementState TEXT,
      stateChangeOption TEXT DEFAULT 'at-retirement',
      stateChangeAge INTEGER,
      filingStatus TEXT DEFAULT 'single',
      withdrawalStrategy TEXT DEFAULT 'waterfall',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating tax_configuration table:', err);
    } else {
      console.log('Tax configuration table created or already exists');
    }
  });

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

  // Tax columns are now stored in separate tax_configuration table (not in financial_data)
};

export default db;
