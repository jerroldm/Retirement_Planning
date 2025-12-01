import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all savings accounts for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM savings_accounts WHERE userId = ? ORDER BY createdAt ASC`,
    [req.userId],
    (err, accounts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(accounts || []);
    }
  );
});

// Create new savings account
router.post('/', verifyToken, (req, res) => {
  const {
    accountType,
    accountName,
    personId,
    owner,
    currentBalance,
    rothBalance,
    traditionalMatchBalance,
    annualContribution,
    companyMatch,
    stopContributingMode,
    stopContributingAge,
    stopContributingMonth,
    stopContributingYear
  } = req.body;

  if (!accountType || !accountName || !personId) {
    return res.status(400).json({ error: 'Account type, name, and owner are required' });
  }

  db.run(
    `INSERT INTO savings_accounts (userId, accountType, accountName, personId, owner, currentBalance, rothBalance, traditionalMatchBalance, annualContribution, companyMatch, stopContributingMode, stopContributingAge, stopContributingMonth, stopContributingYear)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, accountType, accountName, personId || null, owner || '', currentBalance || 0, rothBalance || 0, traditionalMatchBalance || 0, annualContribution || 0, companyMatch || 0, stopContributingMode || 'retirement', stopContributingAge || 0, stopContributingMonth || 0, stopContributingYear || 0],
    function(err) {
      if (err) {
        console.error('Failed to create savings account:', err);
        return res.status(500).json({ error: 'Failed to create account' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Account created successfully'
      });
    }
  );
});

// Update savings account
router.put('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const {
    accountType,
    accountName,
    personId,
    owner,
    currentBalance,
    rothBalance,
    traditionalMatchBalance,
    annualContribution,
    companyMatch,
    stopContributingMode,
    stopContributingAge,
    stopContributingMonth,
    stopContributingYear
  } = req.body;

  console.log('Updating account with data:', {
    accountType,
    accountName,
    rothBalance,
    traditionalMatchBalance,
    currentBalance
  });

  db.run(
    `UPDATE savings_accounts
     SET accountType = ?, accountName = ?, personId = ?, owner = ?, currentBalance = ?, rothBalance = ?, traditionalMatchBalance = ?, annualContribution = ?, companyMatch = ?, stopContributingMode = ?, stopContributingAge = ?, stopContributingMonth = ?, stopContributingYear = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ? AND userId = ?`,
    [accountType, accountName, personId || null, owner || '', currentBalance || 0, rothBalance || 0, traditionalMatchBalance || 0, annualContribution || 0, companyMatch || 0, stopContributingMode || 'retirement', stopContributingAge || 0, stopContributingMonth || 0, stopContributingYear || 0, id, req.userId],
    function(err) {
      if (err) {
        console.error('Failed to update savings account:', err);
        return res.status(500).json({ error: 'Failed to update account' });
      }
      res.json({ message: 'Account updated successfully' });
    }
  );
});

// Delete savings account
router.delete('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM savings_accounts WHERE id = ? AND userId = ?`,
    [id, req.userId],
    function(err) {
      if (err) {
        console.error('Failed to delete savings account:', err);
        return res.status(500).json({ error: 'Failed to delete account' });
      }
      res.json({ message: 'Account deleted successfully' });
    }
  );
});

export default router;
