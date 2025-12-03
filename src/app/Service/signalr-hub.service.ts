import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { environment } from '../Environment/Environment';
import { LocalStorageService } from './Local/local-storage';
import { Subject, Observable } from 'rxjs';

// ==================== INTERFACES ====================

/**
 * Evento PRINCIPAL - Nova mensagem recebida via webhook
 */
export interface MensagemWhatsApp {
  empresaId: string;
  eventType: string;
  payload: any;
  timestamp: string;
}

/**
 * Confirmação de conexão bem-sucedida
 */
export interface OnConnectedData {
  connectionId: string;
  empresaId: string;
  usuarioId: string;
  timestamp: string;
  message: string;
}

/**
 * Atualização de status de sessão WhatsApp
 */
export interface StatusSessaoData {
  empresaId: string;
  sessionName: string;
  status: 'WORKING' | 'SCAN_QR_CODE' | 'STARTING' | 'FAILED' | 'STOPPED';
  timestamp: string;
}

/**
 * QR Code gerado para conectar WhatsApp
 */
export interface QRCodeData {
  empresaId: string;
  sessionName: string;
  qrCode: string;
  timestamp: string;
}

/**
 * WhatsApp conectado com sucesso
 */
export interface WhatsAppConectadoData {
  empresaId: string;
  sessionName: string;
  telefone: string;
  timestamp: string;
}

/**
 * WhatsApp desconectado
 */
export interface WhatsAppDesconectadoData {
  empresaId: string;
  sessionName: string;
  motivo?: string;
  timestamp: string;
}

/**
 * Resposta ao Ping
 */
export interface PongData {
  timestamp: string;
  connectionId: string;
}

/**
 * Cliente atualizado
 */
export interface ClienteAtualizadoData {
  empresaId: string;
  tipoAtualizacao: string;
  cliente: any;
  timestamp: string;
}

/**
 * Serviço para gerenciar conexões SignalR com o backend
 * Permite receber atualizações em tempo real sobre mensagens e status do WhatsApp
 */
@Injectable({
  providedIn: 'root'
})
export class SignalRHubService {
  private hubConnection?: HubConnection;

  // Subjects para eventos
  private connectionStateSubject = new Subject<boolean>();
  private mensagemRecebidaSubject = new Subject<MensagemWhatsApp>();
  private statusSessaoSubject = new Subject<StatusSessaoData>();
  private qrCodeGeradoSubject = new Subject<QRCodeData>();
  private whatsappConectadoSubject = new Subject<WhatsAppConectadoData>();
  private whatsappDesconectadoSubject = new Subject<WhatsAppDesconectadoData>();
  private onConnectedSubject = new Subject<OnConnectedData>();
  private pongSubject = new Subject<PongData>();
  private clienteAtualizadoSubject = new Subject<ClienteAtualizadoData>();

  // Observables públicos para componentes se inscreverem
  public connectionState$: Observable<boolean> = this.connectionStateSubject.asObservable();
  public mensagemRecebida$: Observable<MensagemWhatsApp> = this.mensagemRecebidaSubject.asObservable();
  public statusSessao$: Observable<StatusSessaoData> = this.statusSessaoSubject.asObservable();
  public qrCodeGerado$: Observable<QRCodeData> = this.qrCodeGeradoSubject.asObservable();
  public whatsappConectado$: Observable<WhatsAppConectadoData> = this.whatsappConectadoSubject.asObservable();
  public whatsappDesconectado$: Observable<WhatsAppDesconectadoData> = this.whatsappDesconectadoSubject.asObservable();
  public onConnected$: Observable<OnConnectedData> = this.onConnectedSubject.asObservable();
  public pong$: Observable<PongData> = this.pongSubject.asObservable();
  public clienteAtualizado$: Observable<ClienteAtualizadoData> = this.clienteAtualizadoSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 segundos

  constructor(private localStorageService: LocalStorageService) {}

