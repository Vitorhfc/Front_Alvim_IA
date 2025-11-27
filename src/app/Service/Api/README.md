# Services API - Documentação

Este diretório contém os services para integração com as APIs do sistema Alvim - Atendimento ao Cliente.

## 📁 Estrutura de Arquivos

```
Service/Api/
├── base-api.service.ts      # Service base abstrato com métodos reutilizáveis
├── client.service.ts         # Endpoints da API de Cliente (porta 5002)
├── admin.service.ts          # Endpoints da API de Administração (porta 5001)
├── auth.service.ts           # Autenticação e 2FA
├── empresa.service.ts        # Operações com empresas
├── conversas.service.ts      # Gerenciamento de conversas
├── dashboard.service.ts      # Dados de dashboard
├── email.service.ts          # Envio de emails
├── analises.service.ts       # Análises e relatórios
├── mensagens.service.ts      # Mensagens
├── templates.service.ts      # Templates de mensagens
├── index.ts                  # Barrel export
└── README.md                 # Esta documentação
```

## 🚀 Começando

### 1. Importação dos Services

Você pode importar os services de duas formas:

```typescript
// Forma 1: Importação direta
import { ClientService } from './Service/Api/client.service';
import { AdminService } from './Service/Api/admin.service';

// Forma 2: Usando barrel export (recomendado)
import { ClientService, AdminService } from './Service/Api';
```

### 2. Injeção no Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService, AdminService } from './Service/Api';

@Component({
  selector: 'app-meu-componente',
  templateUrl: './meu-componente.component.html'
})
export class MeuComponente implements OnInit {
  constructor(
    private clientService: ClientService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    // Seus métodos aqui
  }
}
```

## 📘 ClientService

Service para integração com a API de Cliente (porta 5002).

### Endpoints Disponíveis

#### **Clientes**

```typescript
// Listar todos os clientes
const clientes = await this.clientService.listarClientes();

// Buscar cliente por ID
const cliente = await this.clientService.buscarClientePorId('uuid-do-cliente');

// Buscar cliente por telefone
const cliente = await this.clientService.buscarClientePorTelefone('11999999999');

// Cadastrar novo cliente
const novoCliente = await this.clientService.cadastrarCliente({
  nome: 'João Silva',
  telefone: '11999999999',
  email: 'joao@email.com'
});

// Atualizar cliente
const clienteAtualizado = await this.clientService.atualizarCliente('uuid', {
  nome: 'João da Silva'
});

// Remover cliente
await this.clientService.removerCliente('uuid-do-cliente');
```

#### **Mensagens**

```typescript
// Listar mensagens de uma conversa
const mensagens = await this.clientService.listarMensagensConversa('uuid-cliente', 50, 0);

// Buscar mensagem por ID
const mensagem = await this.clientService.buscarMensagemPorId('uuid-mensagem');

// Enviar nova mensagem
const novaMensagem = await this.clientService.enviarMensagem({
  clienteId: 'uuid-cliente',
  conteudo: 'Olá, tudo bem?',
  tipo: 'texto'
});

// Marcar mensagens como lidas
await this.clientService.marcarMensagensComoLidas('uuid-cliente');

// Buscar mensagens não lidas
const naoLidas = await this.clientService.buscarMensagensNaoLidas('uuid-cliente');
```

#### **Agendamentos**

```typescript
// Listar agendamentos do cliente
const agendamentos = await this.clientService.listarAgendamentosCliente('uuid-cliente');

// Listar todos os agendamentos (com filtros opcionais)
const todos = await this.clientService.listarAgendamentos('2025-01-01', '2025-01-31');

// Buscar agendamento por ID
const agendamento = await this.clientService.buscarAgendamentoPorId('uuid-agendamento');

// Criar novo agendamento
const novoAgendamento = await this.clientService.criarAgendamento({
  clienteId: 'uuid-cliente',
  dataHora: '2025-01-15T14:00:00',
  descricao: 'Consulta médica',
  status: 'Pendente'
});

// Atualizar agendamento
const atualizado = await this.clientService.atualizarAgendamento('uuid', {
  dataHora: '2025-01-15T15:00:00'
});

// Cancelar agendamento
await this.clientService.cancelarAgendamento('uuid-agendamento');

// Confirmar agendamento
await this.clientService.confirmarAgendamento('uuid-agendamento');
```

#### **Arquivos**

```typescript
// Listar arquivos de um cliente
const arquivos = await this.clientService.listarArquivosCliente('uuid-cliente');

// Buscar arquivo por ID
const arquivo = await this.clientService.buscarArquivoPorId('uuid-arquivo');

// Upload de arquivo
const formData = new FormData();
formData.append('file', file);
formData.append('clienteId', 'uuid-cliente');
formData.append('tipo', 'documento');

