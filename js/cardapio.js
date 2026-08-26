/* ═══════════════════════════════════════════════════
   VERDI — cardápio
   Este é o único arquivo que precisa ser mexido para
   mudar preço, nome, descrição ou tirar um item de linha.

   Cada item:
     id     — identificador único, sem espaço nem acento
     nome   — como aparece na lista
     desc   — os ingredientes (opcional)
     preco  — em reais, com ponto decimal
     foto   — arquivo em /img (opcional)
     esgotado: true — some da lista sem apagar o cadastro
   ═══════════════════════════════════════════════════ */

const CARDAPIO = [

  {
    id: 'kits',
    nome: 'Kits de receita',
    resumo: 'Todos os ingredientes de um prato, já na medida.',
    itens: [
      { id: 'kit-sopao', nome: 'Kit sopão 400g', desc: 'Abóbora, chuchu e mandioca', preco: 9.50, foto: 'img/item-kit-sopao.jpg' },
      { id: 'kit-sopinha', nome: 'Kit sopinha 400g', desc: 'Cenoura, abóbora e chuchu', preco: 9.50, foto: 'img/item-kit-sopinha.jpg' },
      { id: 'kit-refogado', nome: 'Kit para refogado 400g', desc: 'Chuchu, cenoura, batata-inglesa e abobrinha', preco: 9.50, foto: 'img/item-kit-refogado.jpg' },
      { id: 'kit-seleta', nome: 'Kit seleta 400g', desc: 'Cenoura, chuchu e vagem', preco: 9.50, foto: 'img/item-kit-seleta.jpg' },
      { id: 'kit-maionese', nome: 'Kit maionese 400g', desc: 'Batata-inglesa, cenoura e vagem', preco: 9.50, foto: 'img/item-kit-maionese.jpg' },
      { id: 'kit-caldo-verde', nome: 'Kit caldo verde 400g', desc: 'Batata-inglesa e couve', preco: 9.50, foto: 'img/item-kit-caldo-verde.jpg' },
      { id: 'kit-forno', nome: 'Kit forno / air fryer 400g', desc: 'Abóbora, abobrinha, batata-doce, brócolis e tomatinho', preco: 11.50, foto: 'img/item-kit-forno.jpg' },
      { id: 'kit-yakisoba', nome: 'Kit yakisoba 400g', desc: 'Repolho roxo, acelga, cenoura e brócolis', preco: 13.50, foto: 'img/item-kit-yakisoba.jpg' },
      { id: 'kit-arroz-grega', nome: 'Kit arroz à grega 400g', desc: 'Cenoura e pimentões verde, vermelho e amarelo', preco: 13.50, foto: 'img/item-kit-arroz-grega.jpg' },
      { id: 'kit-papinha', nome: 'Kit papinha 750g', desc: 'Pacote com 5 unidades de 150g', preco: 24.50, foto: 'img/item-kit-papinha.jpg' },
      { id: 'kit-legumes-forno-chuchu', nome: 'Kit legumes ao forno com chuchu 500g', desc: 'Chuchu, abobrinha, cenoura, brócolis e tomate cereja', preco: 15.00, foto: 'img/item-kit-legumes-forno-chuchu.jpg' },
      { id: 'kit-legumes-forno-abobora', nome: 'Kit legumes ao forno com abóbora 500g', desc: 'Abóbora, abobrinha, cenoura, brócolis e tomatinhos', preco: 15.00, foto: 'img/item-kit-legumes-forno-abobora.jpg' },
      { id: 'batata-rustica', nome: 'Batata rústica 400g', desc: 'Batata-Monalisa levemente temperada com ervas finas e páprica', preco: 9.50, foto: 'img/item-batata-rustica.jpg' },
      { id: 'mix-legumes-temperados', nome: 'Mix de legumes temperados 400g', desc: 'Abóbora, cenoura, batata-doce e brócolis', preco: 12.20, foto: 'img/item-mix-legumes-temperados.jpg' },
    ]
  },

  {
    id: 'legumes',
    nome: 'Legumes e raízes',
    resumo: 'Descascados e cortados, prontos para a panela.',
    itens: [
      { id: 'abobrinha', nome: 'Abobrinha 400g', preco: 9.50, foto: 'img/item-abobrinha.jpg' },
      { id: 'chuchu', nome: 'Chuchu 250g', preco: 6.50, foto: 'img/item-chuchu.jpg' },
      { id: 'cebola-rodelas', nome: 'Cebola rodelas 200g', preco: 9.50, foto: 'img/item-cebola-rodelas.jpg' },
      { id: 'batata-doce', nome: 'Batata-doce rodelas 400g', preco: 9.50, foto: 'img/item-batata-doce.jpg' },
      { id: 'mandioca', nome: 'Mandioca 1kg', preco: 9.50, foto: 'img/item-mandioca.jpg' },
      { id: 'abobora-cabotia', nome: 'Abóbora cabotia em cubos 400g', preco: 8.50, foto: 'img/item-abobora-cabotia.jpg' },
      { id: 'vinagrete', nome: 'Vinagrete 250g', desc: 'Tomate, cebola e cheiro-verde', preco: 0, foto: 'img/item-vinagrete.jpg', esgotado: true }
    ]
  },

  {
    id: 'ralados',
    nome: 'Ralados e mixes',
    resumo: 'O corte que toma tempo e suja a cozinha, já feito.',
    itens: [
      { id: 'mix-2-cores', nome: 'Mix 2 cores 250g', preco: 6.50, foto: 'img/item-mix-2-cores.jpg' },
      { id: 'mix-3-cores', nome: 'Mix 3 cores 250g', preco: 6.50, foto: 'img/item-mix-3-cores.jpg' },
      { id: 'mix-4-cores', nome: 'Mix 4 cores 250g', preco: 6.50, foto: 'img/item-mix-4-cores.jpg' },
      { id: 'mix-5-cores', nome: 'Mix 5 cores 250g', preco: 6.50, foto: 'img/item-mix-5-cores.jpg' },
      { id: 'mix-cenoura-beterraba', nome: 'Mix cenoura e beterraba 250g', preco: 6.50, foto: 'img/item-mix-cenoura-beterraba.jpg' },
      { id: 'mix-repolho-cenoura', nome: 'Mix repolho verde e cenoura 250g', preco: 6.50, foto: 'img/item-mix-repolho-cenoura.jpg' },
      { id: 'mix-tradicional', nome: 'Mix tradicional 400g', desc: 'Cenoura, couve-flor e brócolis', preco: 14.50, foto: 'img/item-mix-tradicional.jpg' },
      { id: 'cenoura-ralada', nome: 'Cenoura ralada 250g', preco: 6.50, foto: 'img/item-cenoura-ralada.jpg' },
      { id: 'beterraba', nome: 'Beterraba 250g', preco: 6.50, foto: 'img/item-beterraba.jpg' },
      { id: 'repolho-verde', nome: 'Repolho verde 250g', preco: 6.50, foto: 'img/item-repolho-verde.jpg' },
      { id: 'repolho-roxo', nome: 'Repolho roxo 250g', preco: 9.50, foto: 'img/item-repolho-roxo.jpg' },
      { id: 'repolho-roxo-verde', nome: 'Repolho roxo e repolho verde 250g', preco: 8.50, foto: 'img/item-repolho-roxo-verde.jpg' },
      { id: 'macarrao-abobrinha', nome: 'Macarrão de abobrinha 250g', preco: 6.00, foto: 'img/item-macarrao-abobrinha.jpg' },
    ]
  },

  {
    id: 'saladas',
    nome: 'Saladas prontas',
    resumo: 'Montadas no pote, higienizadas e prontas para o garfo.',
    itens: [
      { id: 'salada-tradicional', nome: 'Salada tradicional 250g', desc: 'Couve, tomate e pepino', preco: 11.50, foto: 'img/item-salada-tradicional.jpg' },
      { id: 'salada-tradicional-2', nome: 'Salada tradicional 2 250g', desc: 'Alface americana, pepino e tomatinhos', preco: 11.50, foto: 'img/item-salada-tradicional-2.jpg' },
      { id: 'salada-campestre', nome: 'Salada campestre 250g', desc: 'Alface e pepino', preco: 11.50, foto: 'img/item-salada-campestre.jpg' },
      { id: 'salada-mix', nome: 'Salada mix 250g', desc: 'Alface crespa, rúcula, cenoura e tomatinhos', preco: 11.50, foto: 'img/item-salada-mix.jpg' },
      { id: 'salada-colorida', nome: 'Salada colorida 250g', desc: 'Alface crespa, cenoura e tomatinhos', preco: 11.50, foto: 'img/item-salada-colorida.jpg' },
      { id: 'salada-gourmet', nome: 'Salada gourmet 250g', desc: 'Alface crespa, rúcula, pepino e tomatinhos', preco: 11.50, foto: 'img/item-salada-gourmet.jpg' },
      { id: 'salada-mista', nome: 'Salada mista 250g', desc: 'Alface americana, beterraba, rúcula e tomatinhos', preco: 11.50, foto: 'img/item-salada-mista.jpg' },
    ]
  },

  {
    id: 'folhas',
    nome: 'Folhas e temperos',
    resumo: 'Lavadas em etapas, sanitizadas e secas antes de embalar.',
    itens: [
      { id: 'alface-crespa', nome: 'Alface crespa 150g', preco: 8.50, foto: 'img/item-alface-crespa.jpg' },
      { id: 'rucula', nome: 'Rúcula 150g', preco: 10.00, foto: 'img/item-rucula.jpg' },
      { id: 'couve', nome: 'Couve 150g', preco: 6.00, foto: 'img/item-couve.jpg' },
      { id: 'cheiro-verde', nome: 'Cheiro-verde 60g', preco: 5.00, foto: 'img/item-cheiro-verde.jpg' },
    ]
  },

  {
    id: 'blends',
    nome: 'Blends de frutas',
    resumo: 'Congelados em pedaços, sem água, sem açúcar e sem conservantes. É só bater.',
    itens: [
      { id: 'blend-abacaxi-hortela', nome: 'Abacaxi com hortelã 150g', preco: 4.50, foto: 'img/item-blend-abacaxi-hortela.jpg' },
      { id: 'blend-abacaxi-morango', nome: 'Abacaxi e morango 150g', preco: 5.50, foto: 'img/item-blend-abacaxi-morango.jpg' },
      { id: 'blend-abacaxi-morango-maracuja', nome: 'Abacaxi, morango e maracujá 150g', preco: 5.50, foto: 'img/item-blend-abacaxi-morango-maracuja.jpg' },
      { id: 'blend-abacaxi-couve-hortela-gengibre', nome: 'Abacaxi, couve, hortelã e gengibre 150g', preco: 5.50, foto: 'img/item-blend-abacaxi-couve-hortela-gengibre.jpg' },
      { id: 'blend-manga-abacaxi-maracuja', nome: 'Manga, abacaxi e maracujá 150g', preco: 5.50, foto: 'img/item-blend-manga-abacaxi-maracuja.jpg' },
      { id: 'blend-abacate-banana-chia', nome: 'Abacate, banana e chia 150g', preco: 5.50, foto: 'img/item-blend-abacate-banana-chia.jpg' }
    ]
  },

  {
    id: 'frutas',
    nome: 'Frutas frescas',
    resumo: 'Cortadas na hora, prontas para comer.',
    itens: [
      { id: 'fruta-melancia', nome: 'Melancia 220g', preco: 6.60, foto: 'img/item-fruta-melancia.jpg' },
      { id: 'fruta-manga', nome: 'Manga 220g', preco: 8.60, foto: 'img/item-fruta-manga.jpg' },
      { id: 'fruta-duo-uvas', nome: 'Duo uvas sem sementes 220g', preco: 12.60, foto: 'img/item-fruta-duo-uvas.jpg' },
      { id: 'fruta-melao', nome: 'Melão 220g', preco: 7.60, foto: 'img/item-fruta-melao.jpg' },
    ]
  },

  {
    id: 'overnight',
    nome: 'Overnight',
    resumo: 'Pote pronto de aveia, é só abrir a tampa.',
    itens: [
      { id: 'overnight-maca', nome: 'Overnight de maçã', desc: 'Chia, aveia, maçã levemente cozida com canela, iogurte e mel', preco: 13.50, foto: 'img/item-overnight-maca.jpg' },
      { id: 'overnight-banana-uva', nome: 'Overnight banana e uva vitória', desc: 'Chia, aveia, banana, uva, iogurte e mel', preco: 13.50, foto: 'img/item-overnight-banana-uva.jpg' },
    ]
  }

];
