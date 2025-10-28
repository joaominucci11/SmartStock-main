// public/scripts/itensScript.js

// === CONSTANTES NOVAS E AJUSTADAS ===
const itensUnicosContainer = document.getElementById('itens-unicos-container');
const tituloParceiro = document.getElementById('titulo-parceiro');
const toggleScannerBtn = document.getElementById('toggle-scanner-btn');
const listaItensSection = document.getElementById('lista-itens-section');
const detalhesItemSection = document.getElementById('detalhes-item-section');
const detalhesContainer = document.getElementById('detalhes-container');
const tituloDetalhe = document.getElementById('titulo-detalhe');
const btnVoltarUnicos = document.getElementById('btn-voltar-unicos');
const scannerSection = document.getElementById('scanner-section');
const scannerStatus = document.getElementById('scanner-status');

// Objeto do Scanner (assume que a tag <script> CDN está no itens.html)
const html5QrCode = new Html5Qrcode("reader"); 


// ===========================================
// LÓGICA DE SEGURANÇA E SESSÃO
// ===========================================

function verificarSessao() {
    const token = sessionStorage.getItem('tokenJWT');
    const parceiro = sessionStorage.getItem('parceiroSelecionado');
    if (!token || !parceiro) {
        sessionStorage.removeItem('parceiroSelecionado');
        window.location.href = 'dashboard.html'; 
        return null;
    }
    return { token, parceiro };
}

function fazerLogout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}


// ===========================================
// LÓGICA DE LISTAGEM (COM IMAGENS)
// ===========================================

// Função principal para carregar os itens ÚNICOS (agrupamento)
async function carregarItensUnicos() {
    const sessao = verificarSessao();
    if (!sessao) return;
    
    tituloParceiro.textContent = `Itens: ${sessao.parceiro.toUpperCase()}`;
    itensUnicosContainer.innerHTML = '<p>Carregando tipos de itens...</p>';

    try {
        const response = await fetch('/itens/listar-unicos', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessao.token}`
            },
            body: JSON.stringify({ parceiro: sessao.parceiro })
        });

        if (response.status === 401) return fazerLogout();
        const data = await response.json();

        if (response.ok) {
            renderizarItensUnicos(data.itensUnicos);
        } else {
            itensUnicosContainer.innerHTML = `<p style="color: red;">Erro: ${data.message}</p>`;
        }
    } catch (error) {
        itensUnicosContainer.innerHTML = '<p style="color: red;">Erro de conexão com o servidor.</p>';
    }
}


// Renderiza a lista de agrupamento com IMAGENS
function renderizarItensUnicos(itensUnicos) {
    if (!itensUnicos || itensUnicos.length === 0) {
        itensUnicosContainer.innerHTML = '<p>Nenhum item cadastrado.</p>';
        return;
    }

    itensUnicosContainer.innerHTML = ''; 

    itensUnicos.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('item-unico-card');

        // Lógica de Imagem: usa imagem_url (do banco) ou a imagem padrão
        // O caminho DEVE começar com a barra '/' para ser relativo à raiz do servidor (pasta public)
        const imageUrl = item.imagem_url ? item.imagem_url : '/images/default-item.png'; 

        itemCard.innerHTML = `
            <img 
                src="${imageUrl}" 
                alt="${item.nome}" 
                class="item-card-image"
                // O onerror tenta carregar o fallback se o src falhar (404)
                onerror="this.onerror=null; this.src='/images/default-item.png';" 
            >
            <div class="item-card-info">
                <strong>${item.nome}</strong>
                <span>Total: ${item.total_registrados}</span>
            </div>
            <button data-nome="${item.nome}" class="btn-detalhes">Ver Detalhes</button>
        `;
        
        itemCard.querySelector('.btn-detalhes').addEventListener('click', (e) => {
            carregarDetalhesItem(e.currentTarget.dataset.nome);
        });

        itensUnicosContainer.appendChild(itemCard);
    });
}


// Carrega os detalhes (instâncias) de um item específico
async function carregarDetalhesItem(nomeItem) {
    const sessao = verificarSessao();
    if (!sessao) return;

    // Alterna a visualização para a seção de Detalhes
    listaItensSection.classList.remove('section-ativa');
    listaItensSection.classList.add('section-oculta');
    detalhesItemSection.classList.remove('section-oculta');
    detalhesItemSection.classList.add('section-ativa');
    
    tituloDetalhe.textContent = `Detalhes: ${nomeItem}`;
    detalhesContainer.innerHTML = '<p>Carregando instâncias...</p>';

    try {
        const response = await fetch('/itens/listar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessao.token}`
            },
            body: JSON.stringify({ parceiro: sessao.parceiro, nomeItem: nomeItem })
        });

        if (response.status === 401) return fazerLogout();
        const data = await response.json();

        if (response.ok) {
            renderizarDetalhes(data.itens);
        } else {
            detalhesContainer.innerHTML = `<p style="color: red;">Erro: ${data.message}</p>`;
        }

    } catch (error) {
        detalhesContainer.innerHTML = '<p style="color: red;">Erro de conexão.</p>';
    }
}


