# Verdi — landing page

Site estático em HTML, CSS e JavaScript puros. Sem build, sem dependências,
sem framework. É só publicar a pasta.

```
verdi/
├── index.html
├── css/styles.css
├── js/
│   ├── cardapio.js     ← os preços moram aqui
│   └── main.js
├── img/                ← fotos e ativos da marca, já prontos
└── ferramentas/        ← scripts de apoio; a página não depende deles
    ├── preparar_fotos.py
    ├── preparar_itens.py
    ├── preparar_logo.py
    └── testar.js       ← testa a página inteira antes de publicar
```

---

## 1. Antes de publicar

### a) Número do WhatsApp — conferir

Abra `js/main.js` e troque a primeira linha do `CONFIG`:

```js
whatsapp: '5569992999008',
whatsappAtendimento: '5569992999008',
```

Tudo vai para **(69) 99299-9008**, mas com mensagens diferentes conforme a
porta de entrada:

- **`whatsapp`** — o botão que fecha o pedido. Abre a conversa com a lista, o
  subtotal, a data de entrega e o endereço já escritos.
- **`whatsappAtendimento`** — o link do rodapé, marcado como **Ajuda e
  suporte**. Abre com "vim pelo site e preciso de ajuda", sem pedido nenhum,
  para quem tem dúvida ou problema com uma encomenda que já fez.

Os dois campos existem para o caso de a Verdi querer separar as linhas um dia;
hoje apontam para o mesmo número.

**Atenção às etiquetas dos produtos.** Nas fotos aparecem duas versões
diferentes do selo: a maioria traz o número antigo, (69) 99284-7503, e
`@verdi.fv`; a etiqueta mais nova (foto da mandioca) traz outro número e
`@verdi.fresh`. O site usa (69) 99299-9008 e `@verdi.fv`, conforme você
confirmou. Vale alinhar as embalagens com o site na próxima tiragem — cliente
que olha o pacote e escreve para um canal sem atendimento é venda perdida.

O Instagram do rodapé aponta para **@verdi.fv**.

Esse número alimenta os três botões de WhatsApp da página (o do formulário,
o flutuante e o do rodapé), todos já com a mensagem do pedido pronta.

### b) Cardápio e preços — conferir

O cardápio veio dos prints do Gerenciador de Catálogos: **47 itens em 6
categorias**, com os preços transcritos um a um. Confira antes de publicar,
principalmente estes pontos:

- **Todo item traz o peso no nome** — inclusive os blends, que são todos de
  150g. Isso importa porque o nome é o que vai na mensagem do WhatsApp: sem o
  peso, "3× Abacaxi e morango" não diz quanto a pessoa está pedindo.
- **Cinco descrições estavam cortadas no print** e foram gravadas só com o que
  dava para ler. Vale completar em `js/cardapio.js`:
  `Kit para refogado`, `Kit forno / air fryer`, `Kit yakisoba`,
  `Kit arroz à grega` e `Salada mista`.
- **Vinagrete** apareceu nas fotos mas não na lista de preços. Está cadastrado
  como `esgotado: true`, ou seja, não aparece no site. Para colocar em linha,
  ponha o preço e apague essa marca.
- **Os 47 itens têm foto.** Para trocar ou incluir uma nova: coloque o arquivo
  na pasta de origem, acrescente uma linha em `ferramentas/preparar_itens.py`
  e rode o script — ele recorta no quadrado certo e comprime sozinho. Itens sem
  foto continuam funcionando: aparece um ícone de folha no lugar.
- **Duas saladas merecem uma conferida na foto:** `salada-mista` e
  `salada-gourmet`. As descrições do catálogo são parecidas e o pareamento foi
  feito olhando os ingredientes visíveis na imagem.



### c) Fotografias do restante da página — já feito ✅

Fora as miniaturas do cardápio, a página usa quatro fotos grandes, recortadas
por `ferramentas/preparar_fotos.py`:

| Arquivo | Onde aparece |
|---|---|
| `hero-salada.jpg` | topo da página |
| `hero-blend.jpg` | círculo do topo |
| `sobre-bancada.jpg` | seção "A Verdi" |
| `faixa-entrega.jpg` | faixa verde antes do rodapé |

