# Documentação de Implementação - AI Agent Frontend

## 📋 Sumário

Este documento descreve todas as telas implementadas para o sistema AI Agent, incluindo componentes, rotas, serviços e modelos de dados.

---

## ✅ Telas Implementadas

### 1. **Sidebar Compartilhada**
- **Localização**: `src/app/Components/sidebar/`
- **Arquivos**: `sidebar.component.ts`, `.html`, `.scss`
- **Recursos**:
  - Menu de navegação com ícones do Material Icons
  - Avatar do usuário com iniciais
  - Toggle de tema claro/escuro
  - Botão de logout
  - Filtro de menu items por permissão (admin only)
  - Responsivo (collapse em mobile)

### 2. **Dashboard (Usuário Comum)** - `/dashboard`
- **Localização**: `src/app/Pages/dashboard/`
- **Arquivos**: `dashboard.component.ts`, `.html`, `.scss`
- **Recursos**:
  - 4 Cards de métricas principais:
    - Conversas Ativas
    - Mensagens Hoje
    - Tempo Médio de Resposta
    - Satisfação do Cliente
  - Gráfico de Volume de Mensagens (placeholder)
  - Gráfico de Categorias de Perguntas (placeholder)
  - Lista de Últimas Conversas
  - Análise de Sentimentos (gráfico pizza placeholder)
  - Loading state
  - Tema claro/escuro

### 3. **Dashboard Administrativa** - `/admin-dashboard`
- **Localização**: `src/app/Pages/admin-dashboard/`
- **Arquivos**: `admin-dashboard.component.ts`, `.html`, `.scss`
- **Recursos**:
  - 6 Cards de métricas administrativas:
    - Total de Clientes
    - Empresas Ativas
    - Mensagens Processadas
    - Receita Mensal
    - Taxa de Atividade
    - Crescimento
  - Gráfico de Crescimento da Plataforma (placeholder)
  - Gráfico de Volume Total de Mensagens (placeholder)
  - Análise por Segmento (placeholder)
  - Top 5 Clientes com badges de plano e rating
  - Saúde do Sistema (4 métricas: Uptime, Latência, Taxa de Erro, Satisfação)
  - Restrito apenas para administradores

### 4. **Conversas** - `/conversas`
- **Localização**: `src/app/Pages/conversas/`
- **Arquivos**: `conversas.component.ts`, `.html`, `.scss`
- **Recursos**:
  - Layout em 3 colunas:
    - Lista de conversas (esquerda)
    - Área de chat (centro)
    - Info do cliente (direita)
  - Busca de conversas
  - Status online/offline
  - Badge de mensagens não lidas
  - Área de chat com mensagens do usuário e IA
  - Input de mensagem com botão de enviar
  - Painel lateral com informações do cliente
  - Empty state quando nenhuma conversa está selecionada

### 5. **Análises Avançadas** - `/analises`
- **Localização**: `src/app/Pages/analises/`
- **Arquivos**: `analises.component.ts`, `.html`, `.scss`
- **Recursos**:
  - Sistema de tabs com 4 abas:
    - **Sentimentos**: Gráfico de área empilhada + 3 métricas
    - **Heatmap**: Mapa de calor de atividade
    - **Resolução**: Taxa de resolução (donut chart)
    - **Palavras-chave**: Word cloud
  - Navegação por tabs com ícones
  - Placeholders para integração com biblioteca de gráficos
  - Métricas complementares

### 6. **Templates de Respostas** - `/templates`
- **Localização**: `src/app/Pages/templates/`
- **Arquivos**: `templates.component.ts`, `.html`, `.scss`
- **Recursos**:
  - Botão "Novo Template" no header
  - Busca de templates
  - Filtros por categoria (Todos, Saudação, Produto, Informações, Despedida, Suporte)
  - Grid de templates cards com:
    - Título e categoria
    - Conteúdo do template
    - Botões: Usar, Editar, Excluir
  - Empty state quando não há templates
  - Sistema de categorias com badges coloridos

---

## 🛣️ Rotas Configuradas

### Rotas Públicas (com `deslogadoGuard`)
- `/` - Home
- `/auth` - Login e Cadastro
- `/validacao-2fa` - Validação 2FA
- `/cadastro-empresa` - Cadastro de Empresa

### Rotas Protegidas (com `logadoGuard`)
- `/dashboard` - Dashboard Usuário
- `/admin-dashboard` - Dashboard Administrativa
- `/conversas` - Conversas
- `/analises` - Análises Avançadas
- `/templates` - Templates de Respostas

