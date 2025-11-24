import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all assets for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM assets WHERE userId = ? ORDER BY createdAt DESC`,
    [req.userId],
    (err, assets) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
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
  const {
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
  } = req.body;

  db.run(
    `INSERT INTO assets (
      userId, assetType, assetName, currentValue,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate,
      sellPlanEnabled, sellYear, sellMonth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId, assetType, assetName, currentValue || 0,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment || 0,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate || 0,
      sellPlanEnabled ? 1 : 0, sellYear, sellMonth,
    ],
    function (err) {
      if (err) {
        console.error('Failed to create asset:', err);
        return res.status(500).json({ error: 'Failed to create asset' });
      }
      res.status(201).json({ id: this.lastID, message: 'Asset created successfully' });
    }
  );
});

// Update asset
router.put('/:id', verifyToken, (req, res) => {
  const {
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
  } = req.body;

  db.run(
    `UPDATE assets SET
      assetName = ?, currentValue = ?,
      loanBalance = ?, loanRate = ?, monthlyPayment = ?, payoffYear = ?, payoffMonth = ?, extraPrincipalPayment = ?,
      propertyTax = ?, propertyTaxAnnualIncrease = ?, insurance = ?, insuranceAnnualIncrease = ?,
      annualExpenses = ?, annualExpensesAnnualIncrease = ?,
      rentalIncome = ?, rentalIncomeAnnualIncrease = ?,
      appreciationRate = ?,
      sellPlanEnabled = ?, sellYear = ?, sellMonth = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?`,
    [
      assetName, currentValue || 0,
      loanBalance, loanRate, monthlyPayment, payoffYear, payoffMonth, extraPrincipalPayment || 0,
      propertyTax, propertyTaxAnnualIncrease, insurance, insuranceAnnualIncrease,
      annualExpenses, annualExpensesAnnualIncrease,
      rentalIncome, rentalIncomeAnnualIncrease,
      appreciationRate || 0,
      sellPlanEnabled ? 1 : 0, sellYear, sellMonth,
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

export default router;
