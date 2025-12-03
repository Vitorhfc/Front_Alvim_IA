import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';
import { ClientService } from '../../Service/Api/client.service';
import { SnackbarService } from '../../Service/snackbar';
import { Cliente, StatusConversa } from '../../Models/Entidades/Client/Cliente';
import { Mensagem as MensagemAPI, ContagemMensagens, TipoMensagem } from '../../Models/Entidades/Client/Mensagem';
import { SignalRHubService, MensagemWhatsApp, ClienteAtualizadoData } from '../../Service/signalr-hub.service';
import { ConfirmationModalComponent } from '../../Components/confirmation-modal/confirmation-modal.component';

interface MensagemView {
  id: string;
  remetenteId: string;
  texto: string;
  dtEnvio: Date;
}

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class ClienteComponent implements OnInit, OnDestroy {
  cliente: Cliente | null = null;
  loading: boolean = true;
  error: string | null = null;
  editMode: boolean = false;
  salvando: boolean = false;
  removendo: boolean = false;
  alterandoModoResposta: boolean = false;

  // Form data
  formData: Partial<Cliente> = {};

  // Tabs
  activeTab: 'dados' | 'mensagens' | 'historico' = 'dados';
  mensagens: MensagemView[] = [];
  loadingMensagens: boolean = false;

  // Contagem de mensagens
  contagemMensagens: ContagemMensagens | null = null;
  loadingContagem: boolean = false;

  // Modal de confirmação de atualização
  mostrarModalAtualizacao: boolean = false;
  clienteAtualizadoBuffer: Cliente | null = null;

  // Gerenciamento de subscrições
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRHubService
  ) { }

  ngOnInit(): void {
    const clienteId = this.route.snapshot.paramMap.get('id');
    if (clienteId) {
      this.carregarCliente(clienteId);
      this.configurarSignalR();
    } else {
      this.error = 'ID do cliente não fornecido';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CARREGAMENTO ====================

  async carregarCliente(id: string): Promise<void> {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      this.cliente = await this.clientService.buscarClientePorId(id);
      this.formData = { ...this.cliente };
      this.error = null;

      // Carregar contagem de mensagens
      this.carregarContagemMensagens();
    } catch (error: any) {
      this.error = error.message || 'Erro ao carregar dados do cliente';
      console.error('Erro ao carregar cliente:', error);
      if (this.error) {
        this.snackbarService.error(this.error);
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async carregarMensagens(): Promise<void> {
    if (!this.cliente?.id || this.loadingMensagens) return;

    this.loadingMensagens = true;
    this.cdr.detectChanges();

    try {
      const response = await this.clientService.listarMensagensConversa(
        this.cliente.id,
        'asc'
      );

      this.mensagens = response.mensagens
        .map(msg => ({
          id: msg.id || '',
          remetenteId: msg.clienteId || 'Sistema',
          texto: msg.conteudoTexto || '',
          dtEnvio: msg.dtRecebido
        }))
        .sort((a, b) => new Date(a.dtEnvio).getTime() - new Date(b.dtEnvio).getTime());

    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      this.snackbarService.error('Erro ao carregar mensagens');
      this.mensagens = [];
    } finally {
      this.loadingMensagens = false;
      this.cdr.detectChanges();
    }
  }

  async carregarContagemMensagens(): Promise<void> {
    if (!this.cliente?.id || this.loadingContagem) return;

    this.loadingContagem = true;
    this.cdr.detectChanges();

    try {
      this.contagemMensagens = await this.clientService.buscarContagemMensagens(
        this.cliente.id
      );
    } catch (error: any) {
      console.error('Erro ao carregar contagem de mensagens:', error);
      this.contagemMensagens = null;
    } finally {
      this.loadingContagem = false;
      this.cdr.detectChanges();
    }
  }

  // ==================== SIGNALR ====================

  /**
   * Configura os listeners do SignalR para receber mensagens em tempo real
   * A conexão já foi iniciada no ConversasComponent
   */
  private configurarSignalR(): void {
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
          console.log('✅ SignalR conectado - Cliente em tempo real');
        }
      });

    // Escutar atualizações de cliente
    this.signalRService.clienteAtualizado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((clienteAtualizadoData: ClienteAtualizadoData) => {
        this.handleClienteAtualizadoSignalR(clienteAtualizadoData);
      });
  }

  /**
   * Manipula nova mensagem recebida via SignalR
   * Só processa se for do cliente atual
   */
  private handleNovaMensagemWhatsApp(mensagemWhatsApp: MensagemWhatsApp): void {
    try {
      const payload = mensagemWhatsApp.payload;

      if (!payload || !payload.clienteId || !this.cliente) {
        return;
      }

      // Só processar se for mensagem do cliente atual
      if (payload.clienteId !== this.cliente.id) {
        return;
      }

      console.log('📨 Nova mensagem recebida para este cliente:', payload);

      // Atualizar última interação
      this.cliente.dtUltimaInteracao = new Date();

      // Se está na aba de mensagens, adicionar mensagem na lista
      if (this.activeTab === 'mensagens') {
        this.adicionarMensagemNaLista(payload);
      }

      // Atualizar contagem de mensagens
      if (this.contagemMensagens) {
        this.contagemMensagens.totalMensagens++;
        if (payload.flgMensagemCliente) {
          this.contagemMensagens.mensagensCliente++;
        } else {
          this.contagemMensagens.mensagensResponsavel++;
        }
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao processar mensagem do SignalR:', error);
    }
  }

  /**
   * Adiciona nova mensagem na lista de mensagens
   */
  private adicionarMensagemNaLista(payloadMensagem: any): void {
    const novaMensagem: MensagemView = {
      id: payloadMensagem.id || `signalr_${Date.now()}`,
      remetenteId: payloadMensagem.clienteId || 'Sistema',
      texto: payloadMensagem.conteudoTexto || this.obterTextoTipoMensagem(payloadMensagem.tipoMensagem),
      dtEnvio: new Date()
    };

    this.mensagens.push(novaMensagem);
    this.cdr.detectChanges();
  }

  /**
   * Obtém texto descritivo para tipos de mensagem não-texto
   */
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

  /**
   * Manipula atualização de cliente via SignalR
   * Se o usuário estiver em modo de edição, exibe modal de confirmação
   * Caso contrário, atualiza automaticamente
   */
  private handleClienteAtualizadoSignalR(clienteAtualizadoData: ClienteAtualizadoData): void {
    try {
      const clienteAtualizado = clienteAtualizadoData.cliente;

      if (!clienteAtualizado || !clienteAtualizado.id || !this.cliente) {
        return;
      }

      // Só processar se for o cliente atual
      if (clienteAtualizado.id !== this.cliente.id) {
        return;
      }

      console.log('👤 Cliente atual foi atualizado via SignalR:', clienteAtualizado);

      // Se estiver em modo de edição, exibir modal de confirmação
      if (this.editMode) {
        this.clienteAtualizadoBuffer = clienteAtualizado;
        this.mostrarModalAtualizacao = true;
        this.cdr.detectChanges();
      } else {
        // Atualizar automaticamente se não estiver editando
        this.aplicarAtualizacaoCliente(clienteAtualizado);
      }
    } catch (error) {
      console.error('Erro ao processar atualização de cliente do SignalR:', error);
    }
  }

  /**
   * Aplica a atualização do cliente recebida via SignalR
   */
  private aplicarAtualizacaoCliente(clienteAtualizado: Cliente): void {
    this.cliente = clienteAtualizado;
    this.formData = { ...clienteAtualizado };
    this.cdr.detectChanges();
    console.log('✅ Cliente atualizado com sucesso');
  }

  /**
   * Confirma a atualização do cliente (chamado pelo modal)
   * Perde as edições locais e aplica os dados do servidor
   */
  confirmarAtualizacaoCliente(): void {
    if (this.clienteAtualizadoBuffer) {
      this.aplicarAtualizacaoCliente(this.clienteAtualizadoBuffer);
      this.editMode = false;
      this.clienteAtualizadoBuffer = null;
    }
    this.mostrarModalAtualizacao = false;
    this.cdr.detectChanges();
    this.snackbarService.info('Cliente atualizado com as informações mais recentes do servidor');
  }

  /**
   * Cancela a atualização do cliente (chamado pelo modal)
   * Mantém as edições locais
   */
  cancelarAtualizacaoCliente(): void {
    this.clienteAtualizadoBuffer = null;
    this.mostrarModalAtualizacao = false;
    this.cdr.detectChanges();
  }

  // ==================== AÇÕES ====================

  habilitarEdicao(): void {
    this.editMode = true;
    this.formData = { ...this.cliente };
    this.cdr.detectChanges();
  }

  cancelarEdicao(): void {
    this.editMode = false;
    this.formData = { ...this.cliente };
    this.cdr.detectChanges();
  }

  async salvarAlteracoes(): Promise<void> {
    if (!this.cliente?.id || this.salvando) return;

    // Validações básicas
    if (!this.formData.nome?.trim()) {
      this.snackbarService.warning('O nome do cliente é obrigatório');
      return;
    }

    this.salvando = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      const clienteAtualizado = await this.clientService.atualizarCliente(
        this.cliente.id,
        this.formData
      );

      this.cliente = clienteAtualizado;
      this.formData = { ...clienteAtualizado };
      this.editMode = false;
      this.snackbarService.success('Cliente atualizado com sucesso!');
    } catch (error: any) {
      this.error = error.message || 'Erro ao atualizar cliente';
      console.error('Erro ao atualizar cliente:', error);
      if (this.error) {
        this.snackbarService.error(this.error);
      }
    } finally {
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  async removerCliente(): Promise<void> {
    if (!this.cliente?.id || this.removendo) return;

    const confirmar = confirm(
      `Tem certeza que deseja remover o cliente "${this.cliente.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    this.removendo = true;
    this.error = null;
    this.cdr.detectChanges();

    try {
      await this.clientService.removerCliente(this.cliente.id);
      this.snackbarService.success('Cliente removido com sucesso!');

      // Aguarda um momento antes de navegar
      setTimeout(() => {
        this.router.navigate(['/conversas']);
      }, 500);
    } catch (error: any) {
      this.error = error.message || 'Erro ao remover cliente';
      console.error('Erro ao remover cliente:', error);
      if (this.error) {
        this.snackbarService.error(this.error);
      }
      this.removendo = false;
      this.cdr.detectChanges();
    }
  }

  voltarParaConversas(): void {
    this.router.navigate(['/conversas']);
  }

  async alternarModoResposta(): Promise<void> {
    if (!this.cliente?.id) return;

    if (this.alterandoModoResposta) {
      console.log('Já está alterando modo de resposta, ignorando...');
      return;
    }

    console.log('Iniciando alteração de modo de resposta...');
    this.alterandoModoResposta = true;
    const novoModo = !this.cliente.flgRespostaResponsavel;
    this.cdr.detectChanges();

    this.alterandoModoResposta = false;
    this.cdr.detectChanges();

    try {
      console.log('Chamando API para alternar modo:', { clienteId: this.cliente.id, novoModo });

      await this.clientService.alternarModoResposta(
        this.cliente.id,
        novoModo
      );

      console.log('API retornou sucesso, atualizando estado local...');

      // Atualizar estado local
      this.cliente.flgRespostaResponsavel = novoModo;

      // Atualizar as datas
      if (novoModo) {
        this.cliente.dtFlgResponsavelAtiva = new Date();
      } else {
        this.cliente.dtFlgResponsavelDesativada = new Date();
      }

      const mensagem = novoModo
        ? 'Modo alterado para: Atendente Humano'
        : 'Modo alterado para: Resposta Automatizada (IA)';

      this.snackbarService.success(mensagem);
      console.log('Sucesso ao alterar modo de resposta');
    } catch (error: any) {
      console.error('Erro ao alternar modo de resposta:', error);
      this.snackbarService.error(
        error.message || 'Erro ao alternar modo de resposta. Tente novamente.'
      );
    } finally {
      console.log('Finalizando alteração de modo de resposta, resetando estado...');
      this.alterandoModoResposta = false;
      this.cdr.detectChanges();
      console.log('Estado resetado:', { alterandoModoResposta: this.alterandoModoResposta });
    }
  }

  // ==================== HELPERS ====================

  selecionarTab(tab: 'dados' | 'mensagens' | 'historico'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();

    if (tab === 'mensagens' && this.mensagens.length === 0) {
      this.carregarMensagens();
    }
  }

  getStatusLabel(status: StatusConversa): string {
    const labels: Record<StatusConversa, string> = {
      [StatusConversa.Ativa]: 'Ativa',
      [StatusConversa.EmAtendimentoHumano]: 'Em Atendimento Humano',
      [StatusConversa.Finalizada]: 'Finalizada',
      [StatusConversa.Aguardando]: 'Aguardando'
    };
    return labels[status] || 'Desconhecido';
  }

  getStatusClass(status: StatusConversa): string {
    const classes: Record<StatusConversa, string> = {
      [StatusConversa.Ativa]: 'status-ativa',
      [StatusConversa.EmAtendimentoHumano]: 'status-atendimento',
      [StatusConversa.Finalizada]: 'status-finalizada',
      [StatusConversa.Aguardando]: 'status-aguardando'
    };
    return classes[status] || '';
  }

  formatarData(data: Date | null): string {
    if (!data) return 'Não informado';

    try {
      const dataObj = new Date(data);

      if (isNaN(dataObj.getTime())) {
        return 'Data inválida';
      }

      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      const ehHoje = dataObj.toDateString() === hoje.toDateString();
      const ehOntem = dataObj.toDateString() === ontem.toDateString();

      if (ehHoje) {
        return `Hoje às ${dataObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      } else if (ehOntem) {
        return `Ontem às ${dataObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      }

      return dataObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  formatarTelefone(numero: string): string {
    if (!numero) return 'Não informado';

    const cleaned = numero.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 13) {
      // Formato internacional (ex: 5511999999999)
      return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    }

    return numero;
  }

  formatarCPF(cpf: string | undefined): string {
    if (!cpf) return 'Não informado';

    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
    }

    return cpf;
  }

  getInitials(nome: string): string {
    if (!nome) return '?';

    const names = nome.trim().split(' ').filter(n => n.length > 0);

    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    return nome.substring(0, 2).toUpperCase();
  }

  // Getter para exibir CPF formatado no modo visualização
  get cpfFormatado(): string {
    return this.formatarCPF(this.cliente?.cpf);
  }

  // TrackBy function para otimizar renderização da lista de mensagens
  trackByMensagemId(_index: number, mensagem: MensagemView): string {
    return mensagem.id;
  }
}