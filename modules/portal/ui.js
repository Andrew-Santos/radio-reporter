// modules/portal/ui.js — desenha a lista de matérias do portal (não chama API)
import { h } from '../../compartilhado/dom.js';

export function desenharTela({ aoAtualizar, aoFiltrar }) {
  const botao = h('button', { type: 'button', class: 'btn btn-sec', onclick: aoAtualizar }, 'Atualizar');
  const filtro = h('input', { id: 'pt-filtro', type: 'checkbox', onchange: aoFiltrar });
  const aviso = h('p', { class: 'estado', role: 'status' });
  const resumo = h('p', { class: 'estado' });
  const lista = h('div', { class: 'pt-lista' });
  const raiz = h('div', { class: 'pt-pagina' },
    h('div', { class: 'pt-topo' }, h('h1', { text: 'Notícias do portal' }), botao),
    h('p', { class: 'pt-sub', text: 'Matérias publicadas no portal nas últimas horas. As que já viraram postagem ficam marcadas, para não repetir.' }),
    h('label', { class: 'pt-filtro', for: 'pt-filtro' }, filtro, 'Mostrar só as que faltam postar'),
    aviso, resumo, lista);
  return { raiz, refs: { botao, filtro, aviso, resumo, lista } };
}

const hora = d => d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia' });

const linha = (i, aoGerar) => h('article', { class: 'pt-linha' + (i.postada ? ' pt-postada' : '') },
  h('div', { class: 'pt-info' },
    h('p', { class: 'pt-titulo', text: i.titulo }),
    h('p', { class: 'pt-meta', text: [hora(i.quando), i.categoria].filter(Boolean).join(' · ') })),
  h('div', { class: 'pt-acoes' },
    /^https?:\/\//i.test(i.link) && h('a', { class: 'pt-abrir', href: i.link, target: '_blank', rel: 'noopener noreferrer', text: 'Abrir matéria' }),
    i.postada
      ? h('span', { class: 'pt-selo', text: 'Já postada' })
      : h('button', { type: 'button', class: 'btn btn-primario', onclick: () => aoGerar(i) }, 'Gerar card')));

export const desenharLinhas = (itens, aoGerar) => itens.map(i => linha(i, aoGerar));
