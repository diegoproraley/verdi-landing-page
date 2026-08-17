# Do site único ao SaaS

Como transformar o que foi construído para a Verdi num produto vendável para
outras lojas, com operação parecida com a de um iFood.

Este documento é um plano, não uma promessa. Ele separa o que já está pronto,
o que precisa ser construído e — a parte mais importante — **quais decisões
precisam ser tomadas antes de escrever a primeira linha**.

---

## 1. A primeira decisão: qual dos dois produtos

"Parecido com o iFood" pode significar duas coisas muito diferentes. Elas
levam a produtos, custos e riscos distintos. Escolher errado aqui custa caro
depois.

### Caminho A — SaaS whitelabel ("Shopify de hortifruti")

Cada loja tem seu próprio site, seu domínio, sua marca. O cliente final é da
loja. Você vende software.

| | |
|---|---|
| **Receita** | Mensalidade por loja (+ opcional % por pedido) |
| **Quem traz o cliente** | A loja |
| **Custo de aquisição** | Vender para lojistas |
| **Risco** | Baixo — você não promete demanda |
| **Efeito de rede** | Nenhum |
| **Onde começa** | Exatamente onde este projeto está |

### Caminho B — Marketplace ("iFood de hortifruti")

Um app único, várias lojas, o consumidor escolhe. O cliente final é seu.

| | |
|---|---|
| **Receita** | Comissão por pedido (15–30%) |
| **Quem traz o cliente** | Você |
| **Custo de aquisição** | Altíssimo — dois lados para conquistar |
| **Risco** | Alto — problema do ovo e da galinha |
| **Efeito de rede** | Forte, quando funciona |
| **Onde começa** | Praticamente do zero em produto e operação |

### Recomendação

**Comece pelo A. Deixe a porta aberta para o B.**

O caminho A é vendável em meses, com o código atual como base. Cada loja
cadastrada vira, mais tarde, uma loja disponível no marketplace — você chega
ao caminho B já com oferta, que é o lado difícil de um marketplace.

O inverso não funciona: começar pelo marketplace exige queimar caixa para
atrair consumidores para um catálogo vazio.

**Consequência prática:** o modelo de dados deve ser multi-loja desde o
primeiro dia, mesmo que a interface seja de site individual. Um `loja_id` em
tudo custa nada agora e é uma migração dolorosa depois.

---

## 2. O que já está pronto para reaproveitar

Não é pouco. Estes são problemas resolvidos e testados:

| Ativo | Valor no SaaS |
|---|---|
| **Motor de prazos** | Já lida com dias de operação, corte de horário e fim de semana. É a peça mais difícil e menos óbvia. |
| **Fuso fixo por loja** | Erro clássico já resolvido. No Brasil, com quatro fusos, é obrigatório. |
| **Modelo de catálogo** | Categoria → item, com `esgotado`, foto opcional e preço. Vira tabela quase sem mudança. |
| **Fluxo em dois passos** | Testado, com todos os casos de borda tratados. |
| **Formato da mensagem** | Serve de template de notificação, mesmo com pedido registrado em banco. |
| **Design system em variáveis** | Base de temas por loja: trocar seis cores muda a marca inteira. |
| **Pipeline de imagens** | Vira serviço de upload com recorte automático. |
| **Suíte de testes** | O hábito e a estrutura já existem. |

**O que precisa ser jogado fora:** a persistência do pedido em `wa.me` como
único destino, os dados dentro de arquivo `.js`, e a premissa de loja única em
`CONFIG`.

---

## 3. Modelo de domínio

O mínimo para operar multi-loja. Nomes em português para casar com a
documentação.

```
Loja
 ├── id, slug, nome, dominio
 ├── marca: logo, cores, tipografia
 ├── contato: whatsapp_pedido, whatsapp_suporte, instagram
 ├── operacao: fuso, dias[], hora_inicio, hora_fim, antecedencia
 ├── modalidades: delivery, retirada
 ├── plano, status
 └── Categoria[]
      └── Item
           ├── id, nome, descricao, peso, preco
           ├── foto, ordem, ativo, esgotado
           └── VariacaoItem[]        (tamanhos, cortes)

ZonaEntrega
 ├── loja_id, nome (bairro/polígono/CEP)
 ├── taxa, pedido_minimo, prazo_extra
 └── ativa

Cliente
 ├── id, nome, telefone (identidade), email?
 └── Endereco[]  (rua, número, bairro, referência, geo)

Pedido
 ├── id, loja_id, cliente_id, numero_sequencial
 ├── status, canal (site/whatsapp/app)
 ├── data_entrega, janela, endereco_snapshot
 ├── subtotal, taxa_entrega, desconto, total
 ├── pagamento: metodo, status, id_externo
 ├── ItemPedido[]  (item_id, nome_snapshot, preco_snapshot, qtd)
 └── EventoPedido[] (status, quando, quem, observação)
```

