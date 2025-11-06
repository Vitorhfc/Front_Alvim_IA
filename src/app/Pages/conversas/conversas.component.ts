import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

interface Conversa {
  id: string;
  clienteNome: string;
  ultimaMensagem: string;
  horario: string;
  naoLidas: number;
  status: 'online' | 'offline';
  avatar: string;
}

interface Mensagem {
  id: string;
  texto: string;
  horario: string;
  isUsuario: boolean;
}

@Component({
  selector: 'app-conversas',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './conversas.component.html',
  styleUrls: ['./conversas.component.scss']
})
export class ConversasComponent implements OnInit {
  loading: boolean = true;
  searchTerm: string = '';
  novaMensagem: string = '';

  // Lista de conversas
  conversas: Conversa[] = [
    {
      id: '1',
      clienteNome: 'João Silva',
      ultimaMensagem: 'Obrigado pela ajuda!',
      horario: '10:30',
      naoLidas: 2,
      status: 'online',
      avatar: 'J'
    },
    {
      id: '2',
      clienteNome: 'Maria Santos',
      ultimaMensagem: 'Qual o preço do produto?',
      horario: '09:15',
      naoLidas: 1,
      status: 'online',
      avatar: 'M'
    },
    {
      id: '3',
      clienteNome: 'Pedro Costa',
      ultimaMensagem: 'Quando posso receber?',
      horario: 'Ontem',
      naoLidas: 1,
      status: 'offline',
      avatar: 'P'
    }
  ];

  // Conversa selecionada
  conversaSelecionada: Conversa | null = null;

  // Mensagens da conversa atual
  mensagens: Mensagem[] = [];

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Integrar com ClientService para buscar clientes/conversas
      // const clientes = await this.clientService.listarClientes();
      // this.conversas = this.formatarConversas(clientes);

      // TODO: Configurar WebSocket/SignalR para receber mensagens em tempo real
      // this.setupWebSocketConnection();

      // Dados mockados por enquanto
      console.log('Conversas: Usando dados mockados. Implementar integração com API.');

      if (this.conversas.length > 0) {
        this.selecionarConversa(this.conversas[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      // TODO: Exibir mensagem de erro usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // TODO: Implementar método para formatar conversas
  // private formatarConversas(clientes: Cliente[]): Conversa[] {
  //   return clientes.map(cliente => ({
  //     id: cliente.id,
  //     clienteNome: cliente.nome,
  //     ultimaMensagem: cliente.ultimaMensagem?.texto || 'Sem mensagens',
  //     horario: this.formatarHorario(cliente.ultimaInteracao),
  //     naoLidas: cliente.mensagensNaoLidas || 0,
  //     status: this.verificarStatusOnline(cliente.ultimaInteracao),
  //     avatar: this.getInitials(cliente.nome)
  //   }));
  // }

  // TODO: Configurar conexão WebSocket
  // private setupWebSocketConnection(): void {
  //   // Implementar conexão com SignalR ou WebSocket para mensagens em tempo real
  // }

  // ==================== CONVERSAS ====================

  selecionarConversa(conversa: Conversa): void {
    this.conversaSelecionada = conversa;
    this.carregarMensagens(conversa.id);
    // Marcar como lidas
    conversa.naoLidas = 0;
  }

  async carregarMensagens(conversaId: string): Promise<void> {
    // TODO: Integrar com ClientService para buscar mensagens
    // const mensagensAPI = await this.clientService.listarMensagensConversa(conversaId, 50);
    // this.mensagens = this.formatarMensagens(mensagensAPI);

    // TODO: Marcar mensagens como lidas
    // await this.clientService.marcarMensagensComoLidas(conversaId);

    // Dados mockados
    this.mensagens = [
      {
        id: '1',
        texto: 'Olá! Como posso ajudar?',
        horario: '10:20',
        isUsuario: false
      },
      {
        id: '2',
        texto: 'Quero saber sobre os produtos',
        horario: '10:22',
        isUsuario: true
      },
      {
        id: '3',
        texto: 'Claro! Temos várias opções disponíveis...',
        horario: '10:23',
        isUsuario: false
      },
      {
        id: '4',
        texto: 'Obrigado pela ajuda!',
        horario: '10:30',
        isUsuario: true
      }
    ];

    console.log(`Conversas: Carregando mensagens para conversa ${conversaId}. Implementar integração com API.`);
  }

  // TODO: Implementar método para formatar mensagens
  // private formatarMensagens(mensagensAPI: Mensagem[]): Mensagem[] {
  //   return mensagensAPI.map(msg => ({
  //     id: msg.id,
  //     texto: msg.texto,
  //     horario: this.formatarHorario(msg.dataHora),
  //     isUsuario: msg.remetenteId === this.usuarioAtualId
  //   }));
  // }

  get conversasFiltradas(): Conversa[] {
    if (!this.searchTerm) return this.conversas;

    return this.conversas.filter(c =>
      c.clienteNome.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // ==================== MENSAGENS ====================

  async enviarMensagem(): Promise<void> {
    if (!this.novaMensagem.trim() || !this.conversaSelecionada) return;

    const textoMensagem = this.novaMensagem;
    this.novaMensagem = '';

    // Adicionar mensagem localmente (otimistic UI)
    const novaMensagemObj: Mensagem = {
      id: Date.now().toString(),
      texto: textoMensagem,
      horario: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isUsuario: true
    };

    this.mensagens.push(novaMensagemObj);

    // TODO: Enviar mensagem para API
    // try {
    //   const mensagemEnviada = await this.clientService.enviarMensagem({
    //     clienteId: this.conversaSelecionada.id,
    //     texto: textoMensagem,
    //     remetenteId: this.usuarioAtualId
    //   });
    //
    //   // Atualizar com ID real da API
    //   novaMensagemObj.id = mensagemEnviada.id;
    //
    //   // A resposta da IA será recebida via WebSocket/SignalR
    // } catch (error) {
    //   console.error('Erro ao enviar mensagem:', error);
    //   // TODO: Exibir erro e remover mensagem da lista
    // }

    console.log('Conversas: Enviando mensagem. Implementar integração com API.');
    this.simularRespostaIA();
  }

  async simularRespostaIA(): Promise<void> {
    const respostaIA: Mensagem = {
      id: Date.now().toString(),
      texto: 'Entendo sua solicitação. Como posso auxiliá-lo?',
      horario: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isUsuario: false
    };

    this.mensagens.push(respostaIA);
  }

  // ==================== HELPERS ====================

  getInitials(nome: string): string {
    const names = nome.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }
}
