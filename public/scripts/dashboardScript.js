// public/scripts/dashboardScript.js

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const btnMenuToggle = document.getElementById('btn-menu-toggle');
const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
const titulo = document.getElementById('titulo-usuario');
const parceirosContainer = document.getElementById('parceiros-container');

// ===========================================
// LÓGICA DE AUTENTICAÇÃO E LOGOUT
// ===========================================

function fazerLogout() {
    // Limpa TUDO no sessionStorage
    sessionStorage.clear(); 
    window.location.href = 'login.html';
}

if (btnSidebarLogout) {
    btnSidebarLogout.addEventListener('click', fazerLogout);
}

// CHECAGEM DE SEGURANÇA: Checa sessionStorage e anula o bfcache
window.addEventListener('pageshow', (event) => {
    const nome = sessionStorage.getItem('nomeUsuario');
    const token = sessionStorage.getItem('tokenJWT'); 
    
    // CORREÇÃO CRÍTICA PARA O BFCACHE:
    if (event.persisted) {
        // Se a página veio do cache e NÃO HÁ SESSÃO VÁLIDA, redireciona e limpa.
        if (!nome || !token) { 
            fazerLogout(); 
            return;
        }
        // Se a página veio do cache e HÁ SESSÃO, forçamos um reload completo para validar o token.
        // O parâmetro 'true' força o ignorar do cache.
        window.location.reload(true); 
        return;
    }
    
    // REDIRECIONAMENTO É IMEDIATO se o nome ou o token estiver ausente
    if (!nome || !token) { 
        fazerLogout(); 
        return; 
    }
    
    if (titulo) {
        titulo.textContent = `Olá, ${nome}!`;
    }
});

// NOVO CÓDIGO: Isso tenta impedir que a página seja salva no bfcache
window.addEventListener('unload', () => {
    // Uma dica para o navegador.
});


// ===========================================
// CRIAÇÃO DINÂMICA DOS PARCEIROS
// ===========================================

window.addEventListener('DOMContentLoaded', () => {
    if (!parceirosContainer) return;

    // Obtém as tabelas (parceiros) liberadas do sessionStorage
    const tabelasLiberadasJson = sessionStorage.getItem('tabelasLiberadas');
    const tabelasLiberadas = tabelasLiberadasJson ? JSON.parse(tabelasLiberadasJson) : [];

    tabelasLiberadas.forEach(nomeParceiro => {
        const nomeFormatado = nomeParceiro.toUpperCase();
        
        const box = document.createElement('div');
        box.classList.add('parceiro-box');

        // Overlay para texto de carregamento/erro
        const overlay = document.createElement('div');
        overlay.classList.add('parceiro-overlay');
        overlay.textContent = nomeFormatado;

        // Imagem
        const img = document.createElement('img');
        img.classList.add('parceiro-logo');
        
        // Lógica para nome do arquivo de imagem
        const imgName = nomeParceiro.toLowerCase().replace(/\s+/g, ''); 
        img.src = `./imagesDash/${imgName}.png`; 
        img.alt = nomeFormatado;

        // Oculta o overlay quando a imagem carrega
        img.onload = () => overlay.style.display = 'none';
        // Remove a imagem e mostra o overlay (apenas o nome) se a imagem falhar
        img.onerror = () => {
            img.remove();
            overlay.style.display = 'flex'; 
        };

        box.appendChild(img);
        box.appendChild(overlay);

        box.addEventListener('click', () => {
            // CORREÇÃO: SALVA O NOME DA TABELA NO sessionStorage
            sessionStorage.setItem('parceiroSelecionado', nomeParceiro); 
            window.location.href = 'itens.html'; 
        });

        parceirosContainer.appendChild(box);
    });
});

// Toggle do menu
if (btnMenuToggle) {
    btnMenuToggle.addEventListener('click', () => {
        const ativo = sidebar.classList.contains('active');
        if (ativo) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            btnMenuToggle.textContent = '☰';
        } else {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            btnMenuToggle.textContent = '✖';
        }
    });
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        if (btnMenuToggle) btnMenuToggle.textContent = '☰';
    });
}