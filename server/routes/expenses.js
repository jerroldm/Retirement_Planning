import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM expenses WHERE userId = ? ORDER BY createdAt ASC`,
    [req.userId],
    (err, expenses) => {
      if (err) {
        console.error('Database error querying expenses:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(expenses || []);
    }
  );
});

// Get single expense
router.get('/:id', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM expenses WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    (err, expense) => {
      if (err) {
        console.error('Database error querying expense:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json(expense);
    }
  );
});

// Create a new expense
router.post('/', verifyToken, (req, res) => {
  const { expenseName, monthlyAmount, preRetirement, postRetirement, notes } = req.body;

  if (!expenseName) {
    return res.status(400).json({ error: 'Expense name is required' });
  }

  console.log('Creating expense:', { userId: req.userId, expenseName, monthlyAmount, preRetirement, postRetirement, notes });

  db.run(
    `INSERT INTO expenses (userId, expenseName, monthlyAmount, preRetirement, postRetirement, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.userId,
      expenseName,
      monthlyAmount || 0,
      preRetirement !== undefined ? preRetirement : 1,
      postRetirement !== undefined ? postRetirement : 1,
      notes || ''
    ],
    function (err) {
      if (err) {
        console.error('Failed to create expense - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to create expense', details: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Expense created successfully',
      });
    }
  );
});

// Update an expense
router.put('/:id', verifyToken, (req, res) => {
  const { expenseName, monthlyAmount, preRetirement, postRetirement, notes } = req.body;

  console.log('Updating expense:', { id: req.params.id, userId: req.userId, expenseName, monthlyAmount, preRetirement, postRetirement, notes });

  db.run(
    `UPDATE expenses SET
      expenseName = ?,
      monthlyAmount = ?,
      preRetirement = ?,
      postRetirement = ?,
      notes = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?`,
    [
      expenseName,
      monthlyAmount || 0,
      preRetirement !== undefined ? preRetirement : 1,
      postRetirement !== undefined ? postRetirement : 1,
      notes || '',
      req.params.id,
      req.userId
    ],
    function (err) {
      if (err) {
        console.error('Failed to update expense - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to update expense', details: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ message: 'Expense updated successfully' });
    }
  );
});

// Delete an expense
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    `DELETE FROM expenses WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to delete expense:', err);
        return res.status(500).json({ error: 'Failed to delete expense' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ message: 'Expense deleted successfully' });
    }
  );
});

export default router;
