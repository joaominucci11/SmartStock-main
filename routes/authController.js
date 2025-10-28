const bcrypt = require('bcrypt');
const loginSchema = require('../schemas/login'); 
const registerSchema = require('../schemas/register');
const pool = require('../server/db'); 
const jwt = require('jsonwebtoken');

// IMPORTANTE: Assumindo que este caminho é 'routes/tokenTables'
const tabelasPorToken = require('./tokenTables'); 

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '30m';

async function validateEmail(req, res) {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) return res.status(400).json({ message: 'Formato de e-mail inválido' });

        const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'E-mail não cadastrado' });

        return res.status(200).json({ message: 'E-mail válido' });
    } catch (err) {
        console.error('Erro ao validar e-mail:', err);
        return res.status(500).json({ message: 'Erro ao validar e-mail no servidor' });
    }
}

async function login(req, res) {
    try {
        await loginSchema.validate(req.body);
        const { email, password } = req.body;

        // Seleciona o ID e nome para uso no JWT se a validação passar
        const [rows] = await pool.query('SELECT id, nome, senha FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'E-mail ou senha incorretos' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.senha);
        if (!isMatch) return res.status(401).json({ message: 'E-mail ou senha incorretos' });

        // CORREÇÃO: Apenas confirma a senha. Não gera o JWT aqui!
        return res.status(200).json({ message: 'Senha correta, prossiga para o token' });

    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
        console.error('Erro no login:', err);
        return res.status(500).json({ message: 'Erro ao fazer login no servidor' });
    }
}

async function loginWithToken(req, res) {
    try {
        // Recebe o e-mail (que já passou pela etapa da senha) e o token de 6 dígitos
        const { email, token } = req.body; 

        // 1. Busca o usuário para o JWT
        const [rows] = await pool.query('SELECT id, nome FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'E-mail inválido ou credenciais ausentes' });
        const user = rows[0];

        // 2. Valida o Token de 6 dígitos
        const tabelasPermitidas = tabelasPorToken[token];
        if (!tabelasPermitidas) {
            return res.status(401).json({ message: 'Token de acesso inválido' });
        }

        // 3. Busca e filtra as tabelas liberadas (Lógica de Permissão)
        const [tabelas] = await pool.query("SHOW TABLES LIKE '%'");
        const nomesTabelasBanco = tabelas.map(t => t[Object.keys(t)[0]]);
        const tabelasLiberadas = tabelasPermitidas.filter(nome =>
            nomesTabelasBanco.includes(nome.toLowerCase()) || nomesTabelasBanco.includes(nome)
        );

        // 4. GERAÇÃO DO JWT (Payload usando o ID do usuário)
        const payload = { id: user.id, nome: user.nome };
        const tokenJWT = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        // 5. Retorna o JWT e as permissões (parceiros)
        return res.status(200).json({
            nome: user.nome,
            tokenJWT,
            tabelasLiberadas 
        });
    } catch (err) {
        console.error('Erro ao validar token:', err);
        return res.status(500).json({ message: 'Erro ao validar token' });
    }
}

async function register(req, res) {
    // ... (Mantém a lógica de registro)
}

module.exports = {
    validateEmail,
    login,
    loginWithToken,
    register,
};