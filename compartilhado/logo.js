// painel/compartilhado/logo.js — logo dos cards (enviada na tela ou arquivo padrão; PNG ou SVG)
import { MARCA } from '../config.js';
import { carregarImagem } from './cartao.js';

const CHAVE = 'painel_logo';
const lerSalva = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };

// SVG de editor (ex.: CorelDRAW) costuma vir em mm, que é minúsculo na tela.
// Troca por pixels do viewBox para o canvas desenhar nítido em qualquer tamanho.
async function imagemDeSvg(texto) {
  const abre = /<svg\b[^>]*>/i.exec(texto)?.[0];
  const vb = /viewBox\s*=\s*"\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i.exec(abre || '');
  if (!abre || !vb) throw new Error('Esse SVG não tem viewBox. Exporte-o de novo ou use PNG.');
  const novaAbertura = abre.replace(/\s(width|height)\s*=\s*"[^"]*"/gi, '').replace(/<svg/i, `<svg width="${vb[1]}" height="${vb[2]}"`);
  const url = URL.createObjectURL(new Blob([texto.replace(abre, novaAbertura)], { type: 'image/svg+xml' }));
  return carregarImagem(url); // o endereço temporário fica até fechar a página
}

async function carregarLogo(src) {
  if (!/\.svg(\?|$)/i.test(src)) return carregarImagem(src);
  const res = await fetch(src);
  if (!res.ok) throw new Error('logo não encontrada');
  return imagemDeSvg(await res.text());
}

// apenasPadrao: ignora a logo enviada na tela e usa sempre o arquivo padrão
export async function obterLogo(apenasPadrao = false) {
  for (const src of [apenasPadrao ? null : lerSalva(), MARCA.logoPadrao]) {
    if (!src) continue;
    try { return await carregarLogo(src); } catch { /* tenta a próxima */ }
  }
  return null;
}

// Guarda como PNG de até 600 px de largura para caber no armazenamento do navegador
export async function salvarLogo(arquivo) {
  if (!arquivo?.type?.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (SVG ou PNG com fundo transparente).');
  let img, url;
  if (arquivo.type === 'image/svg+xml') img = await imagemDeSvg(await arquivo.text());
  else { url = URL.createObjectURL(arquivo); img = await carregarImagem(url); }
  try {
    const esc = Math.min(1, 600 / img.width);
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * esc); c.height = Math.round(img.height * esc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const dados = c.toDataURL('image/png');
    try { localStorage.setItem(CHAVE, dados); } catch { /* vale só até fechar a página */ }
    return carregarImagem(dados);
  } finally { if (url) URL.revokeObjectURL(url); }
}
