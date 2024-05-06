const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

const loginAttempts = {};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.find0ne({ where: { email } });

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (user.isBanned) {
    return res.status(403).json({ error: 'User is banned' });
  }

  if (!isPasswordCorrect) {
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 0, lastAttempt: null };
    }
    loginAttempts[email].count += 1;
    loginAttempts[email].lastAttempt = new Date();

    if (loginAttempts[email].count > 5) {
      const currentTime = new Date();
      const lastAttemptTime = loginAttempts[email].lastAttempt;
      const timeDifference = Math.abs(currentTime - lastAttemptTime);
      const minutesDifference = Math.floor(timeDifference / 1000 / 60);

      if (minutesDifference < 30) {
        return res
          .status(403)
          .json({ error: 'Too many failed login attempts' });
      } else {
        loginAttempts[email].count = 0;
      }
    }
  } else {
    if (loginAttempts[email]) {
      loginAttempts[email].count = 0;
    }
  }

  res.status(200).json({ success: 'User logged in' });
});

module.exports = router;
