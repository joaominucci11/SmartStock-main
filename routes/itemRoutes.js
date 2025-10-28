const express = require('express');
const router = express.Router();
const verificarJWT = require('./authMiddleware');
const { listarItens, registrarItem } = require('./itemController');

// Todas as rotas de itens devem ser protegidas pelo JWT
router.get('/api/itens', verificarJWT, listarItens);
router.post('/api/itens/registrar', verificarJWT, registrarItem);

module.exports = router;