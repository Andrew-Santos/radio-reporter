// modules/agendadas/ui.js — desenha a tela de postagens agendadas (não chama API)
import { h } from '../../compartilhado/dom.js';

export function desenharTela({ aoAtualizar }) {
  const botao = h('button', { type: 'button', class: 'btn btn-sec', onclick: aoAtualizar }, 'Atualizar');
  const aviso = h('p', { class: 'estado', role: 'status' });
  const lista = h('div', { class: 'ag-grade' });
  const raiz = h('div', { class: 'ag-pagina' },
    h('div', { class: 'ag-topo' }, h('h1', { text: 'Postagens agendadas' }), botao),
    aviso, lista);
  return { raiz, refs: { botao, aviso, lista } };
}

// Só a mídia e a legenda (stories não têm legenda, então ficam só com a mídia)
const bloco = i => h('article', { class: 'ag-bloco' },
  i.imagem
    ? h('img', { class: 'ag-midia', src: i.imagem, alt: '', loading: 'lazy' })
    : h('div', { class: 'ag-midia ag-midia-vazia', text: 'Sem mídia' }),
  i.legenda && h('p', { class: 'ag-legenda', text: i.legenda }));

export const desenharBlocos = itens => itens.map(bloco);