const novoArquivo = await this.clientService.uploadArquivo(formData);

// Remover arquivo
await this.clientService.removerArquivo('uuid-arquivo');
```

#### **Configuração de IA**

```typescript
// Buscar configuração de IA
const config = await this.clientService.buscarConfiguracaoIa();

// Atualizar configuração de IA
const atualizada = await this.clientService.atualizarConfiguracaoIa({
  modelo: 'gpt-4',
  temperatura: 0.7,
  maxTokens: 500
});

// Testar configuração de IA
const resultado = await this.clientService.testarConfiguracaoIa('Olá, como você está?');
```

#### **Processamento de IA**

```typescript
// Listar processamentos de IA
const processamentos = await this.clientService.listarProcessamentosIa(50, 0);

// Buscar processamento por ID
const processamento = await this.clientService.buscarProcessamentoIaPorId('uuid');

// Listar processamentos de um cliente
const processamentosCliente = await this.clientService.listarProcessamentosIaPorCliente('uuid-cliente');
```

#### **Funcionários**

```typescript
// Listar funcionários
const funcionarios = await this.clientService.listarFuncionarios();

// Buscar funcionário por ID
const funcionario = await this.clientService.buscarFuncionarioPorId('uuid');

// Cadastrar funcionário
const novoFunc = await this.clientService.cadastrarFuncionario({
  nome: 'Maria Santos',
  email: 'maria@empresa.com',
  cargo: 'Atendente'
});

// Atualizar funcionário
const funcAtualizado = await this.clientService.atualizarFuncionario('uuid', {
  cargo: 'Supervisor'
});

// Remover funcionário
await this.clientService.removerFuncionario('uuid');

// Ativar/Desativar funcionário
await this.clientService.toggleStatusFuncionario('uuid', false);
```

#### **Logs**

```typescript
// Listar logs (com filtros opcionais)
const logs = await this.clientService.listarLogs('INFO', '2025-01-01', '2025-01-31');

// Buscar log por ID
const log = await this.clientService.buscarLogPorId('uuid-log');
```

#### **Estatísticas**

```typescript
// Estatísticas gerais
const stats = await this.clientService.buscarEstatisticas();

// Estatísticas de atendimento
const statsAtendimento = await this.clientService.buscarEstatisticasAtendimento(
  '2025-01-01',
  '2025-01-31'
);

// Estatísticas de IA
const statsIa = await this.clientService.buscarEstatisticasIa('2025-01-01', '2025-01-31');
```

## 📕 AdminService

Service para integração com a API de Administração (porta 5001).

### Endpoints Disponíveis

#### **Usuários**

```typescript
// Listar todos os usuários
const usuarios = await this.adminService.listarUsuarios();

// Buscar usuário por ID
const usuario = await this.adminService.buscarUsuarioPorId('uuid');

// Buscar por email
const usuario = await this.adminService.buscarUsuarioPorEmail('user@email.com');

// Buscar por CPF
const usuario = await this.adminService.buscarUsuarioPorCpf('12345678900');

// Cadastrar usuário
const novoUsuario = await this.adminService.cadastrarUsuario({
  nome: 'João Silva',
  email: 'joao@email.com',
  senha: 'senha123',
  confirmarSenha: 'senha123',
  telefone: '11999999999',
  cpf: '12345678900'
});

// Atualizar usuário
const atualizado = await this.adminService.atualizarUsuario('uuid', {
  nome: 'João da Silva'
});

// Remover usuário
await this.adminService.removerUsuario('uuid');

// Ativar/Desativar usuário
await this.adminService.toggleStatusUsuario('uuid', false);

// Atualizar senha
await this.adminService.atualizarSenha('uuid', {
  senhaAtual: 'senha123',
  novaSenha: 'novaSenha456',
  confirmarNovaSenha: 'novaSenha456'
});

// Recuperar senha (público)
await this.adminService.recuperarSenha({
  email: 'user@email.com'
});

// Redefinir senha com token (público)
await this.adminService.redefinirSenha({
  token: 'token-recebido-por-email',
  novaSenha: 'novaSenha789',
  confirmarNovaSenha: 'novaSenha789'
});
```

#### **Empresas**

```typescript
// Listar todas as empresas
const empresas = await this.adminService.listarEmpresas();

// Buscar empresa por ID
const empresa = await this.adminService.buscarEmpresaPorId('uuid');

// Buscar por CNPJ
const empresa = await this.adminService.buscarEmpresaPorCnpj('12345678000190');

// Cadastrar empresa
const novaEmpresa = await this.adminService.cadastrarEmpresa({
  razaoSocial: 'Empresa LTDA',
  nomeFantasia: 'Empresa',
  cnpj: '12345678000190',
  email: 'contato@empresa.com',
  telefone: '1133334444'
});

