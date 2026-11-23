// painel/menu.js — itens do menu, rotas por hash (#/id) e carregamento dos módulos
import { h } from './compartilhado/dom.js';

const icone = corpo => {
  const s = h('span', { class: 'menu-icone', 'aria-hidden': 'true' });
  s.innerHTML = `<svg viewBox="0 0 24 24">${corpo}</svg>`; // marcação fixa, sem dado externo
  return s;
};

export const MENU = [
  {
    id: 'agendadas', rotulo: 'Postagens agendadas',
    icone: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    carregar: () => import('./modules/agendadas/module.js'),
  },
  {
    id: 'portal', rotulo: 'Notícias do portal',
    icone: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    carregar: () => import('./modules/portal/module.js'),
  },
  {
    id: 'noticia', rotulo: 'Notícia para Instagram',
    icone: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    carregar: () => import('./modules/noticia/module.js'),
  },
  {
    id: 'entrevistados', rotulo: 'Entrevistados do dia',
    icone: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    carregar: () => import('./modules/entrevistados/module.js'),
  },
];

export function iniciarMenu({ Auth, area, nav }) {
  let atual = null, css = null, seq = 0;

  const links = MENU.map(item => h('a', { href: '#/' + item.id, class: 'menu-item', title: item.rotulo, 'data-id': item.id },
    icone(item.icone), h('span', { class: 'menu-rotulo', text: item.rotulo })));
  nav.replaceChildren(...links);

  const idDoHash = () => location.hash.replace(/^#\/?/, '');

  function fechar() {
    try { atual?.desmontar?.(); } catch (e) { console.error(e); }
    atual = null;
    css?.remove();
    css = null;
  }

  async function abrir() {
    const item = MENU.find(m => m.id === idDoHash()) || MENU[0];
    const minha = ++seq; // ignora o resultado se a pessoa já trocou de tela
    links.forEach(a => (a.dataset.id === item.id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    fechar();
    area.replaceChildren(h('p', { class: 'estado', text: 'Carregando…' }));
    try {
      const modulo = (await item.carregar()).default;
      if (minha !== seq) return;
      if (modulo.estilo) {
        css = h('link', { rel: 'stylesheet', href: modulo.estilo });
        document.head.append(css);
      }
      area.replaceChildren();
      atual = modulo;
      await modulo.montar({ Auth, area });
    } catch (e) {
      console.error(e);
      if (minha !== seq) return;
      area.replaceChildren(h('p', { class: 'estado estado-erro', text: 'Não foi possível abrir esta tela. Recarregue a página e tente de novo.' }));
    }
  }

  window.addEventListener('hashchange', abrir);
  abrir();
}