  /**
   * Inicia a conexão com o Hub SignalR
   */
  public async startConnection(): Promise<void> {
    try {
      const token = this.localStorageService.getToken();

      if (!token) {
        console.warn('Token não encontrado. Não é possível conectar ao SignalR.');
        return;
      }

      // Cria a conexão se não existir
      if (!this.hubConnection) {
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${environment.url_Client}/hubs/whatsapp`, {
            accessTokenFactory: () => token,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              // Estratégia de reconexão exponencial
              if (retryContext.previousRetryCount < 5) {
                return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
              }
              return null; // Para de tentar após 5 tentativas
            }
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Configura handlers de eventos
        this.setupEventHandlers();
      }

      // Verifica se já está conectado
      if (this.hubConnection.state === HubConnectionState.Connected) {
        console.log('SignalR já está conectado');
        return;
      }

      // Inicia a conexão
      await this.hubConnection.start();
      console.log('✅ SignalR conectado com sucesso');
      this.reconnectAttempts = 0;
      this.connectionStateSubject.next(true);

    } catch (error) {
      console.error('❌ Erro ao conectar SignalR:', error);
      this.connectionStateSubject.next(false);

      // Tenta reconectar
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.startConnection(), this.reconnectDelay);
      } else {
        console.error('Máximo de tentativas de reconexão atingido');
      }
    }
  }

  /**
   * Para a conexão com o Hub SignalR
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR desconectado');
        this.connectionStateSubject.next(false);
      } catch (error) {
        console.error('Erro ao desconectar SignalR:', error);
      }
    }
  }

  /**
   * Configura os handlers para eventos do SignalR
   */
  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // ⭐ EVENTO PRINCIPAL - Nova mensagem recebida via webhook
    this.hubConnection.on('ReceberMensagem', (data: MensagemWhatsApp) => {
      console.log('📨 Nova mensagem recebida:', data);
      this.mensagemRecebidaSubject.next(data);
    });

    // Confirmação de conexão
    this.hubConnection.on('OnConnected', (data: OnConnectedData) => {
      console.log('🔗 Conectado ao hub SignalR:', data);
      this.onConnectedSubject.next(data);
    });

    // Status de sessão atualizado
    this.hubConnection.on('ReceberStatusSessao', (data: StatusSessaoData) => {
      console.log('🔄 Status da sessão atualizado:', data);
      this.statusSessaoSubject.next(data);
    });

    // QR Code gerado
    this.hubConnection.on('QRCodeGerado', (data: QRCodeData) => {
      console.log('📱 QR Code gerado:', data);
      this.qrCodeGeradoSubject.next(data);
    });

    // WhatsApp conectado
    this.hubConnection.on('WhatsAppConectado', (data: WhatsAppConectadoData) => {
      console.log('✅ WhatsApp conectado:', data);
      this.whatsappConectadoSubject.next(data);
    });

    // WhatsApp desconectado
    this.hubConnection.on('WhatsAppDesconectado', (data: WhatsAppDesconectadoData) => {
      console.log('❌ WhatsApp desconectado:', data);
      this.whatsappDesconectadoSubject.next(data);
    });

    // Resposta ao Ping
    this.hubConnection.on('Pong', (data: PongData) => {
      console.log('🏓 Pong recebido:', data);
      this.pongSubject.next(data);
    });

    // Cliente atualizado
    this.hubConnection.on('ClienteAtualizado', (data: ClienteAtualizadoData) => {
      console.log('👤 Cliente atualizado:', data);
      this.clienteAtualizadoSubject.next(data);
    });

    // Eventos de reconexão
    this.hubConnection.onreconnecting((error) => {
      console.warn('⚠️ SignalR reconectando...', error);
      this.connectionStateSubject.next(false);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconectado. Connection ID:', connectionId);
      this.connectionStateSubject.next(true);
      this.reconnectAttempts = 0;
    });

    this.hubConnection.onclose((error) => {
      console.error('❌ Conexão SignalR fechada', error);
      this.connectionStateSubject.next(false);
    });
  }

  /**
   * Envia uma mensagem para o hub (se necessário no futuro)
   */
  public async invokeMethod<T>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR não está conectado');
    }

    try {
      return await this.hubConnection.invoke<T>(methodName, ...args);
    } catch (error) {
      console.error(`Erro ao invocar método ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Envia um ping para o servidor para verificar se a conexão está ativa
   * Resposta: evento 'Pong' com { timestamp, connectionId }
   */
  public async ping(): Promise<void> {
    try {
      await this.invokeMethod('Ping');
      console.log('🏓 Ping enviado ao servidor');
    } catch (error) {
      console.error('Erro ao enviar ping:', error);
    }
  }

  /**
   * Inscreve-se em um grupo específico (por exemplo, para receber atualizações de uma sessão específica)
   * NOTA: A conexão é automaticamente adicionada ao grupo da empresa ao conectar
   */
  public async joinGroup(groupName: string): Promise<void> {
    try {
      await this.invokeMethod('JoinGroup', groupName);
      console.log(`Inscrito no grupo: ${groupName}`);
    } catch (error) {
      console.error(`Erro ao se inscrever no grupo ${groupName}:`, error);
    }
  }

  /**
   * Desinscreve-se de um grupo
   */
  public async leaveGroup(groupName: string): Promise<void> {
    try {
      await this.invokeMethod('LeaveGroup', groupName);
      console.log(`Desinscrito do grupo: ${groupName}`);
    } catch (error) {
      console.error(`Erro ao se desinscrever do grupo ${groupName}:`, error);
    }
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  /**
   * Obtém o estado atual da conexão
   */
  public getConnectionState(): HubConnectionState | undefined {
    return this.hubConnection?.state;
  }
}