// Atualizar empresa
const atualizada = await this.adminService.atualizarEmpresa('uuid', {
  telefone: '1133335555'
});

// Remover empresa
await this.adminService.removerEmpresa('uuid');

// Ativar/Desativar empresa
await this.adminService.toggleStatusEmpresa('uuid', true);

// Provisionar empresa (WAHA)
const resultado = await this.adminService.provisionarEmpresa('uuid');

// Obter QR Code
const qrCode = await this.adminService.obterQrCodeEmpresa('uuid');

// Status WAHA
const status = await this.adminService.obterStatusWaha('uuid');

// Reconectar WAHA
await this.adminService.reconectarInstanciaWaha('uuid');

// Configurar WAHA
await this.adminService.configurarWaha('uuid', {
  wahaApiUrl: 'https://waha.com',
  wahaApiKey: 'key',
  numeroWhatsApp: '11999999999'
});
```

#### **Vínculo Usuário-Empresa**

```typescript
// Listar usuários de uma empresa
const usuarios = await this.adminService.listarUsuariosEmpresa('uuid-empresa');

// Listar empresas de um usuário
const empresas = await this.adminService.listarEmpresasUsuario('uuid-usuario');

// Vincular usuário à empresa
const vinculo = await this.adminService.vincularUsuarioEmpresa({
  usuarioId: 'uuid-usuario',
  empresaId: 'uuid-empresa',
  flgAdministrador: true
});

// Remover vínculo
await this.adminService.removerVinculoUsuarioEmpresa('uuid-usuario', 'uuid-empresa');

// Atualizar permissões
const atualizado = await this.adminService.atualizarPermissoesUsuarioEmpresa(
  'uuid-usuario',
  'uuid-empresa',
  false
);
```

#### **Logs Administrativos**

```typescript
// Listar logs (com filtros)
const logs = await this.adminService.listarLogsAdm('INFO', 'uuid-usuario', '2025-01-01', '2025-01-31');

// Buscar log por ID
const log = await this.adminService.buscarLogAdmPorId('uuid-log');

// Logs por usuário
const logUsuario = await this.adminService.listarLogsPorUsuario('uuid-usuario');

// Logs por empresa
const logEmpresa = await this.adminService.listarLogsPorEmpresa('uuid-empresa');
```

#### **Dashboard e Estatísticas**

```typescript
// Estatísticas gerais do sistema
const stats = await this.adminService.buscarEstatisticasGerais();

// Estatísticas de empresas
const statsEmpresas = await this.adminService.buscarEstatisticasEmpresas();

// Estatísticas de usuários
const statsUsuarios = await this.adminService.buscarEstatisticasUsuarios();

// Estatísticas de uso
const statsUso = await this.adminService.buscarEstatisticasUso('2025-01-01', '2025-01-31');
```

#### **Relatórios**

```typescript
// Gerar relatório de empresas (PDF ou Excel)
const pdfEmpresas = await this.adminService.gerarRelatorioEmpresas('pdf');
const excelEmpresas = await this.adminService.gerarRelatorioEmpresas('excel');

// Gerar relatório de usuários
const pdfUsuarios = await this.adminService.gerarRelatorioUsuarios('pdf');

// Gerar relatório de uso
const pdfUso = await this.adminService.gerarRelatorioUso('2025-01-01', '2025-01-31', 'pdf');

// Download do Blob
const url = window.URL.createObjectURL(pdfEmpresas);
const link = document.createElement('a');
link.href = url;
link.download = 'relatorio-empresas.pdf';
link.click();
window.URL.revokeObjectURL(url);
```

#### **Importação/Exportação**

```typescript
// Importar empresas
const formData = new FormData();
formData.append('file', file);
const resultado = await this.adminService.importarEmpresas(formData);

// Exportar empresas
const csvBlob = await this.adminService.exportarEmpresas('csv');
const excelBlob = await this.adminService.exportarEmpresas('excel');
```

## 🔐 BaseApiService

Service abstrato que fornece métodos reutilizáveis. **Não deve ser usado diretamente**, apenas estendido por outros services.

### Métodos Disponíveis

- `get<T>(endpoint: string): Promise<T>` - GET request
- `post<T, R>(endpoint: string, data: T): Promise<R>` - POST request
- `put<T, R>(endpoint: string, data: T): Promise<R>` - PUT request
- `patch<T, R>(endpoint: string, data: Partial<T>): Promise<R>` - PATCH request
- `delete<T>(endpoint: string): Promise<T | void>` - DELETE request
- `getPublic<T>(endpoint: string): Promise<T>` - GET sem autenticação
- `postPublic<T, R>(endpoint: string, data: T): Promise<R>` - POST sem autenticação

### Criando um Novo Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../Environment/Environment';
import { BaseApiService } from './base-api.service';
import { LocalStorageService } from '../Local/local-storage';

@Injectable({
  providedIn: 'root'
})
export class MeuNovoService extends BaseApiService {
  protected override baseUrl = environment.url_Client; // ou url_ADMIN

  constructor(
    protected override http: HttpClient,
    protected override localStorageService: LocalStorageService
  ) {
    super(http, localStorageService);
  }

  async meuMetodo(): Promise<any> {
    return this.get<any>('/meu-endpoint');
  }
}
```

