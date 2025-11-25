import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's financial data
router.get('/', verifyToken, (req, res) => {
  console.log('GET /financial - Looking for userId:', req.userId);
  db.get(
    `SELECT * FROM financial_data WHERE userId = ? ORDER BY updatedAt DESC LIMIT 1`,
    [req.userId],
    (err, data) => {
      if (err) {
        console.error('Database error querying financial_data:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log('Query result:', { found: !!data, userId: req.userId });
      if (!data) {
        return res.json(null);
      }

      console.log('Returning financial data for userId:', req.userId, 'birthYear:', data.birthYear);
      res.json(data);
    }
  );
});

// Save or update financial data
router.post('/', verifyToken, (req, res) => {
  console.log('=== FINANCIAL DATA POST ===');
  console.log('Received POST request for financial data:');
  console.log('  userId:', req.userId);
  console.log('  birthYear:', req.body.birthYear);
  console.log('  birthMonth:', req.body.birthMonth);
  console.log('  dataKeys:', Object.keys(req.body));
  const {
    maritalStatus,
    firstName,
    currentAge,
    birthMonth,
    birthYear,
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
    spouse2FirstName,
    spouse2CurrentAge,
    spouse2BirthMonth,
    spouse2BirthYear,
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
    homePropertyTax,
    homePropertyTaxAnnualIncrease,
    homeInsurance,
    homeInsuranceAnnualIncrease,
    homeSalePlanEnabled,
    homeSaleYear,
    homeSaleMonth,
    homeMortgageExtraPrincipalPayment,
    otherAssets,
    preRetirementAnnualExpenses,
    postRetirementAnnualExpenses,
    investmentReturn,
    inflationRate,
    federalTaxRate,
    stateTaxRate,
  } = req.body;

  // Check if user already has financial data
  db.get(
    `SELECT id FROM financial_data WHERE userId = ?`,
    [req.userId],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing) {
        // Update existing
        db.run(
          `UPDATE financial_data SET
            maritalStatus = ?,
            firstName = ?,
            currentAge = ?, birthMonth = ?, birthYear = ?, retirementAge = ?, deathAge = ?, contributionStopAge = ?,
            currentSalary = ?, annualSalaryIncrease = ?,
            traditionalIRA = ?, rothIRA = ?, investmentAccounts = ?,
            traditionalIRAContribution = ?, traditionIRACompanyMatch = ?,
            rothIRAContribution = ?, rothIRACompanyMatch = ?,
            investmentAccountsContribution = ?,
            spouse2FirstName = ?,
            spouse2CurrentAge = ?, spouse2BirthMonth = ?, spouse2BirthYear = ?, spouse2RetirementAge = ?,
            spouse2CurrentSalary = ?, spouse2AnnualSalaryIncrease = ?,
            spouse2TraditionalIRA = ?, spouse2RothIRA = ?, spouse2InvestmentAccounts = ?,
            spouse2TraditionalIRAContribution = ?, spouse2TraditionalIRACompanyMatch = ?,
            spouse2RothIRAContribution = ?, spouse2RothIRACompanyMatch = ?,
            spouse2InvestmentAccountsContribution = ?, spouse2ContributionStopAge = ?,
            homeValue = ?, homeMortgage = ?, homeMortgageRate = ?,
            homeMortgageMonthlyPayment = ?, homeMortgagePayoffYear = ?, homeMortgagePayoffMonth = ?, homePropertyTaxInsurance = ?, homePropertyTax = ?, homePropertyTaxAnnualIncrease = ?, homeInsurance = ?, homeInsuranceAnnualIncrease = ?, homeSalePlanEnabled = ?, homeSaleYear = ?, homeSaleMonth = ?, homeMortgageExtraPrincipalPayment = ?, otherAssets = ?,
            preRetirementAnnualExpenses = ?, postRetirementAnnualExpenses = ?, investmentReturn = ?,
            inflationRate = ?, federalTaxRate = ?, stateTaxRate = ?,
            updatedAt = CURRENT_TIMESTAMP
            WHERE userId = ?`,
          [
            maritalStatus,
            firstName,
            currentAge, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
            currentSalary, annualSalaryIncrease,
            traditionalIRA, rothIRA, investmentAccounts,
            traditionalIRAContribution, traditionIRACompanyMatch,
            rothIRAContribution, rothIRACompanyMatch,
            investmentAccountsContribution,
            spouse2FirstName,
            spouse2CurrentAge, spouse2BirthMonth, spouse2BirthYear, spouse2RetirementAge,
            spouse2CurrentSalary, spouse2AnnualSalaryIncrease,
            spouse2TraditionalIRA, spouse2RothIRA, spouse2InvestmentAccounts,
            spouse2TraditionalIRAContribution, spouse2TraditionalIRACompanyMatch,
            spouse2RothIRAContribution, spouse2RothIRACompanyMatch,
            spouse2InvestmentAccountsContribution, spouse2ContributionStopAge,
            homeValue, homeMortgage, homeMortgageRate,
            homeMortgageMonthlyPayment, homeMortgagePayoffYear, homeMortgagePayoffMonth, homePropertyTaxInsurance, homePropertyTax, homePropertyTaxAnnualIncrease, homeInsurance, homeInsuranceAnnualIncrease, homeSalePlanEnabled, homeSaleYear, homeSaleMonth, homeMortgageExtraPrincipalPayment, otherAssets,
            preRetirementAnnualExpenses, postRetirementAnnualExpenses, investmentReturn,
            inflationRate, federalTaxRate, stateTaxRate,
            req.userId,
          ],
          function (err) {
            if (err) {
              console.error('Failed to update financial data:', err);
              return res.status(500).json({ error: 'Failed to update data' });
            }

            res.json({
              id: existing.id,
              message: 'Financial data updated successfully',
            });
          }
        );
      } else {
        // Insert new
        db.run(
          `INSERT INTO financial_data (
            userId, maritalStatus, firstName, currentAge, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
            currentSalary, annualSalaryIncrease,
            traditionalIRA, rothIRA, investmentAccounts,
            traditionalIRAContribution, traditionIRACompanyMatch,
            rothIRAContribution, rothIRACompanyMatch,
            investmentAccountsContribution,
            spouse2FirstName, spouse2CurrentAge, spouse2BirthMonth, spouse2BirthYear, spouse2RetirementAge,
            spouse2CurrentSalary, spouse2AnnualSalaryIncrease,
            spouse2TraditionalIRA, spouse2RothIRA, spouse2InvestmentAccounts,
            spouse2TraditionalIRAContribution, spouse2TraditionalIRACompanyMatch,
            spouse2RothIRAContribution, spouse2RothIRACompanyMatch,
            spouse2InvestmentAccountsContribution, spouse2ContributionStopAge,
            homeValue, homeMortgage, homeMortgageRate,
            homeMortgageMonthlyPayment, homeMortgagePayoffYear, homeMortgagePayoffMonth, homePropertyTaxInsurance, homePropertyTax, homePropertyTaxAnnualIncrease, homeInsurance, homeInsuranceAnnualIncrease, homeSalePlanEnabled, homeSaleYear, homeSaleMonth, homeMortgageExtraPrincipalPayment, otherAssets,
            preRetirementAnnualExpenses, postRetirementAnnualExpenses, investmentReturn,
            inflationRate, federalTaxRate, stateTaxRate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.userId, maritalStatus, firstName, currentAge, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
            currentSalary, annualSalaryIncrease,
            traditionalIRA, rothIRA, investmentAccounts,
            traditionalIRAContribution, traditionIRACompanyMatch,
            rothIRAContribution, rothIRACompanyMatch,
            investmentAccountsContribution,
            spouse2FirstName, spouse2CurrentAge, spouse2BirthMonth, spouse2BirthYear, spouse2RetirementAge,
            spouse2CurrentSalary, spouse2AnnualSalaryIncrease,
            spouse2TraditionalIRA, spouse2RothIRA, spouse2InvestmentAccounts,
            spouse2TraditionalIRAContribution, spouse2TraditionalIRACompanyMatch,
            spouse2RothIRAContribution, spouse2RothIRACompanyMatch,
            spouse2InvestmentAccountsContribution, spouse2ContributionStopAge,
            homeValue, homeMortgage, homeMortgageRate,
            homeMortgageMonthlyPayment, homeMortgagePayoffYear, homeMortgagePayoffMonth, homePropertyTaxInsurance, homePropertyTax, homePropertyTaxAnnualIncrease, homeInsurance, homeInsuranceAnnualIncrease, homeSalePlanEnabled, homeSaleYear, homeSaleMonth, homeMortgageExtraPrincipalPayment, otherAssets,
            preRetirementAnnualExpenses, postRetirementAnnualExpenses, investmentReturn,
            inflationRate, federalTaxRate, stateTaxRate,
          ],
          function (err) {
            if (err) {
              console.error('Failed to insert financial data:', err);
              console.error('Error details:', err.message);
              return res.status(500).json({ error: 'Failed to save data', details: err.message });
            }

            res.status(201).json({
              id: this.lastID,
              message: 'Financial data saved successfully',
            });
          }
        );
      }
    }
  );
});

// Get all scenarios for user
router.get('/scenarios', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM scenarios WHERE userId = ? ORDER BY updatedAt DESC`,
    [req.userId],
    (err, scenarios) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(scenarios || []);
    }
  );
});

// Save a scenario
router.post('/scenarios', verifyToken, (req, res) => {
  const { name, description, financialData } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Scenario name required' });
  }

  // First save the financial data
  db.run(
    `INSERT INTO financial_data (
      userId, maritalStatus, firstName, currentAge, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
      currentSalary, annualSalaryIncrease,
      traditionalIRA, rothIRA, investmentAccounts,
      traditionalIRAContribution, traditionIRACompanyMatch,
      rothIRAContribution, rothIRACompanyMatch,
      investmentAccountsContribution,
      spouse2FirstName, spouse2CurrentAge, spouse2BirthMonth, spouse2BirthYear, spouse2RetirementAge,
      spouse2CurrentSalary, spouse2AnnualSalaryIncrease,
      spouse2TraditionalIRA, spouse2RothIRA, spouse2InvestmentAccounts,
      spouse2TraditionalIRAContribution, spouse2TraditionalIRACompanyMatch,
      spouse2RothIRAContribution, spouse2RothIRACompanyMatch,
      spouse2InvestmentAccountsContribution, spouse2ContributionStopAge,
      homeValue, homeMortgage, homeMortgageRate,
      homeMortgageMonthlyPayment, homeMortgagePayoffYear, homeMortgagePayoffMonth, homePropertyTaxInsurance, homePropertyTax, homePropertyTaxAnnualIncrease, homeInsurance, homeInsuranceAnnualIncrease, homeSalePlanEnabled, homeSaleYear, homeSaleMonth, homeMortgageExtraPrincipalPayment, otherAssets,
      preRetirementAnnualExpenses, postRetirementAnnualExpenses, investmentReturn,
      inflationRate, federalTaxRate, stateTaxRate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId,
      financialData.maritalStatus,
      financialData.firstName,
      financialData.currentAge, financialData.birthMonth, financialData.birthYear, financialData.retirementAge, financialData.deathAge, financialData.contributionStopAge,
      financialData.currentSalary, financialData.annualSalaryIncrease,
      financialData.traditionalIRA, financialData.rothIRA, financialData.investmentAccounts,
      financialData.traditionalIRAContribution, financialData.traditionIRACompanyMatch,
      financialData.rothIRAContribution, financialData.rothIRACompanyMatch,
      financialData.investmentAccountsContribution,
      financialData.spouse2FirstName, financialData.spouse2CurrentAge, financialData.spouse2BirthMonth, financialData.spouse2BirthYear, financialData.spouse2RetirementAge,
      financialData.spouse2CurrentSalary, financialData.spouse2AnnualSalaryIncrease,
      financialData.spouse2TraditionalIRA, financialData.spouse2RothIRA, financialData.spouse2InvestmentAccounts,
      financialData.spouse2TraditionalIRAContribution, financialData.spouse2TraditionalIRACompanyMatch,
      financialData.spouse2RothIRAContribution, financialData.spouse2RothIRACompanyMatch,
      financialData.spouse2InvestmentAccountsContribution, financialData.spouse2ContributionStopAge,
      financialData.homeValue, financialData.homeMortgage, financialData.homeMortgageRate,
      financialData.homeMortgageMonthlyPayment, financialData.homeMortgagePayoffYear, financialData.homeMortgagePayoffMonth, financialData.homePropertyTaxInsurance, financialData.homePropertyTax, financialData.homePropertyTaxAnnualIncrease, financialData.homeInsurance, financialData.homeInsuranceAnnualIncrease, financialData.homeSalePlanEnabled, financialData.homeSaleYear, financialData.homeSaleMonth, financialData.homeMortgageExtraPrincipalPayment, financialData.otherAssets,
      financialData.preRetirementAnnualExpenses, financialData.postRetirementAnnualExpenses, financialData.investmentReturn,
      financialData.inflationRate, financialData.federalTaxRate, financialData.stateTaxRate,
    ],
    function (err) {
      if (err) {
        console.error('Failed to insert financial data for scenario:', err);
        console.error('Error details:', err.message);
        return res.status(500).json({ error: 'Failed to save financial data', details: err.message });
      }

      const financialDataId = this.lastID;

      // Then save the scenario
      db.run(
        `INSERT INTO scenarios (userId, name, description, financialDataId)
         VALUES (?, ?, ?, ?)`,
        [req.userId, name, description || '', financialDataId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save scenario' });
          }

          res.status(201).json({
            id: this.lastID,
            message: 'Scenario saved successfully',
          });
        }
      );
    }
  );
});

export default router;