Cada uma tem uma versão `-sm` com metade da largura, servida por `srcset` no
celular. Para trocar: ponha o arquivo novo na pasta de origem, ajuste o mapa
`U` no topo do script e rode `python3 preparar_fotos.py` de dentro de
`ferramentas/`.

### d) Marca — já feito ✅

**A arte oficial é usada sem nenhuma edição.** Não há recorte, remoção de
fundo nem separação em partes: é o mesmo arquivo que você enviou, apenas
redimensionado e comprimido para a web por `ferramentas/preparar_logo.py`.

Quem se adaptou foi a página. Como a arte é quadrada e vem sobre creme
`#F9EDDD`, esse creme virou o fundo do cabeçalho, do selo do rodapé e do
avatar do atendimento — assim a logo encaixa sem borda, sem moldura e sem
retângulo aparente.

| Arquivo | Onde aparece | O que é |
|---|---|---|
| `logo-verdi.jpg` | selo do rodapé, em telas de alta densidade | arte original em 720px |
| `logo-verdi-sm.jpg` | cabeçalho e rodapé | a mesma arte em 320px |
| `favicon.png` | aba do navegador | a mesma arte em 128px |
| `icone-ios.png` | tela inicial do iPhone | a mesma arte em 180px |
| `og-verdi.jpg` | link compartilhado no WhatsApp | logo inteira + foto |

A marca aparece em dois lugares: no cabeçalho, a 84px (62px depois de rolar),
e no rodapé, a 200px — onde o "fresh drinks | cozinha" se lê por inteiro. Se um
dia a Verdi tiver uma **versão horizontal** da marca, ela caberia melhor na
barra do topo; é só trocar o arquivo e ajustar `.marca__logo` no CSS.

A paleta do site foi medida na própria logo — os valores estão comentados no
topo de `css/styles.css`:

| Variável | Cor | De onde veio |
|---|---|---|
| `--verde-noite` | `#22400A` | verde do wordmark |
| `--verde-mata` | `#4A6A18` | derivado, para textos e links |
| `--verde-broto` | `#A9BE55` | oliva das folhas do coração |
| `--creme` | `#F9EDDD` | fundo da arte original |
| `--coral` | `#E8695C` | coraçãozinho do lockup |
| `--cenoura` | `#F15A07` | laranja da cenoura |

### e) Depoimentos — trocar antes de publicar

Os três depoimentos da seção "Quem já pede" são exemplos de escrita, não
clientes reais. Substitua por frases de clientes de verdade antes de publicar —
com autorização deles. Estão em `index.html`, na seção `id="depoimentos"`.

---

## 2. Ajustes opcionais

Tudo fica no objeto `CONFIG`, no topo de `js/main.js`:

- **`atendimento`** — o modelo de operação: horário de pedidos
  (`inicioPedidos` / `fimPedidos`), dias em que há entrega (`diasEntrega`,
  onde 0 = domingo … 6 = sábado; hoje é `[1,2,3,4,5]`) e se é só delivery. A página calcula sozinha
  a próxima entrega, o horário-limite e o tempo restante. Se mudar aqui,
  atualize também a tabela em `index.html` (`id="quadro-corpo"`), onde cada
  linha tem um `data-dia` com o dia do pedido.
- **`js/cardapio.js`** — este é o arquivo dos preços. Está separado de
  propósito: é o que muda com mais frequência e não exige mexer em mais nada.
  Cada item tem `id`, `nome`, `desc`, `preco`, `foto` (opcional) e
  `esgotado: true` para tirar de linha sem apagar o cadastro. Mudou o preço?
  Uma linha. Entrou item novo? Uma linha. A página monta as abas, os
  contadores, o subtotal e a mensagem sozinha.
- **`atalhos`** — os combos de um toque ("Semana da salada", "Combo família").

Cores e tipografia estão nas variáveis do início de `css/styles.css`
(`--verde-noite`, `--verde-mata`, `--verde-broto`, `--folha`, `--framboesa`).

