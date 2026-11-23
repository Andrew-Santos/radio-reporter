// painel/app.js — inicia o painel: login, sessão e menu lateral
import { Auth } from './auth.js';
import { iniciarMenu } from './menu.js';
import { MARCA } from './config.js';

const $ = id => document.getElementById(id);
let menuIniciado = false;

const mostrar = tela => {
  $('tela-carga').hidden = true;
  $('tela-login').hidden = tela !== 'login';
  $('painel').hidden = tela !== 'painel';
  if (tela === 'login') $('login-senha').focus();
};

const erroLogin = msg => { $('login-erro').textContent = msg; $('login-erro').hidden = !msg; };

function abrirPainel() {
  mostrar('painel');
  if (menuIniciado) return;
  menuIniciado = true;
  iniciarMenu({ Auth, area: $('area'), nav: $('menu-itens') });
}

function ligarMenuLateral() {
  const painel = $('painel'), botao = $('btn-menu');
  const aplicar = min => {
    painel.classList.toggle('menu-min', min);
    botao.setAttribute('aria-expanded', String(!min));
    botao.setAttribute('aria-label', min ? 'Expandir menu' : 'Minimizar menu');
  };
  try { aplicar(localStorage.getItem('painel_menu_min') === '1'); } catch { /* usa padrão */ }
  botao.addEventListener('click', () => {
    const min = !painel.classList.contains('menu-min');
    aplicar(min);
    try { localStorage.setItem('painel_menu_min', min ? '1' : '0'); } catch { /* sem storage */ }
  });
}

async function iniciar() {
  document.querySelectorAll('.marca-nome').forEach(e => { e.textContent = MARCA.nome; });
  ligarMenuLateral();

  $('form-login').addEventListener('submit', async ev => {
    ev.preventDefault();
    erroLogin('');
    $('login-botao').disabled = true;
    try {
      await Auth.entrar($('login-senha').value);
      $('login-senha').value = '';
      abrirPainel();
    } catch (e) { erroLogin(e.message); }
    finally { $('login-botao').disabled = false; }
  });

  // Sair pelo botão recarrega a página para não deixar nada na tela
  $('btn-sair').addEventListener('click', () => { Auth.sair(); location.hash = ''; location.reload(); });

  // Sessão expirada no meio do uso: volta ao login sem perder o que está na tela
  window.addEventListener('painel:sair', () => { mostrar('login'); erroLogin('Sessão expirada. Entre novamente.'); });

  try {
    if (await Auth.validar()) abrirPainel();
    else mostrar('login');
  } catch (e) {
    mostrar('login');
    erroLogin(e.message);
  }
}

iniciar();
