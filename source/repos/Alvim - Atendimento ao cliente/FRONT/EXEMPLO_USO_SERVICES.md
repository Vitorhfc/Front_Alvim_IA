# Exemplos de Uso dos Services - Guia Rápido

Este documento contém exemplos práticos de como usar os services criados para integração com a API.

## 📦 Estrutura Criada

```
Service/Api/
├── base-api.service.ts      ✅ Service base abstrato
├── client.service.ts         ✅ API de Cliente (porta 5002)
├── admin.service.ts          ✅ API de Admin (porta 5001)
├── index.ts                  ✅ Barrel export
└── README.md                 ✅ Documentação completa
```

## 🚀 Como Começar

### 1. Importar o Service no Componente

```typescript
import { Component } from '@angular/core';
import { ClientService, AdminService } from './Service/Api';

@Component({
  selector: 'app-meu-componente',
  templateUrl: './meu-componente.component.html'
})
export class MeuComponente {
  constructor(
    private clientService: ClientService,
    private adminService: AdminService
  ) {}
}
```

### 2. Usar os Métodos Async/Await

```typescript
async carregarDados() {
  try {
    const clientes = await this.clientService.listarClientes();
    console.log('Clientes:', clientes);
  } catch (error: any) {
    console.error('Erro:', error.message);
  }
}
```

## 📋 Exemplos por Funcionalidade

### 🔐 1. Autenticação (já existe auth.service.ts)

```typescript
import { AuthService } from './Service/Api';

// Login
const response = await this.authService.login({
  email: 'usuario@email.com',
  senha: 'senha123'
});

// Validação 2FA
const validacao = await this.authService.solicitarValidacao2FA({
  usuarioId: response.usuarioId
});

const auth = await this.authService.confirmarValidacao2FA({
  usuarioId: response.usuarioId,
  codigo: '123456'
});

// Salvar dados
this.authService.salvarDadosAutenticacao(auth);
```

### 👥 2. Gestão de Clientes

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService } from './Service/Api';
import { Cliente } from './Models/Entidades/Client/Cliente';

