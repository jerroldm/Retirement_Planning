import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get tax configuration for user
router.get('/', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM tax_configuration WHERE userId = ?`,
    [req.userId],
    (err, config) => {
      if (err) {
        console.error('Database error querying tax configuration:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // Return empty object if no record exists (will use defaults)
      res.json(config || {});
    }
  );
});

// Create tax configuration
router.post('/', verifyToken, (req, res) => {
  const {
    federalTaxRate,
    stateTaxRate,
    workingState,
    retirementState,
    stateChangeOption,
    stateChangeAge,
    filingStatus,
    withdrawalStrategy
  } = req.body;

  console.log('Creating tax configuration:', { userId: req.userId, federalTaxRate, stateTaxRate, workingState });

  db.run(
    `INSERT INTO tax_configuration (userId, federalTaxRate, stateTaxRate, workingState, retirementState, stateChangeOption, stateChangeAge, filingStatus, withdrawalStrategy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId,
      federalTaxRate || 22,
      stateTaxRate || 5,
      workingState || 'TX',
      retirementState || null,
      stateChangeOption || 'at-retirement',
      stateChangeAge || null,
      filingStatus || 'single',
      withdrawalStrategy || 'waterfall'
    ],
    function (err) {
      if (err) {
        console.error('Failed to create tax configuration - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to create tax configuration', details: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Tax configuration created successfully',
      });
    }
  );
});

// Update tax configuration
router.put('/', verifyToken, (req, res) => {
  const {
    federalTaxRate,
    stateTaxRate,
    workingState,
    retirementState,
    stateChangeOption,
    stateChangeAge,
    filingStatus,
    withdrawalStrategy
  } = req.body;

  console.log('Updating tax configuration:', { userId: req.userId, federalTaxRate, stateTaxRate, workingState });

  db.run(
    `UPDATE tax_configuration SET
      federalTaxRate = ?,
      stateTaxRate = ?,
      workingState = ?,
      retirementState = ?,
      stateChangeOption = ?,
      stateChangeAge = ?,
      filingStatus = ?,
      withdrawalStrategy = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ?`,
    [
      federalTaxRate || 22,
      stateTaxRate || 5,
      workingState || 'TX',
      retirementState || null,
      stateChangeOption || 'at-retirement',
      stateChangeAge || null,
      filingStatus || 'single',
      withdrawalStrategy || 'waterfall',
      req.userId
    ],
    function (err) {
      if (err) {
        console.error('Failed to update tax configuration - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to update tax configuration', details: err.message });
      }
      if (this.changes === 0) {
        // No record exists, create one instead
        db.run(
          `INSERT INTO tax_configuration (userId, federalTaxRate, stateTaxRate, workingState, retirementState, stateChangeOption, stateChangeAge, filingStatus, withdrawalStrategy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.userId, federalTaxRate || 22, stateTaxRate || 5, workingState || 'TX', retirementState || null, stateChangeOption || 'at-retirement', stateChangeAge || null, filingStatus || 'single', withdrawalStrategy || 'waterfall'],
          function (err) {
            if (err) {
              console.error('Failed to create tax configuration - DB Error:', err.message);
              return res.status(500).json({ error: 'Failed to create tax configuration', details: err.message });
            }
            res.json({ message: 'Tax configuration created successfully' });
          }
        );
      } else {
        res.json({ message: 'Tax configuration updated successfully' });
      }
    }
  );
});

export default router;
