# Regras de negócio

Este documento descreve **como a operação funciona**, independente de código.
É a fonte de verdade: se um dia a landing page for reescrita, ou virar produto
para outras lojas, são estas regras que precisam ser reproduzidas.

Onde uma regra está implementada, o local aparece entre parênteses.

---

## 1. Modelo de operação

A Verdi vende **alimentos frescos minimamente processados** — lavados,
higienizados, cortados e porcionados — para consumo doméstico.

**Não há estoque.** Nada fica pronto esperando comprador. Cada encomenda é
comprada, higienizada e cortada depois que o pedido entra. Essa é a regra
estruturante: ela explica o prazo, justifica o frescor e determina o desenho
inteiro do fluxo de pedido.

Consequências diretas:

- Não existe "disponibilidade em tempo real". Um item está no cardápio ou está
  fora de linha (`esgotado: true`), sem contagem de unidades.
- Não existe entrega imediata. O prazo mínimo é o próximo dia de operação.
- O risco de sobra é da produção, não do cliente: por isso o corte de horário
  é rígido.

---

## 2. Área de atendimento

| Regra | Valor |
|---|---|
| Cidade atendida | Porto Velho (RO), todos os bairros |
| Modalidade | **Somente delivery** — não há retirada nem loja física |
| Fora da cidade | Não atendido |

*(`CONFIG.atendimento.cidade` e `somenteDelivery` em `js/main.js`.)*

A restrição aparece em cinco pontos da página — topo, regra de prazos, campo de
endereço, rodapé e descrição do site — porque é a informação que mais
desqualifica visitante cedo. Deixar isso ambíguo gera conversa no WhatsApp que
termina em "ah, então não dá".

---

## 3. Janela de pedidos e prazo de entrega

### A regra

> **Pedido feito até as 16h de um dia de operação é entregue no próximo dia de
> operação.**

| Parâmetro | Valor |
|---|---|
| Dias de operação | Segunda a sexta |
| Recebimento de pedidos | 08:00 às 16:00 |
| Corte (deadline) | 16:00 |
| Fuso de referência | **UTC−4 (Rondônia), fixo** |
| Sábado e domingo | Sem produção e sem entrega |

*(`CONFIG.atendimento` em `js/main.js`; tabela visível em `index.html`,
`#quadro-corpo`.)*

### Tabela de prazos

| Você pede (até 16h) | Recebe |
|---|---|
| Segunda | Terça |
| Terça | Quarta |
| Quarta | Quinta |
| Quinta | Sexta |
| Sexta | Segunda |

### Casos de borda

Estes são os casos que geram reclamação se não estiverem explícitos:

| Momento do pedido | Entrega | Por quê |
|---|---|---|
| Segunda, 15h59 | Terça | Dentro da janela |
| Segunda, 16h01 | Quarta | Passou do corte; conta como terça |
| Sexta, 15h | Segunda | Próximo dia de operação |
| Sexta, 16h30 | **Terça** | O prazo da segunda fechou às 16h de sexta |
| Sábado ou domingo | **Terça** | Idem — não há operação no fim de semana |

O caso da sexta à tarde é o mais contraintuitivo e por isso está escrito na
página, não só calculado.

### Por que o fuso é fixo

O cálculo **não usa o relógio do aparelho de quem acessa**. Um cliente com o
celular no fuso de São Paulo, às 16h30, veria "pedidos encerrados" quando em
Porto Velho ainda eram 15h30 — e desistiria de um pedido que era válido.

Todo o cálculo é ancorado em UTC−4 (`agoraNaLoja()`). Quem acessa de outro fuso
vê um aviso dizendo que horas são em Porto Velho.

### O que a página calcula sozinha

A partir dessa única regra, a página deriva:

- a próxima data de entrega disponível e as três seguintes;
- o horário-limite de cada uma, em linguagem relativa ("hoje, 16h", "amanhã, 16h");
- quanto tempo falta para o corte, com barra de progresso que fica vermelha nas
  últimas 12h;
- se o balcão está aberto agora ("Pedidos abertos agora" × "Pedidos fecham às 16h");
- qual linha da tabela de prazos destacar.

Não existe data escrita à mão em lugar nenhum. Mudar `fimPedidos` de 16 para 17
reflete em todos esses pontos.

---

## 4. Catálogo e preços

| Regra | Valor |
|---|---|
| Itens ativos | 47 |
| Categorias | 6 |
| Faixa de preço | R$ 4,50 a R$ 24,50 |
| Unidade de venda | Pacote/pote/bandeja fechado, peso no nome |

