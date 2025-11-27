import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { environment } from '../Environment/Environment';
import { LocalStorageService } from './Local/local-storage';
import { Subject, Observable } from 'rxjs';

export interface WhatsAppStatusUpdate {
  sessionName: string;
  status: string;
  message?: string;
  telefone?: string;
  qrCode?: string;
  timestamp: Date;
}

/**
 * Serviço para gerenciar conexões SignalR com o backend
 * Permite receber atualizações em tempo real sobre o status do WhatsApp
 */
@Injectable({
  providedIn: 'root'
})
export class SignalRHubService {
  private hubConnection?: HubConnection;
  private whatsappStatusSubject = new Subject<WhatsAppStatusUpdate>();
  private connectionStateSubject = new Subject<boolean>();

  // Observables para componentes se inscreverem
  public whatsappStatus$: Observable<WhatsAppStatusUpdate> = this.whatsappStatusSubject.asObservable();
  public connectionState$: Observable<boolean> = this.connectionStateSubject.asObservable();

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

    // Evento: Status do WhatsApp alterado
    this.hubConnection.on('WhatsAppStatusChanged', (update: WhatsAppStatusUpdate) => {
      console.log('📱 Status do WhatsApp atualizado:', update);
      this.whatsappStatusSubject.next(update);
    });

    // Evento: QR Code gerado/atualizado
    this.hubConnection.on('QRCodeGerado', (data: { sessionName: string; qrCode: string }) => {
      console.log('🔲 QR Code recebido via SignalR');
      this.whatsappStatusSubject.next({
        sessionName: data.sessionName,
        status: 'SCAN_QR_CODE',
        qrCode: data.qrCode,
        message: 'QR Code gerado. Escaneie no WhatsApp.',
        timestamp: new Date()
      });
    });

    // Evento: WhatsApp conectado
    this.hubConnection.on('WhatsAppConectado', (data: { sessionName: string; telefone: string }) => {
      console.log('✅ WhatsApp conectado via SignalR');
      this.whatsappStatusSubject.next({
        sessionName: data.sessionName,
        status: 'WORKING',
        telefone: data.telefone,
        message: 'WhatsApp conectado com sucesso',
        timestamp: new Date()
      });
    });

    // Evento: WhatsApp desconectado
    this.hubConnection.on('WhatsAppDesconectado', (data: { sessionName: string; motivo?: string }) => {
      console.log('❌ WhatsApp desconectado via SignalR');
      this.whatsappStatusSubject.next({
        sessionName: data.sessionName,
        status: 'STOPPED',
        message: data.motivo || 'WhatsApp desconectado',
        timestamp: new Date()
      });
    });

    // Eventos de conexão
    this.hubConnection.onreconnecting((error) => {
      console.warn('🔄 SignalR reconectando...', error);
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
   * Inscreve-se em um grupo específico (por exemplo, para receber atualizações de uma sessão específica)
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
