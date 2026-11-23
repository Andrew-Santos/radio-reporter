// modules/agendadas/actions.js — busca as postagens agendadas, em ordem de horário
import * as data from './data.js';

export async function carregar() {
  const itens = (await data.listarAgendadas())
    .map(p => ({ id: p.id, legenda: p.legenda, imagem: p.imagem, quando: new Date(p.data_agendamento) }))
    .filter(i => !isNaN(i.quando))
    .sort((a, b) => a.quando - b.quando);
  return { itens };
}
