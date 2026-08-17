# Arquitetura atual

Como a landing page está construída, por que cada decisão foi tomada, e o que
dessas decisões sobrevive numa versão SaaS.

---

## 1. Retrato em uma linha

Site estático de **uma página**, sem framework, sem build, sem servidor e sem
dependências em produção. Todo o comportamento é JavaScript puro rodando no
navegador.

| Métrica | Valor |
|---|---|
| Primeiro carregamento (celular) | ~198 KB |
| Pacote completo | 1,8 MB (quase tudo imagem) |
| Dependências em produção | nenhuma |
| Etapa de build | nenhuma |
| Tempo de deploy | arrastar a pasta na Vercel |

---

## 2. Estrutura de arquivos

```
verdi/
├── index.html          estrutura e conteúdo fixo
├── css/styles.css      design tokens + componentes
├── js/
│   ├── cardapio.js     DADOS: catálogo e preços
│   └── main.js         LÓGICA: prazos, carrinho, interface
├── img/                fotos e ativos da marca
├── docs/               esta documentação
└── ferramentas/        scripts que NÃO vão ao ar
    ├── preparar_fotos.py    recorta as fotos grandes
    ├── preparar_itens.py    recorta as miniaturas do cardápio
    ├── preparar_logo.py     redimensiona a logo oficial
    └── testar.js            testa a página inteira
```

### A separação que mais importa

**`cardapio.js` guarda os dados; `main.js` guarda as regras.**

Preço é o que mais muda num negócio de alimentos. Se estivesse misturado com a
lógica, cada correção de R$ 6,50 exigiria mexer em código de cálculo de datas.
Separado, mudar um preço é editar uma linha de um arquivo que só tem dados.

Essa fronteira é a mesma que, no SaaS, separa **banco de dados** de
**aplicação**. Ela já está desenhada.

---

## 3. Camadas

```
┌─────────────────────────────────────────────┐
│  cardapio.js — DADOS                        │
│  CARDAPIO = [{ categoria, itens[] }]        │
└───────────────────┬─────────────────────────┘
                    │ achatado em ITENS[id] no carregamento
┌───────────────────▼─────────────────────────┐
│  main.js — CONFIG                           │
│  atendimento (cidade, horários, fuso, dias) │
│  whatsapp, atalhos (combos)                 │
└───────────────────┬─────────────────────────┘
                    │
     ┌──────────────┼──────────────┬────────────────┐
     ▼              ▼              ▼                ▼
  MOTOR DE       CARDÁPIO       CARRINHO      MENSAGEM
   PRAZOS       (render)        (estado)      (montagem)
     │              │              │                │
     └──────────────┴──────┬───────┴────────────────┘
                           ▼
                    INTERFACE (DOM)
```

### Motor de prazos

Funções puras, sem DOM, testáveis isoladamente:

| Função | O que faz |
|---|---|
| `agoraNaLoja()` | "Agora" no fuso da loja, não do visitante |
| `ehDiaDeEntrega(d)` | O dia está na lista de operação? |
| `diaDePedidoAnterior(e)` | Último dia útil antes de uma entrega |
| `proximasEntregas(n)` | As n próximas janelas com prazo ainda aberto |
| `rotuloLimite(l)` | "hoje, 16h" / "amanhã, 16h" / "sexta, 16h" |

O algoritmo de `proximasEntregas`, resumido:

```
para i de 0 a 21 dias à frente:
    entrega = hoje + i
    se entrega não é dia de operação: pule
    limite = 16h do dia de operação anterior a entrega
    se limite já passou: pule
    inclua { entrega, limite }
```

Vinte e uma iterações cobrem qualquer configuração de dias, inclusive uma loja
que opere só uma vez por semana. É o coração reaproveitável do sistema.

### Estado

O carrinho é um objeto simples em memória:

```js
carrinho = { 'salada-mix': 2, 'blend-abacaxi-morango': 4 }
```

A lista é gravada em `localStorage` sob a chave `verdi:lista:v1`, com quatro
salvaguardas contra os problemas clássicos de persistência:

| Risco | Salvaguarda |
|---|---|
| Voltar dias depois com pedido esquecido | Expira em 72h |
| Item saiu de linha | Só restaura ids presentes no cardápio atual |
| Preço desatualizado | **Preço nunca é gravado** — sempre lido do cardápio |
| Navegação privada, cota cheia, JSON corrompido | Tudo em `try/catch`; falha silenciosa |
| Pedido duplicado na volta | O envio apaga a lista, guardando só o link para reenvio |

A gravação acontece num ponto único (`pintarCarrinho`), que já é o funil por
onde toda alteração passa. O campo `versao` no payload permite mudar o formato
no futuro sem quebrar quem tiver dado antigo.

### Renderização

Sem framework e sem DOM virtual. Cada mudança redesenha **a menor região
possível**: `pintarAcao(id)` refaz só o botão daquele item, `pintarCarrinho()`
refaz só a lista. Com 47 itens, isso é imperceptível e dispensa 40 KB de
biblioteca.

---

## 4. Decisões e seus porquês

