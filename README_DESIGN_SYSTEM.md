# 🌿 Sistema de Design da Verdi

Este é o sistema de design profissional e durável da landing page Verdi. Ele garante **consistência, escalabilidade e qualidade** em todo o projeto.

## 📚 Documentação

Este projeto possui três camadas de documentação:

### 1. **Guia Visual Interativo** (`estilo.html`)
- 🎨 **Paleta de cores** com previsualizações ao vivo
- ⚙️ **Componentes** com exemplos funcionais
- 🔧 **Variáveis CSS** documentadas
- 📋 **Princípios de design** e guia de contribuição

**Como acessar:** Abra `estilo.html` no navegador para ver a paleta completa com exemplos visuais.

### 2. **Documentação Técnica** (`DESIGN_SYSTEM.md`)
- 📐 Estrutura geral (largura, altura, padding, etc.)
- 🎨 Paleta de cores organizada por contexto
- 🎯 Componentes e seus estilos específicos
- 📝 Tipografia e escala
- 📂 Como atualizar o sistema

### 3. **Código Fonte** (`css/styles.css`)
- Todas as cores em **variáveis CSS** centralizadas
- Comentários explicativos no `:root`
- Componentes bem organizados com nomes BEM

---

## 🎯 Princípios

### 1. **Uma Fonte de Verdade**
Todas as cores, espaçamentos e dimensões estão definidas **uma única vez** em variáveis CSS. Quando uma cor muda, você muda em um lugar e o site todo reflete a mudança.

### 2. **Continuidade Visual**
O formulário de entrega (painel esquerdo) e o quadro de resumo (painel direito) formam uma **unidade contínua visual** — mesma paleta creme/branco, criando a impressão de uma única tela.

### 3. **Escalabilidade**
Novos componentes reutilizam variáveis existentes. Não há hardcoding de cores. Tudo é modular e reutilizável.

### 4. **Acessibilidade**
Contrastes WCAG AA mínimos em tudo. Cores não são o único meio de comunicação — use também texto, ícones, etc.

---

## 🔧 Como Usar

### Adicionar Uma Nova Cor

1. **Defina a variável** em `css/styles.css` no `:root`:
   ```css
   --minha-cor: #XXXXXX;  /* Descrição breve */
   ```

2. **Use em componentes**:
   ```css
   .meu-botao {
     background: var(--minha-cor);
   }
   ```

3. **Documente em dois lugares**:
   - `DESIGN_SYSTEM.md` — adicione à tabela de cores
   - `estilo.html` — adicione um preview visual

### Criar Um Novo Componente

1. **Nomeie com BEM**:
   ```css
   .componente__elemento--modificador {
     /* usar variáveis CSS */
   }
   ```

2. **Reutilize variáveis**:
   ```css
   .meu-card {
     background: var(--branco);
     border: 1px solid var(--linha);
     border-radius: var(--raio);
     padding: var(--pad);
     color: var(--tinta);
     transition: all var(--transicao);
   }
   ```

3. **Documente**:
   - Comente o propósito do componente
   - Adicione exemplo em `estilo.html` se for componente visual

### Alterar a Paleta Inteira

Se a marca precisar de uma paleta nova (novo verde, novo creme, etc.):

1. Atualize as variáveis no `:root` de `css/styles.css`
2. Atualize `DESIGN_SYSTEM.md`
3. Atualize `estilo.html` — os colors boxes vão refletir automaticamente!

---

## 📂 Arquivos

| Arquivo | Propósito |
|---|---|
| `css/styles.css` | Implementação CSS com variáveis centralizadas |
| `DESIGN_SYSTEM.md` | Documentação técnica — cores, componentes, uso |
| `estilo.html` | Guia visual interativo — abra no navegador |
| `README_DESIGN_SYSTEM.md` | Este arquivo — como usar o sistema |

---

## 🎨 Paleta Rápida

### Verdes (Marca)
```
--verde-noite:    #22400A  → Títulos, painéis
--verde-mata:     #4A6A18  → Textos principais
--verde-broto:    #A9BE55  → Acentos, foco
--verde-claro:    #D9E3AE  → Rótulos
```

### Tema Claro (Formulário)
```
--cream-light:    #FFFBF0  → Painel de entrada
--cream-medium:   #F9F5F0  → Botões de data
--branco:         #FFFFFF  → Inputs
--brown-border:   #D4C4B0  → Bordas, hover
```

### Textos
```
--tinta:          #2B3A1B  → Texto principal
--tinta-suave:    #5E6B4C  → Texto secundário
--brown-light:    #B5A898  → Placeholder
```

---

## ✅ Checklist para Novo Desenvolvedor

Se você é novo no projeto, certifique-se de:

- [ ] Abrir `estilo.html` no navegador e explorar a paleta
- [ ] Ler `DESIGN_SYSTEM.md` para entender componentes
- [ ] Sempre usar **variáveis CSS**, nunca hardcode cores
- [ ] Usar **nomes BEM** para classes
- [ ] Testar **acessibilidade** (contrastes, foco visível)
- [ ] Documentar novos componentes em `DESIGN_SYSTEM.md`

---

## 🚀 Manutenção

### Quando a Marca Muda
- ✅ Mude as cores no `:root` de `css/styles.css`
- ✅ Atualize `DESIGN_SYSTEM.md`
- ✅ O `estilo.html` reflete automaticamente!

### Quando Cria Um Novo Componente
- ✅ Declare em `css/styles.css`
- ✅ Use nomes BEM: `.componente__elemento`
- ✅ Use variáveis CSS sempre
- ✅ Documente em `DESIGN_SYSTEM.md`
- ✅ Adicione preview em `estilo.html`

### Quando Descobre Um Bug de Estilo
- ✅ Cheque se é um problema de **variável** ou de **lógica CSS**
- ✅ Se for variável, mude uma vez no `:root`
- ✅ Se for componente, atualize no lugar certo em `styles.css`
- ✅ Confirme que outros componentes não quebram

---

## 🎓 Exemplo Prático

### Tarefa: Estilizar um novo botão "Confirmar"

**Passo 1:** Abra `estilo.html` e veja a paleta — escolha cores.

**Passo 2:** Em `css/styles.css`, declare o componente:
```css
.btn-confirmar {
  background: var(--verde-broto);
  color: var(--verde-noite);
  border: none;
  border-radius: var(--raio);
  padding: 0.8rem 1.6rem;
  font-family: var(--corpo);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicao);
}

.btn-confirmar:hover {
  background: var(--verde-claro);
  color: var(--tinta);
}

.btn-confirmar:focus-visible {
  outline: 3px solid var(--verde-broto);
  outline-offset: 3px;
}
```

**Passo 3:** Adicione em `DESIGN_SYSTEM.md`:
```
### Botão Confirmar (`.btn-confirmar`)
- **Fundo:** `var(--verde-broto)`
- **Texto:** `var(--verde-noite)`
- **Hover:** `var(--verde-claro)`
- **Uso:** Confirmações, submissão de formulário
```

**Passo 4:** Adicione preview em `estilo.html` na seção de componentes.

**Pronto!** Seu botão usa variáveis, é documentado e escalável.

---

## 📞 Dúvidas?

Se não tiver certeza:
1. Abra `estilo.html` — veja os exemplos
2. Leia `DESIGN_SYSTEM.md` — procure o componente similar
3. Procure em `css/styles.css` — veja como foi feito

---

**Última atualização:** 2026-08-18  
**Mantenha este sistema limpo, consistente e escalável.** 🌿
