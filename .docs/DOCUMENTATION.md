# Documentação de Layout e Estilos

Este documento descreve as principais diretrizes de layout, rotas e estilos do projeto, servindo como referência para o desenvolvimento da nova versão.

## 1. Rotas da Aplicação

A estrutura de navegação principal é definida em `src/App.tsx`. As rotas são:

- `/`: Página inicial
- `/auth`: Página de autenticação
- `/dashboard`: Painel principal
- `/admin-dashboard`: Painel administrativo
- `/conversations`: Página de conversas
- `/analytics`: Página de análise de dados
- `/templates`: Página de modelos
- `/knowledge`: Página de base de conhecimento
- `/settings`: Página de configurações
- `*`: Página não encontrada (catch-all)

## 2. Padronização do Layout

A padronização do layout, definida em `src/components/DashboardLayout.tsx`, segue um design de painel de controle (dashboard).

### Estrutura Geral

- **Layout de Duas Colunas:** A interface é dividida em uma barra lateral de navegação (`<aside>`) e uma área de conteúdo principal (`<main>`).
- **Barra Lateral Fixa:** A barra lateral tem uma largura fixa de `w-64` (256px) e permanece visível em telas de desktop (`lg` e maiores).
- **Conteúdo Fluido:** A área de conteúdo principal ocupa o espaço restante da tela.

### Responsividade

- **Desktop (`lg:`):** A barra lateral é sempre visível, e o conteúdo principal tem um `padding-left` (`lg:pl-64`) para evitar sobreposição.
- **Mobile (telas menores que `lg`):** A barra lateral fica oculta por padrão e pode ser ativada por um botão de menu. Quando aberta, ela desliza sobre o conteúdo e um overlay escurecido é exibido no fundo.

### Componentes do Layout

- **Cabeçalho da Barra Lateral:** Contém o logo da aplicação.
- **Navegação Principal:** Lista vertical de links. O link ativo recebe um estilo de destaque.
- **Seção do Usuário:** Agrupa informações e ações do usuário (avatar, nome, troca de tema, logout).
- **Área de Conteúdo:** Possui um `padding` interno (`p-4 lg:p-8`) para o conteúdo das páginas.

## 3. Sistema de Cores (Design System)

O sistema de cores é definido em `src/index.css` utilizando variáveis CSS com formato HSL.

### Tema Claro (Padrão)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 220 14% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 262 83% 58%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 221 83% 53%;
  --radius: 0.75rem;
}
```

### Tema Escuro

```css
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 13%;
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 13%;
  --popover-foreground: 210 40% 98%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --secondary: 222 47% 15%;
  --secondary-foreground: 210 40% 98%;
  --muted: 222 47% 15%;
  --muted-foreground: 215 16% 65%;
  --accent: 262 83% 58%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 222 47% 20%;
  --input: 222 47% 20%;
  --ring: 221 83% 53%;
}