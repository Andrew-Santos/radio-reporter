// modules/noticia/ui.js — desenha a tela (não chama API)
import { h } from '../../compartilhado/dom.js';
import { grupo, blocoCartao } from '../../compartilhado/ui-previa.js';

export function desenharTela({ canvasFeed, canvasStory, aoBuscar, aoEditar, aoPublicar }) {
  const link = h('input', {
    id: 'nt-link', class: 'campo', type: 'url', placeholder: 'https://…', autocomplete: 'off',
    onkeydown: e => { if (e.key === 'Enter') aoBuscar(link.value); },
  });
  const botaoBuscar = h('button', { type: 'button', class: 'btn btn-primario', onclick: () => aoBuscar(link.value) }, 'Buscar notícia');
  const aviso = h('p', { class: 'estado', role: 'status' });

  const titulo = h('input', { id: 'nt-titulo', class: 'campo', type: 'text', maxlength: '300', oninput: aoEditar });
  const legenda = h('textarea', { id: 'nt-legenda', class: 'campo', rows: '14', maxlength: '2200' });
  const botaoPublicar = h('button', { type: 'button', class: 'btn btn-primario', onclick: aoPublicar }, 'Enviar para publicação');
  const avisoPublicar = h('p', { class: 'estado', role: 'status' });
  const barra = h('div', { class: 'nt-barra-cheia' });
  const textoProgresso = h('span', { class: 'nt-progresso-texto' });
  const progresso = h('div', { class: 'nt-progresso', hidden: true },
    h('div', { class: 'nt-barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0', 'aria-label': 'Progresso do envio' }, barra),
    textoProgresso);

  // Modal de confirmação: aparece quando a mídia sobe; ao fechar, o módulo limpa o formulário
  const modalTexto = h('p', { class: 'nt-modal-texto' });
  const botaoConfirmar = h('button', { type: 'button', class: 'btn btn-primario', autofocus: true, onclick: () => modal.close() }, 'Confirmar e limpar');
  const botaoVer = h('button', { type: 'button', class: 'btn btn-sec', onclick: () => { modal.close(); location.hash = '#/agendadas'; } }, 'Ver agendadas');
  const modal = h('dialog', { class: 'nt-modal', 'aria-labelledby': 'nt-modal-titulo' },
    h('h2', { id: 'nt-modal-titulo', text: 'Mídia enviada!' }),
    modalTexto,
    h('div', { class: 'nt-modal-acoes' }, botaoVer, botaoConfirmar));

  const resultado = h('div', { class: 'nt-resultado', hidden: true },
    h('div', { class: 'nt-form' },
      grupo('Título do card', titulo),
      grupo('Legenda do Instagram', legenda, 'Montada no seu padrão (título, link, programa e hashtags). Edite à vontade.'),
      botaoPublicar, progresso, avisoPublicar),
    h('div', { class: 'cartao-previas' },
      blocoCartao('Feed (1440×1920)', canvasFeed, 'noticia-feed.png'),
      blocoCartao('Stories (1440×2560)', canvasStory, 'noticia-stories.png')));

  const raiz = h('div', { class: 'nt-pagina' },
    h('h1', { text: 'Notícia para Instagram' }),
    h('p', { class: 'nt-sub', text: 'Cole o link da matéria para gerar o card de feed, o de stories e a legenda.' }),
    h('div', { class: 'nt-busca' }, grupo('Link da notícia', link), botaoBuscar),
    aviso, resultado, modal);

  return { raiz, refs: { link, botaoBuscar, aviso, resultado, titulo, legenda, botaoPublicar, avisoPublicar, progresso: { caixa: progresso, barra, texto: textoProgresso }, modal: { caixa: modal, texto: modalTexto, confirmar: botaoConfirmar } } };
}
