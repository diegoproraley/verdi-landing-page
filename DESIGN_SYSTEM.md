# 🌿 VERDI — Sistema de Design

Documentação do sistema de design, paleta de cores e componentes da landing page Verdi.

---

## 📐 Estrutura Geral

| Propriedade | Valor | Descrição |
|---|---|---|
| **Largura máxima** | 1200px | `--env` |
| **Altura do cabeçalho** | 104px | `--barra` |
| **Padding padrão** | 1.8rem | `--pad` |
| **Border radius** | 18px / 32px | `--raio` / `--raio-g` |
| **Transição padrão** | 0.35s ease | `--transicao` |

---

## 🎨 Paleta de Cores

### Verdes (Primários)
- **Verde Noite** `#22400A` — Título, painel escuro
- **Verde Mata** `#4A6A18` — Textos e links primários
- **Verde Broto** `#A9BE55` — Acentos, hover, foco
- **Verde Claro** `#D9E3AE` — Textos secundários, rótulos

### Neutros (Tema Claro)
- **Branco** `#FFFFFF` — Fundo, inputs, cards
- **Creme** `#F9EDDD` — Fundo de seções
- **Tinta** `#2B3A1B` — Texto principal
- **Tinta Suave** `#5E6B4C` — Texto secundário
- **Linha** `rgba(34,64,10,.16)` — Bordas sutis

### Destaque
- **Coral** `#E8695C` — Apenas para urgência/erro

---

## 🎯 Componentes & Contextos

### Formulário de Entrega (`.painel__campos`)
**Paleta:** Creme + Branco + Marrom
- **Fundo:** `#FFFBF0` (creme muito claro)
- **Borda:** `#F5EFE0` (sutil, marrom claro)
- **Inputs:** `#FFFFFF` branco puro
  - Borda: `#E8DDD0`
  - Placeholder: `#B5A898` (marrom suave)
  - Focus: Verde-mata + anel `rgba(169,190,85,.15)`

### Botões de Data (`.entrega-op`)
- **Fundo padrão:** `#F9F5F0`
- **Borda:** `#E8DDD0`
- **Texto forte:** Verde-noite (marrom escuro)
- **Texto fraco:** `#8B7B6E` (marrom médio)
- **Hover:** `#F5F0E8` fundo, `#D4C4B0` borda
- **Marcado:** Verde-broto (fundo) + Verde-noite (texto)

### Seletor Expandido (`.entrega-op--escolher`)
- **Fundo:** `#F0EFE5`
- **Borda:** `#D4C4B0`
- **Hover:** `#EAE5D8` fundo, `#C0AE9E` borda

---

## 📝 Tipografia

| Uso | Fonte | Tamanho | Peso | Cor |
|---|---|---|---|---|
| **Rótulo** | DM Mono | 0.72rem | 400 | Verde-mata |
| **Título** | Bricolage | 1.9–3.1rem | 800 | Verde-noite |
| **Corpo** | Instrument Sans | 1rem | 400 | Tinta |
| **Secundário** | Instrument Sans | 0.94rem | 400 | Tinta-suave |

---

## ✨ Princípios

1. **Continuidade Visual** — O formulário de entrega e o quadro de resumo (items) formam uma unidade contínua (mesma paleta creme/branco)
2. **Contraste** — Texto escuro sobre fundo claro; fundo claro sobre escuro
3. **Hierarquia** — Tamanhos e cores definem importância
4. **Acessibilidade** — Ratios de contraste WCAG AA mínimo em tudo
5. **Modularidade** — Componentes reutilizáveis, variáveis centralizadas

---

## 🔧 Como Usar

### Adicionar Nova Cor
1. Defina no `:root` de `css/styles.css`:
   ```css
   --nova-cor: #XXXXXX; /* descrição */
   ```
2. Documente aqui neste arquivo
3. Use em componentes: `color: var(--nova-cor);`

### Criar Novo Componente
1. Use nomes descritivos: `.componente__elemento` (BEM)
2. Reutilize variáveis CSS, não hardcode cores
3. Documente em DESIGN_SYSTEM.md
4. Inclua no guia de estilos visual (`estilo.html`)

### Atualizar Paleta
Se mudar uma cor, atualize:
- [ ] `css/styles.css` (variável)
- [ ] `DESIGN_SYSTEM.md` (documentação)
- [ ] `estilo.html` (preview visual)

---

## 📂 Arquivos Relacionados

- `css/styles.css` — Implementação
- `estilo.html` — Guia visual interativo
- `DESIGN_SYSTEM.md` — Este arquivo

---

**Última atualização:** 2026-08-18  
**Responsável:** Design System Verdi
