import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, firstName || '', lastName || ''],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const userId = this.lastID;

        // Auto-create a "Self" person for the new user
        db.run(
          `INSERT INTO persons (userId, personType, firstName, birthMonth, birthYear, includeInCalculations)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, 'self', firstName || 'Self', 1, 1970, 1],
          function (personErr) {
            if (personErr) {
              console.error('Failed to create self person:', personErr);
              // Don't fail the signup if person creation fails
            }

            const token = generateToken(userId);
            res.status(201).json({
              token,
              user: {
                id: userId,
                email,
                firstName: firstName || '',
                lastName: lastName || '',
              },
            });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  db.get(
    `SELECT id, email, firstName, lastName FROM users WHERE id = ?`,
    [req.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

export default router;
