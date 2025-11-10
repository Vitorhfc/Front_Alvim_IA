import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';
import { WahaService } from '../../Service/Api/waha.service';
import { SnackbarService } from '../../Service/snackbar';
import { hideSpinner, ShowSpinner } from '../../Service/Local/spinner';
import { WAHASessionStatus } from '../../Models/Objetos/waha.model';
import { QRCodeComponent } from 'angularx-qrcode';
import { SignalRHubService, WhatsAppStatusUpdate } from '../../Service/signalr-hub.service';
import { Subscription } from 'rxjs';

interface StatusConexao {
  status: 'connected' | 'disconnected' | 'connecting' | 'qr' | 'error';
  telefone?: string;
  qrCode?: string;
  mensagem?: string;
  sessionName?: string;
}

@Component({
  selector: 'app-whatsapp-config',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, QRCodeComponent],
  templateUrl: './whatsapp-config.html',
  styleUrls: ['./whatsapp-config.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhatsappConfigComponent implements OnInit, OnDestroy {
  carregando: boolean = true;
  salvandoTelefone: boolean = false;
  conectando: boolean = false;
  editandoTelefone: boolean = false;

  // Dados da conexão
  statusConexao: StatusConexao = {
    status: 'disconnected',
    mensagem: 'Aguardando conexão...'
  };

  // Dados do telefone da empresa
  telefoneEmpresa: string = '';
  telefoneOriginal: string = '';

  // Nome da sessão WAHA (baseado na empresa)
  sessionName: string = '';

  // SignalR - substituindo polling
  private signalRSubscription?: Subscription;
  private connectionStateSubscription?: Subscription;
  private usarSignalR: boolean = true; // Flag para ativar/desativar SignalR

  // Fallback: Intervalo de polling (usado apenas se SignalR falhar)
  private pollingInterval: any = null;
  private readonly POLLING_INTERVAL_MS = 30000; // 30 segundos (reduzido drasticamente)
  private readonly POLLING_FAST_INTERVAL_MS = 10000; // 10 segundos quando aguardando conexão

  // Controle de erros consecutivos
  private errosConsecutivos = 0;
  private readonly MAX_ERROS_CONSECUTIVOS = 3; // Para polling após 3 erros seguidos

  constructor(
    private wahaService: WahaService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRHubService
  ) { }

  async ngOnInit(): Promise<void> {
    this.sessionName = await this.wahaService.getNomeSessaoPadrao();

    // Inicializa SignalR
    await this.inicializarSignalR();

    await this.carregarDados();
  }

  ngOnDestroy(): void {
    this.pararMonitoramento();
    this.desconectarSignalR();
  }

  /**
   * Inicializa a conexão SignalR e configura os listeners
   */
  private async inicializarSignalR(): Promise<void> {
    if (!this.usarSignalR) {
      console.log('SignalR desabilitado, usando apenas polling');
      return;
    }

    try {
      // Conecta ao SignalR
      await this.signalRService.startConnection();

      // Inscreve-se no grupo da sessão para receber atualizações específicas
      await this.signalRService.joinGroup(this.sessionName);

      // Configura listener para atualizações de status do WhatsApp
      this.signalRSubscription = this.signalRService.whatsappStatus$.subscribe(
        (update: WhatsAppStatusUpdate) => {
          this.processarAtualizacaoSignalR(update);
        }
      );

      // Monitora estado da conexão SignalR
      this.connectionStateSubscription = this.signalRService.connectionState$.subscribe(
        (connected: boolean) => {
          if (!connected && this.usarSignalR) {
            console.warn('SignalR desconectado, ativando fallback para polling');
            this.iniciarMonitoramentoStatus();
          } else if (connected) {
            console.log('SignalR conectado, desativando polling');
            this.pararMonitoramento();
          }
        }
      );

      console.log('✅ SignalR inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar SignalR, usando polling como fallback:', error);
      this.usarSignalR = false;
      this.iniciarMonitoramentoStatus();
    }
  }

  /**
   * Desconecta do SignalR e limpa subscriptions
   */
  private desconectarSignalR(): void {
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }

    if (this.connectionStateSubscription) {
      this.connectionStateSubscription.unsubscribe();
    }

    if (this.signalRService.isConnected()) {
      this.signalRService.leaveGroup(this.sessionName);
      this.signalRService.stopConnection();
    }
  }

  /**
   * Processa atualizações recebidas via SignalR
   */
  private processarAtualizacaoSignalR(update: WhatsAppStatusUpdate): void {
    console.log('📱 Atualização recebida via SignalR:', update);

    // Verifica se a atualização é para esta sessão
    if (update.sessionName !== this.sessionName) {
      return;
    }

    // Mapeia status do WAHA para status interno
    switch (update.status) {
      case 'WORKING':
        this.statusConexao.status = 'connected';
        this.statusConexao.mensagem = update.message || 'WhatsApp conectado com sucesso';
        if (update.telefone) {
          this.telefoneEmpresa = this.formatarTelefoneExibicao(update.telefone);
          this.telefoneOriginal = this.telefoneEmpresa;
          this.statusConexao.telefone = this.telefoneEmpresa;
        }
        this.snackbarService.success('WhatsApp conectado com sucesso!');
        break;

      case 'SCAN_QR_CODE':
        this.statusConexao.status = 'qr';
        this.statusConexao.mensagem = update.message || 'Escaneie o QR Code no seu WhatsApp';
        if (update.qrCode) {
          this.statusConexao.qrCode = update.qrCode;
        }
        break;

      case 'STARTING':
        this.statusConexao.status = 'connecting';
        this.statusConexao.mensagem = update.message || 'Iniciando sessão...';
        break;

      case 'FAILED':
        this.statusConexao.status = 'error';
        this.statusConexao.mensagem = update.message || 'Falha na conexão. Tente novamente.';
        this.snackbarService.error('Erro na conexão do WhatsApp');
        break;

      case 'STOPPED':
        this.statusConexao.status = 'disconnected';
        this.statusConexao.mensagem = update.message || 'WhatsApp desconectado';
        this.telefoneEmpresa = '';
        this.telefoneOriginal = '';
        break;

      default:
        console.warn('Status desconhecido recebido:', update.status);
    }

    this.cdr.detectChanges();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.carregando = true;
    this.cdr.detectChanges();

    ShowSpinner();
    try {
      // Verifica status atual da sessão
      await this.verificarStatusConexao();

      // Se conectado, busca informações da conta
      if (this.statusConexao.status === 'connected') {
        await this.carregarInformacoesConta();
      }

      // Inicia monitoramento automático APENAS se SignalR não estiver ativo
      if (!this.usarSignalR || !this.signalRService.isConnected()) {
        console.log('Iniciando polling como fallback (SignalR não disponível)');
        this.iniciarMonitoramentoStatus();
      } else {
        console.log('SignalR ativo, polling desabilitado');
      }

      this.carregando = false;
      this.cdr.detectChanges();
      hideSpinner();
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      this.snackbarService.error('Erro ao carregar configurações do WhatsApp');
      this.carregando = false;
      this.cdr.detectChanges();
      hideSpinner();
    }
  }

  // ==================== STATUS E CONEXÃO ====================

  /**
   * Verifica o status atual da sessão WAHA
   */
  async verificarStatusConexao(): Promise<void> {
    try {
      const statusResponse = await this.wahaService.obterStatus(this.sessionName);

      // Sucesso - reseta contador de erros
      this.errosConsecutivos = 0;

      this.statusConexao.sessionName = this.sessionName;

      // Mapeia status do WAHA para status interno
      switch (statusResponse.status) {
        case WAHASessionStatus.WORKING:
          this.statusConexao.status = 'connected';
          this.statusConexao.mensagem = 'WhatsApp conectado com sucesso';
          break;

        case WAHASessionStatus.SCAN_QR_CODE:
          this.statusConexao.status = 'qr';
          this.statusConexao.mensagem = 'Escaneie o QR Code no seu WhatsApp';
          // Busca o QR Code
          await this.buscarQRCode();
          break;

        case WAHASessionStatus.STARTING:
          this.statusConexao.status = 'connecting';
          this.statusConexao.mensagem = 'Iniciando sessão...';
          break;

        case WAHASessionStatus.FAILED:
          this.statusConexao.status = 'error';
          this.statusConexao.mensagem = 'Falha na conexão. Tente novamente.';
          break;

        case WAHASessionStatus.STOPPED:
        default:
          this.statusConexao.status = 'disconnected';
          this.statusConexao.mensagem = 'WhatsApp desconectado';
          break;
      }

      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);

      // Incrementa contador de erros
      this.errosConsecutivos++;

      // Se sessão não existe ou erro no backend, trata como desconectado
      this.statusConexao = {
        status: 'disconnected',
        mensagem: 'WhatsApp não conectado. Clique em "Conectar WhatsApp" para iniciar.',
        sessionName: this.sessionName
      };

      // Se muitos erros consecutivos, para o polling
      if (this.errosConsecutivos >= this.MAX_ERROS_CONSECUTIVOS) {
        console.warn(`Parando polling após ${this.errosConsecutivos} erros consecutivos`);
        this.pararMonitoramento();
        this.statusConexao.mensagem = 'Erro ao conectar com o servidor. Clique em "Conectar WhatsApp" para tentar novamente.';
      }

      this.cdr.detectChanges();
    }
  }

  /**
   * Busca o QR Code da sessão
   */
  async buscarQRCode(): Promise<void> {
    try {
      const qrResponse = await this.wahaService.obterQRCode(this.sessionName);
      this.statusConexao.qrCode = qrResponse.qrCode;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Erro ao buscar QR Code:', error);
      this.snackbarService.error('Erro ao obter QR Code');
    }
  }

  /**
   * Carrega informações da conta conectada
   */
  async carregarInformacoesConta(): Promise<void> {
    try {
      const accountInfo = await this.wahaService.obterInformacoesConta(this.sessionName);

      // Formata o telefone para exibição
      if (accountInfo.id) {
        // Remove @s.whatsapp.net e formata
        const phoneNumber = accountInfo.id.replace('@s.whatsapp.net', '');
        this.telefoneEmpresa = this.formatarTelefoneExibicao(phoneNumber);
        this.telefoneOriginal = this.telefoneEmpresa;
        this.statusConexao.telefone = this.telefoneEmpresa;
      }

      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Erro ao carregar informações da conta:', error);
    }
  }

  /**
   * Inicia monitoramento automático do status
   * Nota: Usado apenas como fallback quando SignalR não está disponível
   */
  iniciarMonitoramentoStatus(): void {
    // Se SignalR estiver ativo, não inicia polling
    if (this.usarSignalR && this.signalRService.isConnected()) {
      console.log('SignalR ativo, polling não necessário');
      return;
    }

    this.pararMonitoramento(); // Para qualquer monitoramento anterior

    const interval = this.statusConexao.status === 'qr' || this.statusConexao.status === 'connecting'
      ? this.POLLING_FAST_INTERVAL_MS
      : this.POLLING_INTERVAL_MS;

    console.log(`Iniciando polling com intervalo de ${interval}ms`);

    this.pollingInterval = setInterval(async () => {
      // Verifica novamente se SignalR foi estabelecido
      if (this.usarSignalR && this.signalRService.isConnected()) {
        console.log('SignalR conectado, parando polling');
        this.pararMonitoramento();
        return;
      }

      if (!this.carregando && !this.conectando) {
        const statusAnterior = this.statusConexao.status;
        await this.verificarStatusConexao();

        // Se mudou de QR/connecting para connected, carrega informações
        if (statusAnterior !== 'connected' && this.statusConexao.status === 'connected') {
          await this.carregarInformacoesConta();
          this.snackbarService.success('WhatsApp conectado com sucesso!');
          // Reduz frequência de polling
          this.iniciarMonitoramentoStatus();
        }
        // Se mudou para QR/connecting, aumenta frequência
        else if ((this.statusConexao.status === 'qr' || this.statusConexao.status === 'connecting')
                 && statusAnterior !== this.statusConexao.status) {
          this.iniciarMonitoramentoStatus();
        }
      }
    }, interval);
  }

  /**
   * Para o monitoramento automático
   */
  pararMonitoramento(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Inicia uma nova conexão WhatsApp
   */
  async iniciarConexao(): Promise<void> {
    // Reseta contador de erros ao tentar conectar manualmente
    this.errosConsecutivos = 0;

    this.conectando = true;
    this.statusConexao.status = 'connecting';
    this.statusConexao.mensagem = 'Iniciando sessão...';
    this.cdr.detectChanges();

    try {
      // Inicia a sessão WAHA
      const qrResponse = await this.wahaService.iniciarSessao(this.sessionName);

      this.statusConexao = {
        status: 'qr',
        qrCode: qrResponse.qrCode,
        mensagem: 'Escaneie o QR Code no seu WhatsApp',
        sessionName: this.sessionName
      };

      this.snackbarService.success('QR Code gerado! Escaneie no seu WhatsApp');

      // Aumenta frequência do polling para detectar conexão rápida
      this.iniciarMonitoramentoStatus();

      this.conectando = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('Erro ao iniciar conexão:', error);
      this.snackbarService.error(error.message || 'Erro ao iniciar conexão com WhatsApp. Verifique se o servidor WAHA está rodando.');

      this.statusConexao = {
        status: 'error',
        mensagem: error.message || 'Erro ao iniciar sessão. Verifique se o servidor está disponível.',
        sessionName: this.sessionName
      };

      this.conectando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Desconecta a sessão WhatsApp
   */
  async desconectar(): Promise<void> {
    const confirmacao = confirm('Tem certeza que deseja desconectar o WhatsApp?\n\nVocê precisará escanear o QR Code novamente para reconectar.');

    if (!confirmacao) {
      return;
    }

    this.conectando = true;
    this.cdr.detectChanges();

    try {
      await this.wahaService.pararSessao(this.sessionName);

      this.statusConexao = {
        status: 'disconnected',
        mensagem: 'WhatsApp desconectado',
        sessionName: this.sessionName
      };

      this.telefoneEmpresa = '';
      this.telefoneOriginal = '';

      this.snackbarService.success('WhatsApp desconectado com sucesso');
      this.conectando = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      this.snackbarService.error(error.message || 'Erro ao desconectar WhatsApp');
      this.conectando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Atualiza o QR Code (gera um novo)
   */
  async atualizarQrCode(): Promise<void> {
    this.conectando = true;
    this.cdr.detectChanges();

    try {
      // Reinicia a sessão para obter novo QR Code
      await this.wahaService.reiniciarSessao(this.sessionName);

      // Aguarda um pouco para a sessão reiniciar
      await this.sleep(1000);

      // Busca o novo QR Code
      const qrResponse = await this.wahaService.obterQRCode(this.sessionName);

      this.statusConexao.qrCode = qrResponse.qrCode;
      this.snackbarService.success('QR Code atualizado');

      this.conectando = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('Erro ao atualizar QR Code:', error);
      this.snackbarService.error(error.message || 'Erro ao atualizar QR Code');
      this.conectando = false;
      this.cdr.detectChanges();
    }
  }

  // ==================== TELEFONE DA EMPRESA ====================
  // Nota: O telefone é obtido automaticamente da conta conectada do WhatsApp
  // Estas funções são mantidas para referência, mas não são editáveis

  iniciarEdicaoTelefone(): void {
    this.snackbarService.info('O telefone é obtido automaticamente do WhatsApp conectado e não pode ser editado manualmente.');
  }

  cancelarEdicaoTelefone(): void {
    this.telefoneEmpresa = this.telefoneOriginal;
    this.editandoTelefone = false;
    this.cdr.detectChanges();
  }

  async salvarTelefone(): Promise<void> {
    // Não é mais necessário, o telefone vem do WhatsApp conectado
    this.snackbarService.info('O telefone é sincronizado automaticamente com o WhatsApp conectado.');
  }

  // ==================== VALIDAÇÃO E FORMATAÇÃO ====================

  validarTelefone(telefone: string): boolean {
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    // Valida se tem entre 10 e 13 dígitos (considerando código do país)
    return numeros.length >= 10 && numeros.length <= 15;
  }

  formatarTelefone(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length <= 2) {
      valor = valor.replace(/(\d{0,2})/, '+$1');
    } else if (valor.length <= 4) {
      valor = valor.replace(/(\d{2})(\d{0,2})/, '+$1 $2');
    } else if (valor.length <= 9) {
      valor = valor.replace(/(\d{2})(\d{2})(\d{0,5})/, '+$1 $2 $3');
    } else {
      valor = valor.replace(/(\d{2})(\d{2})(\d{5})(\d{0,4})/, '+$1 $2 $3-$4');
    }

    this.telefoneEmpresa = valor;
    this.cdr.detectChanges();
  }

  /**
   * Formata número de telefone para exibição
   * Exemplo: 5511987654321 -> +55 11 98765-4321
   */
  formatarTelefoneExibicao(phoneNumber: string): string {
    // Remove caracteres não numéricos
    const numeros = phoneNumber.replace(/\D/g, '');

    // Se começar com 55 (Brasil)
    if (numeros.startsWith('55') && numeros.length >= 12) {
      // Formato: +55 11 98765-4321
      const ddi = numeros.substring(0, 2);
      const ddd = numeros.substring(2, 4);
      const parte1 = numeros.substring(4, 9);
      const parte2 = numeros.substring(9, 13);
      return `+${ddi} ${ddd} ${parte1}-${parte2}`;
    }

    // Formato genérico para outros países
    if (numeros.length > 10) {
      return `+${numeros.substring(0, 2)} ${numeros.substring(2)}`;
    }

    return phoneNumber;
  }

  // ==================== GETTERS ====================

  get telefoneAlterado(): boolean {
    return this.telefoneEmpresa !== this.telefoneOriginal;
  }

  get statusClass(): string {
    switch (this.statusConexao.status) {
      case 'connected': return 'status-connected';
      case 'qr': return 'status-qr';
      case 'connecting': return 'status-connecting';
      case 'error': return 'status-error';
      default: return 'status-disconnected';
    }
  }

  get statusIcon(): string {
    switch (this.statusConexao.status) {
      case 'connected': return 'check_circle';
      case 'qr': return 'qr_code_2';
      case 'connecting': return 'sync';
      case 'error': return 'error';
      default: return 'power_settings_new';
    }
  }

  get statusTexto(): string {
    switch (this.statusConexao.status) {
      case 'connected': return 'Conectado';
      case 'qr': return 'Aguardando QR Code';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro na Conexão';
      default: return 'Desconectado';
    }
  }

  // ==================== UTILS ====================

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}