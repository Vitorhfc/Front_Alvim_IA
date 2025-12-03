import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../Service/Api/client.service';
import { SnackbarService } from '../../Service/snackbar';
import { Cliente, StatusConversa } from '../../Models/Entidades/Client/Cliente';
import { Mensagem as MensagemAPI, MensagensClienteResponse, TipoMensagem } from '../../Models/Entidades/Client/Mensagem';
import { SignalRHubService, MensagemWhatsApp } from '../../Service/signalr-hub.service';

interface Conversa {
  id: string;
  clienteNome: string;
  ultimaMensagem: string;
  horario: string;
  naoLidas: number;
  status: 'online' | 'offline';
  avatar: string;
  cliente: Cliente;
  atendimentoHumano: boolean; // true = atendente humano, false = IA
}

interface Mensagem {
  id: string;
  texto: string;
  horario: string;
  isUsuario: boolean;
  tipoMensagem: TipoMensagem;
  midia?: {
    urlDownload: string | null;
    nomeArquivo: string | null;
    mimeType: string | null;
    caption: string | null;
  } | null;
  idMensagemResposta?: string | null;
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

  // Painel lateral
  painelLateralAberto: boolean = false;
  alterandoModoResposta: boolean = false;

  // Gerenciamento de subscrições
  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private router: Router,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRHubService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.iniciarSignalR();
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
        cliente: cliente,
        atendimentoHumano: cliente.flgRespostaResponsavel || false
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

  // ==================== SIGNALR ====================

