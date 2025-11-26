import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all income sources for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM income_sources WHERE userId = ? ORDER BY createdAt ASC`,
    [req.userId],
    (err, sources) => {
      if (err) {
        console.error('Database error querying income_sources:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(sources || []);
    }
  );
});

// Create a new income source
router.post('/', verifyToken, (req, res) => {
  const { sourceName, annualSalary, annualSalaryIncrease } = req.body;

  if (!sourceName) {
    return res.status(400).json({ error: 'Source name is required' });
  }

  db.run(
    `INSERT INTO income_sources (userId, sourceName, annualSalary, annualSalaryIncrease)
     VALUES (?, ?, ?, ?)`,
    [req.userId, sourceName, annualSalary || 0, annualSalaryIncrease || 0],
    function (err) {
      if (err) {
        console.error('Failed to create income source:', err);
        return res.status(500).json({ error: 'Failed to create income source' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Income source created successfully',
      });
    }
  );
});

// Update an income source
router.put('/:id', verifyToken, (req, res) => {
  const { sourceName, annualSalary, annualSalaryIncrease } = req.body;

  db.run(
    `UPDATE income_sources SET
      sourceName = ?,
      annualSalary = ?,
      annualSalaryIncrease = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?`,
    [sourceName, annualSalary || 0, annualSalaryIncrease || 0, req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to update income source:', err);
        return res.status(500).json({ error: 'Failed to update income source' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Income source not found' });
      }
      res.json({ message: 'Income source updated successfully' });
    }
  );
});

// Delete an income source
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    `DELETE FROM income_sources WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to delete income source:', err);
        return res.status(500).json({ error: 'Failed to delete income source' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Income source not found' });
      }
      res.json({ message: 'Income source deleted successfully' });
    }
  );
});

export default router;