| Decisão | Motivo |
|---|---|
| **Sem framework** | 47 itens e um formulário não justificam React. Menos peso, menos build, menos manutenção. |
| **Sem build** | Qualquer pessoa abre o arquivo, edita e publica. Sem `npm install` para trocar um preço. |
| **Fuso fixo em UTC−4** | O relógio do visitante mentiria sobre o prazo. |
| **Dados fora da lógica** | Preço muda toda semana; regra de negócio, raramente. |
| **Altura do cabeçalho como variável CSS** | Topo, âncoras, menu e abas grudadas dependem dela. Uma variável evita sobreposição quando a logo muda de tamanho. |
| **Rolagem contínua no cardápio** | Filtro por categoria escondia 40 dos 47 itens. Quem não sabe que existem abas nunca vê os blends. |
| **Pedido em dois passos** | Misturar "o que eu quero" com "para onde vai" faz a pessoa parar no meio. |
| **`localStorage` com prazo e revalidação** | Guarda a lista sem trazer de volta preço velho ou item fora de linha. |
| **Logo original, sem edição** | A página é que se adaptou: o creme da arte virou o fundo do cabeçalho. |
| **Imagens em duas resoluções** | Conexão de celular em Rondônia. 198 KB em vez de ~1 MB. |

---

## 5. Design system

Todo o visual sai de variáveis CSS declaradas uma vez:

```css
--verde-noite:#22400A    verde do wordmark da logo
--verde-mata:#4A6A18     textos e links
--verde-broto:#A9BE55    oliva das folhas do coração
--creme:#F9EDDD          fundo da arte original
--coral:#E8695C          coraçãozinho do lockup
--cenoura:#F15A07        laranja da cenoura
--pad:1.8rem             respiro interno dos cartões
--barra:104px            altura do cabeçalho
```

As cores **foram medidas na logo oficial**, não escolhidas. Isso garante que o
site e a embalagem pertençam à mesma marca.

`--pad` e `--barra` encolhem por faixa de tela (1000px, 620px, 380px). Foi assim
que o desalinhamento do mobile foi resolvido: em vez de corrigir cartão por
cartão, uma variável muda e tudo acompanha.

Tipografia: **Bricolage Grotesque** (títulos), **Instrument Sans** (texto),
**DM Mono** (datas, preços e etiquetas). O monoespaçado nas datas não é
enfeite — dá ao quadro de prazos cara de ficha de produção, que é o que ele é.

---

## 6. Pipeline de imagens

Os scripts em `ferramentas/` transformam fotos cruas em ativos prontos. Eles
rodam **na máquina de quem edita**, nunca em produção.

| Script | Entrada | Saída |
|---|---|---|
| `preparar_itens.py` | fotos dos produtos | 47 miniaturas quadradas de 260px |
| `preparar_fotos.py` | fotos ambiente | 4 fotos grandes + versões `-sm` (metade) |
| `preparar_logo.py` | logo oficial | logo web, favicon, ícone iOS, imagem de compartilhamento |

Regras do pipeline:

- **A arte da logo nunca é editada** — só redimensionada. O encaixe na página
  se dá pelo fundo creme, não por recorte.
- Toda foto grande ganha uma versão `-sm` servida por `srcset`.
- Recortes são medidos, não estimados (o script lê a caixa real do conteúdo).

---

## 7. Teste automatizado

`ferramentas/testar.js` abre o `index.html` num navegador simulado (jsdom),
executa o JavaScript de verdade e verifica **38 pontos**: seções presentes,
cardápio renderizado por grupo com nome/preço/botão, cálculo de datas, carrinho,
subtotal, os dois passos, mensagem final e ausência de código removido.

```bash
npm install jsdom
node ferramentas/testar.js
```

### Por que ele existe

Numa das versões, uma função foi apagada por engano durante uma refatoração.
O HTML era válido, o CSS estava certo, a sintaxe do JavaScript passava — e
metade da página não carregava, porque o erro interrompia a inicialização no
meio. **Validação estática não pega isso. Executar pega.**

O teste também encontrou, depois: ouvintes de evento empilhando a cada clique,
uma chamada de rolagem sem proteção que derrubava a inicialização, e um bloco
de HTML removido junto com outro.

---

## 8. Acessibilidade e desempenho

- Alvos de toque de 44px ou mais no celular.
- Foco visível no teclado; abas não são recriadas ao trocar (o foco se perde).
- `prefers-reduced-motion` respeitado.
- Áreas seguras do iPhone (`env(safe-area-inset-bottom)`).
- `100dvh` em vez de `100vh`, por causa da barra de endereço móvel.
- Imagens fora da primeira dobra com `loading="lazy"`.
- Contraste verificado nas combinações principais.
- **Ícones são SVG no HTML ou formas de CSS básico** (borda, fundo, transform).
  Nada depende de `mask`/`-webkit-mask`: quando a máscara não é aplicada — o
  que acontece em vários navegadores móveis — sobra um quadrado sólido no lugar
  do desenho.

---

## 9. Fragilidades desta arquitetura

Honestamente, o que não escala:

| Fragilidade | Impacto |
|---|---|
| **Depende de JavaScript** | Sem JS, o cardápio não aparece. Ruim para SEO de itens. |
| **Preço no código-fonte** | Mudar preço exige editar arquivo e republicar. |
| **Nenhum registro do pedido** | Zero dados sobre vendas, itens mais pedidos, recorrência. |
| **Uma loja só** | Toda a configuração é global, num arquivo. |
| **Confirmação humana obrigatória** | A operação não escala além do que uma pessoa responde no WhatsApp. |
| **Sem cálculo de taxa** | Uma ida e volta a mais em todo pedido. |

Nenhuma dessas é defeito no estágio atual — são o preço justo por um site que
custa quase nada para manter. Todas viram requisito no documento 03.