@Component({
  selector: 'app-clientes',
  template: `
    <div class="container">
      <h2>Lista de Clientes</h2>
      <button (click)="carregarClientes()">Recarregar</button>

      <div *ngFor="let cliente of clientes" class="cliente-card">
        <h3>{{ cliente.nome }}</h3>
        <p>{{ cliente.telefone }}</p>
        <p>{{ cliente.email }}</p>
        <button (click)="editarCliente(cliente)">Editar</button>
        <button (click)="removerCliente(cliente.id)">Remover</button>
      </div>

      <button (click)="abrirFormularioCadastro()">Novo Cliente</button>
    </div>
  `
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  carregando = false;

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.carregarClientes();
  }

  async carregarClientes() {
    try {
      this.carregando = true;
      this.clientes = await this.clientService.listarClientes();
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error.message);
      alert('Erro ao carregar clientes');
    } finally {
      this.carregando = false;
    }
  }

  async cadastrarCliente(dados: Partial<Cliente>) {
    try {
      const novoCliente = await this.clientService.cadastrarCliente(dados);
      console.log('Cliente cadastrado:', novoCliente);
      this.clientes.push(novoCliente);
      alert('Cliente cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro ao cadastrar: ${error.message}`);
    }
  }

  async editarCliente(cliente: Cliente) {
    try {
      const atualizado = await this.clientService.atualizarCliente(cliente.id, {
        nome: 'Novo Nome',
        telefone: '11988887777'
      });
      console.log('Cliente atualizado:', atualizado);

      // Atualizar na lista
      const index = this.clientes.findIndex(c => c.id === cliente.id);
      if (index !== -1) {
        this.clientes[index] = atualizado;
      }
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  }

  async removerCliente(id: string) {
    if (!confirm('Deseja realmente remover este cliente?')) {
      return;
    }

    try {
      await this.clientService.removerCliente(id);
      this.clientes = this.clientes.filter(c => c.id !== id);
      alert('Cliente removido com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro ao remover: ${error.message}`);
    }
  }

  async buscarPorTelefone(telefone: string) {
    try {
      const cliente = await this.clientService.buscarClientePorTelefone(telefone);
      console.log('Cliente encontrado:', cliente);
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Cliente não encontrado');
    }
  }

  abrirFormularioCadastro() {
    // Abrir modal ou navegar para página de cadastro
  }
}
```

### 💬 3. Chat e Mensagens

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService } from './Service/Api';
import { Mensagem } from './Models/Entidades/Client/Mensagem';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div class="mensagens" #scrollContainer>
        <div *ngFor="let msg of mensagens"
             [class]="msg.remetente === 'cliente' ? 'msg-cliente' : 'msg-atendente'">
          <p>{{ msg.conteudo }}</p>
          <small>{{ msg.dataEnvio | date:'short' }}</small>
        </div>
      </div>

      <div class="input-area">
        <input [(ngModel)]="novaMensagem"
               (keyup.enter)="enviarMensagem()"
               placeholder="Digite sua mensagem...">
        <button (click)="enviarMensagem()">Enviar</button>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit {
  clienteId = 'uuid-do-cliente';
  mensagens: Mensagem[] = [];
  novaMensagem = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.carregarMensagens();
    this.iniciarVerificacaoNovasMensagens();
  }

  async carregarMensagens() {
    try {
      this.mensagens = await this.clientService.listarMensagensConversa(
        this.clienteId,
        50, // limit
        0   // offset
      );

      // Marcar como lidas
      await this.clientService.marcarMensagensComoLidas(this.clienteId);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error.message);
    }
  }

  async enviarMensagem() {
    if (!this.novaMensagem.trim()) {
      return;
    }

    try {
      const mensagem = await this.clientService.enviarMensagem({
        clienteId: this.clienteId,
        conteudo: this.novaMensagem,
        tipo: 'texto',
        remetente: 'atendente'
      });

      this.mensagens.push(mensagem);
      this.novaMensagem = '';

      // Scroll para o final
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error.message);
      alert('Erro ao enviar mensagem');
    }
  }

  async verificarNovasMensagens() {
    try {
      const naoLidas = await this.clientService.buscarMensagensNaoLidas(this.clienteId);

      if (naoLidas.length > 0) {
        this.mensagens.push(...naoLidas);
        await this.clientService.marcarMensagensComoLidas(this.clienteId);
        this.scrollToBottom();
      }
    } catch (error: any) {
      console.error('Erro ao verificar novas mensagens:', error.message);
    }
  }

  iniciarVerificacaoNovasMensagens() {
    // Verificar a cada 5 segundos
    setInterval(() => {
      this.verificarNovasMensagens();
    }, 5000);
  }

  scrollToBottom() {
    // Implementar scroll automático
  }
}
```

### 📅 4. Agendamentos

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService } from './Service/Api';
import { Agendamento } from './Models/Entidades/Client/Agendamento';

@Component({
  selector: 'app-agendamentos',
  template: `
    <div class="agendamentos">
      <h2>Agendamentos</h2>

      <div class="filtros">
        <input type="date" [(ngModel)]="dataInicio">
        <input type="date" [(ngModel)]="dataFim">
        <button (click)="filtrar()">Filtrar</button>
      </div>

      <div *ngFor="let agendamento of agendamentos" class="agendamento-card">
        <h3>{{ agendamento.descricao }}</h3>
        <p>Data: {{ agendamento.dataHora | date:'full' }}</p>
        <p>Status: {{ agendamento.status }}</p>
        <button (click)="confirmar(agendamento.id)">Confirmar</button>
        <button (click)="cancelar(agendamento.id)">Cancelar</button>
      </div>

      <button (click)="novoAgendamento()">Novo Agendamento</button>
    </div>
  `
})
export class AgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  dataInicio = '';
  dataFim = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.carregarAgendamentos();
  }

  async carregarAgendamentos() {
    try {
      this.agendamentos = await this.clientService.listarAgendamentos();
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }

  async filtrar() {
    try {
      this.agendamentos = await this.clientService.listarAgendamentos(
        this.dataInicio,
        this.dataFim
      );
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }

  async criarAgendamento(dados: Partial<Agendamento>) {
    try {
      const novo = await this.clientService.criarAgendamento(dados);
      this.agendamentos.push(novo);
      alert('Agendamento criado com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }

  async confirmar(id: string) {
    try {
      await this.clientService.confirmarAgendamento(id);

      // Atualizar status localmente
      const agendamento = this.agendamentos.find(a => a.id === id);
      if (agendamento) {
        agendamento.status = 'Confirmado';
      }

      alert('Agendamento confirmado!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }

  async cancelar(id: string) {
    if (!confirm('Deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await this.clientService.cancelarAgendamento(id);

      const agendamento = this.agendamentos.find(a => a.id === id);
      if (agendamento) {
        agendamento.status = 'Cancelado';
      }

      alert('Agendamento cancelado!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }

  novoAgendamento() {
    // Abrir formulário
  }
}
```

### 🏢 5. Gestão de Empresas (Admin)

```typescript
import { Component, OnInit } from '@angular/core';
import { AdminService } from './Service/Api';
import { Empresa } from './Models/Entidades/Adm/Empresa';

@Component({
  selector: 'app-admin-empresas',
  templateUrl: './admin-empresas.component.html'
})
export class AdminEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.carregarEmpresas();
  }

  async carregarEmpresas() {
    try {
      this.empresas = await this.adminService.listarEmpresas();
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }

  async cadastrarEmpresa(dados: Partial<Empresa>) {
    try {
      const nova = await this.adminService.cadastrarEmpresa(dados);
      this.empresas.push(nova);
      alert('Empresa cadastrada com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }

  async provisionarEmpresa(id: string) {
    try {
      const resultado = await this.adminService.provisionarEmpresa(id);
      console.log('Provisionamento:', resultado);
      alert('Empresa provisionada com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }

  async obterQrCode(id: string) {
    try {
      const qrCode = await this.adminService.obterQrCodeEmpresa(id);
      console.log('QR Code:', qrCode);
      // Exibir QR Code em modal
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao obter QR Code');
    }
  }

  async verificarStatusWaha(id: string) {
    try {
      const status = await this.adminService.obterStatusWaha(id);
      console.log('Status WAHA:', status);

      if (status.conectado) {
        alert('WhatsApp conectado!');
      } else {
        alert('WhatsApp desconectado');
      }
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }

  async removerEmpresa(id: string) {
    if (!confirm('Deseja realmente remover esta empresa?')) {
      return;
    }

    try {
      await this.adminService.removerEmpresa(id);
      this.empresas = this.empresas.filter(e => e.id !== id);
      alert('Empresa removida com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro: ${error.message}`);
    }
  }
}
```

### 📊 6. Dashboard e Estatísticas

```typescript
import { Component, OnInit } from '@angular/core';
import { ClientService } from './Service/Api';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total de Clientes</h3>
          <p class="stat-value">{{ stats?.totalClientes || 0 }}</p>
        </div>

        <div class="stat-card">
          <h3>Mensagens Hoje</h3>
          <p class="stat-value">{{ stats?.mensagensHoje || 0 }}</p>
        </div>

        <div class="stat-card">
          <h3>Agendamentos Pendentes</h3>
          <p class="stat-value">{{ stats?.agendamentosPendentes || 0 }}</p>
        </div>

        <div class="stat-card">
          <h3>Taxa de Resposta IA</h3>
          <p class="stat-value">{{ stats?.taxaRespostaIA || 0 }}%</p>
        </div>
      </div>

      <div class="filtros">
        <input type="date" [(ngModel)]="dataInicio">
        <input type="date" [(ngModel)]="dataFim">
        <button (click)="atualizarEstatisticas()">Atualizar</button>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  dataInicio = '';
  dataFim = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.carregarEstatisticas();
  }

  async carregarEstatisticas() {
    try {
      this.stats = await this.clientService.buscarEstatisticas();
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }

  async atualizarEstatisticas() {
    try {
      const [statsAtendimento, statsIa] = await Promise.all([
        this.clientService.buscarEstatisticasAtendimento(this.dataInicio, this.dataFim),
        this.clientService.buscarEstatisticasIa(this.dataInicio, this.dataFim)
      ]);

      this.stats = {
        ...statsAtendimento,
        ...statsIa
      };
    } catch (error: any) {
      console.error('Erro:', error.message);
    }
  }
}
```

### 📁 7. Upload de Arquivos

```typescript
import { Component } from '@angular/core';
import { ClientService } from './Service/Api';

@Component({
  selector: 'app-upload-arquivo',
  template: `
    <div class="upload-area">
      <input type="file"
             (change)="onFileSelected($event)"
             #fileInput>
      <button (click)="fileInput.click()">Selecionar Arquivo</button>
      <button (click)="upload()"
              [disabled]="!arquivoSelecionado">
        Fazer Upload
      </button>

      <p *ngIf="arquivoSelecionado">
        Arquivo: {{ arquivoSelecionado.name }}
      </p>
    </div>
  `
})
export class UploadArquivoComponent {
  arquivoSelecionado: File | null = null;
  clienteId = 'uuid-do-cliente';

  constructor(private clientService: ClientService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.arquivoSelecionado = file;
    }
  }

  async upload() {
    if (!this.arquivoSelecionado) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.arquivoSelecionado);
    formData.append('clienteId', this.clienteId);
    formData.append('tipo', 'documento');

    try {
      const arquivo = await this.clientService.uploadArquivo(formData);
      console.log('Arquivo enviado:', arquivo);
      alert('Arquivo enviado com sucesso!');
      this.arquivoSelecionado = null;
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert(`Erro ao enviar arquivo: ${error.message}`);
    }
  }
}
```

### 📄 8. Geração de Relatórios (Admin)

```typescript
import { Component } from '@angular/core';
import { AdminService } from './Service/Api';

@Component({
  selector: 'app-relatorios',
  template: `
    <div class="relatorios">
      <h2>Relatórios</h2>

      <div class="relatorio-item">
        <h3>Relatório de Empresas</h3>
        <button (click)="gerarRelatorioEmpresas('pdf')">PDF</button>
        <button (click)="gerarRelatorioEmpresas('excel')">Excel</button>
      </div>

      <div class="relatorio-item">
        <h3>Relatório de Usuários</h3>
        <button (click)="gerarRelatorioUsuarios('pdf')">PDF</button>
        <button (click)="gerarRelatorioUsuarios('excel')">Excel</button>
      </div>

      <div class="relatorio-item">
        <h3>Relatório de Uso</h3>
        <input type="date" [(ngModel)]="dataInicio">
        <input type="date" [(ngModel)]="dataFim">
        <button (click)="gerarRelatorioUso('pdf')">PDF</button>
        <button (click)="gerarRelatorioUso('excel')">Excel</button>
      </div>
    </div>
  `
})
export class RelatoriosComponent {
  dataInicio = '';
  dataFim = '';

  constructor(private adminService: AdminService) {}

  async gerarRelatorioEmpresas(formato: 'pdf' | 'excel') {
    try {
      const blob = await this.adminService.gerarRelatorioEmpresas(formato);
      this.downloadBlob(blob, `relatorio-empresas.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao gerar relatório');
    }
  }

  async gerarRelatorioUsuarios(formato: 'pdf' | 'excel') {
    try {
      const blob = await this.adminService.gerarRelatorioUsuarios(formato);
      this.downloadBlob(blob, `relatorio-usuarios.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao gerar relatório');
    }
  }

  async gerarRelatorioUso(formato: 'pdf' | 'excel') {
    if (!this.dataInicio || !this.dataFim) {
      alert('Selecione as datas');
      return;
    }

    try {
      const blob = await this.adminService.gerarRelatorioUso(
        this.dataInicio,
        this.dataFim,
        formato
      );
      this.downloadBlob(blob, `relatorio-uso.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao gerar relatório');
    }
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
```

## ✅ Checklist de Implementação

- [x] BaseApiService criado
- [x] ClientService criado
- [x] AdminService criado
- [x] Barrel export (index.ts) criado
- [x] Documentação completa (README.md)
- [x] Exemplos de uso

## 🎯 Próximos Passos

1. **Testar os endpoints** - Certifique-se de que sua API está rodando
2. **Ajustar os modelos** - Se necessário, ajuste as interfaces dos models
3. **Implementar nos componentes** - Use os exemplos acima como base
4. **Adicionar interceptors** - Para tratamento global de erros e tokens
5. **Implementar loading states** - Para melhor UX

## 📞 Suporte

Se tiver dúvidas sobre os services, consulte:
- [README.md completo](./src/app/Service/Api/README.md)
- Documentação da API Backend
- Código-fonte dos services

---

**Criado em:** Janeiro 2025
**Versão:** 1.0.0
