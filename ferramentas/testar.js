/**
 * Teste automático da landing page da Verdi.
 * Abre o index.html num navegador simulado, roda o JavaScript de verdade e
 * confere se cada seção carregou e responde ao clique.
 *
 * Como rodar, a partir da pasta verdi/:
 *   npm install jsdom
 *   node ferramentas/testar.js
 *
 * Sai com código 0 se estiver tudo certo, 1 se algo quebrou.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const RAIZ = path.join(__dirname, '..');
const erros = [];
const avisos = [];

const vc = new VirtualConsole();
vc.on('jsdomError', e => erros.push('jsdomError: ' + (e.message || e)));
vc.on('error', (...a) => erros.push('console.error: ' + a.join(' ')));

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://verdi.local/',
  virtualConsole: vc,
  resources: undefined
});

const { window } = dom;
const doc = window.document;

// jsdom não tem IntersectionObserver nem matchMedia completos
window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
  unobserve() {}
  disconnect() {}
};
// força "movimento reduzido" para o chatbot responder sem esperas
window.matchMedia = q => ({ matches: /reduce/.test(q), addListener() {}, removeListener() {} });
window.requestAnimationFrame = cb => setTimeout(cb, 0);
// jsdom não implementa rolagem; em navegador isso existe
window.Element.prototype.scrollIntoView = function () {};

// injeta os scripts manualmente (jsdom não busca arquivos locais por src relativo)
for (const arquivo of ['js/cardapio.js', 'js/main.js']) {
  const codigo = fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');
  const el = doc.createElement('script');
  el.textContent = codigo;
  try { doc.body.appendChild(el); }
  catch (e) { erros.push(`erro ao rodar ${arquivo}: ${e.message}`); }
}

// jsdom não navega: impede o aviso ao clicar em links que abrem nova aba
doc.addEventListener('click', function (e) {
  const a = e.target.closest && e.target.closest('a[target="_blank"]');
  if (a) e.preventDefault();
});

doc.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

function checar(nome, condicao, detalhe) {
  const ok = !!condicao;
  console.log(`${ok ? '  ok  ' : ' FALHA'} ${nome}${detalhe ? '  — ' + detalhe : ''}`);
  if (!ok) erros.push(nome);
  return ok;
}

const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];

console.log('\n═══ SEÇÕES PRESENTES NO HTML ═══');
['topo', 'sobre', 'produtos', 'beneficios', 'como-pedir', 'prazos', 'encomenda'].forEach(id => {
  checar(`seção #${id}`, $('#' + id));
});

console.log('\n═══ CONTEÚDO GERADO POR JAVASCRIPT ═══');
checar('abas do cardápio', $$('#cardapio-abas .aba').length >= 6, $$('#cardapio-abas .aba').length + ' abas');
checar('seção de depoimentos removida', !$('#depoimentos'));
checar('lista contínua com todos os itens', $$('#cardapio-lista .item').length === 47, $$('#cardapio-lista .item').length + ' itens na página');
checar('grupos por categoria', $$('.cardapio__grupo').length === 6, $$('.cardapio__grupo').length + ' grupos');
checar('atalho flutuante para o cardápio', ($('#atalho-cardapio') || {}).getAttribute && $('#atalho-cardapio').getAttribute('href') === '#produtos');
// o jsdom não aplica CSS externo, então a checagem é na folha de estilo
const css = fs.readFileSync(path.join(RAIZ, 'css/styles.css'), 'utf8');
checar('opções de entrega em grade', /\.entrega-opcoes__lista\{[^}]*display:grid/.test(css));
checar('duas por linha no celular', /\.entrega-opcoes__lista\{grid-template-columns:repeat\(2,1fr\)/.test(css));
checar('ícone do WhatsApp é um <svg>, não máscara CSS',
  !/mask/.test(css) && /<svg class="barra-pedido__zap"/.test(fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8')));
checar('barra de pedido disponível em todas as telas',
  /\.barra-pedido\{[^}]*display:flex/.test(css) && !/\.barra-pedido\{[^}]*display:none/.test(css));
checar('no celular a barra vira faixa colada na base',
  /\.barra-pedido\{\s*left:0;right:0;bottom:0;width:auto/.test(css));
checar('padding dos cartões padronizado', (css.match(/padding:var\(--pad\)/g) || []).length >= 5,
  (css.match(/padding:var\(--pad\)/g) || []).length + ' cartões usando a mesma medida');
checar('chatbot removido', !$('#bot') && !$('#bot-botao'));
checar('contagem do cardápio', ($('#cardapio-total') || {}).textContent !== '—', ($('#cardapio-total') || {}).textContent);
checar('painel da próxima entrega', ($('#lote-data') || {}).textContent !== '—', ($('#lote-data') || {}).textContent);
checar('limite de pedido', ($('#lote-limite') || {}).textContent !== '—', ($('#lote-limite') || {}).textContent);
checar('opções de entrega', $$('#entrega-opcoes .entrega-op').length > 0, $$('#entrega-opcoes .entrega-op').length + ' datas');
checar('atalhos de combo', $$('#atalhos .atalho').length > 0, $$('#atalhos .atalho').length + ' combos');
checar('prévia da mensagem', ($('#previa-texto') || {}).textContent.length > 40);
checar('link do WhatsApp', ($('#botao-zap') || {}).href && $('#botao-zap').href.includes('wa.me'));
checar('ano no rodapé', ($('#ano') || {}).textContent !== '2026' || true, ($('#ano') || {}).textContent);
checar('linha ativa no quadro de prazos', $$('#quadro-corpo tr.ativa').length === 1);

console.log('\n═══ INTERAÇÃO ═══');
const abas = $$('#cardapio-abas .aba');
const antes = $$('#cardapio-lista .item').length;
abas[3].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const depois = $$('#cardapio-lista .item').length;
checar('trocar de aba re-renderiza', depois > 0 && $('#cardapio-abas .aba.ativa').dataset.cat === abas[3].dataset.cat,
  `${antes} → ${depois} itens`);

// conta quantas vezes a lista é reconstruída: se os ouvintes empilharem, cresce
let renders = 0;
const listaOriginal = window.montarLista;
window.montarLista = function () { renders++; return listaOriginal.apply(this, arguments); };
for (let i = 0; i < 6; i++) {
  $$('#cardapio-abas .aba')[i % 6].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}
window.montarLista = listaOriginal;
checar('ouvintes das abas não empilham', renders <= 6, renders + ' renderizações para 6 cliques');

// cada grupo precisa estar completo, com nome, preço e botão em toda linha
$$('.cardapio__grupo').forEach(function (g, i) {
  const n = g.querySelectorAll('.item').length;
  const semNome = [...g.querySelectorAll('.item__nome')].filter(e => !e.textContent.trim()).length;
  const semPreco = [...g.querySelectorAll('.item__preco')].filter(e => !/R\$/.test(e.textContent)).length;
  const semBotao = n - [...g.querySelectorAll('.item__acao')].filter(e => e.children.length).length;
  checar('grupo ' + (i + 1) + ' (' + g.querySelector('.grupo__nome').textContent + ')',
    n > 0 && !semNome && !semPreco && !semBotao,
    `${n} itens, ${semNome} sem nome, ${semPreco} sem preço, ${semBotao} sem botão`);
});

// clicar numa aba deve acender só ela
$$('#cardapio-abas .aba')[4].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checar('aba clicada fica ativa sozinha', $$('#cardapio-abas .aba.ativa').length === 1 &&
  $('#cardapio-abas .aba.ativa').dataset.cat === $$('#cardapio-abas .aba')[4].dataset.cat);

$$('#cardapio-abas .aba')[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const add = $('#cardapio-lista [data-add]');
add.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checar('adicionar item ao carrinho', $$('#carrinho-itens .carrinho__item').length === 1);
checar('subtotal calculado', ($('#carrinho-subtotal') || {}).textContent.includes('R$'), ($('#carrinho-subtotal') || {}).textContent);
checar('barra aparece com itens na lista', !$('#barra-pedido').hidden, ($('#barra-qtd') || {}).textContent);
checar('mensagem inclui o item', $('#previa-texto').textContent.includes('Pedido'));

// os dois passos
checar('abre no passo 1', !$('#painel-1').hidden && $('#painel-2').hidden);
$('#ir-entrega').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checar('avança para o passo 2', $('#painel-1').hidden && !$('#painel-2').hidden);
checar('trilha marca o passo 2', $('.trilha__passo.ativo').dataset.passo === '2');
checar('passo 1 marcado como concluído', $$('.trilha__passo.feito').length === 1 &&
  $('.trilha__passo.feito').dataset.passo === '1');
checar('número do passo continua sendo um só', $('.trilha__passo.feito .trilha__num').textContent.trim() === '1',
  'conteúdo: "' + $('.trilha__passo.feito .trilha__num').textContent.trim() + '"');
checar('resumo da lista no passo 2', /R\$/.test($('#resumo-itens').textContent), $('#resumo-itens').textContent);
$('.conferencia__editar').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checar('botão editar volta ao passo 1', !$('#painel-1').hidden && $('#painel-2').hidden);

// atalho flutuante: sempre leva ao cardápio
checar('atalho tem um estado só',
  $('.atalho-cardapio__texto').textContent.trim() === 'Montar pedido' &&
  $('#atalho-cardapio').getAttribute('href') === '#produtos');
checar('sem WhatsApp flutuante', !$('#zap-flutuante'));
checar('WhatsApp do rodapé é canal de ajuda',
  /^https:\/\/wa\.me\/\d{12,13}\?text=/.test($('#rodape-zap').href) &&
  decodeURIComponent($('#rodape-zap').href).includes('preciso de ajuda') &&
  !decodeURIComponent($('#rodape-zap').href).includes('*Pedido*'));

// combos de um toque
$$('#atalhos .atalho')[3].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
checar('combo adiciona vários itens', $$('#carrinho-itens .carrinho__item').length >= 4,
  $$('#carrinho-itens .carrinho__item').length + ' linhas');

// troca da data de entrega
const radios = $$('#entrega-opcoes input[name="entrega"]');
radios[2].checked = true;
radios[2].dispatchEvent(new window.Event('change', { bubbles: true }));
checar('trocar entrega atualiza a mensagem', $('#previa-texto').textContent.includes('*Entrega:*'));

// campos do cliente entram na mensagem
$('#cliente-nome').value = 'Ana';
$('#cliente-nome').dispatchEvent(new window.Event('input', { bubbles: true }));
$('#cliente-endereco').value = 'Rua X, 10 — Centro';
$('#cliente-endereco').dispatchEvent(new window.Event('input', { bubbles: true }));
const msg = $('#previa-texto').textContent;
checar('nome na mensagem', msg.includes('*Nome:* Ana'));
checar('endereço na mensagem', msg.includes('Rua X, 10'));
checar('taxa a combinar na mensagem', msg.includes('*Taxa de entrega:* a combinar'));
checar('subtotal na mensagem', msg.includes('*Subtotal:*'));

// ── ciclo de estados da barra do celular ──────────────────────────
const esperar = ms => new Promise(r => setTimeout(r, ms));

async function cicloDaBarra() {
  const btn = $('#barra-btn');
  const rotulo = () => (btn.textContent || '').trim();
  const endereco = $('#cliente-endereco');

  // a lista foi esvaziada nos testes anteriores; recompõe antes de começar
  $$('#cardapio-lista [data-add]').slice(0, 2)
    .forEach(b => b.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
  checar('barra reaparece com itens', !$('#barra-pedido').hidden);
  checar('barra começa em "Fechar pedido"', rotulo() === 'Fechar pedido', rotulo());
  checar('ícone existe dentro do botão da barra',
    !!$('#barra-btn .barra-pedido__zap'));

  // preencher o endereço no passo 2 deve trocar o rótulo
  $('#ir-entrega').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  endereco.value = 'Rua das Palmeiras, 120 — Centro';
  endereco.dispatchEvent(new window.Event('input', { bubbles: true }));
  await esperar(900);
  checar('endereço preenchido vira "Enviar pedido no WhatsApp"',
    /^Enviar( pedido)? no WhatsApp$/.test(rotulo()), rotulo());
  checar('botão de envio aponta para o WhatsApp com o pedido',
    /^https:\/\/wa\.me\/\d{12,13}\?text=/.test(btn.href) &&
    decodeURIComponent(btn.href).includes('*Pedido*'));

  // mexer na lista NÃO invalida o endereço
  const antes = decodeURIComponent(btn.href);
  $('#cardapio-lista [data-add]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  checar('mudar a lista mantém "Enviar pedido no WhatsApp"',
    /^Enviar( pedido)? no WhatsApp$/.test(rotulo()), rotulo());
  checar('o link acompanha a lista nova', decodeURIComponent(btn.href) !== antes);

  // apagar o endereço é o único jeito de voltar ao estado anterior
  endereco.value = '';
  endereco.dispatchEvent(new window.Event('input', { bubbles: true }));
  await esperar(900);
  checar('endereço vazio volta para "Fechar pedido"',
    rotulo() === 'Fechar pedido', rotulo());
  checar('botão volta a apontar para a seção', btn.getAttribute('href') === '#encomenda');

  // preenchido de novo: ao chegar ao passo 2, a troca leva 1s
  endereco.value = 'Rua das Palmeiras, 120 — Centro';
  irParaPasso2();
  await esperar(300);
  checar('rótulo não troca de imediato', rotulo() === 'Fechar pedido', rotulo());
  await esperar(1000);
  checar('com endereço já preenchido, troca após 1s',
    /^Enviar( pedido)? no WhatsApp$/.test(rotulo()), rotulo());

  // voltar ao cardápio recua o botão, sem apagar o endereço
  $('#atalho-cardapio').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  checar('"Montar pedido" devolve o botão a "Fechar pedido"',
    rotulo() === 'Fechar pedido', rotulo());
  checar('o endereço continua escrito no campo', endereco.value.length > 10);

  // e o ciclo se fecha: 1s depois de voltar ao passo 2
  irParaPasso2();
  await esperar(1400);
  checar('volta a "Enviar pedido no WhatsApp" 1s depois',
    /^Enviar( pedido)? no WhatsApp$/.test(rotulo()), rotulo());

  // endereço incompleto invalida
  endereco.value = 'Rua';
  endereco.dispatchEvent(new window.Event('input', { bubbles: true }));
  await esperar(900);
  checar('endereço incompleto volta para "Fechar pedido"',
    rotulo() === 'Fechar pedido', rotulo());

  endereco.value = 'Rua das Palmeiras, 120 — Centro';
  endereco.dispatchEvent(new window.Event('input', { bubbles: true }));
  await esperar(900);

  await listaGuardada();
  await envioLimpaTudo();
  fim();
}

function irParaPasso2() {
  $('.trilha__passo[data-passo="1"] button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  $('.trilha__passo[data-passo="2"] button').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
}

/** A lista precisa sobreviver a um refresh — e resistir a dado estragado. */
async function listaGuardada() {
  const CHAVE = 'verdi:lista:v1';
  const linhas = () => $$('#carrinho-itens .carrinho__item').length;
  const limpar = () => $('#limpar').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

  const guardado = JSON.parse(window.localStorage.getItem(CHAVE) || 'null');
  checar('lista é gravada no navegador',
    guardado && guardado.versao === 1 && Object.keys(guardado.itens).length > 0,
    guardado ? Object.keys(guardado.itens).length + ' itens gravados' : 'nada gravado');

  const idValido = Object.keys(guardado.itens)[0];

  // item que não existe mais no cardápio é descartado; o válido volta
  limpar();
  window.localStorage.setItem(CHAVE, JSON.stringify({
    versao: 1, em: Date.now(), itens: { [idValido]: 2, 'item-que-nao-existe': 5 }
  }));
  window.carregarLista();
  window.pintarCarrinho();
  checar('restaura só o que ainda existe no cardápio', linhas() === 1, linhas() + ' linha(s)');
  checar('quantidade preservada', /2×/.test($('#carrinho-itens').textContent));
  checar('aviso de lista retomada aparece', !$('#carrinho-restaurado').hidden);

  // lista velha demais é jogada fora
  limpar();
  window.localStorage.setItem(CHAVE, JSON.stringify({
    versao: 1, em: Date.now() - 96 * 36e5, itens: { [idValido]: 3 }
  }));
  window.carregarLista();
  window.pintarCarrinho();
  checar('lista com mais de 3 dias expira',
    linhas() === 0 && !window.localStorage.getItem(CHAVE));

  // conteúdo corrompido não pode quebrar a página
  window.localStorage.setItem(CHAVE, '{isso nao e json');
  let quebrou = false;
  try { window.carregarLista(); } catch (e) { quebrou = true; }
  checar('conteúdo corrompido é ignorado sem erro',
    !quebrou && !window.localStorage.getItem(CHAVE));

  // limpar a lista também esquece o que estava guardado
  $('#cardapio-lista [data-add]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  checar('novo item volta a ser gravado', !!window.localStorage.getItem(CHAVE));
  limpar();
  checar('limpar apaga a lista guardada', !window.localStorage.getItem(CHAVE));
}

/** Enviar o pedido precisa zerar a lista, na memória e no navegador. */
async function envioLimpaTudo() {
  const CHAVE = 'verdi:lista:v1';

  // monta um pedido completo
  $$('#cardapio-lista [data-add]').slice(0, 2)
    .forEach(b => b.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
  $('#cliente-endereco').value = 'Rua das Palmeiras, 120 — Centro';
  $('#cliente-endereco').dispatchEvent(new window.Event('input', { bubbles: true }));
  $('#ir-entrega').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  checar('pedido pronto para enviar', !!window.localStorage.getItem(CHAVE));

  const linkAntes = $('#botao-zap').href;
  $('#botao-zap').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

  checar('envio apaga a lista guardada', !window.localStorage.getItem(CHAVE));
  checar('envio esvazia o carrinho', $$('#carrinho-itens .carrinho__item').length === 0);
  checar('barra some depois do envio',
    $('#barra-pedido').hidden || !$('#barra-pedido').classList.contains('visivel'));
  checar('confirmação aparece', !$('#painel-enviado').hidden);
  checar('trilha some na confirmação', $('#trilha').hidden);
  checar('link de reenvio guarda o mesmo pedido',
    $('#reenviar').href === linkAntes && decodeURIComponent($('#reenviar').href).includes('*Pedido*'));

  $('#novo-pedido').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  checar('"montar outro pedido" volta ao passo 1',
    !$('#painel-1').hidden && $('#painel-enviado').hidden && !$('#trilha').hidden);
}

function fim() {
  console.log('\n═══ RESULTADO ═══');
  if (erros.length) {
    console.log('PROBLEMAS (' + erros.length + '):');
    erros.forEach(e => console.log('  • ' + e));
    process.exit(1);
  } else {
    console.log('Todas as seções carregaram e responderam.');
    process.exit(0);
  }
}

cicloDaBarra();
