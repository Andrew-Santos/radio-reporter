// modules/entrevistados/module.js — tela "Entrevistados do dia" (em desenvolvimento)
import { h } from '../../compartilhado/dom.js';

export default {
  estilo: new URL('./style.css', import.meta.url).href,

  montar({ area }) {
    area.append(
      h('div', { class: 'en-pagina' },
        h('h1', { text: 'Entrevistados do dia' }),
        h('div', { class: 'en-vazio' },
          h('p', { class: 'en-vazio-titulo', text: 'Esta tela ainda está em desenvolvimento.' }),
          h('p', { class: 'estado', text: 'Em breve você poderá criar o card do entrevistado por aqui.' }))));
  },

  desmontar() {},
};
