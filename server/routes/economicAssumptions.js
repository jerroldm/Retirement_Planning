import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get economic assumptions for user
router.get('/', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM economic_assumptions WHERE userId = ?`,
    [req.userId],
    (err, assumptions) => {
      if (err) {
        console.error('Database error querying economic assumptions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // Return empty object if no record exists (will use defaults)
      res.json(assumptions || {});
    }
  );
});

// Create economic assumptions
router.post('/', verifyToken, (req, res) => {
  const { investmentReturn, inflationRate } = req.body;

  console.log('Creating economic assumptions:', { userId: req.userId, investmentReturn, inflationRate });

  db.run(
    `INSERT INTO economic_assumptions (userId, investmentReturn, inflationRate)
     VALUES (?, ?, ?)`,
    [
      req.userId,
      investmentReturn || 7,
      inflationRate || 3
    ],
    function (err) {
      if (err) {
        console.error('Failed to create economic assumptions - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to create economic assumptions', details: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Economic assumptions created successfully',
      });
    }
  );
});

// Update economic assumptions
router.put('/', verifyToken, (req, res) => {
  const { investmentReturn, inflationRate } = req.body;

  console.log('Updating economic assumptions:', { userId: req.userId, investmentReturn, inflationRate });

  db.run(
    `UPDATE economic_assumptions SET
      investmentReturn = ?,
      inflationRate = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ?`,
    [
      investmentReturn || 7,
      inflationRate || 3,
      req.userId
    ],
    function (err) {
      if (err) {
        console.error('Failed to update economic assumptions - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to update economic assumptions', details: err.message });
      }
      if (this.changes === 0) {
        // No record exists, create one instead
        db.run(
          `INSERT INTO economic_assumptions (userId, investmentReturn, inflationRate)
           VALUES (?, ?, ?)`,
          [req.userId, investmentReturn || 7, inflationRate || 3],
          function (err) {
            if (err) {
              console.error('Failed to create economic assumptions - DB Error:', err.message);
              return res.status(500).json({ error: 'Failed to create economic assumptions', details: err.message });
            }
            res.json({ message: 'Economic assumptions created successfully' });
          }
        );
      } else {
        res.json({ message: 'Economic assumptions updated successfully' });
      }
    }
  );
});

export default router;
