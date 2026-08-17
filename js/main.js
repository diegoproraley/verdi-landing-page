/* ═══════════════════════════════════════════════════
   VERDI — main.js
   Tudo o que a Verdi precisa ajustar está em CONFIG.
   ═══════════════════════════════════════════════════ */

const CONFIG = {

  /* WhatsApp da Verdi. Formato: país + DDD + número, só dígitos.
     Uma linha só atende pedidos e dúvidas. */
  whatsapp: '5569992999008',
  whatsappAtendimento: '5569992999008',

  /* Como a Verdi atende.
     diasEntrega: 0 = domingo … 6 = sábado. Hoje: segunda a sexta. */
  atendimento: {
    somenteDelivery: true,
    cidade: 'Porto Velho (RO)',
    fusoHorario: -4,           // UTC−4: prazos sempre no relógio da loja
    inicioPedidos: 8,          // pedidos a partir das 08h
    fimPedidos: 16,            // pedidos até as 16h
    diasEntrega: [1, 2, 3, 4, 5],
    janelaEntrega: 'ao longo do dia'   // ajuste se houver faixa de horário fixa
  },

  /* Quantas horas antes do limite a barra começa a descer.
     A janela de um pedido dura um dia, então 24 é o padrão. */
  janelaBarraHoras: 24,

  /* Combos de um toque, montados com ids do cardápio (js/cardapio.js) */
  atalhos: [
    { rotulo: 'Semana da salada', itens: { 'salada-mix': 2, 'salada-colorida': 2, 'mix-3-cores': 1 } },
    { rotulo: 'Café da manhã',    itens: { 'blend-abacaxi-morango': 3, 'blend-mamao-maca-banana': 2 } },
    { rotulo: 'Jantar resolvido', itens: { 'kit-yakisoba': 1, 'kit-forno': 1, 'kit-sopinha': 1 } },
    { rotulo: 'Combo família',    itens: { 'salada-mix': 2, 'kit-arroz-grega': 1, 'mix-tradicional': 1, 'blend-abacaxi-morango': 4 } }
  ]
};

/* Lista plana de todos os itens, para buscar por id sem varrer categorias. */
const ITENS = CARDAPIO.reduce(function (todos, cat) {
  cat.itens.forEach(function (item) {
    if (!item.esgotado) todos[item.id] = Object.assign({ categoria: cat.nome }, item);
  });
  return todos;
}, {});

const fmtReal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── Utilidades de data ─────────────────────────── */
const DIAS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

const fmtData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/**
 * Devolve o "agora" no fuso da Verdi, e não no do aparelho de quem acessa.
 * Sem isso, alguém em outro estado veria um horário-limite errado.
 */
function agoraNaLoja() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + CONFIG.atendimento.fusoHorario * 3600000);
}

/** True quando o aparelho está num fuso diferente do da loja. */
function fusoDiferente() {
  const d = new Date();
  return (-d.getTimezoneOffset() / 60) !== CONFIG.atendimento.fusoHorario;
}

function ehDiaDeEntrega(d) {
  return CONFIG.atendimento.diasEntrega.indexOf(d.getDay()) !== -1;
}

/** Último dia em que dá para pedir antes de uma entrega. */
function diaDePedidoAnterior(entrega) {
  const d = new Date(entrega);
  do { d.setDate(d.getDate() - 1); } while (!ehDiaDeEntrega(d));
  return d;
}

