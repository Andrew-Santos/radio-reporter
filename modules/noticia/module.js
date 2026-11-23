// modules/noticia/module.js — cria cards de notícia (feed e stories) a partir de um link
import { desenharTela } from './ui.js';
import { desenharNoticia } from './cartoes.js';
import { buscar, publicarCards } from './actions.js';
import { iniciar } from './data.js';
import { obterLogo } from '../../compartilhado/logo.js';
import { ponte } from '../../compartilhado/ponte.js';
import { criarCanvas, carregarImagem, aparar, NOTICIA_FEED, NOTICIA_STORY } from '../../compartilhado/cartao.js';

export default {
  estilo: new URL('./style.css', import.meta.url).href,

  async montar({ area, Auth }) {
    iniciar(Auth);
    const canvasFeed = criarCanvas(NOTICIA_FEED), canvasStory = criarCanvas(NOTICIA_STORY);
    const estado = { imagem: null, logo: await obterLogo(true), fonte: '', link: '', ocupado: false };

    const redesenhar = () => {
      const dados = { imagem: estado.imagem, titulo: refs.titulo.value || 'Título da notícia', fonte: estado.fonte, logo: estado.logo };
      desenharNoticia(canvasFeed, NOTICIA_FEED, dados);
      desenharNoticia(canvasStory, NOTICIA_STORY, dados);
    };
    let espera;
    const agendar = () => { clearTimeout(espera); espera = setTimeout(redesenhar, 150); };

    const avisar = (elemento, texto, tipo = '') => {
      elemento.textContent = texto;
      elemento.className = 'estado' + (tipo ? ' estado-' + tipo : '');
    };

    // Deixa a tela pronta para a próxima notícia
    const limpar = () => {
      clearTimeout(espera);
      Object.assign(estado, { imagem: null, fonte: '', link: '' });
      refs.link.value = ''; refs.titulo.value = ''; refs.legenda.value = '';
      refs.resultado.hidden = true;
      refs.progresso.caixa.hidden = true; refs.progresso.barra.style.width = '0%';
      avisar(refs.aviso, ''); avisar(refs.avisoPublicar, '');
      refs.link.focus();
    };

    const { raiz, refs } = desenharTela({
      canvasFeed, canvasStory,
      aoEditar: agendar,

      async aoBuscar(url) {
        if (estado.ocupado) return;
        estado.ocupado = true; refs.botaoBuscar.disabled = true;
        avisar(refs.aviso, 'Buscando a notícia…');
        try {
          const n = await buscar(url);
          estado.fonte = n.fonte; estado.link = n.link;
          estado.imagem = n.imagem ? aparar(await carregarImagem(n.imagem)) : null;
          refs.titulo.value = n.titulo;
          refs.legenda.value = n.legenda;
          refs.resultado.hidden = false;
          avisar(refs.avisoPublicar, '');
          redesenhar();
          if (estado.imagem) avisar(refs.aviso, '');
          else avisar(refs.aviso, 'Não encontrei a imagem dessa matéria; o card foi gerado só com o título.', 'erro');
        } catch (e) { avisar(refs.aviso, e.message, 'erro'); }
        finally { estado.ocupado = false; refs.botaoBuscar.disabled = false; }
      },

      async aoPublicar() {
        if (estado.ocupado) return;
        estado.ocupado = true; refs.botaoPublicar.disabled = true;
        avisar(refs.avisoPublicar, '');
        const P = refs.progresso;
        const mostrar = (pct, texto) => {
          P.caixa.hidden = false;
          P.barra.style.width = pct + '%';
          P.barra.parentElement.setAttribute('aria-valuenow', String(Math.round(pct)));
          P.texto.textContent = texto;
        };
        let pct = 0, andamento = null;
        mostrar(0, 'Preparando os cards…');
        try {
          clearTimeout(espera); redesenhar(); // garante que o PNG enviado é o que está na tela
          const enviar = forcar => publicarCards({
            titulo: refs.titulo.value, legenda: refs.legenda.value, link: estado.link, forcar, canvasFeed, canvasStory,
            aoProgresso(f) {
              // 0–90%: bytes enviados · depois o servidor grava (R2 e tabela) e a barra avança devagar até a resposta
              if (f < 1) { pct = Math.round(f * 90); mostrar(pct, `Enviando… ${Math.round(f * 100)}%`); return; }
              mostrar(Math.max(pct, 90), 'Gravando no servidor…');
              clearInterval(andamento);
              andamento = setInterval(() => { pct = Math.min(98, Math.max(pct, 90) + 1); mostrar(pct, 'Gravando no servidor…'); }, 400);
            },
          });
          let r;
          try { r = await enviar(false); }
          catch (e) {
            // o servidor recusa notícia que já está em postagens.roteiro; só repete se a pessoa confirmar
            if (!e.duplicada || !confirm(`${e.message}\n\nEnviar mesmo assim?`)) throw e;
            clearInterval(andamento);
            pct = 0; mostrar(0, 'Preparando os cards…');
            r = await enviar(true);
          }
          mostrar(100, 'Concluído');
          const hora = r.agendada_para && new Date(r.agendada_para).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bahia' });
          refs.modal.texto.textContent = hora ? `Feed e Stories agendados para as ${hora}.` : 'Os cards foram agendados.';
          refs.modal.caixa.showModal(); // ao fechar (Confirmar, Ver agendadas ou Esc) o formulário é limpo
        } catch (e) {
          P.caixa.hidden = true;
          avisar(refs.avisoPublicar, e.message, 'erro');
        } finally {
          clearInterval(andamento);
          estado.ocupado = false; refs.botaoPublicar.disabled = false;
        }
      },
    });

    refs.modal.caixa.addEventListener('close', limpar);
    area.append(raiz);
    // veio de "Notícias do portal": já preenche o link e busca a matéria
    if (ponte.link) { refs.link.value = ponte.link; ponte.link = ''; refs.botaoBuscar.click(); }
  },

  desmontar() {},
};
