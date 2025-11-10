import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../Service/Api/client.service';
import { SnackbarService } from '../../Service/snackbar';
import { Cliente, StatusConversa } from '../../Models/Entidades/Client/Cliente';
import { Mensagem as MensagemAPI } from '../../Models/Entidades/Client/Mensagem';

interface Conversa {
  id: string;
  clienteNome: string;
  ultimaMensagem: string;
  horario: string;
  naoLidas: number;
  status: 'online' | 'offline';
  avatar: string;
  cliente: Cliente;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './conversas.component.html',
  styleUrls: ['./conversas.component.scss']
})
export class ConversasComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  loadingMensagens: boolean = false;
  enviandoMensagem: boolean = false;
  searchTerm: string = '';
  novaMensagem: string = '';

  // Lista de conversas
  conversas: Conversa[] = [];

  // Conversa selecionada
  conversaSelecionada: Conversa | null = null;

  // Mensagens da conversa atual
  mensagens: Mensagem[] = [];

  // Gerenciamento de subscrições
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private router: Router,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const clientes = await this.clientService.listarClientes();
      this.conversas = this.formatarConversas(clientes);

      // TODO: Configurar WebSocket/SignalR para receber mensagens em tempo real
      // this.setupWebSocketConnection();

      console.log(`Conversas: ${this.conversas.length} conversas carregadas`);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      this.snackbarService.error(
        error.message || 'Erro ao carregar conversas. Tente novamente.'
      );
      this.conversas = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private formatarConversas(clientes: Cliente[]): Conversa[] {
    return clientes
      .map(cliente => ({
        id: cliente.id || '',
        clienteNome: cliente.nome || 'Desconhecido',
        ultimaMensagem: this.obterUltimaMensagem(cliente),
        horario: this.formatarHorario(cliente.dtUltimaInteracao),
        naoLidas: 0, // TODO: Implementar contagem de mensagens não lidas
        status: this.verificarStatusOnline(cliente.dtUltimaInteracao),
        avatar: this.getInitials(cliente.nome || 'D'),
        cliente: cliente
      }))
      .sort((a, b) => {
        // Ordenar por data de última interação (mais recente primeiro)
        const dataA = a.cliente.dtUltimaInteracao ? new Date(a.cliente.dtUltimaInteracao).getTime() : 0;
        const dataB = b.cliente.dtUltimaInteracao ? new Date(b.cliente.dtUltimaInteracao).getTime() : 0;
        return dataB - dataA;
      });
  }

  private obterUltimaMensagem(cliente: Cliente): string {
    // TODO: Buscar última mensagem real da API
    if (cliente.contexto?.intencaoIdentificada) {
      return `Intenção: ${cliente.contexto.intencaoIdentificada}`;
    }
    return 'Sem mensagens recentes';
  }

  private formatarHorario(data: Date | null): string {
    if (!data) return '';

    try {
      const dataObj = new Date(data);
      
      if (isNaN(dataObj.getTime())) {
        return '';
      }

      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      const ehHoje = dataObj.toDateString() === hoje.toDateString();
      const ehOntem = dataObj.toDateString() === ontem.toDateString();

      if (ehHoje) {
        return dataObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (ehOntem) {
        return 'Ontem';
      } else {
        return dataObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      }
    } catch (error) {
      return '';
    }
  }

  private verificarStatusOnline(ultimaInteracao: Date | null): 'online' | 'offline' {
    if (!ultimaInteracao) return 'offline';

    try {
      const dataObj = new Date(ultimaInteracao);
      
      if (isNaN(dataObj.getTime())) {
        return 'offline';
      }

      const agora = new Date();
      const diferencaMinutos = (agora.getTime() - dataObj.getTime()) / 1000 / 60;

      // Considera online se interagiu nos últimos 5 minutos
      return diferencaMinutos < 5 ? 'online' : 'offline';
    } catch (error) {
      return 'offline';
    }
  }

  // TODO: Configurar conexão WebSocket
  // private setupWebSocketConnection(): void {
  //   // Implementar conexão com SignalR ou WebSocket para mensagens em tempo real
  //   // this.signalRService.startConnection();
  //   // this.signalRService.addMessageListener((mensagem) => {
  //   //   this.handleNovaMensagem(mensagem);
  //   // });
  // }

  // ==================== CONVERSAS ====================

  selecionarConversa(conversa: Conversa): void {
    if (this.conversaSelecionada?.id === conversa.id) {
      return; // Já está selecionada
    }

    this.conversaSelecionada = conversa;
    this.mensagens = [];
    this.novaMensagem = '';
    this.cdr.detectChanges();

    this.carregarMensagens(conversa.id);

    // Marcar como lidas
    if (conversa.naoLidas > 0) {
      conversa.naoLidas = 0;
      this.marcarComoLidas(conversa.id);
    }
  }

  async carregarMensagens(conversaId: string): Promise<void> {
    if (this.loadingMensagens) return;

    this.loadingMensagens = true;
    this.cdr.detectChanges();

    try {
      const mensagensAPI = await this.clientService.listarMensagensConversa(conversaId, 100);
      this.mensagens = this.formatarMensagens(mensagensAPI);

      // Scroll para a última mensagem
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      this.mensagens = [];
      this.snackbarService.error(
        error.message || 'Erro ao carregar mensagens da conversa.'
      );
    } finally {
      this.loadingMensagens = false;
      this.cdr.detectChanges();
    }
  }

  private formatarMensagens(mensagensAPI: MensagemAPI[]): Mensagem[] {
    return mensagensAPI
      .map(msg => ({
        id: msg.id || '',
        texto: msg.conteudoTexto || '',
        horario: this.formatarHorarioMensagem(msg.dtRecebido),
        isUsuario: msg.flgMensagemCliente || false
      }))
      .sort((a, b) => {
        // Ordenar por horário (mais antigas primeiro)
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });
  }

  private formatarHorarioMensagem(data: Date): string {
    try {
      const dataObj = new Date(data);
      
      if (isNaN(dataObj.getTime())) {
        return '';
      }

      const hoje = new Date();
      const ehHoje = dataObj.toDateString() === hoje.toDateString();

      if (ehHoje) {
        return dataObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return dataObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  }

  private async marcarComoLidas(conversaId: string): Promise<void> {
    try {
      await this.clientService.marcarMensagensComoLidas(conversaId);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  }

  abrirDetalhesCliente(conversa: Conversa | null): void {
    if (!conversa?.id) return;
    this.router.navigate(['/cliente', conversa.id]);
  }

  get conversasFiltradas(): Conversa[] {
    if (!this.searchTerm?.trim()) return this.conversas;

    const termo = this.searchTerm.toLowerCase().trim();
    return this.conversas.filter(c =>
      c.clienteNome.toLowerCase().includes(termo) ||
      c.ultimaMensagem.toLowerCase().includes(termo) ||
      c.cliente.numero?.includes(termo) ||
      c.cliente.email?.toLowerCase().includes(termo)
    );
  }

  // ==================== MENSAGENS ====================

  async enviarMensagem(): Promise<void> {
    const textoMensagem = this.novaMensagem?.trim();
    
    if (!textoMensagem || !this.conversaSelecionada || this.enviandoMensagem) {
      return;
    }

    this.enviandoMensagem = true;
    const mensagemOriginal = this.novaMensagem;
    this.novaMensagem = '';
    this.cdr.detectChanges();

    // Adicionar mensagem localmente (optimistic UI)
    const novaMensagemObj: Mensagem = {
      id: `temp_${Date.now()}`,
      texto: textoMensagem,
      horario: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isUsuario: true
    };

    this.mensagens.push(novaMensagemObj);
    this.cdr.detectChanges();
    this.scrollToBottom();

    try {
      // TODO: Implementar envio real para API
      // const mensagemEnviada = await this.clientService.enviarMensagem({
      //   clienteId: this.conversaSelecionada.id,
      //   texto: textoMensagem,
      //   remetenteId: this.usuarioAtualId
      // });
      //
      // novaMensagemObj.id = mensagemEnviada.id;

      console.log('Enviando mensagem:', textoMensagem);
      
      // Simular resposta da IA (remover quando API estiver pronta)
      await this.simularRespostaIA();

      // Atualizar última mensagem da conversa
      this.conversaSelecionada.ultimaMensagem = textoMensagem;
      this.conversaSelecionada.horario = novaMensagemObj.horario;

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Remover mensagem que falhou
      const index = this.mensagens.findIndex(m => m.id === novaMensagemObj.id);
      if (index > -1) {
        this.mensagens.splice(index, 1);
      }
      
      // Restaurar texto
      this.novaMensagem = mensagemOriginal;
      
      this.snackbarService.error(
        error.message || 'Erro ao enviar mensagem. Tente novamente.'
      );
    } finally {
      this.enviandoMensagem = false;
      this.cdr.detectChanges();
    }
  }

  private async simularRespostaIA(): Promise<void> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    const respostasIA = [
      'Entendo sua solicitação. Como posso auxiliá-lo?',
      'Obrigado pela mensagem! Estou aqui para ajudar.',
      'Recebi sua mensagem. Em que mais posso ser útil?',
      'Perfeito! Há mais alguma informação que você gostaria de compartilhar?',
      'Entendido. Vou processar essa informação.'
    ];

    const respostaAleatoria = respostasIA[Math.floor(Math.random() * respostasIA.length)];

    const respostaIA: Mensagem = {
      id: `ia_${Date.now()}`,
      texto: respostaAleatoria,
      horario: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isUsuario: false
    };

    this.mensagens.push(respostaIA);
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Atualizar última mensagem da conversa
    if (this.conversaSelecionada) {
      this.conversaSelecionada.ultimaMensagem = respostaAleatoria;
      this.conversaSelecionada.horario = respostaIA.horario;
    }
  }

  private scrollToBottom(): void {
    try {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (error) {
      console.error('Erro ao fazer scroll:', error);
    }
  }

  // ==================== HELPERS ====================

  getInitials(nome: string): string {
    if (!nome?.trim()) return '?';

    const names = nome.trim().split(' ').filter(n => n.length > 0);
    
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    
    return nome.substring(0, 2).toUpperCase();
  }

  // TrackBy functions para melhor performance
  trackByConversaId(index: number, conversa: Conversa): string {
    return conversa.id;
  }

  trackByMensagemId(index: number, mensagem: Mensagem): string {
    return mensagem.id;
  }
}