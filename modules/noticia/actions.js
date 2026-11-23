// modules/noticia/actions.js — regras da tela (validação rápida; o worker valida de novo)
import { MARCA } from '../../config.js';
import { paraPng } from '../../compartilhado/cartao.js';
import * as data from './data.js';

// Tira do título o que vem depois de " - ", " – ", " — " ou " | " quando é curto
// (autor ou nome do site, ex.: "Título da matéria - Fulano de Tal"). Subtítulos longos ficam.
export function limparTitulo(titulo = '') {
  let t = titulo.trim();
  for (let i = 0; i < 2; i++) {
    const m = /^(.+?)\s+[-–—|]\s+([^-–—|]{2,40})$/.exec(t);
    if (!m || m[2].trim().split(/\s+/).length > 6) break;
    t = m[1].trim();
  }
  return t;
}

// Corta no fim de uma frase (ou palavra) em vez de no meio
const resumir = (texto = '', max = 220) => {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max);
  const frase = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('! '), corte.lastIndexOf('? '));
  if (frase > 80) return corte.slice(0, frase + 1);
  return texto.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
};

const semProtocolo = link => (link || '').replace(/^https?:\/\/(www\.)?/i, '');

const LIMITE_LEGENDA = 2200; // limite do Instagram

export function montarLegenda({ titulo, descricao, link }) {
  const L = MARCA.legenda;
  const montar = resumo => [
    `${L.emoji} ${(titulo || '').toLocaleUpperCase('pt-BR')}!`.replace(/([!?.…])!$/, '$1'),
    resumo || null,
    link ? `👉 Leia a matéria completa:\n${semProtocolo(link)}` : null,
    [L.frequencia, L.site, L.horario].join('\n'),
    `${L.apresentacao}\n${L.slogan}`,
    `${L.perfil}\n${MARCA.hashtags}`,
  ].filter(Boolean).join('\n\n');

  if (!L.incluirResumo || !descricao) return montar('');
  // a descrição só ocupa o que sobrar até o limite do Instagram
  const sobra = LIMITE_LEGENDA - montar('').length - 2;
  const max = Math.max(0, Math.min(L.maxResumo || 450, sobra));
  return montar(max >= 60 ? resumir(descricao, max) : '');
}

export async function buscar(url) {
  const limpa = (url || '').trim();
  if (!/^https?:\/\/\S+$/i.test(limpa)) throw new Error('Cole o link completo da notícia, começando com http:// ou https://.');
  const n = await data.buscarNoticia(limpa);
  const titulo = limparTitulo(n.titulo);
  return { ...n, titulo, legenda: montarLegenda({ ...n, titulo }) };
}

export async function publicarCards({ titulo, legenda, link, forcar = false, canvasFeed, canvasStory, aoProgresso }) {
  if (!titulo.trim()) throw new Error('O título não pode ficar vazio.');
  if (legenda.length > 2200) throw new Error('A legenda passa do limite de 2.200 caracteres do Instagram.');
  return data.publicar({ titulo, legenda, link, forcar, feed: paraPng(canvasFeed), story: paraPng(canvasStory) }, aoProgresso);
}