### Três regras de modelagem que evitam dor

1. **Snapshot de tudo que o cliente viu.** Nome, preço e endereço são copiados
   para o pedido no momento da compra. Se o preço mudar amanhã, o pedido de
   ontem continua contando a verdade. Sem isso, todo relatório financeiro fica
   errado na primeira mudança de tabela.
2. **`EventoPedido` em vez de só um campo `status`.** Você vai precisar saber
   *quando* o pedido foi confirmado, quem cancelou e por quê. Um log de eventos
   dá isso de graça; um campo sobrescrito destrói a informação.
3. **Telefone como identidade do cliente.** No Brasil, é o que existe. E-mail
   é opcional; senha, um obstáculo. Login por código no WhatsApp resolve.

---

## 4. Ciclo de vida do pedido

Hoje o pedido é uma mensagem. No SaaS ele precisa ser uma entidade com estados:

```
  RASCUNHO ──► AGUARDANDO_CONFIRMACAO ──► CONFIRMADO ──► EM_PRODUCAO
  (carrinho)         (loja avalia)         (aceito)      (dia da entrega)
                            │                                  │
                            ▼                                  ▼
                       CANCELADO ◄────────────────────  SAIU_PARA_ENTREGA
                                                               │
                                                               ▼
                                                            ENTREGUE
```

Cada transição dispara notificação para cliente e loja. Duas decisões:

- **Confirmação automática ou manual?** Para produção sob encomenda, manual
  faz sentido no começo (a loja checa se consegue produzir). Automática exige
  controle de capacidade — ver adiante.
- **Cancelamento até quando?** O natural é: até o corte de horário. Depois
  disso o insumo já foi comprado.

---

## 5. Funcionalidades por fase

### Fase 1 — Multi-loja com painel (o MVP vendável)

Objetivo: uma loja consegue se cadastrar, montar cardápio e receber pedidos
sem que você toque em código.

- Cadastro de loja com slug e domínio (`verdi.seuapp.com.br`)
- Painel: categorias, itens, preços, fotos, esgotado, ordem
- Configuração de operação: dias, horários, fuso, antecedência
- Tema por loja (cores e logo, aplicados nas variáveis CSS já existentes)
- Site público gerado a partir do banco
- Pedido ainda finalizado no WhatsApp, mas **registrado** antes de sair
- Painel de pedidos recebidos

**O que isso destrava:** cobrar mensalidade. É o menor produto que já vale
dinheiro.

### Fase 2 — Taxa de entrega e cliente

- Zonas de entrega por bairro, com taxa e pedido mínimo
- Cálculo automático da taxa (fim do "a combinar")
- Cadastro de cliente por telefone, com endereços salvos
- Repetir último pedido em um toque

**O que isso destrava:** conversão. Some a ida e volta do "quanto fica a
entrega" e a redigitação de endereço — as duas maiores fricções de hoje.

### Fase 3 — Pedido de verdade

- Status e notificações automáticas (WhatsApp Business API)
- Painel operacional: fila do dia, lista de separação, impressão
- Cancelamento e alteração com regras
- Relatórios: faturamento, itens mais vendidos, recorrência

**O que isso destrava:** a loja para de operar no olho e passa a operar por
processo. É aqui que o produto vira indispensável.

### Fase 4 — Pagamento

- PIX com confirmação automática, cartão via gateway
- Split de pagamento (sua comissão retida na origem)
- Conciliação e repasse

**O que isso destrava:** cobrar por pedido, não só mensalidade. E muda a
economia do produto.

### Fase 5 — Escala e marketplace

- Capacidade de produção por dia (parar de aceitar quando encher)
- Assinatura recorrente ("toda terça, a mesma cesta")
- App do entregador, roteirização
- Vitrine multi-loja por região
- Cupons, programa de fidelidade

---

## 6. Generalizar o motor de prazos

A regra da Verdi é um caso particular. Outras lojas precisam de outros modelos.
O motor deve aceitar uma **estratégia** por loja:

| Estratégia | Exemplo | Parâmetro |
|---|---|---|
| Próximo dia de operação | Verdi | corte de horário |
| Mesmo dia | padaria | corte + tempo de preparo |
| Dias fixos da semana | cesta orgânica | dias de entrega + antecedência |
| Agendamento livre | bolo de festa | antecedência mínima em horas |
| Imediato | delivery pronto | tempo estimado |

```
calcularEntregas(loja, agora) → JanelaEntrega[]
  cada janela: { data, inicio, fim, prazo_pedido, capacidade_restante }
```

O algoritmo atual já é uma implementação da primeira estratégia. As demais
entram como variações da mesma interface — e a suíte de testes deve cobrir os
casos de borda de cada uma, porque é exatamente aí que mora o erro que ninguém
percebe (a sexta à tarde da Verdi é um exemplo real disso).

