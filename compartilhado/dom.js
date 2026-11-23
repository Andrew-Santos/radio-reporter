// painel/compartilhado/dom.js — cria elementos sem innerHTML (seguro para dado externo)
export const h = (tag, props = {}, ...filhos) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e[k] = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...filhos.flat().filter(f => f != null && f !== false));
  return e;
};