## ⚙️ Configuração

### Environments

As URLs das APIs são configuradas nos arquivos de environment:

```typescript
// Environment.ts (Desenvolvimento)
export const environment = {
  url_Client: 'https://localhost:5002/api',
  url_ADMIN: 'https://localhost:5001/api',
  production: false
};
```

### Headers de Autenticação

Os services automaticamente incluem o token de autenticação nos headers das requisições:

```typescript
'Authorization': `Bearer ${token}`
'Content-Type': 'application/json'
```

## 🛡️ Tratamento de Erros

Todos os métodos fazem tratamento automático de erros e retornam mensagens amigáveis:

```typescript
try {
  const clientes = await this.clientService.listarClientes();
} catch (error: any) {
  console.error('Erro:', error.message);
  // Exibir mensagem ao usuário
}
```

## 📋 Padrão de Response

Todas as respostas da API seguem o padrão `ApiResponse`:

```typescript
interface ApiResponse<T = any> {
  sucesso: boolean;
  mensagem: string;
  data?: T;
  timestamp: string;
  errorCode?: string;
  errors?: Record<string, string[]>; // Erros de validação
}
```

## 🔄 Promises vs Observables

Os services utilizam **Promises** ao invés de Observables para simplificar o uso:

```typescript
// Ao invés de:
this.clientService.listarClientes().subscribe(clientes => {
  console.log(clientes);
});

// Você usa:
const clientes = await this.clientService.listarClientes();
console.log(clientes);
```

## 💡 Boas Práticas

1. **Sempre use try-catch** para capturar erros
2. **Não faça lógica de negócio nos services** - mantenha-os focados em chamadas API
3. **Use o LocalStorageService** para gerenciar tokens
4. **Mantenha os methods async/await** para melhor legibilidade
5. **Documente métodos complexos** com JSDoc

## 📚 Exemplos Práticos

### Exemplo 1: Listar e Exibir Clientes

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService } from './Service/Api';
import { Cliente } from './Models/Entidades/Client/Cliente';

@Component({
  selector: 'app-lista-clientes',
  template: `
    <div *ngFor="let cliente of clientes">
      {{ cliente.nome }} - {{ cliente.telefone }}
    </div>
  `
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(private clientService: ClientService) {}

  async ngOnInit() {
    try {
      this.clientes = await this.clientService.listarClientes();
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error.message);
    }
  }
}
```

### Exemplo 2: Cadastrar Empresa

```typescript
import { Component } from '@angular/core';
import { AdminService } from './Service/Api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cadastro-empresa',
  templateUrl: './cadastro-empresa.component.html'
})
export class CadastroEmpresaComponent {
  form: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      razaoSocial: ['', Validators.required],
      cnpj: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async cadastrar() {
    if (this.form.invalid) {
      return;
    }

    try {
      const empresa = await this.adminService.cadastrarEmpresa(this.form.value);
      console.log('Empresa cadastrada:', empresa);
      alert('Empresa cadastrada com sucesso!');
      this.form.reset();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }
}
```

### Exemplo 3: Enviar Mensagem

```typescript
import { Component } from '@angular/core';
import { ClientService } from './Service/Api';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent {
  mensagemTexto = '';
  clienteId = 'uuid-do-cliente';

  constructor(private clientService: ClientService) {}

  async enviarMensagem() {
    if (!this.mensagemTexto.trim()) {
      return;
    }

    try {
      const mensagem = await this.clientService.enviarMensagem({
        clienteId: this.clienteId,
        conteudo: this.mensagemTexto,
        tipo: 'texto',
        remetente: 'atendente'
      });

      console.log('Mensagem enviada:', mensagem);
      this.mensagemTexto = '';
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }
}
```

## 🔗 Links Úteis

- [Documentação Angular HttpClient](https://angular.io/guide/http)
- [API Client Documentation](../../../API_ALVIM_IA/Cliente/README.md)
- [API Admin Documentation](../../../API_ALVIM_IA/ADM/README.md)

---

**Última atualização:** Janeiro 2025
**Versão do Angular:** 20.3.0
