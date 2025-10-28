// routes/itensController.js
const pool = require('../server/db'); 

// NOVO: Função para obter a lista de nomes de itens únicos (o agrupamento)
async function getItensUnicosPorParceiro(req, res) {
    const { parceiro } = req.body; 
    
    if (!parceiro) {
        return res.status(400).json({ message: 'Nome do parceiro não fornecido.' });
    }

    try {
        // AJUSTADO: Adiciona MAX(imagem_url) para pegar uma URL de imagem para o grupo
        // O MySQL retorna a primeira URL não-NULL que ele encontra no grupo.
        const query = `
            SELECT nome, COUNT(id) as total_registrados, MAX(imagem_url) as imagem_url
            FROM \`itens\` 
            WHERE parceiro = ? 
            GROUP BY nome 
            ORDER BY nome ASC
        `;
        
        const [rows] = await pool.query(query, [parceiro]); 

        return res.status(200).json({ itensUnicos: rows });

    } catch (err) {
        console.error('Erro ao buscar itens únicos:', err);
        return res.status(500).json({ message: 'Erro ao buscar itens únicos no servidor.' });
    }
}

// AJUSTADA: Função para obter os detalhes (instâncias) de um item específico
async function getItensPorParceiro(req, res) {
    const { parceiro, nomeItem } = req.body; 
    
    if (!parceiro) {
        return res.status(400).json({ message: 'Nome do parceiro não fornecido.' });
    }

    try {
        let query = `SELECT * FROM \`itens\` WHERE parceiro = ?`; 
        const params = [parceiro];

        if (nomeItem) {
            query += ` AND nome = ?`;
            params.push(nomeItem);
        }
        query += ` ORDER BY nome ASC`;
        
        const [rows] = await pool.query(query, params); 

        return res.status(200).json({ itens: rows });

    } catch (err) {
        console.error('Erro ao buscar itens:', err);
        return res.status(500).json({ message: 'Erro ao buscar itens no servidor.' });
    }
}

// Sua função de registro (mantida)
async function registrarItem(req, res) {
    const { parceiro, codigo, descricao } = req.body;
    const nome_ou_descricao = descricao || 'Novo Item via QR Code';

    try {
        const [existing] = await pool.query(
            `SELECT codigo_qr FROM \`itens\` WHERE codigo_qr = ? AND parceiro = ?`, 
            [codigo, parceiro]
        );

        if (existing.length > 0) {
             return res.status(200).json({ message: 'Item já registrado para este código QR e parceiro.' });
        } else {
            const result = await pool.query(
                `INSERT INTO \`itens\` (nome, codigo_qr, parceiro, localizacao) VALUES (?, ?, ?, ?)`, 
                [nome_ou_descricao, codigo, parceiro, 'Não Definida']
            );
            return res.status(201).json({ message: 'Item registrado com sucesso.', id: result.insertId });
        }

    } catch (err) {
        console.error('Erro ao registrar item:', err);
        return res.status(500).json({ message: 'Erro ao registrar item no servidor.' });
    }
}


module.exports = {
    getItensUnicosPorParceiro, 
    getItensPorParceiro,       
    registrarItem
};