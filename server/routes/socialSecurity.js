import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all social security records for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM social_security WHERE userId = ? ORDER BY personId ASC`,
    [req.userId],
    (err, records) => {
      if (err) {
        console.error('Database error querying social_security:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(records || []);
    }
  );
});

// Get single social security record
router.get('/:id', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM social_security WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    (err, record) => {
      if (err) {
        console.error('Database error querying social_security record:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!record) {
        return res.status(404).json({ error: 'Social security record not found' });
      }
      res.json(record);
    }
  );
});

// Create a new social security record
router.post('/', verifyToken, (req, res) => {
  const { personId, estimatedAnnualBenefit, plannedClaimingAge } = req.body;

  if (!personId) {
    return res.status(400).json({ error: 'Person ID is required' });
  }

  console.log('Creating social security record:', { userId: req.userId, personId, estimatedAnnualBenefit, plannedClaimingAge });

  db.run(
    `INSERT INTO social_security (userId, personId, estimatedAnnualBenefit, plannedClaimingAge)
     VALUES (?, ?, ?, ?)`,
    [
      req.userId,
      personId,
      estimatedAnnualBenefit || 0,
      plannedClaimingAge || 67
    ],
    function (err) {
      if (err) {
        console.error('Failed to create social security record - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to create social security record', details: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Social security record created successfully',
      });
    }
  );
});

// Update a social security record
router.put('/:id', verifyToken, (req, res) => {
  const { personId, estimatedAnnualBenefit, plannedClaimingAge } = req.body;

  console.log('Updating social security record:', { id: req.params.id, userId: req.userId, personId, estimatedAnnualBenefit, plannedClaimingAge });

  db.run(
    `UPDATE social_security SET
      personId = ?,
      estimatedAnnualBenefit = ?,
      plannedClaimingAge = ?
      WHERE id = ? AND userId = ?`,
    [
      personId,
      estimatedAnnualBenefit || 0,
      plannedClaimingAge || 67,
      req.params.id,
      req.userId
    ],
    function (err) {
      if (err) {
        console.error('Failed to update social security record - DB Error:', err.message);
        return res.status(500).json({ error: 'Failed to update social security record', details: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Social security record not found' });
      }
      res.json({ message: 'Social security record updated successfully' });
    }
  );
});

// Delete a social security record
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    `DELETE FROM social_security WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to delete social security record:', err);
        return res.status(500).json({ error: 'Failed to delete social security record' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Social security record not found' });
      }
      res.json({ message: 'Social security record deleted successfully' });
    }
  );
});

export default router;
