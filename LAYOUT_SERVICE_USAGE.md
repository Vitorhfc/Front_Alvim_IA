# Como usar o LayoutService para controlar o Sidebar

## Visão Geral

O `LayoutService` foi criado para controlar a exibição do sidebar de forma centralizada no `app.html`. Agora você não precisa mais declarar `<app-sidebar>` em cada tela individualmente.

## Modos de Exibição do Sidebar

O sidebar possui 3 modos:

- **`'visible'`**: Sidebar sempre visível (padrão para rotas protegidas)
- **`'hidden'`**: Sidebar oculto, mas pode ser ativado
- **`'never'`**: Sidebar nunca será exibido (padrão para rotas públicas como login)

## Como Usar nos Componentes

### 1. Importar o LayoutService

```typescript
import { LayoutService } from '../../Service/layout';
```

### 2. Injetar no Construtor

```typescript
constructor(private layoutService: LayoutService) {}
```

### 3. Configurar no ngOnInit

#### Para páginas COM sidebar (rotas protegidas):

```typescript
ngOnInit(): void {
  // Mostra o sidebar
  this.layoutService.setSidebarMode('visible');

  // Seu código aqui...
}
```

#### Para páginas SEM sidebar (rotas públicas):

```typescript
ngOnInit(): void {
  // Oculta completamente o sidebar
  this.layoutService.setSidebarMode('never');

  // Seu código aqui...
}
```

## Exemplos Práticos

### Exemplo 1: Dashboard (COM sidebar)

```typescript
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../Service/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    // Exibe o sidebar
    this.layoutService.setSidebarMode('visible');
  }
}
```

### Exemplo 2: Login (SEM sidebar)

```typescript
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../Service/layout';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    // Nunca exibe o sidebar
    this.layoutService.setSidebarMode('never');
  }
}
```

### Exemplo 3: Conversas (COM sidebar)

```typescript
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../Service/layout';

@Component({
  selector: 'app-conversas',
  templateUrl: './conversas.component.html',
  styleUrls: ['./conversas.component.scss']
})
export class ConversasComponent implements OnInit {

  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    // Exibe o sidebar
    this.layoutService.setSidebarMode('visible');
  }
}
```

## Funcionalidades Adicionais

### Alternar Colapso do Sidebar

```typescript
// Alternar entre colapsado/expandido
this.layoutService.toggleSidebarCollapse();

// Ou definir manualmente
this.layoutService.setSidebarCollapsed(true); // colapsa
this.layoutService.setSidebarCollapsed(false); // expande
```

### Verificar Estado Atual

```typescript
// Verificar modo atual
const mode = this.layoutService.getSidebarMode();

// Verificar se está colapsado
const isCollapsed = this.layoutService.isSidebarCollapsed();
```

### Mostrar/Ocultar Dinamicamente

```typescript
// Mostrar sidebar (se não estiver em modo 'never')
this.layoutService.showSidebar();

// Ocultar sidebar (se não estiver em modo 'never')
this.layoutService.hideSidebar();
```

## Comportamento do Layout

### Desktop
- **Com sidebar**: O conteúdo principal tem margem à esquerda de `280px` (ou `70px` se colapsado)
- **Sem sidebar**: O conteúdo ocupa 100% da largura

### Mobile (< 768px)
- O sidebar se torna um overlay (não empurra o conteúdo)
- O conteúdo sempre ocupa 100% da largura

## Importante

1. **Remova** todas as declarações de `<app-sidebar>` dos templates individuais
2. **Adicione** a configuração do `LayoutService` no `ngOnInit` de cada componente
3. O sidebar **nunca** vai sobrepor o conteúdo em desktop - ele empurra o conteúdo para a direita
4. O estado do sidebar é **reativo** e persiste durante a navegação

## Estrutura no app.html

O layout agora está centralizado em `app.html`:

```html
<div class="app-container">
  <!-- Sidebar: Controlado pelo LayoutService -->
  @if (sidebarMode$ | async; as mode) {
    @if (mode === 'visible' || mode === 'hidden') {
      <aside class="sidebar-wrapper" [class.collapsed]="sidebarCollapsed$ | async">
        <app-sidebar />
      </aside>
    }
  }

  <!-- Conteúdo principal: Ajusta automaticamente -->
  <main class="main-content"
        [class.with-sidebar]="(sidebarMode$ | async) === 'visible' || (sidebarMode$ | async) === 'hidden'"
        [class.sidebar-collapsed]="sidebarCollapsed$ | async">
    <router-outlet></router-outlet>
  </main>
</div>

<!-- Componentes globais -->
<app-spinner/>
<app-snackbar/>
```

Agora você tem controle total do sidebar de forma centralizada!
