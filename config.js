// painel/config.js — URLs dos workers e identidade da marca
export const URL_API = {
  auth: 'https://radioreporter-auth.andrewmssantos.workers.dev',
  noticia: 'https://radioreporter-noticia.andrewmssantos.workers.dev',
};

export const MARCA = {
  nome: 'Rádio Repórter',
  cor: '#d71920',            // cor de destaque nos cards
  hashtags: '#RadioReporter #NordesteFM #FeiraDeSantana #Bahia #Noticias',
  // dados fixos que entram na legenda do Instagram
  legenda: {
    emoji: '🔴',
    frequencia: '📻 Sintonize: 95,3 Nordeste FM',
    site: '🌐 portalradioreporter.com.br',
    horario: '🕐 Seg a Sex · 17h às 19h',
    apresentacao: 'Apresentação: Renato Ribeiro',
    slogan: 'Jornalismo na velocidade da notícia!',
    perfil: '@programaradioreporterfsa',
    incluirResumo: true,    // coloca a descrição da matéria entre o título e o link
    maxResumo: 450,         // limite de caracteres da descrição (o total nunca passa de 2.200)
  },
  logoPadrao: './assets/logo.svg',  // PNG ou SVG; a logo enviada na tela tem prioridade
};
