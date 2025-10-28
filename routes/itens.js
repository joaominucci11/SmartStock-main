// routes/itens.js
const express = require('express');
const router = express.Router();
const verificarJWT = require('./authMiddleware');
const { getItensUnicosPorParceiro, getItensPorParceiro, registrarItem } = require('./itensController'); 

// Rota protegida para LISTAR itens únicos (AGRUPAMENTO)
router.post('/itens/listar-unicos', verificarJWT, getItensUnicosPorParceiro);

// Rota protegida para LISTAR detalhes de itens (DETALHES)
router.post('/itens/listar', verificarJWT, getItensPorParceiro);

// Rota protegida para REGISTRAR itens via QR Code
router.post('/itens/registrar', verificarJWT, registrarItem); 

module.exports = router;