  /**
   * Inicia a conexão SignalR e configura os listeners para eventos em tempo real
   */
  private iniciarSignalR(): void {
    // Iniciar conexão
    this.signalRService.startConnection().catch(error => {
      console.error('Erro ao conectar SignalR:', error);
    });

    // Escutar novas mensagens
    this.signalRService.mensagemRecebida$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mensagemWhatsApp: MensagemWhatsApp) => {
        this.handleNovaMensagemWhatsApp(mensagemWhatsApp);
      });

    // Escutar estado da conexão
    this.signalRService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected: boolean) => {
        if (connected) {
          console.log('✅ SignalR conectado - Conversas em tempo real ativas');
        } else {
          console.warn('⚠️ SignalR desconectado - Modo offline');
        }
      });

    // Escutar status da sessão WhatsApp
    this.signalRService.statusSessao$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statusData) => {
        console.log('Status WhatsApp atualizado:', statusData);
        if (statusData.status === 'FAILED' || statusData.status === 'STOPPED') {
          this.snackbarService.warning(`WhatsApp ${statusData.status}: Verifique a conexão`);
        }
      });

    // Escutar atualizações de cliente
    this.signalRService.clienteAtualizado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((clienteAtualizadoData) => {
        this.handleClienteAtualizado(clienteAtualizadoData);
      });
  }

  /**
   * Manipula nova mensagem recebida via SignalR
   */
  private handleNovaMensagemWhatsApp(mensagemWhatsApp: MensagemWhatsApp): void {
    console.log('📨 Nova mensagem recebida via SignalR:', mensagemWhatsApp);

    try {
      // Extrair informações do payload
      const payload = mensagemWhatsApp.payload;

      if (!payload || !payload.clienteId) {
        console.warn('Payload inválido ou sem clienteId:', payload);
        return;
      }

      const clienteId = payload.clienteId;

      // Encontrar a conversa correspondente
      const conversa = this.conversas.find(c => c.id === clienteId);

      if (conversa) {
        // Atualizar última mensagem e horário
        conversa.ultimaMensagem = payload.conteudoTexto || this.obterTextoTipoMensagem(payload.tipoMensagem);
        conversa.horario = this.formatarHorario(new Date());
        conversa.cliente.dtUltimaInteracao = new Date();

        // Incrementar contador de não lidas se não for a conversa selecionada
        if (this.conversaSelecionada?.id !== clienteId) {
          conversa.naoLidas = (conversa.naoLidas || 0) + 1;
        } else {
          // Se for a conversa selecionada, adicionar mensagem na lista
          this.adicionarMensagemNaLista(payload);
        }

        // Reordenar conversas (mover para o topo)
        this.reordenarConversas();
        this.cdr.detectChanges();
      } else {
        // Cliente novo que não está na lista - recarregar conversas
        console.log('Nova conversa detectada, recarregando lista...');
        this.carregarDados();
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do SignalR:', error);
    }
  }

  /**
   * Adiciona nova mensagem na lista de mensagens da conversa atual
   */
  private adicionarMensagemNaLista(payloadMensagem: any): void {
    if (!this.conversaSelecionada) return;

    const novaMensagem: Mensagem = {
      id: payloadMensagem.id || `signalr_${Date.now()}`,
      texto: payloadMensagem.conteudoTexto || this.obterTextoTipoMensagem(payloadMensagem.tipoMensagem),
      horario: this.formatarHorarioMensagem(new Date()),
      isUsuario: !payloadMensagem.flgMensagemCliente, // Invertido: true = atendente, false = cliente
      tipoMensagem: payloadMensagem.tipoMensagem,
      idMensagemResposta: payloadMensagem.idMensagemResposta
    };

    // Adicionar informações de mídia se existir
    if (payloadMensagem.midia && payloadMensagem.tipoMensagem !== TipoMensagem.Texto) {
      novaMensagem.midia = {
        urlDownload: payloadMensagem.midia.urlDownload,
        nomeArquivo: payloadMensagem.midia.nomeArquivo,
        mimeType: payloadMensagem.midia.mimeType,
        caption: payloadMensagem.midia.caption
      };
    }

    this.mensagens.push(novaMensagem);
    this.cdr.detectChanges();

    // Scroll para a nova mensagem
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Reordena conversas colocando as mais recentes no topo
   */
  private reordenarConversas(): void {
    this.conversas.sort((a, b) => {
      const dataA = a.cliente.dtUltimaInteracao ? new Date(a.cliente.dtUltimaInteracao).getTime() : 0;
      const dataB = b.cliente.dtUltimaInteracao ? new Date(b.cliente.dtUltimaInteracao).getTime() : 0;
      return dataB - dataA;
    });
  }

  /**
   * Manipula atualização de cliente via SignalR
   */
  private handleClienteAtualizado(clienteAtualizadoData: any): void {
    console.log('👤 Cliente atualizado via SignalR:', clienteAtualizadoData);

    try {
      const clienteAtualizado = clienteAtualizadoData.cliente;

      if (!clienteAtualizado || !clienteAtualizado.id) {
        console.warn('Dados de cliente inválidos:', clienteAtualizado);
        return;
      }

      // Encontrar a conversa correspondente na lista
      const index = this.conversas.findIndex(c => c.id === clienteAtualizado.id);

      if (index !== -1) {
        // Atualizar os dados do cliente mantendo a estrutura da conversa
        this.conversas[index].cliente = clienteAtualizado;
        this.conversas[index].clienteNome = clienteAtualizado.nome || 'Desconhecido';
        this.conversas[index].atendimentoHumano = clienteAtualizado.flgRespostaResponsavel || false;
        this.conversas[index].avatar = this.getInitials(clienteAtualizado.nome || 'D');

        // Se for a conversa selecionada, atualizar também
        if (this.conversaSelecionada && this.conversaSelecionada.id === clienteAtualizado.id) {
          this.conversaSelecionada.cliente = clienteAtualizado;
          this.conversaSelecionada.clienteNome = clienteAtualizado.nome || 'Desconhecido';
          this.conversaSelecionada.atendimentoHumano = clienteAtualizado.flgRespostaResponsavel || false;
          this.conversaSelecionada.avatar = this.getInitials(clienteAtualizado.nome || 'D');
        }

        this.cdr.detectChanges();
        console.log('✅ Conversa atualizada na lista');
      } else {
        // Cliente novo que não está na lista - recarregar conversas
        console.log('Novo cliente detectado, recarregando lista...');
        this.carregarDados();
      }
    } catch (error) {
      console.error('Erro ao processar atualização de cliente do SignalR:', error);
    }
  }

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
      const response: MensagensClienteResponse = await this.clientService.listarMensagensConversa(conversaId, 'asc');
      this.mensagens = this.formatarMensagens(response.mensagens);

      // Atualizar informações do cliente na conversa selecionada
      if (this.conversaSelecionada) {
        this.conversaSelecionada.cliente.totalMensagens = response.totalMensagens;
      }

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
    return mensagensAPI.map(msg => {
      const mensagemFormatada: Mensagem = {
        id: msg.id || '',
        texto: msg.conteudoTexto || this.obterTextoTipoMensagem(msg.tipoMensagem),
        horario: this.formatarHorarioMensagem(msg.dtRecebido),
        isUsuario: !msg.flgMensagemCliente, // Invertido: true = atendente, false = cliente
        tipoMensagem: msg.tipoMensagem,
        idMensagemResposta: msg.idMensagemResposta
      };

      // Adicionar informações de mídia se existir
      if (msg.midia && msg.tipoMensagem !== TipoMensagem.Texto) {
        mensagemFormatada.midia = {
          urlDownload: msg.midia.urlDownload,
          nomeArquivo: msg.midia.nomeArquivo,
          mimeType: msg.midia.mimeType,
          caption: msg.midia.caption
        };
      }

      return mensagemFormatada;
    });
  }

  private obterTextoTipoMensagem(tipo: TipoMensagem): string {
    const tiposTexto: Record<number, string> = {
      [TipoMensagem.Audio]: '🎤 Áudio',
      [TipoMensagem.Imagem]: '📷 Imagem',
      [TipoMensagem.Video]: '🎥 Vídeo',
      [TipoMensagem.Documento]: '📄 Documento',
      [TipoMensagem.Contato]: '👤 Contato',
      [TipoMensagem.Localizacao]: '📍 Localização',
      [TipoMensagem.Sticker]: '🎨 Sticker'
    };
    return tiposTexto[tipo] || 'Mensagem';
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
      isUsuario: true,
      tipoMensagem: TipoMensagem.Texto
    };

    this.mensagens.push(novaMensagemObj);
    this.cdr.detectChanges();
    this.scrollToBottom();

    try {
      // Enviar mensagem via WhatsApp
      await this.clientService.enviarMensagemTexto(
        this.conversaSelecionada.id,
        textoMensagem
      );

      console.log('Mensagem enviada com sucesso:', textoMensagem);

      // Atualizar última mensagem da conversa
      this.conversaSelecionada.ultimaMensagem = textoMensagem;
      this.conversaSelecionada.horario = novaMensagemObj.horario;

      // Mostrar feedback de sucesso
      this.snackbarService.success('Mensagem enviada com sucesso!');

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

  // ==================== PAINEL LATERAL ====================

  togglePainelLateral(): void {
    this.painelLateralAberto = !this.painelLateralAberto;
    this.cdr.detectChanges();
  }

  fecharPainelLateral(): void {
    this.painelLateralAberto = false;
    this.cdr.detectChanges();
  }

  async alternarModoResposta(): Promise<void> {
    if (!this.conversaSelecionada || this.alterandoModoResposta) {
      return;
    }

    this.alterandoModoResposta = true;
    const novoModo = !this.conversaSelecionada.atendimentoHumano;

    try {
      await this.clientService.alternarModoResposta(
        this.conversaSelecionada.id,
        novoModo
      );

      // Atualizar estado local
      this.conversaSelecionada.atendimentoHumano = novoModo;
      this.conversaSelecionada.cliente.flgRespostaResponsavel = novoModo;

      const mensagem = novoModo
        ? 'Modo de atendimento alterado para: Atendente Humano'
        : 'Modo de atendimento alterado para: Resposta Automatizada (IA)';

      this.snackbarService.success(mensagem);
    } catch (error: any) {
      console.error('Erro ao alternar modo de resposta:', error);
      this.snackbarService.error(
        error.message || 'Erro ao alternar modo de resposta. Tente novamente.'
      );
    } finally {
      this.alterandoModoResposta = false;
      this.cdr.detectChanges();
    }
  }

  // TrackBy functions para melhor performance
  trackByConversaId(_index: number, conversa: Conversa): string {
    return conversa.id;
  }

  trackByMensagemId(_index: number, mensagem: Mensagem): string {
    return mensagem.id;
  }
}