// modules/portal/module.js — lista as matérias do portal das últimas horas e marca as já postadas
import { desenharTela, desenharLinhas } from './ui.js';
import { carregar, abrirNoCard } from './actions.js';
import { iniciar } from './data.js';
import { h } from '../../compartilhado/dom.js';

export default {
  estilo: new URL('./style.css', import.meta.url).href,

  async montar({ area, Auth }) {
    iniciar(Auth);
    let ativo = true, ocupado = false, horas = 24, itens = [];

    const desenharLista = () => {
      const faltam = itens.filter(i => !i.postada).length;
      const visiveis = refs.filtro.checked ? itens.filter(i => !i.postada) : itens;
      refs.resumo.textContent = itens.length ? `${faltam} para postar · ${itens.length - faltam} já postada(s)` : '';
      refs.lista.replaceChildren(...(visiveis.length
        ? desenharLinhas(visiveis, i => abrirNoCard(i.link))
        : [h('div', { class: 'pt-vazio' },
            h('p', { class: 'pt-vazio-titulo', text: itens.length ? 'Todas as matérias já foram postadas.' : `Nenhuma matéria publicada nas últimas ${horas} horas.` }))]));
    };

    const atualizar = async () => {
      if (ocupado) return;
      ocupado = true; refs.botao.disabled = true;
      refs.aviso.textContent = 'Buscando as matérias do portal…'; refs.aviso.className = 'estado';
      try {
        const r = await carregar();
        if (!ativo) return;
        ({ horas, itens } = r);
        refs.aviso.textContent = '';
        desenharLista();
      } catch (e) {
        if (!ativo) return;
        itens = []; refs.resumo.textContent = ''; refs.lista.replaceChildren();
        refs.aviso.textContent = e.message; refs.aviso.className = 'estado estado-erro';
      } finally { ocupado = false; refs.botao.disabled = false; }
    };

    const { raiz, refs } = desenharTela({ aoAtualizar: atualizar, aoFiltrar: desenharLista });
    area.append(raiz);
    this.parar = () => { ativo = false; };
    await atualizar();
  },

  desmontar() { this.parar?.(); },
};