// Renderiza a tabela de detalhes (mantida como tabela)
function renderizarDetalhes(itens) {
    if (!itens || itens.length === 0) {
        detalhesContainer.innerHTML = '<p>Nenhuma instância registrada para este item.</p>';
        return;
    }

    let htmlTabela = '<table class="itens-tabela">'; 
    htmlTabela += `
        <thead>
            <tr>
                <th>CÓDIGO QR</th>
                <th>LOCALIZAÇÃO</th>
                <th>DATA REGISTRO</th>
                <th>AÇÕES</th>
            </tr>
        </thead>
        <tbody>
    `;

    itens.forEach(item => {
        htmlTabela += `
            <tr>
                <td>${item.codigo_qr || 'N/A'}</td>
                <td>${item.localizacao || 'N/A'}</td>
                <td>${new Date(item.data_registro).toLocaleDateString('pt-BR') || 'N/A'}</td>
                <td><button class="btn-editar">Editar</button></td>
            </tr>
        `;
    });

    htmlTabela += '</tbody></table>';
    detalhesContainer.innerHTML = htmlTabela;
}


// ===========================================
// LÓGICA DO SCANNER (MANTIDA)
// ===========================================

function toggleScanner(ativar) {
    if (ativar) {
        listaItensSection.classList.remove('section-ativa');
        listaItensSection.classList.add('section-oculta');
        detalhesItemSection.classList.remove('section-ativa'); // Esconde detalhes
        detalhesItemSection.classList.add('section-oculta');
        scannerSection.classList.remove('section-oculta');
        scannerSection.classList.add('section-ativa');
        toggleScannerBtn.textContent = 'Fechar Scanner';
        iniciarScanner();
    } else {
        pararScanner();
        scannerSection.classList.remove('section-ativa');
        scannerSection.classList.add('section-oculta');
        listaItensSection.classList.remove('section-oculta');
        listaItensSection.classList.add('section-ativa');
        toggleScannerBtn.textContent = 'Abrir Scanner';
    }
}

function iniciarScanner() {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const successCallback = (decodedText) => {
        pararScanner();
        scannerStatus.textContent = 'QR Code lido. Registrando...';
        registrarItem(decodedText);
    };
    const errorCallback = (errorMessage) => {};
    
    html5QrCode.start({ facingMode: "environment" }, config, successCallback, errorCallback)
        .catch(err => {
            scannerStatus.textContent = `Erro ao iniciar scanner: ${err.message}`;
            console.error("Erro ao iniciar scanner:", err);
        });
}

function pararScanner() {
    if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Erro ao parar scanner:", err));
    }
}

async function registrarItem(codigoQr) {
    const sessao = verificarSessao();
    if (!sessao) return;

    try {
        const response = await fetch('/itens/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessao.token}`
            },
            body: JSON.stringify({ 
                parceiro: sessao.parceiro,
                codigo: codigoQr,
                descricao: `Item ${codigoQr}` 
            })
        });

        const data = await response.json();

        if (response.ok) {
            scannerStatus.textContent = `Sucesso: ${data.message}`;
        } else {
            scannerStatus.textContent = `Erro: ${data.message || 'Falha ao registrar.'}`;
        }

    } catch (error) {
        scannerStatus.textContent = 'Erro de conexão com o servidor.';
        console.error('Erro ao registrar item:', error);
    } finally {
        setTimeout(() => {
            scannerStatus.textContent = '';
            toggleScanner(false);
            carregarItensUnicos();
        }, 2000); 
    }
}


// ===========================================
// EVENTOS E INICIALIZAÇÃO
// ===========================================

// Ouve o botão de Voltar
if (btnVoltarUnicos) {
    btnVoltarUnicos.addEventListener('click', () => {
        detalhesItemSection.classList.remove('section-ativa');
        detalhesItemSection.classList.add('section-oculta');
        listaItensSection.classList.remove('section-oculta');
        listaItensSection.classList.add('section-ativa');
        // A lista de únicos já estava carregada, então apenas voltamos a visualização
    });
}

// Inicialização da página
window.addEventListener('pageshow', (event) => {
    const sessao = verificarSessao();
    
    // Lógica do BFCACHE (mantida)
    if (event.persisted) {
        if (!sessao) return;
        window.location.reload(true);
        return;
    }

    if (!sessao) return; 

    carregarItensUnicos();
    
    if (toggleScannerBtn) {
        toggleScannerBtn.addEventListener('click', () => {
            const isScannerActive = scannerSection.classList.contains('section-ativa');
            toggleScanner(!isScannerActive); 
        });
    }
});