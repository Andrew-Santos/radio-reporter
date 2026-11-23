// modules/portal/actions.js — organiza a lista do portal e leva a matéria para a tela de card
import * as data from './data.js';
import { ponte } from '../../compartilhado/ponte.js';

export async function carregar() {
  const { horas, noticias = [] } = await data.listarPortal();
  const itens = noticias
    .map(n => ({ titulo: n.titulo, link: n.link, categoria: n.categoria, postada: n.postada === true, quando: new Date(n.publicado_em) }))
    .filter(i => i.titulo && !isNaN(i.quando))
    .sort((a, b) => b.quando - a.quando);
  return { horas, itens };
}

// A tela "Notícia para Instagram" lê o link da ponte ao abrir e já busca a matéria
export function abrirNoCard(link) {
  ponte.link = link;
  location.hash = '#/noticia';
}
