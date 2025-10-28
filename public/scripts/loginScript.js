// public/scripts/loginScript.js

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const mensagem = document.getElementById('mensagem');

const etapaEmail = document.getElementById('etapa-email');
const etapaSenha = document.getElementById('etapa-password');
const etapaToken = document.getElementById('etapa-token');

const tokenInputs = document.querySelectorAll('.token-input');

const btnUnico = document.getElementById('btn-unico');

let etapaAtual = 1;
let email = ''; 
let password = '';

function exibirMensagem(texto, cor = 'White') {
    mensagem.textContent = texto;
    mensagem.style.color = cor;
    mensagem.style.fontSize = '15px';
}

// =====================
// FADE IN / FADE OUT
// =====================
function fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = 0;
        setTimeout(() => {
            element.classList.add('oculto');
            element.style.opacity = 1;
            resolve();
        }, duration);
    });
}

function fadeIn(element, duration = 300, delay = 200) {
    return new Promise((resolve) => {
        setTimeout(() => {
            element.classList.remove('oculto');
            element.style.opacity = 0;
            element.style.transition = `opacity ${duration}ms`;
            requestAnimationFrame(() => {
                element.style.opacity = 1;
                resolve();
            });
        }, delay);
    });
}

// =====================
// LÓGICA DE VALIDAÇÃO
// =====================

async function validarEmail() {
    exibirMensagem('Validando e-mail...');
    btnUnico.disabled = true;

    try {
        const response = await fetch('/validate-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailInput.value })
        });
        
        const data = await response.json();

        if (response.ok) {
            email = emailInput.value; // Salva o e-mail
            
            // CORREÇÃO 2: Avanço de Etapa após sucesso
            await fadeOut(etapaEmail);
            etapaAtual++;
            
            passwordInput.value = ''; 
            passwordInput.disabled = false;
            passwordInput.focus();
            
            await fadeIn(etapaSenha);
            btnUnico.textContent = 'PRÓXIMO';
            exibirMensagem('E-mail válido. Digite sua senha.');

        } else if (response.status === 404) {
            exibirMensagem(data.message || 'E-mail não cadastrado.', 'red');
        } else {
            exibirMensagem(data.message || 'E-mail inválido.', 'red');
        }

    } catch (error) {
        exibirMensagem('Erro de conexão com o servidor.', 'red');
        console.error('Erro ao validar e-mail:', error);
    } finally {
        btnUnico.disabled = false;
    }
}

async function validarSenha() {
    exibirMensagem('Validando senha...');
    btnUnico.disabled = true;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: passwordInput.value })
        });
        
        const data = await response.json();

        if (response.ok) {
            password = passwordInput.value; // Salva a senha

            // Lógica de Avanço para o Token
            await fadeOut(etapaSenha);
            etapaAtual++;
            
            // CORREÇÃO 3: Habilita todos os inputs de token antes de dar foco
            tokenInputs.forEach(input => {
                input.disabled = false;
                input.value = ''; // Limpa qualquer valor anterior
            });
            tokenInputs[0].focus();
            
            await fadeIn(etapaToken);
            btnUnico.textContent = 'VALIDAR';
            exibirMensagem('Senha válida. Digite o código de 6 dígitos.');

        } else if (response.status === 401) {
            exibirMensagem(data.message || 'Senha inválida.', 'red');
        } else {
            exibirMensagem(data.message || 'Erro ao validar senha.', 'red');
        }

    } catch (error) {
        exibirMensagem('Erro de conexão com o servidor.', 'red');
        console.error('Erro ao validar senha:', error);
    } finally {
        btnUnico.disabled = false;
    }
}

function getToken() {
    let token = '';
    tokenInputs.forEach(input => {
        token += input.value;
    });
    return token.trim();
}

// CORREÇÃO 3: Lógica de Foco Automático e Backspace
tokenInputs.forEach((input, index) => {
    // Ao digitar, avança para o próximo campo
    input.addEventListener('input', () => {
        // Se o valor é 1 (o maxlength é 1), avança o foco
        if (input.value.length === 1) { 
            if (index < tokenInputs.length - 1) {
                tokenInputs[index + 1].focus();
            }
        }
    });
    
    // Ao pressionar Backspace em um campo vazio, volta para o campo anterior
    input.addEventListener('keydown', (e) => {
        // Verifica se é Backspace e se o campo está vazio
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
            tokenInputs[index - 1].focus();
        }
    });
});

async function validarToken() {
    const token = getToken();
    if (token.length !== 6) {
        return exibirMensagem('O token deve ter 6 dígitos.', 'red');
    }

    exibirMensagem('Validando token...');
    btnUnico.disabled = true;

    try {
        const response = await fetch('/login-with-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password, token: token })
        });

        const data = await response.json();

        if (response.ok) {
            // LOGIN BEM-SUCEDIDO
            sessionStorage.setItem('nomeUsuario', data.nome);
            sessionStorage.setItem('tokenJWT', data.tokenJWT);
            sessionStorage.setItem('tabelasLiberadas', JSON.stringify(data.tabelasLiberadas || []));
            
            window.location.href = 'dashboard.html';
        } else {
            exibirMensagem(data.message || 'Token inválido.', 'red');
        }
    } catch (error) {
        exibirMensagem('Erro de conexão ao validar o token.', 'red');
        console.error(error);
    } finally {
        btnUnico.disabled = false;
    }
}

// =====================
// EVENT LISTENERS
// =====================

// CORREÇÃO 2: Usa o evento de 'click' do botão único para gerenciar as etapas (mais seguro)
if (btnUnico) {
    btnUnico.addEventListener('click', async (e) => {
        e.preventDefault(); 
        switch (etapaAtual) {
            case 1:
                await validarEmail();
                break;
            case 2:
                await validarSenha();
                break;
            case 3:
                await validarToken();
                break;
            default:
                exibirMensagem('Erro de estado do formulário. Recarregue a página');
        }
    });
}


// CORREÇÃO 1: CHECAGEM DE SESSÃO ATIVA (Resolve o problema do "Voltar" do navegador)
window.addEventListener('pageshow', (event) => {
    const token = sessionStorage.getItem('tokenJWT');
    const nome = sessionStorage.getItem('nomeUsuario');

    // Se a sessão está ativa, redirecione IMEDIATAMENTE.
    if (token && nome) {
        // Se a página veio do cache, força o recarregamento com o cache desabilitado
        if (event.persisted) {
            window.location.reload(true); 
            return;
        }
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Se não há sessão e a página foi recarregada do cache (botão Voltar),
    // é uma boa prática limpar o sessionStorage para garantir que não haja estados parciais.
    if (event.persisted) {
         sessionStorage.clear();
    }
});

// REMOVIDO: O antigo listener 'load' que limpava o sessionStorage (isso era um bug) foi removido.