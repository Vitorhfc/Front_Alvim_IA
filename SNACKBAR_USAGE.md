# Guia de Uso do SnackBar

O sistema de SnackBar foi implementado para fornecer feedback visual ao usuário sobre ações e erros na aplicação.

## Componentes Criados

### 1. **SnackbarService** (`src/app/Service/snackbar.ts`)
Serviço responsável por gerenciar as mensagens.

### 2. **SnackbarComponent** (`src/app/Components/snackbar/snackbar.*`)
Componente visual que exibe as mensagens no canto superior direito da tela.

## Como Usar

### 1. Injetar o Serviço

```typescript
import { SnackbarService } from '../../Service/snackbar';

constructor(private snackbarService: SnackbarService) {}
```

### 2. Exibir Mensagens

#### Sucesso
```typescript
this.snackbarService.success('Cliente salvo com sucesso!');
this.snackbarService.success('Operação concluída!', 4000); // 4 segundos
```

#### Erro
```typescript
this.snackbarService.error('Erro ao carregar dados.');
this.snackbarService.error('Falha na operação', 5000); // 5 segundos
```

#### Aviso
```typescript
this.snackbarService.warning('Atenção: Esta ação não pode ser desfeita.');
this.snackbarService.warning('Dados incompletos', 4000);
```

#### Informação
```typescript
this.snackbarService.info('Processando sua solicitação...');
this.snackbarService.info('Novidades disponíveis', 3000);
```

## Exemplos Práticos

### Exemplo 1: Tratamento de Erro em Requisição
```typescript
async salvarCliente(cliente: Cliente): Promise<void> {
  try {
    await this.clientService.cadastrarCliente(cliente);
    this.snackbarService.success('Cliente cadastrado com sucesso!');
  } catch (error: any) {
    this.snackbarService.error(
      error.message || 'Erro ao cadastrar cliente.'
    );
  }
}
```

### Exemplo 2: Validação de Formulário
```typescript
submitForm(): void {
  if (!this.form.valid) {
    this.snackbarService.warning('Preencha todos os campos obrigatórios.');
    return;
  }

  this.salvarDados();
}
```

### Exemplo 3: Operação em Background
```typescript
async processarEmLote(): Promise<void> {
  this.snackbarService.info('Processando registros...');

  try {
    const resultado = await this.service.processar();
    this.snackbarService.success(
      `${resultado.total} registros processados com sucesso!`
    );
  } catch (error: any) {
    this.snackbarService.error('Erro no processamento em lote.');
  }
}
```

### Exemplo 4: Múltiplas Mensagens
```typescript
async executarVariasOperacoes(): Promise<void> {
  try {
    await this.operacao1();
    this.snackbarService.success('Operação 1 concluída');

    await this.operacao2();
    this.snackbarService.success('Operação 2 concluída');

    await this.operacao3();
    this.snackbarService.success('Todas operações concluídas!');
  } catch (error: any) {
    this.snackbarService.error('Erro em uma das operações');
  }
}
```

## Métodos Disponíveis

| Método | Parâmetros | Duração Padrão | Descrição |
|--------|-----------|----------------|-----------|
| `success(message, duration?)` | message: string, duration?: number | 3000ms | Mensagem de sucesso (verde) |
| `error(message, duration?)` | message: string, duration?: number | 5000ms | Mensagem de erro (vermelho) |
| `warning(message, duration?)` | message: string, duration?: number | 4000ms | Mensagem de aviso (laranja) |
| `info(message, duration?)` | message: string, duration?: number | 3000ms | Mensagem informativa (azul) |
| `remove(id)` | id: string | - | Remove mensagem específica |
| `clear()` | - | - | Remove todas as mensagens |

## Características

✅ **Auto-dismiss**: Mensagens são removidas automaticamente após a duração especificada
✅ **Empilhamento**: Múltiplas mensagens são exibidas em pilha
✅ **Animações**: Entrada e saída suaves com slide
✅ **Fechamento Manual**: Botão X para fechar manualmente
✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela
✅ **Ícones**: Cada tipo tem seu ícone apropriado
✅ **Cores**: Visual diferenciado por tipo de mensagem

## Personalização

### Alterar Duração Padrão
Edite o arquivo `src/app/Service/snackbar.ts`:

```typescript
success(message: string, duration: number = 5000): void {
  this.show(message, 'success', duration);
}
```

### Alterar Posição
Edite o arquivo `src/app/Components/snackbar/snackbar.scss`:

```scss
.snackbar-container {
  position: fixed;
  bottom: 1.5rem;  // Mover para baixo
  left: 1.5rem;    // Mover para esquerda
  // ...
}
```

## Uso Atual no Projeto

O SnackBar já está integrado nos seguintes componentes:

- ✅ **ConversasComponent**: Erros ao carregar conversas e mensagens
- 🔄 **ClienteComponent**: Adicionar em salvar, atualizar e remover
- 🔄 **AuthComponent**: Adicionar em login e cadastro
- 🔄 **ConfiguracoesComponent**: Adicionar em salvar configurações

## Próximos Passos

1. Integrar em todos os formulários de CRUD
2. Adicionar mensagens de confirmação para ações críticas
3. Implementar notificações de WebSocket usando o SnackBar