*(`js/cardapio.js` — arquivo separado do resto do código de propósito.)*

### Categorias

| Categoria | Itens | O que é |
|---|---|---|
| Saladas prontas | 7 | Refeição montada no pote, pronta para o garfo |
| Folhas e temperos | 4 | Lavadas, sanitizadas e secas |
| Ralados e mixes | 12 | Cortes trabalhosos (julienne, ralado, fatiado) |
| Legumes e raízes | 5 | Descascados e cortados |
| Kits de receita | 10 | Todos os ingredientes de um prato, porcionados |
| Blends de frutas | 9 | Congelados, sem água, sem açúcar, sem conservante |

### Regras do item

- **Peso obrigatório no nome.** Todo item traz o peso ("Salada mix 250g",
  "Abacaxi com hortelã 150g"). Isso não é estética: o nome é o que vai na
  mensagem do WhatsApp, e sem o peso o pedido fica ambíguo na hora de separar.
- **Preço em reais, sem variação por tamanho.** Um item = um preço. Tamanhos
  diferentes são itens diferentes.
- **`esgotado: true`** tira o item do site sem apagar o cadastro. Serve para
  sazonalidade (fruta fora de época) e para produtos ainda sem preço definido.
- **Foto é opcional.** Sem foto, a linha mostra um ícone de folha. Hoje todos
  os 47 têm foto.

### O que o preço do site significa

O subtotal mostrado é **prévia, não cobrança**. O valor final é confirmado no
WhatsApp, porque falta a taxa de entrega. Isso está escrito em três pontos do
fluxo para não haver surpresa.

---

## 5. Taxa de entrega

| Regra | Valor |
|---|---|
| Modelo | **A combinar**, por bairro |
| Quando é informada | Na conversa do WhatsApp, antes da confirmação |
| Aparece no pedido | Sim, como linha explícita "*Taxa de entrega:* a combinar" |

A taxa entra na mensagem **mesmo quando o cliente não preenche o endereço** —
nesse caso o endereço sai como "(vou passar na conversa)". Isso protege os dois
lados: o cliente não fecha achando que já sabe o total, e a Verdi não precisa
explicar depois que faltava um valor.

---

## 6. Fluxo do pedido

O pedido acontece em **dois passos**, deliberadamente separados:

### Passo 1 — Montagem da lista

- O cliente navega o cardápio (rolagem contínua, categorias como atalho) e
  adiciona itens com **+**.
- Cada item tem contador com limite de **30 unidades**.
- A lista **fica guardada no navegador** e volta se a pessoa recarregar a
  página ou voltar no mesmo dia. Regras: expira em **3 dias**, só restaura
  itens que ainda existem no cardápio, e **nunca guarda preço** — o subtotal é
  sempre recalculado com a tabela de hoje. Ao restaurar, um aviso discreto
  explica de onde veio a lista.
- Existem **combos de um toque** ("Semana da salada", "Café da manhã",
  "Jantar resolvido", "Combo família") que adicionam vários itens de uma vez.
- O subtotal é calculado ao vivo.
- **Não é possível avançar com a lista vazia.** O botão fica desabilitado e o
  aviso pisca se a pessoa insistir.

### Passo 2 — Entrega e contato

- Escolha da data de entrega, entre as próximas quatro janelas válidas.
- Nome, endereço e observações (todos opcionais no sistema; o endereço é
  cobrado na conversa se faltar).
- Prévia integral da mensagem antes de enviar.
- **Se a lista for esvaziada estando no passo 2, o fluxo volta ao passo 1** —
  não faz sentido pedir endereço para um pedido inexistente.

### A barra de pedido

Assim que há algo na lista, aparece uma barra fixa com a quantidade, o subtotal
e um botão que **muda de função conforme o estado do pedido**. Ela existe em
todas as telas: no computador é uma pílula centrada acima do rodapé; no celular,
uma faixa colada na base.

| Estado | Botão | Ao tocar |
|---|---|---|
| Endereço ainda não conferido | **Fechar pedido** | Vai ao passo 2 |
| Já no passo 2, endereço vazio | **Fechar pedido** | Põe o cursor no campo de endereço |
| Endereço válido | **Enviar pedido no WhatsApp** | Abre a conversa com o pedido |

Regras de transição:

- Um endereço é considerado válido com **pelo menos 10 caracteres e duas
  palavras**. É uma checagem de sanidade, não de correção — endereço errado só
  a conversa resolve.