### Rotas Pendentes (comentadas)
- `/base-conhecimento` - Base de Conhecimento
- `/configuracoes` - Configurações

---

## 🎨 Sistema de Temas

### Implementação
- **Toggle**: Botão na sidebar para alternar entre tema claro/escuro
- **Persistência**: Tema salvo no localStorage (`tema_preferido`)
- **Variáveis CSS**: Utiliza custom properties para cores dinâmicas
- **Aplicação**: Classe `.dark-theme` adicionada ao `documentElement`

### Variáveis CSS (arquivo `variable.scss`)
```scss
:root {
  --sidebar-bg: hsl(0, 0%, 100%);
  --text-primary: hsl(222, 47%, 11%);
  --text-secondary: hsl(215, 16%, 47%);
  --hover-bg: hsl(220, 14%, 96%);
  --border-color: hsl(220, 13%, 91%);
  --card-bg: hsl(0, 0%, 100%);
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-theme {
  /* Valores para tema escuro */
}
```

---

## 📦 Interfaces TypeScript

### Dashboard Models (`dashboard.model.ts`)
```typescript
- MetricCard
- ConversaRecente
- SentimentosData
- MetricCardAdmin
- TopCliente
- SystemHealth
- DashboardResponse
- AdminDashboardResponse
```

### Conversas Models (`conversas.model.ts`)
```typescript
- Conversa
- Mensagem
- TipoMensagem (type)
- StatusMensagem (type)
- MidiaInfo
- ClienteInfo
- EnviarMensagemRequest
- ListarConversasRequest
- ConversasResponse
- MensagensResponse
- EnviarMensagemResponse
```

### Templates Models (`templates.model.ts`)
```typescript
- Template
- CategoriaTemplate (type)
- CriarTemplateRequest
- AtualizarTemplateRequest
- ListarTemplatesRequest
- TemplatesResponse
- TemplateResponse
```

### Análises Models (`analises.model.ts`)
```typescript
- AnalisesSentimentos
- EvolucaoSentimento
- HeatmapAtividade
- TaxaResolucao
- PalavraChave
- MetricasAnalises
- AnalisesResponse
- AnalisesSentimentosResponse
- HeatmapResponse
- ResolucaoResponse
- PalavrasChaveResponse
```

---

## 🔌 Serviços API

### DashboardService (`dashboard.service.ts`)
```typescript
- obterDadosDashboard(): Promise<DashboardResponse>
- obterDadosAdminDashboard(): Promise<AdminDashboardResponse>
```

### ConversasService (`conversas.service.ts`)
```typescript
- listarConversas(request?: ListarConversasRequest): Promise<ConversasResponse>
- obterConversaPorId(conversaId: string): Promise<ClienteInfo>
- listarMensagens(conversaId: string): Promise<MensagensResponse>
- enviarMensagem(request: EnviarMensagemRequest): Promise<EnviarMensagemResponse>
```

### TemplatesService (`templates.service.ts`)
```typescript
- listarTemplates(request?: ListarTemplatesRequest): Promise<TemplatesResponse>
- obterTemplatePorId(templateId: string): Promise<Template>
- criarTemplate(request: CriarTemplateRequest): Promise<Template>
- atualizarTemplate(templateId: string, request: AtualizarTemplateRequest): Promise<Template>
- excluirTemplate(templateId: string): Promise<void>
```

### AnalisesService (`analises.service.ts`)
```typescript
- obterAnalises(dataInicio?: Date, dataFim?: Date): Promise<AnalisesResponse>
- obterSentimentos(dataInicio?: Date, dataFim?: Date): Promise<AnalisesSentimentosResponse>
- obterHeatmap(dataInicio?: Date, dataFim?: Date): Promise<HeatmapResponse>
- obterResolucao(dataInicio?: Date, dataFim?: Date): Promise<ResolucaoResponse>
- obterPalavrasChave(dataInicio?: Date, dataFim?: Date): Promise<PalavrasChaveResponse>
```

---

## 🔐 Guards

### logadoGuard
- **Propósito**: Proteger rotas autenticadas
- **Comportamento**: Redireciona para `/auth` se não estiver autenticado
- **Uso**: Aplicado em todas as rotas protegidas

### deslogadoGuard
- **Propósito**: Prevenir acesso a rotas públicas quando já autenticado
- **Comportamento**: Redireciona para `/dashboard` se já estiver autenticado
- **Uso**: Aplicado em rotas de login/cadastro

