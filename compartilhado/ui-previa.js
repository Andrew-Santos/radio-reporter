// painel/compartilhado/ui-previa.js — blocos de tela reaproveitados pelos módulos de cards
import { h } from './dom.js';
import { baixar } from './cartao.js';

export const grupo = (rotulo, campo, dica) =>
  h('div', { class: 'campo-grupo' }, h('label', { for: campo.id, text: rotulo }), campo, dica && h('p', { class: 'campo-dica', text: dica }));

export function campoLogo(id, aoEscolher) {
  const entrada = h('input', {
    id, class: 'campo', type: 'file', accept: 'image/*',
    onchange: () => { if (entrada.files[0]) aoEscolher(entrada.files[0]); entrada.value = ''; },
  });
  return grupo('Logo do card', entrada, 'SVG ou PNG com fundo transparente. Fica salva neste navegador.');
}

// nomeArquivo pode ser texto ou função (para usar o valor atual do formulário)
export function blocoCartao(rotulo, canvas, nomeArquivo) {
  canvas.classList.add('cartao-canvas');
  return h('figure', { class: 'cartao-bloco' },
    h('figcaption', { text: rotulo }),
    canvas,
    h('button', { type: 'button', class: 'btn btn-sec', onclick: () => baixar(canvas, typeof nomeArquivo === 'function' ? nomeArquivo() : nomeArquivo) }, 'Baixar PNG'));
}
