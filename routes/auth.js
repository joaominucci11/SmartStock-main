const express = require('express');
const router = express.Router();
const { login, register, validateEmail, loginWithToken } = require('./authController');

// 1. Rota para a Etapa E-mail (Verifica se o e-mail existe)
router.post('/validate-email', validateEmail);

// 2. Rota para a Etapa Senha (Verifica credenciais e exige 2FA)
router.post('/login', login);

// 3. Rota para a Etapa Token (Validação final com 2FA)
router.post('/login-with-token', loginWithToken);

// Rota de registro (Permanece a mesma)
router.post('/register', register);

module.exports = router;