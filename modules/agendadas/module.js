// modules/agendadas/module.js — lista as postagens AGENDADAS do banco
import { desenharTela, desenharBlocos } from './ui.js';
import { carregar } from './actions.js';
import { iniciar } from './data.js';
import { h } from '../../compartilhado/dom.js';

export default {
  estilo: new URL('./style.css', import.meta.url).href,

  async montar({ area, Auth }) {
    iniciar(Auth);
    let ativo = true, ocupado = false;

    const atualizar = async () => {
      if (ocupado) return;
      ocupado = true; refs.botao.disabled = true;
      refs.aviso.textContent = 'Carregando…'; refs.aviso.className = 'estado';
      try {
        const { itens } = await carregar();
        if (!ativo) return;
        refs.aviso.textContent = '';
        refs.lista.replaceChildren(...(itens.length
          ? desenharBlocos(itens)
          : [h('div', { class: 'ag-vazio' },
              h('p', { class: 'ag-vazio-titulo', text: 'Nenhuma postagem agendada por enquanto.' }),
              h('p', { class: 'estado', text: 'Quando você enviar um card pela tela “Notícia para Instagram”, ele aparece aqui.' }))]));
      } catch (e) {
        if (!ativo) return;
        refs.lista.replaceChildren();
        refs.aviso.textContent = e.message; refs.aviso.className = 'estado estado-erro';
      } finally { ocupado = false; refs.botao.disabled = false; }
    };

    const { raiz, refs } = desenharTela({ aoAtualizar: atualizar });
    area.append(raiz);
    this.parar = () => { ativo = false; };
    await atualizar();
  },

  desmontar() { this.parar?.(); },
};