- **Mexer na lista não invalida o endereço.** Quem já informou onde mora não
  precisa informar de novo por ter acrescentado uma alface. O link do WhatsApp
  é remontado a cada alteração, então a mensagem sempre reflete a lista atual —
  o cliente nunca envia uma lista desatualizada.
- **Voltar ao cardápio recua o botão para "Fechar pedido".** Ir para o cardápio
  significa "vou mexer na lista", então a barra pede uma nova passada pela
  conferência. O endereço escrito continua no campo; só o estado do botão
  recua. Ao voltar ao passo 2, ele volta a "Enviar" depois de 1 segundo.
- Fora isso, o botão só volta a "Fechar pedido" se o **endereço deixar de ser
  válido** (apagado ou incompleto).
- A troca de rótulo tem **atraso proposital**: 0,7s depois de parar de digitar,
  e 1s quando o cliente chega ao passo 2 com o endereço já preenchido de antes.
  Trocar um botão embaixo do dedo de alguém, sem aviso, faz a pessoa tocar no
  que não queria. O botão dá um pulso curto ao mudar.

### Passo 3 — WhatsApp

O envio abre uma conversa com a mensagem pronta. **O pedido não é registrado
em lugar nenhum:** ele existe apenas como texto no WhatsApp. Ver
"Limitações conhecidas".

Ao enviar, a página:

1. **Apaga a lista** — da memória e do navegador. Uma lista antiga na próxima
   visita geraria pedido duplicado.
2. Mostra uma **confirmação** deixando claro que o pedido só chega à Verdi
   depois que a pessoa tocar em enviar dentro do WhatsApp. Essa distinção é
   importante: abrir a conversa não é o mesmo que mandar a mensagem.
3. Guarda o **link do último pedido**, oferecido como "A conversa não abriu?
   Tentar de novo" — cobre bloqueador de pop-up, WhatsApp não instalado ou aba
   fechada sem querer, sem que a lista tenha se perdido.
4. Oferece **"Montar outro pedido"**, que devolve ao cardápio.

---

## 7. Formato da mensagem de pedido

```
Olá, Verdi! Quero fazer uma encomenda.

*Pedido*
• 3× Abacaxi com hortelã 150g — R$ 13,50
• 1× Salada mix 250g — R$ 11,50

*Subtotal:* R$ 25,00

*Entrega:* terça, 18/08
*Nome:* Ana Beatriz
*Endereço:* Rua das Palmeiras, 120 — Centro
*Taxa de entrega:* a combinar

Pode confirmar o total com a taxa de entrega e a forma de pagamento?
```

Regras do formato:

- Negrito do WhatsApp (`*texto*`) nos rótulos, para leitura rápida no celular.
- Uma linha por item, com quantidade, nome completo (com peso) e valor da linha.
- Subtotal separado da taxa, sempre.
- Termina com uma pergunta — convida resposta em vez de deixar a conversa parada.

---

## 8. Canais de contato

| Canal | Número | Mensagem inicial |
|---|---|---|
| Pedido | (69) 99299-9008 | Pedido completo com lista e subtotal |
| Ajuda e suporte (rodapé) | (69) 99299-9008 | "Vim pelo site e preciso de ajuda" |
| Instagram | @verdi.fv | — |

Hoje é a mesma linha com mensagens diferentes. A separação existe no código
(`whatsapp` e `whatsappAtendimento`) para permitir dividir os canais sem
refatorar nada.

**Pendência conhecida:** as etiquetas dos produtos circulam com pelo menos duas
versões de contato diferentes do site. Alinhar na próxima tiragem.

---

## 9. Formas de pagamento

PIX, cartão ou dinheiro, **combinados na conversa**. A página não processa
pagamento nem coleta dado financeiro.

---

## 10. Limitações conhecidas (por decisão, não por falta)

Estas ausências são intencionais no estágio atual e viram requisitos na versão
SaaS:

| Não existe | Consequência |
|---|---|
| Cadastro de cliente | Cliente redigita nome e endereço a cada pedido (a lista de itens, essa sim, fica guardada) |
| Registro do pedido | Nenhum histórico, nenhum relatório de vendas |
| Confirmação automática | Todo pedido depende de resposta humana no WhatsApp |
| Controle de estoque | Risco de aceitar item que acabou |
| Cálculo de taxa de entrega | Uma ida e volta a mais na conversa |
| Pagamento online | Recebimento manual |
| Painel administrativo | Preço só muda editando um arquivo e republicando |

O sistema atual é, na prática, **um formulário sofisticado que gera uma
mensagem bem formatada**. Isso é suficiente para uma operação de bairro e
insuficiente para escalar — o que motiva o documento 03.
