// modules/agendadas/data.js — único arquivo que fala com o worker radioreporter-noticia (lista)
import { URL_API } from '../../config.js';

let Auth;
export const iniciar = a => { Auth = a; };

export async function listarAgendadas() {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch(URL_API.noticia + '/agendadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Auth.token() },
      body: '{}',
      signal: ctl.signal,
    });
    if (res.status === 401) { Auth.sair(); throw new Error('Sessão expirada. Entre novamente.'); }
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || dados.ok === false) throw new Error((dados.erro || 'Falha na comunicação com o servidor.') + (dados.detalhe ? ` (${dados.detalhe})` : ''));
    return dados.postagens || [];
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor. Verifique a internet.');
    throw e;
  } finally { clearTimeout(timer); }
}
