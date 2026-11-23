// modules/noticia/cartoes.js — desenha os cards de feed (3:4) e stories (9:16) da notícia
import { NOTICIA_STORY, FONTE, desenharDesfocado, ajustarTexto, desenharLogo } from '../../compartilhado/cartao.js';

// Foto inteira (horizontal ou vertical) num quadro sobre fundo desfocado da própria foto; título logo abaixo.
// O quadro tem a proporção da foto, então nada é cortado. O conjunto é centralizado na área livre.
export function desenharNoticia(canvas, formato, { imagem, titulo, fonte, logo }) {
  const ctx = canvas.getContext('2d');
  const { l, a } = formato;
  const story = formato === NOTICIA_STORY;
  const margem = 96;
  const ALT_LOGO = 84, LARG_LOGO = 280;
  const larg = l - margem * 2;

  // fundo: foto desfocada + véu escuro (sem foto, só o escuro)
  ctx.fillStyle = '#0b0d11';
  ctx.fillRect(0, 0, l, a);
  if (imagem) desenharDesfocado(ctx, imagem, l, a);
  const veu = ctx.createLinearGradient(0, 0, 0, a);
  veu.addColorStop(0, 'rgba(8,10,14,.58)'); veu.addColorStop(0.5, 'rgba(8,10,14,.68)'); veu.addColorStop(1, 'rgba(8,10,14,.94)');
  ctx.fillStyle = veu; ctx.fillRect(0, 0, l, a);

  // stories: topo e rodapé ficam livres por causa da interface do Instagram
  const topoLogo = story ? 330 : 90;
  if (logo) desenharLogo(ctx, logo, margem, topoLogo, LARG_LOGO, ALT_LOGO, 'left', true);
  const zonaTopo = topoLogo + (logo ? ALT_LOGO : 0) + 50;
  const zonaBase = a - (story ? 340 : 120);

  const { linhas, tam } = ajustarTexto(ctx, titulo, { larguraMax: larg, maxLinhas: 5, tamMax: story ? 104 : 100, tamMin: 58 });
  const altLinha = tam * 1.18;
  const altTitulo = linhas.length * altLinha;
  const ESPACO_FOTO = 64, ESPACO_FONTE = 40, ALT_FONTE = 36;

  // quadro da foto: mesma proporção da original, dentro da largura e da altura disponíveis (sem cortar)
  const proporcao = imagem ? imagem.width / imagem.height : 1;
  const resto = (temFoto) => altTitulo + ESPACO_FONTE + ALT_FONTE + (temFoto ? ESPACO_FOTO : 0);
  const livre = zonaBase - zonaTopo;
  let largFoto = 0, altFoto = 0;
  if (imagem) {
    const altMax = Math.max(400, Math.min(story ? 1400 : 900, livre - resto(true)));
    largFoto = Math.min(larg, altMax * proporcao);
    altFoto = largFoto / proporcao;
  }

  let y = zonaTopo + Math.max(0, (livre - (altFoto + resto(!!altFoto))) / 2);

  if (altFoto) {
    const xFoto = (l - largFoto) / 2; // foto vertical fica centralizada
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.roundRect(xFoto, y, largFoto, altFoto, 28); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.roundRect(xFoto, y, largFoto, altFoto, 28); ctx.clip();
    ctx.drawImage(imagem, xFoto, y, largFoto, altFoto);
    ctx.restore();
    y += altFoto + ESPACO_FOTO;
  }

  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff'; ctx.font = `800 ${tam}px ${FONTE}`;
  linhas.forEach((ln, i) => ctx.fillText(ln, margem, y + i * altLinha));
  y += altTitulo + ESPACO_FONTE;

  // só o link (domínio da matéria), discreto
  ctx.font = `500 ${ALT_FONTE}px ${FONTE}`;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.fillText(fonte, margem, y);
}
