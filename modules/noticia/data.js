// modules/noticia/data.js — único arquivo que fala com o worker radioreporter-noticia
import { URL_API } from '../../config.js';

let Auth;
export const iniciar = a => { Auth = a; };

const montarErro = d => (d.erro || 'Falha na comunicação com o servidor.') + (d.detalhe ? ` (${d.detalhe})` : '');

const chamar = async (caminho, corpo) => {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const res = await fetch(URL_API.noticia + caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + Auth.token() },
      body: JSON.stringify(corpo),
      signal: ctl.signal,
    });
    if (res.status === 401) { Auth.sair(); throw new Error('Sessão expirada. Entre novamente.'); }
    const dados = await res.json().catch(() => ({}));
    if (!res.ok || dados.ok === false) throw new Error(montarErro(dados));
    return dados;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou para responder. Tente novamente.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor. Verifique a internet.');
    throw e;
  } finally { clearTimeout(timer); }
};

export const buscarNoticia = url => chamar('/noticia', { url });

// fetch não informa o progresso do ENVIO; XMLHttpRequest informa.
// aoProgresso(fracao 0..1) acompanha os bytes enviados; quando chega a 1 o servidor ainda está gravando.
export const publicar = (corpo, aoProgresso = () => {}) => new Promise((ok, falha) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', URL_API.noticia + '/publicar');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + Auth.token());
  xhr.timeout = 180000;
  xhr.upload.onprogress = e => { if (e.lengthComputable) aoProgresso(e.loaded / e.total); };
  xhr.upload.onload = () => aoProgresso(1);
  xhr.onload = () => {
    let dados = {};
    try { dados = JSON.parse(xhr.responseText); } catch { /* resposta sem JSON */ }
    if (xhr.status === 401) { Auth.sair(); return falha(new Error('Sessão expirada. Entre novamente.')); }
    if (xhr.status < 200 || xhr.status >= 300 || dados.ok === false) {
      const erro = new Error(montarErro(dados));
      erro.duplicada = dados.duplicada === true; // notícia já enviada antes (o módulo pergunta se quer repetir)
      return falha(erro);
    }
    ok(dados);
  };
  xhr.onerror = () => falha(new Error('Sem conexão com o servidor. Verifique a internet.'));
  xhr.ontimeout = () => falha(new Error('O servidor demorou para responder. Verifique em “Postagens agendadas” antes de tentar de novo.'));
  xhr.send(JSON.stringify(corpo));
});
