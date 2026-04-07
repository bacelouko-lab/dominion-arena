const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../supabase');

const router = express.Router();

// ROTA DE REGISTRO
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Email ou usuário já existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      username,
      password_hash: hashedPassword,
      elo: 1200,
      wins: 0,
      losses: 0
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const token = jwt.sign(
    { userId: newUser.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      elo: newUser.elo
    }
  });
});

// ROTA DE LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      elo: user.elo
    }
  });
});

module.exports = router;