function mesmoDia(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function rotuloLimite(limite) {
  const agora = agoraNaLoja();
  const amanha = new Date(agora);
  amanha.setDate(agora.getDate() + 1);
  const hora = CONFIG.atendimento.fimPedidos + 'h';

  if (mesmoDia(limite, agora)) return 'hoje, ' + hora;
  if (mesmoDia(limite, amanha)) return 'amanhã, ' + hora;
  return DIAS[limite.getDay()] + ', ' + hora;
}

/**
 * Pedido feito dentro da janela do dia sai na entrega do próximo dia de
 * atendimento. Depois do horário, entra no dia seguinte. Domingo não entrega.
 */
function proximasEntregas(qtd = 4) {
  const agora = agoraNaLoja();
  const lista = [];

  for (let i = 0; i <= 21 && lista.length < qtd; i++) {
    const entrega = new Date(agora);
    entrega.setDate(agora.getDate() + i);
    entrega.setHours(12, 0, 0, 0);
    if (!ehDiaDeEntrega(entrega)) continue;

    const limite = diaDePedidoAnterior(entrega);
    limite.setHours(CONFIG.atendimento.fimPedidos, 0, 0, 0);
    if (limite <= agora) continue;

    lista.push({
      entrega: entrega,
      limite: limite,
      rotuloLimite: rotuloLimite(limite),
      janelaEntrega: CONFIG.atendimento.janelaEntrega
    });
  }
  return lista;
}

/** "terça, 18/08" — como a data de entrega aparece na tela e na mensagem. */
function rotuloEntrega(item) {
  return DIAS[item.entrega.getDay()] + ', ' + fmtData.format(item.entrega);
}

function restanteTexto(ms) {
  if (ms <= 0) return 'Janela encerrada';
  const horas = Math.floor(ms / 36e5);
  const min = Math.floor((ms % 36e5) / 6e4);
  if (horas >= 24) {
    const dias = Math.floor(horas / 24);
    return dias + (dias === 1 ? ' dia' : ' dias') + ' e ' + (horas % 24) + 'h para pedir';
  }
  return horas + 'h' + String(min).padStart(2, '0') + ' para pedir';
}

/* ── Lista guardada no navegador ────────────────── */
/*
 * O carrinho sobrevive a um refresh ou a uma volta no mesmo dia. Três cuidados:
 *   1. só entram ids que ainda existem no cardápio e não estão esgotados;
 *   2. a lista expira em 3 dias, para ninguém voltar com um pedido esquecido;
 *   3. preço nunca é guardado — ele é sempre lido do cardápio atual, então o
 *      subtotal reflete a tabela de hoje, não a de quando salvou.
 * Tudo protegido: navegação privada e cota cheia não podem quebrar a página.
 */
const CHAVE_LISTA = 'verdi:lista:v1';
const VALIDADE_LISTA_HORAS = 72;
let listaRestaurada = false;

function salvarLista() {
  try {
    if (!Object.keys(carrinho).length) {
      localStorage.removeItem(CHAVE_LISTA);
      return;
    }
    localStorage.setItem(CHAVE_LISTA, JSON.stringify({
      versao: 1,
      em: Date.now(),
      itens: carrinho
    }));
  } catch (e) {
    /* sem armazenamento disponível: a página segue funcionando normalmente */
  }
}

function esquecerLista() {
  try { localStorage.removeItem(CHAVE_LISTA); } catch (e) {}
}

function carregarLista() {
  let dados;
  try {
    const bruto = localStorage.getItem(CHAVE_LISTA);
    if (!bruto) return;
    dados = JSON.parse(bruto);
  } catch (e) {
    esquecerLista();
    return;
  }

  if (!dados || dados.versao !== 1 || !dados.itens) { esquecerLista(); return; }

  const horas = (Date.now() - Number(dados.em || 0)) / 36e5;
  if (!(horas >= 0) || horas > VALIDADE_LISTA_HORAS) { esquecerLista(); return; }

  Object.keys(dados.itens).forEach(function (id) {
    const qtd = Math.floor(Number(dados.itens[id]));
    if (ITENS[id] && qtd >= 1) {
      carrinho[id] = Math.min(30, qtd);
      listaRestaurada = true;
    }
  });

  if (!listaRestaurada) esquecerLista();
}

/* ── Estado ─────────────────────────────────────── */
const carrinho = {};      // { idProduto: quantidade }
let entregaEscolhida = null;
let entregasDisponiveis = [];

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ── Painel do próximo lote ─────────────────────── */
function pintarLote() {
  entregasDisponiveis = proximasEntregas(4);
  if (!entregasDisponiveis.length) return;

  const prox = entregasDisponiveis[0];
  const agora = agoraNaLoja();
  const restante = prox.limite - agora;
  const janela = CONFIG.janelaBarraHoras * 36e5;
  const fracao = Math.max(0, Math.min(1, restante / janela));
  const urgente = restante < 12 * 36e5;

  $('#lote-data').textContent =
    DIAS[prox.entrega.getDay()].replace(/^./, c => c.toUpperCase()) +
    ', ' + fmtData.format(prox.entrega);

  $('#lote-limite').textContent = prox.rotuloLimite;
  $('#lote-barra').style.width = (fracao * 100).toFixed(1) + '%';
  $('#lote-resta').textContent = restanteTexto(restante);

  $('#lote-barra').parentElement.classList.toggle('urgente', urgente);
  $('#lote-resta').classList.toggle('urgente', urgente);

  // Estado do balcão de pedidos, no topo do quadro
  const painel = $('#quadro-semana');
  if (painel) {
    const h = agora.getHours();
    const abertoHoje = ehDiaDeEntrega(agora) &&
                       h >= CONFIG.atendimento.inicioPedidos &&
                       h < CONFIG.atendimento.fimPedidos;
    painel.textContent = abertoHoje ? 'Pedidos abertos agora' : 'Pedidos fecham às ' + CONFIG.atendimento.fimPedidos + 'h';
    painel.classList.toggle('quadro__aberto', abertoHoje);
  }

  // Quem acessa de outro fuso precisa saber de qual relógio estamos falando
  const aviso = $('#quadro-fuso');
  if (aviso) {
    if (fusoDiferente()) {
      const hh = String(agora.getHours()).padStart(2, '0');
      const mm = String(agora.getMinutes()).padStart(2, '0');
      aviso.hidden = false;
      aviso.textContent = 'Todos os horários são de ' + CONFIG.atendimento.cidade +
        ', UTC−4 — lá são ' + hh + ':' + mm + ' agora.';
    } else {
      aviso.hidden = true;
    }
  }

  // Destaca no quadro a linha do dia em que o pedido cai
  const diaPedido = prox.limite.getDay();
  $$('#quadro-corpo tr').forEach(function (tr) {
    tr.classList.toggle('ativa', Number(tr.dataset.dia) === diaPedido);
  });
}

/* ── Cardápio ───────────────────────────────────── */
/* Uma lista só, contínua: todas as categorias ficam sempre na página. As abas
   viram atalhos de rolagem e se acendem sozinhas conforme a pessoa desce. */

let categoriaAtiva = CARDAPIO[0].id;

function alturaBarra() {
  const cab = $('#cabecalho');
  return cab ? cab.offsetHeight : 90;
}

function montarAbas() {
  const total = $('#cardapio-total');
  if (total) {
    total.textContent = Object.keys(ITENS).length + ' itens em ' + CARDAPIO.length + ' categorias';
  }

  const caixa = $('#cardapio-abas');
  if (!caixa) return;

  caixa.innerHTML = CARDAPIO.map(function (cat, i) {
    const n = cat.itens.filter(x => !x.esgotado).length;
    return `<button class="aba${i === 0 ? ' ativa' : ''}" type="button" role="tab"
              aria-selected="${i === 0}" data-cat="${cat.id}">
              ${cat.nome}<span>${n}</span>
            </button>`;
  }).join('');
}

function marcarAba(id) {
  const caixa = $('#cardapio-abas');
  if (!caixa) return;

  let ativa = null;
  $$('#cardapio-abas .aba').forEach(function (b) {
    const eh = b.dataset.cat === id;
    b.classList.toggle('ativa', eh);
    b.setAttribute('aria-selected', String(eh));
    if (eh) ativa = b;
  });

  // mantém a aba acesa visível na barra, sem rolar a página
  if (ativa) {
    const alvo = Math.max(0, ativa.offsetLeft - (caixa.clientWidth - ativa.offsetWidth) / 2);
    if (typeof caixa.scrollTo === 'function') {
      caixa.scrollTo({ left: alvo, behavior: 'smooth' });
    } else {
      caixa.scrollLeft = alvo;
    }
  }
}

/** Acende a aba da categoria que está passando pelo topo da tela. */
function seguirRolagem() {
  const grupos = $$('.cardapio__grupo');
  if (!grupos.length) return;

  const limite = alturaBarra() + 110;
  let atual = grupos[0].dataset.cat;
  grupos.forEach(function (g) {
    if (g.getBoundingClientRect().top <= limite) atual = g.dataset.cat;
  });

  if (atual !== categoriaAtiva) {
    categoriaAtiva = atual;
    marcarAba(atual);
  }
}

function ligarAbas() {
  const caixa = $('#cardapio-abas');
  if (!caixa) return;

  caixa.addEventListener('click', function (e) {
    const aba = e.target.closest('[data-cat]');
    if (!aba) return;
    categoriaAtiva = aba.dataset.cat;
    marcarAba(categoriaAtiva);
    const grupo = document.getElementById('grupo-' + categoriaAtiva);
    if (grupo && typeof grupo.scrollIntoView === 'function') {
      grupo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function linhaItem(item) {
  const foto = item.foto
    ? `<img class="item__foto" src="${item.foto}" alt="${item.nome}" loading="lazy" width="260" height="260">`
    : `<span class="item__foto item__foto--vazia" aria-hidden="true">
         <svg viewBox="0 0 24 24"><path d="M19 4c0 8.5-4.7 13.5-11 13.5C8 9 12.7 4 19 4Z"/><path d="M6 21c1.4-5 4.2-8.7 8.2-11.4"/></svg>
       </span>`;

  return `
    <article class="item" data-item="${item.id}">
      ${foto}
      <div class="item__txt">
        <h4 class="item__nome">${item.nome}</h4>
        ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}
        <p class="item__preco">${fmtReal.format(item.preco)}</p>
      </div>
      <div class="item__acao" data-acao="${item.id}"></div>
    </article>`;
}

function montarLista() {
  const lista = $('#cardapio-lista');
  if (!lista) return;

  lista.innerHTML = CARDAPIO.map(function (cat) {
    const itens = cat.itens.filter(i => !i.esgotado);
    if (!itens.length) return '';
    return `
      <section class="cardapio__grupo" id="grupo-${cat.id}" data-cat="${cat.id}"
               aria-labelledby="titulo-${cat.id}">
        <header class="grupo__topo">
          <h3 class="grupo__nome" id="titulo-${cat.id}">${cat.nome}</h3>
          <span class="grupo__conta">${itens.length}</span>
          ${cat.resumo ? `<p class="grupo__resumo">${cat.resumo}</p>` : ''}
        </header>
        <div class="grupo__itens">${itens.map(linhaItem).join('')}</div>
      </section>`;
  }).join('');

  Object.keys(ITENS).forEach(pintarAcao);
}

function pintarAcao(id) {
  const alvo = document.querySelector(`[data-acao="${id}"]`);
  if (!alvo) return;

  const qtd = carrinho[id] || 0;
  const cartao = document.querySelector(`[data-item="${id}"]`);

  if (qtd === 0) {
    alvo.innerHTML = `<button class="item__add" type="button" data-add="${id}" aria-label="Adicionar ${ITENS[id].nome}">+</button>`;
  } else {
    alvo.innerHTML = `
      <div class="contador">
        <button class="contador__btn" type="button" data-menos="${id}" aria-label="Tirar um">−</button>
        <span class="contador__valor" aria-live="polite">${qtd}</span>
        <button class="contador__btn" type="button" data-mais="${id}" aria-label="Adicionar mais um">+</button>
      </div>`;
  }

  if (cartao) cartao.classList.toggle('escolhido', qtd > 0);
}

/* ── Carrinho ───────────────────────────────────── */
function alterar(id, delta) {
  const atual = carrinho[id] || 0;
  const novo = Math.max(0, Math.min(30, atual + delta));
  if (novo === 0) delete carrinho[id]; else carrinho[id] = novo;
  listaRestaurada = false;
  pintarAcao(id);
  pintarCarrinho();
}

function zerarTudo() {
  listaRestaurada = false;
  esquecerLista();
  Object.keys(carrinho).forEach(function (id) {
    delete carrinho[id];
    pintarAcao(id);
  });
  pintarCarrinho();
}

function subtotal() {
  return Object.keys(carrinho).reduce(function (t, id) {
    return ITENS[id] ? t + ITENS[id].preco * carrinho[id] : t;
  }, 0);
}

function totalItens() {
  return Object.keys(carrinho).reduce((t, id) => t + carrinho[id], 0);
}

function pintarCarrinho() {
  const lista = $('#carrinho-itens');
  const vazio = $('#carrinho-vazio');
  const ids = Object.keys(carrinho);

  lista.innerHTML = ids.map(function (id) {
    const p = ITENS[id];
    if (!p) return '';
    const q = carrinho[id];
    return `
      <li class="carrinho__item">
        <span class="carrinho__qtd">${q}×</span>
        <p>${p.nome}<span>${fmtReal.format(p.preco)} cada</span></p>
        <strong class="carrinho__valor">${fmtReal.format(p.preco * q)}</strong>
        <button class="carrinho__tira" type="button" data-zerar="${id}" aria-label="Tirar ${p.nome} da lista">×</button>
      </li>`;
  }).join('');

  vazio.hidden = ids.length > 0;
  $('#limpar').hidden = ids.length === 0;

  const soma = $('#carrinho-soma');
  if (soma) {
    soma.hidden = ids.length === 0;
    $('#carrinho-subtotal').textContent = fmtReal.format(subtotal());
  }

  const total = totalItens();
  salvarLista();

  const aviso = $('#carrinho-restaurado');
  if (aviso) aviso.hidden = !(listaRestaurada && total > 0);

  const resumo = $('#resumo-itens');
  if (resumo) {
    resumo.textContent = total
      ? total + (total === 1 ? ' item · ' : ' itens · ') + fmtReal.format(subtotal())
      : 'nenhum item ainda';
  }

  const avancar = $('#ir-entrega');
  if (avancar) {
    avancar.disabled = total === 0;
    avancar.textContent = total
      ? 'Continuar para a entrega (' + total + ')'
      : 'Escolha ao menos um item';
  }

  // esvaziou a lista estando no passo 2? volta para o começo
  if (total === 0 && passoAtual === 2) irParaPasso(1, false);

  const cont = $('#zap-cont');
  cont.textContent = total;
  cont.hidden = total === 0;

  pintarBarra(total);
  pintarPrevia();
}

/**
 * Barra fixa do rodapé no celular: só aparece quando há itens na lista.
 * A classe no <body> reposiciona o botão do atendimento para não sobrepor.
 */
/* ── Barra fixa do celular ──────────────────────── */
/*
 * A barra tem dois estados:
 *   fechar  → leva ao passo 2 (endereço ainda não preenchido)
 *   enviar  → abre o WhatsApp com o pedido pronto
 *
 * O endereço só depende do que está escrito no campo: mexer na lista NÃO o
 * invalida. Quem já informou onde mora não precisa informar de novo por ter
 * acrescentado uma alface. O link do WhatsApp é remontado a cada alteração,
 * então a mensagem sempre reflete a lista atual.
 */
let enderecoOk = false;      // o endereço no campo é utilizável?
let relogioEndereco = null;  // atraso antes de trocar o rótulo

/** Endereço mínimo aceitável: duas palavras e alguma substância. */
function enderecoValido() {
  const campo = $('#cliente-endereco');
  if (!campo) return false;
  const texto = (campo.value || '').trim();
  return texto.length >= 10 && texto.split(/\s+/).length >= 2;
}

/**
 * Agenda a revalidação do endereço. O atraso existe de propósito:
 * a troca de rótulo embaixo do dedo do cliente precisa ser percebida,
 * não acontecer no meio de um toque.
 */
function agendarEndereco(atraso) {
  clearTimeout(relogioEndereco);
  relogioEndereco = setTimeout(function () {
    const valido = enderecoValido();
    if (valido !== enderecoOk) {
      enderecoOk = valido;
      pintarBarra(totalItens(), true);
    }
  }, atraso);
}

function pintarBarra(total, destacar) {
  const barra = $('#barra-pedido');
  const botao = $('#barra-btn');
  if (!barra || !botao) return;

  const tem = total > 0;
  document.body.classList.toggle('com-barra', tem);

  if (!tem) {
    barra.classList.remove('visivel');
    setTimeout(function () {
      if (!document.body.classList.contains('com-barra')) barra.hidden = true;
    }, 350);
    return;
  }

  barra.hidden = false;
  requestAnimationFrame(() => barra.classList.add('visivel'));

  $('#barra-qtd').textContent = total + (total === 1 ? ' item · ' : ' itens · ') + fmtReal.format(subtotal());
  $('#barra-entrega').textContent = entregaEscolhida
    ? 'entrega ' + rotuloEntrega(entregaEscolhida) + ' · taxa a combinar'
    : 'taxa de entrega a combinar';

  const enviar = enderecoOk;
  // em tela estreita o rótulo longo espreme a informação da esquerda
  const estreito = window.matchMedia && window.matchMedia('(max-width:420px)').matches;
  botao.classList.toggle('barra-pedido__btn--enviar', enviar);

  // só o texto é trocado: o ícone é um <svg> irmão e precisa sobreviver
  const rotulo = $('#barra-btn-texto') || botao;
  rotulo.textContent = enviar
    ? (estreito ? 'Enviar no WhatsApp' : 'Enviar pedido no WhatsApp')
    : 'Fechar pedido';

  if (enviar) {
    botao.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(montarMensagem());
    botao.target = '_blank';
    botao.rel = 'noopener';
  } else {
    botao.href = '#encomenda';
    botao.removeAttribute('target');
    botao.removeAttribute('rel');
  }

  if (destacar) {
    botao.classList.remove('trocou');
    void botao.offsetWidth;          // reinicia a animação
    botao.classList.add('trocou');
  }
}


/* ── Depois do envio ────────────────────────────── */
/*
 * Enviado o pedido, a lista é apagada da memória e do navegador: uma lista
 * antiga na próxima visita gera pedido duplicado. O link continua guardado
 * para o caso de a conversa não ter aberto — bloqueador de pop-up, WhatsApp
 * não instalado, aba fechada sem querer.
 */
let pedidoEnviado = false;

function marcarEnviado(link) {
  pedidoEnviado = true;

  const reenviar = $('#reenviar');
  if (reenviar && link) reenviar.href = link;

  esquecerLista();
  listaRestaurada = false;
  Object.keys(carrinho).forEach(function (id) {
    delete carrinho[id];
    pintarAcao(id);
  });
  pintarCarrinho();

  const trilha = $('#trilha');
  if (trilha) trilha.hidden = true;
  const p1 = $('#painel-1');
  const p2 = $('#painel-2');
  const pe = $('#painel-enviado');
  if (p1) p1.hidden = true;
  if (p2) p2.hidden = true;
  if (pe) pe.hidden = false;
}

function novoPedido() {
  pedidoEnviado = false;
  const trilha = $('#trilha');
  if (trilha) trilha.hidden = false;
  const pe = $('#painel-enviado');
  if (pe) pe.hidden = true;
  irParaPasso(1, false);

  const cardapio = $('#produtos');
  if (cardapio && typeof cardapio.scrollIntoView === 'function') {
    cardapio.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ── Os dois passos do pedido ───────────────────── */
let passoAtual = 1;

function irParaPasso(n, rolar) {
  // o passo 2 só faz sentido com algo na lista
  if (n === 2 && totalItens() === 0) {
    const aviso = $('#carrinho-vazio');
    if (aviso) {
      aviso.classList.add('pisca');
      setTimeout(() => aviso.classList.remove('pisca'), 900);
    }
    return;
  }

  passoAtual = n;
  if (pedidoEnviado) {
    pedidoEnviado = false;
    const trilha = $('#trilha');
    if (trilha) trilha.hidden = false;
    const pe = $('#painel-enviado');
    if (pe) pe.hidden = true;
  }
  const p1 = $('#painel-1');
  const p2 = $('#painel-2');
  if (p1) p1.hidden = n !== 1;
  if (p2) p2.hidden = n !== 2;

  $$('.trilha__passo').forEach(function (li) {
    const eu = Number(li.dataset.passo);
    li.classList.toggle('ativo', eu === n);
    li.classList.toggle('feito', eu < n);
  });

  if (n === 2) {
    // endereço já preenchido de antes? o rótulo muda sozinho, com folga
    agendarEndereco(enderecoValido() && !enderecoOk ? 1000 : 0);
  }

  if (rolar) {
    const secao = $('#encomenda');
    if (secao && typeof secao.scrollIntoView === 'function') {
      secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function ligarPassos() {
  /*
   * Ir para o cardápio significa "vou mexer na lista". A barra volta a
   * "Fechar pedido" para que a pessoa passe de novo pela conferência —
   * o texto do endereço continua onde estava, só o estado do botão recua.
   */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('a[href="#produtos"]')) return;
    clearTimeout(relogioEndereco);
    if (enderecoOk) {
      enderecoOk = false;
      pintarBarra(totalItens(), true);
    }
  });

  document.addEventListener('click', function (e) {
    const ir = e.target.closest('[data-ir]');
    if (ir) { irParaPasso(Number(ir.dataset.ir), true); return; }
    if (e.target.closest('#ir-entrega')) irParaPasso(2, true);
  });
}

/* ── Opções de entrega ──────────────────────────── */
function montarEntregas() {
  const caixa = $('#entrega-opcoes');
  if (!caixa || !entregasDisponiveis.length) return;

  caixa.innerHTML = entregasDisponiveis.map(function (item, i) {
    return `
      <label class="entrega-op${i === 0 ? ' marcada' : ''}">
        <input type="radio" name="entrega" value="${i}"${i === 0 ? ' checked' : ''}>
        <strong>${rotuloEntrega(item)}</strong>
        <span>peça até ${item.rotuloLimite}</span>
      </label>`;
  }).join('');

  entregaEscolhida = entregasDisponiveis[0];

  caixa.addEventListener('change', function (e) {
    if (e.target.name !== 'entrega') return;
    entregaEscolhida = entregasDisponiveis[Number(e.target.value)];
    const totalItens = Object.keys(carrinho).reduce((t, id) => t + carrinho[id], 0);
    pintarBarra(totalItens);
    $$('.entrega-op').forEach(function (l) {
      l.classList.toggle('marcada', l.contains(e.target));
    });
    pintarPrevia();
  });
}

/* ── Mensagem do WhatsApp ───────────────────────── */
function montarMensagem() {
  const ids = Object.keys(carrinho);
  const nome = ($('#cliente-nome').value || '').trim();
  const endereco = ($('#cliente-endereco').value || '').trim();
  const obs = ($('#cliente-obs').value || '').trim();

  const linhas = ['Olá, Verdi! Quero fazer uma encomenda.', ''];

  if (ids.length) {
    linhas.push('*Pedido*');
    ids.forEach(function (id) {
      const p = ITENS[id];
      if (!p) return;
      const q = carrinho[id];
      linhas.push(`• ${q}× ${p.nome} — ${fmtReal.format(p.preco * q)}`);
    });
    linhas.push('', `*Subtotal:* ${fmtReal.format(subtotal())}`);
  } else {
    linhas.push('Ainda estou montando a lista — pode me ajudar a escolher?');
  }

  linhas.push('');
  if (entregaEscolhida) {
    linhas.push(`*Entrega:* ${rotuloEntrega(entregaEscolhida)}`);
  }
  if (nome) linhas.push(`*Nome:* ${nome}`);
  linhas.push(endereco ? `*Endereço:* ${endereco}` : `*Endereço:* (vou passar na conversa — ${CONFIG.atendimento.cidade})`);
  linhas.push('*Taxa de entrega:* a combinar');
  if (obs) linhas.push(`*Observações:* ${obs}`);

  linhas.push('', 'Pode confirmar o total com a taxa de entrega e a forma de pagamento?');
  return linhas.join('\n');
}

function pintarPrevia() {
  const texto = montarMensagem();
  const previa = $('#previa-texto');
  if (previa) previa.textContent = texto;

  const link = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(texto);
  const botao = $('#botao-zap');
  if (botao) botao.href = link;

}

/* ── Atalhos ────────────────────────────────────── */
function montarAtalhos() {
  const caixa = $('#atalhos');
  if (!caixa) return;

  caixa.innerHTML = CONFIG.atalhos.map(function (a, i) {
    return `<button class="atalho" type="button" data-atalho="${i}">+ ${a.rotulo}</button>`;
  }).join('');

  caixa.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-atalho]');
    if (!btn) return;
    const combo = CONFIG.atalhos[Number(btn.dataset.atalho)];
    Object.keys(combo.itens).forEach(function (id) {
      carrinho[id] = Math.min(30, (carrinho[id] || 0) + combo.itens[id]);
      pintarAcao(id);
    });
    pintarCarrinho();
  });
}

/* ── Interface geral ────────────────────────────── */
function ligarInterface() {
  // Cliques em produtos e carrinho (delegação)
  document.addEventListener('click', function (e) {
    const add = e.target.closest('[data-add]');
    const mais = e.target.closest('[data-mais]');
    const menos = e.target.closest('[data-menos]');
    const zerar = e.target.closest('[data-zerar]');

    if (add) alterar(add.dataset.add, 1);
    if (mais) alterar(mais.dataset.mais, 1);
    if (menos) alterar(menos.dataset.menos, -1);
    if (zerar) {
      const id = zerar.dataset.zerar;
      delete carrinho[id];
      pintarAcao(id);
      pintarCarrinho();
    }
  });

  $('#limpar').addEventListener('click', zerarTudo);

  const enviar = $('#botao-zap');
  if (enviar) {
    enviar.addEventListener('click', function () { marcarEnviado(enviar.href); });
  }

  const btnNovo = $('#novo-pedido');
  if (btnNovo) btnNovo.addEventListener('click', novoPedido);

  const btnBarra = $('#barra-btn');
  if (btnBarra) {
    btnBarra.addEventListener('click', function (e) {
      if (btnBarra.classList.contains('barra-pedido__btn--enviar')) {
        marcarEnviado(btnBarra.href);      // segue para o WhatsApp e limpa a lista
        return;
      }
      e.preventDefault();
      const jaEstava = passoAtual === 2;
      irParaPasso(2, true);
      // já estava no passo 2 e ainda falta endereço: leva o cursor até ele
      if (jaEstava && !enderecoValido()) {
        const campo = $('#cliente-endereco');
        if (campo) campo.focus();
      }
    });
  }
  ['#cliente-nome', '#cliente-endereco', '#cliente-obs'].forEach(function (sel) {
    const campo = $(sel);
    if (campo) campo.addEventListener('input', pintarPrevia);
  });

  const endereco = $('#cliente-endereco');
  if (endereco) {
    endereco.addEventListener('input', function () { agendarEndereco(700); });
    endereco.addEventListener('blur', function () { agendarEndereco(0); });
  }

  // Menu móvel
  const btn = $('#menu-btn');
  const nav = $('#nav');
  btn.addEventListener('click', function () {
    const aberto = nav.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', String(aberto));
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('aberto');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Cabeçalho e atalho flutuante
  const cabecalho = $('#cabecalho');
  const flutuante = $('#flutuante');
  let ticking = false;

  function aoRolar() {
    const y = window.scrollY;
    cabecalho.classList.toggle('encolhido', y > 40);
    if (flutuante) flutuante.classList.toggle('visivel', y > 700);
    seguirRolagem();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(aoRolar); ticking = true; }
  }, { passive: true });
  aoRolar();

  // Revelação em rolagem
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visivel');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    $$('.revelar').forEach(el => obs.observe(el));
  } else {
    $$('.revelar').forEach(el => el.classList.add('visivel'));
  }

  // O WhatsApp do rodapé é suporte, não pedido: mensagem própria, definida uma vez.
  const ajuda = $('#rodape-zap');
  if (ajuda) {
    ajuda.href = 'https://wa.me/' + CONFIG.whatsappAtendimento + '?text=' +
      encodeURIComponent('Olá, Verdi! Vim pelo site e preciso de ajuda.');
  }

  $('#ano').textContent = new Date().getFullYear();
}


/* ── Partida ────────────────────────────────────── */
/* once: a partida roda uma vez só — registrar ouvintes em dobro faria
   cada clique disparar duas vezes. */
document.addEventListener('DOMContentLoaded', function () {
  pintarLote();
  carregarLista();
  montarAbas();
  ligarAbas();
  ligarPassos();
  montarLista();
  montarEntregas();
  montarAtalhos();
  ligarInterface();
  pintarCarrinho();

  // Atualiza a contagem do próximo lote a cada minuto
  setInterval(pintarLote, 60000);
}, { once: true });
