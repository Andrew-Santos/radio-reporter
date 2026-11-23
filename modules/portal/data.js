// modules/portal/data.js — único arquivo que fala com o worker radioreporter-noticia (rota /portal)
import { URL_API } from '../../config.js';

let Auth;
export const iniciar = a => { Auth = a; };

export async function listarPortal() {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 45000); // o worker lê até 8 páginas do feed
  try {
    const res = await fetch(URL_API.noticia + '/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Auth.token() },
      body: '{}',
      signal: ctl.signal,
    });
    if (res.status === 401) { Auth.sair(); throw new Error('Sessão expirada. Entre novamente.'); }
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || dados.ok === false) throw new Error((dados.erro || 'Falha na comunicação com o servidor.') + (dados.detalhe ? ` (${dados.detalhe})` : ''));
    return dados;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor. Verifique a internet.');
    throw e;
  } finally { clearTimeout(timer); }
}