Os contatos do rodapé (dois WhatsApps e o Instagram) estão no fim do
`index.html`. Não há e-mail: todo o atendimento passa pelo WhatsApp.

---

## 3. Publicar na Vercel

**Opção rápida — arrastar e soltar:**
1. Entre em [vercel.com/new](https://vercel.com/new)
2. Arraste a pasta `verdi` inteira para a área de upload
3. Framework Preset: **Other**. Build Command: deixe vazio.
   Output Directory: deixe vazio (a raiz já é o site).
4. Deploy.

**Opção com Git:**
```bash
cd verdi
git init && git add . && git commit -m "Landing page Verdi"
# suba para o GitHub e importe o repositório na Vercel
```

**Opção com a CLI:**
```bash
npm i -g vercel
cd verdi
vercel --prod
```

Depois é só apontar o domínio (ex.: `verdi.com.br`) em
Settings → Domains no painel da Vercel.

---

## 4. O modelo de atendimento no site

Está tudo derivado de uma regra só, escrita em `CONFIG.atendimento`:

- **Área única: Porto Velho (RO).** A cidade está em `CONFIG.atendimento.cidade`
  e aparece no topo, na regra de prazos, no campo de endereço, no rodapé e no
  chatbot. Nenhum texto tem a cidade escrita à mão no JavaScript.
- **Fuso fixo em UTC−4** (`CONFIG.atendimento.fusoHorario`). Todo o cálculo de
  prazo usa o relógio da loja, não o do aparelho de quem acessa — sem isso, um
  cliente em São Paulo às 16h30 veria o pedido como fechado, quando em Porto
  Velho ainda são 15h30. Quem acessa de outro fuso vê um aviso no quadro de
  prazos dizendo que horas são em Porto Velho.
- **Só delivery**, sem retirada — dito no hero, nos passos, no rodapé e no chatbot.
- **Taxa de entrega a combinar.** O formulário tem campo de endereço e avisa
  que a taxa depende do bairro; ela entra na mensagem do WhatsApp como
  "a combinar", para ninguém fechar pedido achando que já sabe o total.
- **Pedidos de 8h às 16h**, de segunda a sexta.
- **Pedido até as 16h chega no dia seguinte.** Depois das 16h, entra no dia
  seguinte. Não há entrega no fim de semana: o que for pedido de sexta à tarde
  em diante sai na terça, porque na segunda o prazo já fechou.

O painel do topo, as opções de entrega do formulário, o quadro de prazos e as
respostas do chatbot leem essa mesma regra — não há texto fixo com data em
lugar nenhum. Mudou o horário? Mexa em `fimPedidos` e a página inteira
acompanha.

---

## 5. O pedido em dois passos

A seção de fechamento foi separada, porque misturar "o que eu quero" com "para
onde vai" numa tela só faz a pessoa parar no meio:

1. **Sua lista** — os itens escolhidos, o subtotal e os combos de um toque. O
   botão de avançar mostra a quantidade e fica desabilitado enquanto a lista
   estiver vazia.
2. **Entrega e contato** — data de entrega, nome, endereço e observações, com
   a prévia da mensagem e o botão do WhatsApp ao lado.

A trilha no topo mostra em qual passo a pessoa está e permite voltar. No passo
2 há um resumo ("3 itens · R$ 34,50") com um botão **Editar** que devolve ao
passo 1. Se a lista for esvaziada estando no passo 2, a página volta sozinha
ao passo 1 — não faz sentido pedir endereço para um pedido que não existe.

No celular, o botão da barra fixa ("Fechar pedido") pula direto para o passo 2,
já que quem tocou nele já escolheu o que queria.

---

## 6. Como a página se comporta no celular

O site foi ajustado para uso em telefone, que é onde a maioria dos pedidos vai
nascer. O que muda abaixo de 760px:

- **Cardápio de rolagem contínua.** Os 47 itens ficam todos na página, em
  ordem, separados por título de categoria. A barra de categorias gruda embaixo
  do cabeçalho e **acende sozinha** conforme a pessoa desce, além de rolar para
  manter a aba ativa à vista. Tocar numa categoria leva até ela. Assim ninguém
  precisa descobrir que existem outras abas para ver o resto do cardápio.
- **Barra fixa de pedido com dois estados** (presente também no computador,
  como pílula centrada). Assim que algo entra na lista, ela sobe com a
  quantidade, o subtotal e a data de entrega. O
  botão começa como **Fechar pedido** (leva ao passo 2) e vira **Enviar pedido
  no WhatsApp** quando o endereço está preenchido. Mexer na lista não desfaz
  isso: o link é remontado a cada alteração e a mensagem sempre sai com a lista
  atual. A troca de rótulo tem atraso proposital, para não acontecer embaixo do
  dedo. Ela empurra o atalho
  flutuante para cima para não sobrepor.
- **Atalho "Montar pedido"** flutuando no canto depois que a pessoa rola um
  pouco, sempre levando ao cardápio, com um contador de itens. Em telas bem
  estreitas fica só o ícone. Para fechar o pedido existe a barra fixa do
  rodapé, que sobe assim que há algo na lista.
- **Padding dos cartões numa variável só** (`--pad`), que encolhe por faixa de
  tela: 1,8rem no computador, 1,6rem em tablet, 1,3rem no celular e 1,1rem em
  telas muito estreitas. Antes cada cartão tinha o seu valor e o mobile ficava
  desalinhado.
- **Datas de entrega duas por linha** no celular, com altura igual entre elas.
  Em uma coluna só, as quatro opções empurravam o formulário para baixo demais.
- **Alvos de toque de 44px ou mais** nos contadores, nas abas de categoria e
  nos links do menu — abaixo disso o dedo erra.
- **Menu com o botão "Fazer pedido"** dentro, já que o CTA do cabeçalho some.
- **Altura do cabeçalho é uma variável de CSS** (`--barra`), e o topo da página,
  as âncoras, o menu e as abas grudadas se apoiam nela. Mudou a altura da logo?
  Ajuste `--barra` e todo o resto acompanha, sem sobreposição.
- **Áreas seguras respeitadas** (`env(safe-area-inset-bottom)`), para nada
  ficar sob o indicador de home do iPhone.
- **Imagens em duas resoluções.** Cada foto tem uma versão `-sm` com metade da
  largura, servida por `srcset`. No celular a primeira dobra carrega cerca de
  **290 KB** em vez de quase 1 MB.

Há ainda um ponto para telas de 380px ou menos, onde o título do topo e o
carrossel ganham medidas próprias.

---

## 7. Testar antes de publicar

Sempre que mexer em preço, item ou qualquer script, vale rodar:

```bash
npm install jsdom      # só na primeira vez
node ferramentas/testar.js
```

O teste abre o `index.html` num navegador simulado, executa o JavaScript de
verdade e confere, uma a uma: se todas as seções existem, se o cardápio
renderiza as seis categorias com nome, preço e botão, se o painel de entrega
calcula a data, se cada grupo do cardápio traz nome, preço e botão em todas as
linhas, se adicionar item soma o subtotal e se a mensagem do WhatsApp sai
completa. Se algo quebrar, ele diz o quê e sai com erro.

Isso pega um tipo de problema que passa despercebido ao olhar o código: um
único erro de JavaScript no meio da inicialização derruba tudo o que vem
depois — o cardápio aparece, mas o formulário de pedido fica vazio.

---

## 8. O que já está resolvido

- Responsivo de 320px até telas largas, com carrossel e barra de pedido no celular
- Foco visível no teclado, `aria-label` nos controles e link "pular para o conteúdo"
- `prefers-reduced-motion` respeitado (desliga animações)
- Imagens com `loading="lazy"` fora da primeira dobra
- Meta tags de compartilhamento (Open Graph) e favicon embutido
- Carrinho, prazos e atendimento calculados no navegador, sem servidor e sem cookies
- Lista guardada no navegador por 3 dias, revalidada contra o cardápio ao voltar
- Chatbot fecha com Esc, tem foco visível e não bloqueia a leitura da página
