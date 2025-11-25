import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all persons for user
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT * FROM persons WHERE userId = ? ORDER BY personType DESC, createdAt ASC`,
    [req.userId],
    (err, persons) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(persons || []);
    }
  );
});

// Create a new person
router.post('/', verifyToken, (req, res) => {
  const {
    personType,
    firstName,
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
  } = req.body;

  if (!personType || !firstName) {
    return res.status(400).json({ error: 'Person type and first name are required' });
  }

  db.run(
    `INSERT INTO persons (
      userId, personType, firstName, birthMonth, birthYear, retirementAge, deathAge, contributionStopAge,
      currentSalary, annualSalaryIncrease,
      traditionalIRA, rothIRA, investmentAccounts,
      traditionalIRAContribution, traditionIRACompanyMatch,
      rothIRAContribution, rothIRACompanyMatch,
      investmentAccountsContribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId,
      personType,
      firstName,
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
    ],
    function (err) {
      if (err) {
        console.error('Failed to create person:', err);
        return res.status(500).json({ error: 'Failed to create person' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Person created successfully',
      });
    }
  );
});

// Update a person
router.put('/:id', verifyToken, (req, res) => {
  const {
    firstName,
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
  } = req.body;

  db.run(
    `UPDATE persons SET
      firstName = ?,
      birthMonth = ?,
      birthYear = ?,
      retirementAge = ?,
      deathAge = ?,
      contributionStopAge = ?,
      currentSalary = ?,
      annualSalaryIncrease = ?,
      traditionalIRA = ?,
      rothIRA = ?,
      investmentAccounts = ?,
      traditionalIRAContribution = ?,
      traditionIRACompanyMatch = ?,
      rothIRAContribution = ?,
      rothIRACompanyMatch = ?,
      investmentAccountsContribution = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND userId = ?`,
    [
      firstName,
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
      req.params.id,
      req.userId,
    ],
    function (err) {
      if (err) {
        console.error('Failed to update person:', err);
        return res.status(500).json({ error: 'Failed to update person' });
      }
      res.json({ message: 'Person updated successfully' });
    }
  );
});

// Delete a person
router.delete('/:id', verifyToken, (req, res) => {
  db.run(
    `DELETE FROM persons WHERE id = ? AND userId = ?`,
    [req.params.id, req.userId],
    function (err) {
      if (err) {
        console.error('Failed to delete person:', err);
        return res.status(500).json({ error: 'Failed to delete person' });
      }
      res.json({ message: 'Person deleted successfully' });
    }
  );
});

export default router;
