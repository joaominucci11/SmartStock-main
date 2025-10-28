// server.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const itensRoutes = require('./routes/itens'); 

const verificarJWT = require('./routes/authMiddleware');


const app = express();

// ===============================================
// SOLUÇÃO CRÍTICA: Desabilitar o Cache no Express
// Este Middleware deve vir PRIMEIRO!
// ===============================================
app.use((req, res, next) => {
    // Aplica cabeçalhos anti-cache para todas as respostas.
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
// ===============================================


app.use(cors());
app.use(express.json()); 

// Serve os arquivos estáticos (HTMLs, JS, CSS, IMAGENS) usando path.resolve para garantir o caminho
app.use(express.static(path.resolve(__dirname, 'public'))); 
app.use('/images', express.static(path.resolve(__dirname, 'public/images'))); // Rota explícita para imagens

// Rotas da API
app.use(authRoutes);
app.use(itensRoutes); 


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard-data', verificarJWT, (req, res) => {
  res.json({ message: `Bem-vindo ${req.user.nome}` });
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));