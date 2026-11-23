// painel/compartilhado/cartao.js — utilitários de desenho em canvas para os cards
export const FEED = { l: 1080, a: 1350 };   // 4:5
export const STORY = { l: 1080, a: 1920 };  // 9:16
export const NOTICIA_FEED = { l: 1440, a: 1920 };   // 3:4
export const NOTICIA_STORY = { l: 1440, a: 2560 };  // 9:16
export const FONTE = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const carregarImagem = src => new Promise((ok, falha) => {
  const img = new Image();
  img.onload = () => ok(img);
  img.onerror = () => falha(new Error('Não foi possível ler essa imagem.'));
  img.src = src;
});

export const criarCanvas = ({ l, a }) => {
  const c = document.createElement('canvas');
  c.width = l; c.height = a;
  return c;
};

// Preenche a área cortando o excesso (como object-fit: cover)
export function desenharCover(ctx, img, x, y, l, a) {
  const esc = Math.max(l / img.width, a / img.height);
  const w = img.width * esc, alt = img.height * esc;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, l, a); ctx.clip();
  ctx.drawImage(img, x + (l - w) / 2, y + (a - alt) / 2, w, alt);
  ctx.restore();
}

// Tira faixas e linhas brancas (ou transparentes) das bordas da foto e uma folga mínima de 0,4% por lado,
// que pega fios de 1–2 px que o site deixa na borda. Analisa em resolução cheia: reduzida, a linha fina some no meio da foto.
// Limite de 25% por lado, p/ não comer foto clara de verdade.
export function aparar(img) {
  const { width: w, height: h } = img;
  const amostra = criarCanvas({ l: w, a: h });
  const mx = amostra.getContext('2d', { willReadFrequently: true });
  mx.drawImage(img, 0, 0);
  let px;
  try { px = mx.getImageData(0, 0, w, h).data; } catch { return img; } // canvas "sujo" (imagem de outro site)

  const branco = (x, y) => {
    const i = (y * w + x) * 4;
    return px[i + 3] < 20 || Math.min(px[i], px[i + 1], px[i + 2]) >= 225;
  };
  const linhaBranca = (y, x0, x1) => { let n = 0; for (let x = x0; x < x1; x++) if (branco(x, y)) n++; return n >= (x1 - x0) * 0.9; };
  const colunaBranca = (x, y0, y1) => { let n = 0; for (let y = y0; y < y1; y++) if (branco(x, y)) n++; return n >= (y1 - y0) * 0.9; };

  const maxY = Math.floor(h * 0.25), maxX = Math.floor(w * 0.25);
  let t = 0, b = 0, e = 0, d = 0;
  while (t < maxY && linhaBranca(t, 0, w)) t++;
  while (b < maxY && linhaBranca(h - 1 - b, 0, w)) b++;
  while (e < maxX && colunaBranca(e, t, h - b)) e++;
  while (d < maxX && colunaBranca(w - 1 - d, t, h - b)) d++;

  const fx = Math.max(2, Math.round(w * 0.004)), fy = Math.max(2, Math.round(h * 0.004));
  t += fy; b += fy; e += fx; d += fx;
  const sl = w - e - d, sa = h - t - b;
  if (sl < w * 0.5 || sa < h * 0.5) return img;
  const saida = criarCanvas({ l: sl, a: sa });
  saida.getContext('2d').drawImage(img, e, t, sl, sa, 0, 0, sl, sa);
  return saida;
}

// Fundo desfocado: encolhe a imagem e estica de volta em duas etapas (funciona em qualquer navegador, sem ctx.filter)
export function desenharDesfocado(ctx, img, l, a) {
  const pequeno = criarCanvas({ l: Math.round(l / 40), a: Math.round(a / 40) });
  desenharCover(pequeno.getContext('2d'), img, 0, 0, pequeno.width, pequeno.height);
  const medio = criarCanvas({ l: Math.round(l / 8), a: Math.round(a / 8) });
  const mx = medio.getContext('2d');
  mx.imageSmoothingEnabled = true; mx.imageSmoothingQuality = 'high';
  mx.drawImage(pequeno, 0, 0, medio.width, medio.height);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(medio, 0, 0, l, a);
}

// sombra: levíssimo sombreamento atrás da logo (ajuda a destacá-la do fundo sem pesar)
export function desenharLogo(ctx, logo, x, y, maxL, maxA, alinhar = 'left', sombra = false) {
  const esc = Math.min(maxL / logo.width, maxA / logo.height);
  const w = logo.width * esc, alt = logo.height * esc;
  ctx.save();
  if (sombra) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3; }
  ctx.drawImage(logo, alinhar === 'center' ? x - w / 2 : x, y, w, alt);
  ctx.restore();
  return { w, a: alt };
}

export function quebrarTexto(ctx, texto, larguraMax) {
  const linhas = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    const teste = atual ? atual + ' ' + palavra : palavra;
    if (ctx.measureText(teste).width > larguraMax && atual) { linhas.push(atual); atual = palavra; }
    else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Diminui a fonte até caber em maxLinhas; se ainda não couber, corta com reticências
export function ajustarTexto(ctx, texto, { larguraMax, maxLinhas, tamMax, tamMin, peso = 800 }) {
  let linhas = [];
  for (let tam = tamMax; tam >= tamMin; tam -= 2) {
    ctx.font = `${peso} ${tam}px ${FONTE}`;
    linhas = quebrarTexto(ctx, texto, larguraMax);
    if (linhas.length <= maxLinhas) return { linhas, tam };
  }
  if (linhas.length > maxLinhas) {
    linhas = linhas.slice(0, maxLinhas);
    linhas[maxLinhas - 1] = linhas[maxLinhas - 1].replace(/\s*\S+$/, '') + '…';
  }
  return { linhas, tam: tamMin };
}

export const paraPng = canvas => canvas.toDataURL('image/png');

export function baixar(canvas, nomeArquivo) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