---

## 7. Multi-tenancy: como isolar

Três escolhas a fazer cedo:

1. **Banco compartilhado com `loja_id` em toda tabela.** Simples e barato.
   Exige disciplina: toda consulta filtra por loja, de preferência por política
   no próprio banco (RLS), não só por cuidado do programador.
2. **Domínio.** Subdomínio por padrão, domínio próprio como recurso pago. A
   resolução do tenant vem do host da requisição.
3. **Arquivos.** Imagens em bucket com prefixo por loja, servidas por CDN.
   O pipeline de recorte que já existe vira função de upload.

---

## 8. Stack sugerida

Escolhas conservadoras, priorizando velocidade de entrega e baixo custo fixo:

| Camada | Sugestão | Por quê |
|---|---|---|
| Banco | PostgreSQL (Supabase/Neon) | Relacional resolve bem; RLS ajuda no isolamento |
| Backend | Node ou Python, API REST | Mesma linguagem do que já existe, no caso do Node |
| Site público | Next.js ou Astro, renderizado no servidor | Resolve o SEO que hoje falta |
| Painel | SPA simples atrás de login | Não precisa ser bonito, precisa ser rápido |
| Arquivos | S3/R2 + CDN | Barato e previsível |
| Mensagens | WhatsApp Business API (via provedor) | Onde o cliente brasileiro já está |
| Pagamento | Gateway com split | Não construa isso |
| Filas | Fila simples para notificação e conciliação | Evita perder mensagem |

**O front-end público deve ser renderizado no servidor.** É a correção da
principal fragilidade atual: hoje, sem JavaScript, o cardápio não existe — e
buscador nenhum indexa "salada pronta em Porto Velho".

---

## 9. Precificação do SaaS

Referências para o caminho A:

| Plano | Ideia | Faixa |
|---|---|---|
| Grátis | Até 30 pedidos/mês, subdomínio, marca do produto | R$ 0 |
| Essencial | Ilimitado, domínio próprio, sem marca | R$ 79–149/mês |
| Pro | Pagamento online, relatórios, assinatura recorrente | R$ 249–399/mês |
| Por pedido | Alternativa: 1,5–3% em vez de mensalidade | — |

O plano grátis existe para reduzir o atrito de venda: o lojista monta o
cardápio antes de decidir. E o teto de pedidos é um gatilho natural de upgrade
— quem passa de 30 já está ganhando dinheiro com a ferramenta.

---

## 10. Métricas que importam

**Da loja** (mostrar no painel — é o que faz ela renovar):
faturamento por período, ticket médio, itens mais vendidos, taxa de recompra,
pedidos perdidos por fechamento de prazo.

**Do produto** (suas): lojas ativas, GMV, retenção mensal, tempo até o primeiro
pedido de uma loja nova, e — a mais reveladora — **percentual de carrinhos
montados que viram pedido enviado**. Queda aí significa que algo no fluxo
quebrou.

---

## 11. Riscos e armadilhas

| Risco | Mitigação |
|---|---|
| **Cada loja quer uma regra diferente de prazo** | Estratégias fechadas, não campo livre. Diga não ao caso muito específico. |
| **Virar agência disfarçada de SaaS** | Se cada cliente exige customização, não é produto. Tema, sim; código sob medida, não. |
| **WhatsApp API é cara e burocrática** | Comece com link `wa.me` (como hoje) e migre quando o volume justificar. |
| **Fuso e horário de verão** | Já resolvido aqui; mantenha teste automatizado para isso. |
| **Preço mudando e quebrando histórico** | Snapshot no pedido, sempre. |
| **Marketplace sem demanda** | Não comece por aí. |
| **Regressão silenciosa** | O teste que existe já provou seu valor: uma função apagada derrubou metade da página sem erro visível. Amplie a suíte junto com o produto. |

---

## 12. Ordem de ataque sugerida

1. Modelar banco multi-loja e migrar a Verdi para ele — com a landing page
   atual consumindo a API. **A Verdi vira o primeiro cliente e o laboratório.**
2. Construir o painel de cardápio. É o que o lojista usa todo dia.
3. Registrar o pedido antes de mandar para o WhatsApp. Mesmo sem mudar o
   fluxo do cliente, você passa a ter dados.
4. Zonas de entrega e cálculo de taxa. Maior ganho de conversão por esforço.
5. Cadastro de cliente e "repetir pedido". Segundo maior.
6. Só então: pagamento, status automatizado, marketplace.

O princípio: **cada passo deve deixar a Verdi melhor do que estava.** Se um
passo não melhora a operação de uma loja real, ele provavelmente é sobre-
engenharia disfarçada de plataforma.
