import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all assets for user
router.get('/', verifyToken, (req, res) => {
  console.log('GET /api/assets - Fetching assets for user:', req.userId);
  db.all(
    `SELECT * FROM assets WHERE userId = ? ORDER BY createdAt DESC`,
    [req.userId],
    (err, assets) => {
      if (err) {
        console.error('Failed to fetch assets:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      console.log('Successfully fetched', (assets || []).length, 'assets');
      res.json(assets || []);
    }
  );
});

// Get single asset
router.get('/:id', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM assets WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    (err, asset) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json(asset);
    }
  );
});

// Create asset
router.post('/', verifyToken, (req, res) => {
  console.log('POST /api/assets - Creating asset for user:', req.userId);
  console.log('Request body:', req.body);

  const {
    personId,
    assetType,
    assetName,
    currentValue,
    loanBalance,
    loanRate,
    monthlyPayment,
    payoffYear,
    payoffMonth,
    extraPrincipalPayment,
    propertyTax,
    propertyTaxAnnualIncrease,
    insurance,
    insuranceAnnualIncrease,
    annualExpenses,
    annualExpensesAnnualIncrease,
    rentalIncome,
    rentalIncomeAnnualIncrease,
    appreciationRate,
    sellPlanEnabled,
    sellYear,
    sellMonth,
    expectedSaleProceeds,
  } = req.body;

  db.run(
    `INSERT INTO assets (
      userId, personId, assetType, assetName, currentValue,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate,
      sellPlanEnabled, sellYear, sellMonth, expectedSaleProceeds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId, personId || null, assetType, assetName, currentValue || 0,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment || 0,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate || 0,
      sellPlanEnabled ? 1 : 0, sellYear, sellMonth, expectedSaleProceeds || 0,
    ],
    function (err) {
      if (err) {
        console.error('Failed to create asset:', err);
        return res.status(500).json({ error: 'Failed to create asset', details: err.message });
      }
      console.log('Asset created successfully with ID:', this.lastID);
      res.status(201).json({ id: this.lastID, message: 'Asset created successfully' });
    }
  );
});

// Update asset
router.put('/:id', verifyToken, (req, res) => {
  const {
    personId,
    assetName,
    currentValue,
    loanBalance,
    loanRate,
    monthlyPayment,
    payoffYear,
    payoffMonth,
    extraPrincipalPayment,
    propertyTax,
    propertyTaxAnnualIncrease,
    insurance,
    insuranceAnnualIncrease,
    annualExpenses,
    annualExpensesAnnualIncrease,
    rentalIncome,
    rentalIncomeAnnualIncrease,
    appreciationRate,
    sellPlanEnabled,
    sellYear,
    sellMonth,
    expectedSaleProceeds,
  } = req.body;

  db.run(
    `UPDATE assets SET
      personId = ?, assetName = ?, currentValue = ?,
      loanBalance = ?, loanRate = ?, monthlyPayment = ?, payoffYear = ?, payoffMonth = ?, extraPrincipalPayment = ?,
      propertyTax = ?, propertyTaxAnnualIncrease = ?, insurance = ?, insuranceAnnualIncrease = ?,
      annualExpenses = ?, annualExpensesAnnualIncrease = ?,
      rentalIncome = ?, rentalIncomeAnnualIncrease = ?,
      appreciationRate = ?,
      sellPlanEnabled = ?, sellYear = ?, sellMonth = ?, expectedSaleProceeds = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?`,
    [
      personId || null, assetName, currentValue || 0,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment || 0,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate || 0,
      sellPlanEnabled ? 1 : 0, sellYear, sellMonth, expectedSaleProceeds || 0,
      req.params.id, req.userId,
    ],
    function (err) {
      if (err) {
        console.error('Failed to update asset:', err);
        return res.status(500).json({ error: 'Failed to update asset' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json({ message: 'Asset updated successfully' });
    }
  );
});

// Delete asset
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    `DELETE FROM assets WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to delete asset:', err);
        return res.status(500).json({ error: 'Failed to delete asset' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json({ message: 'Asset deleted successfully' });
    }
  );
});

// Migrate home data from financial_data to assets table
router.post('/migrate/home-data', verifyToken, (req, res) => {
  console.log('POST /api/assets/migrate/home-data - Migrating home data for user:', req.userId);

  // First, check if a primary-residence asset already exists
  db.get(
    `SELECT id FROM assets WHERE userId = ? AND assetType = 'primary-residence'`,
    [req.userId],
    (err, existingAsset) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // If asset already exists, migration is done
      if (existingAsset) {
        return res.json({ message: 'Home data already migrated', migrated: false });
      }

      // Fetch user's financial data
      db.get(
        `SELECT * FROM financial_data WHERE userId = ?`,
        [req.userId],
        (err, financialData) => {
          if (err) {
            console.error('Failed to fetch financial data:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
          }

          // If no financial data or no home value, nothing to migrate
          if (!financialData || !financialData.homeValue) {
            return res.json({ message: 'No home data to migrate', migrated: false });
          }

          console.log('Found home data, creating primary-residence asset');

          // Create asset from home data
          db.run(
            `INSERT INTO assets (
              userId, assetType, assetName, currentValue,
              loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment,
              propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
              appreciationRate,
              sellPlanEnabled, sellYear, sellMonth
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              req.userId,
              'primary-residence',
              'Primary Residence',
              financialData.homeValue,
              financialData.homeMortgage,
              financialData.homeMortgageRate,
              financialData.homeMortgageMonthlyPayment,
              financialData.homeMortgagePayoffYear,
              financialData.homeMortgagePayoffMonth,
              financialData.homeMortgageExtraPrincipalPayment,
              financialData.homePropertyTax,
              financialData.homePropertyTaxAnnualIncrease,
              financialData.homeInsurance,
              financialData.homeInsuranceAnnualIncrease,
              0, // appreciationRate - use 0 for now, can be set separately
              financialData.homeSalePlanEnabled ? 1 : 0,
              financialData.homeSaleYear,
              financialData.homeSaleMonth,
            ],
            function (err) {
              if (err) {
                console.error('Failed to create home asset:', err);
                return res.status(500).json({ error: 'Failed to migrate home data', details: err.message });
              }
              console.log('Home data migrated successfully, asset ID:', this.lastID);
              res.json({ message: 'Home data migrated successfully', migrated: true, assetId: this.lastID });
            }
          );
        }
      );
    }
  );
});

// Migrate person ownership - assign unassigned assets/accounts to 'Self' person
router.post('/migrate/assign-person-ownership', verifyToken, (req, res) => {
  console.log('POST /api/assets/migrate/assign-person-ownership - Migrating ownership for user:', req.userId);

  // Find user's 'self' person, or create one if it doesn't exist
  db.get(
    `SELECT id FROM persons WHERE userId = ? AND personType = 'self' LIMIT 1`,
    [req.userId],
    (err, person) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // If self person doesn't exist, create one
      if (!person) {
        db.run(
          `INSERT INTO persons (userId, personType, firstName, birthMonth, birthYear, includeInCalculations)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.userId, 'self', 'Self', 1, 1970, 1],
          function (createErr) {
            if (createErr) {
              console.error('Failed to create self person:', createErr);
              return res.status(500).json({ error: 'Failed to create person' });
            }

            // Continue with assignment using the newly created person
            const personId = this.lastID;
            assignPersonOwnership(personId, req.userId, res);
          }
        );
        return;
      }

      // Person exists, continue with assignment
      assignPersonOwnership(person.id, req.userId, res);
    }
  );

  // Helper function to assign ownership
  function assignPersonOwnership(personId, userId, res) {
    // Update all assets without personId
    db.run(
      `UPDATE assets SET personId = ? WHERE userId = ? AND personId IS NULL`,
      [personId, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update assets' });
        }

        const assetsUpdated = this.changes;

        // Update all savings accounts without personId
        db.run(
          `UPDATE savings_accounts SET personId = ? WHERE userId = ? AND personId IS NULL`,
          [personId, userId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update savings accounts' });
            }

            res.json({
              message: 'Person ownership assigned successfully',
              assetsUpdated,
              accountsUpdated: this.changes
            });
          }
        );
      }
    );
  }
});

export default router;