---

## 📁 Estrutura de Arquivos

```
Projeto/
├── src/
│   └── app/
│       ├── Components/
│       │   └── sidebar/
│       │       ├── sidebar.component.ts
│       │       ├── sidebar.component.html
│       │       └── sidebar.component.scss
│       ├── Pages/
│       │   ├── dashboard/
│       │   ├── admin-dashboard/
│       │   ├── conversas/
│       │   ├── analises/
│       │   └── templates/
│       ├── Service/
│       │   ├── Api/
│       │   │   ├── auth.service.ts
│       │   │   ├── dashboard.service.ts
│       │   │   ├── conversas.service.ts
│       │   │   ├── templates.service.ts
│       │   │   └── analises.service.ts
│       │   └── Local/
│       │       ├── local-storage.ts
│       │       └── spinner.ts
│       ├── Models/
│       │   ├── Entidades/
│       │   └── Objetos/
│       │       ├── auth.model.ts
│       │       ├── resposta.model.ts
│       │       ├── dashboard.model.ts
│       │       ├── conversas.model.ts
│       │       ├── templates.model.ts
│       │       └── analises.model.ts
│       ├── Guard/
│       │   ├── logado-guard.ts
│       │   └── deslogado-guard.ts
│       ├── Scss/
│       │   └── variable.scss
│       ├── app.routes.ts
│       └── app.config.ts
```

---

## 🎯 Próximos Passos

### Implementações Pendentes

1. **Integração com Biblioteca de Gráficos**
   - Instalar biblioteca (Chart.js, ApexCharts, ou ng2-charts)
   - Implementar gráficos reais nos dashboards
   - Substituir placeholders

2. **Telas Adicionais**
   - Base de Conhecimento (`/base-conhecimento`)
   - Configurações (`/configuracoes`)

3. **Funcionalidades**
   - Modal de criação/edição de templates
   - Upload de arquivos nas conversas
   - Filtros avançados de data nas análises
   - Exportação de relatórios
   - WebSocket/SignalR para atualizações em tempo real

4. **Melhorias**
   - Paginação nas listas
   - Infinite scroll
   - Skeleton loaders
   - Notificações toast/snackbar
   - Confirmações de ações destrutivas (excluir, etc.)

---

## 🚀 Como Usar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
ng serve

# Acessar em
http://localhost:4200
```

### Build

```bash
# Build de produção
ng build --configuration production

# Build de homologação
ng build --configuration homolog
```

### Integração com Backend

1. Configure as URLs da API em `src/app/Environment/Environment.ts`:
   ```typescript
   export const environment = {
     url_Client: 'https://seu-backend.com/api',
     url_ADMIN: 'https://seu-backend.com/api'
   };
   ```

2. Os serviços já estão preparados para:
   - Autenticação via JWT (Bearer token)
   - Headers automáticos com token
   - Tratamento de erros
   - Respostas tipadas

3. Endpoints esperados pelo frontend:
   - `/Dashboard` - GET
   - `/Dashboard/Admin` - GET
   - `/Conversas` - GET
   - `/Conversas/{id}/Mensagens` - GET, POST
   - `/Templates` - GET, POST, PUT, DELETE
   - `/Analises/*` - GET (sentimentos, heatmap, resolução, palavras-chave)

---

## 📝 Notas Importantes

1. **Material Icons**: O projeto utiliza Material Icons. Certifique-se de ter a fonte carregada no `index.html` ou `styles.scss`.

2. **Dados Mockados**: Atualmente, os componentes usam dados mockados. Substitua pelos serviços API quando o backend estiver pronto.

3. **Tema Escuro**: O tema é aplicado via classe CSS no `document.documentElement`. A preferência é salva no localStorage.

4. **Guards**: As rotas protegidas verificam a existência de token no localStorage. Certifique-se de que o token seja salvo após login.

5. **Responsividade**: Todos os componentes são responsivos com breakpoints em 768px e 1200px.

---

## 🤝 Contribuindo

Para adicionar novas telas:

1. Crie o componente em `Pages/`
2. Adicione a rota em `app.routes.ts`
3. Crie os models necessários em `Models/Objetos/`
4. Crie o serviço API em `Service/Api/`
5. Adicione o item no menu da sidebar (se aplicável)

---

## 📧 Contato

Para dúvidas ou sugestões, consulte a documentação completa do projeto ou entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0
**Data**: Janeiro 2025
**Stack**: Angular 19 (standalone components) + TypeScript + SCSS
