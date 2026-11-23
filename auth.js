// painel/auth.js — sessão do painel (token no sessionStorage, validado pelo worker)
import { URL_API } from './config.js';

const CHAVE = 'painel_token';
const ler = () => { try { return sessionStorage.getItem(CHAVE) || ''; } catch { return ''; } };
const gravar = t => { try { t ? sessionStorage.setItem(CHAVE, t) : sessionStorage.removeItem(CHAVE); } catch { /* sem storage */ } };

const chamar = async (caminho, opcoes = {}) => {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try { return await fetch(URL_API.auth + caminho, { ...opcoes, signal: ctl.signal }); }
  catch { throw new Error('Sem conexão com o servidor. Tente novamente.'); }
  finally { clearTimeout(timer); }
};

export const Auth = {
  token: ler,

  // Limpa a sessão e avisa o painel (app.js volta para o login)
  sair() { gravar(''); window.dispatchEvent(new Event('painel:sair')); },

  async entrar(senha) {
    const res = await chamar('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || !dados.ok) throw new Error(dados.erro || 'Não foi possível entrar.');
    gravar(dados.token);
  },

  // true = sessão válida, false = sem sessão ou expirada; falha de rede lança erro
  async validar() {
    const token = ler();
    if (!token) return false;
    const res = await chamar('/sessao', { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) { gravar(''); return false; }
    return res.ok;
  },
};
