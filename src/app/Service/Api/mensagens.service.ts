import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import { SpinnerService } from '../Local/spinner';

// ==================== INTERFACES ====================

export interface EnviarWhatsAppRequest {
  numeroDestino: string;
  mensagem: string;
  tipo?: 'texto' | 'imagem' | 'audio' | 'video' | 'documento';
  urlMidia?: string;
  nomeArquivo?: string;
}

export interface EnviarWhatsAppResponse {
  sucesso: boolean;
  mensagem: string;
  idEnvio?: string;
  dataEnvio: Date;
  erro?: string;
}

export interface ProcessarMensagemN8NRequest {
  idEmpresa: string;
  idCliente: string;
  ultimaResposta: {
    idMensagem: string;
    flgMensagemCliente: boolean;
    dtRecebido: Date;
    mensagem: string;
    tipoMensagem: string;
  };
  listaUltimasMensagens: Array<{
    idMensagem: string;
    flgMensagemCliente: boolean;
    dtRecebido: Date;
    mensagem: string;
    tipoMensagem: string;
  }>;
  flgPrimeiraMensagemDoDia: boolean;
}

export interface RespostaIAResponse {
  textoResposta: string;
  tipoResposta: string;
  urlAudio?: string;
  modeloUtilizado?: string;
  tokensUtilizados?: number;
  tempoProcessamentoMs?: number;
  modulosUtilizados?: string[];
  documentosConsultados?: string[];
  agendamentoGeradoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MensagensService {
  private readonly CLIENT_API = environment.url_Client;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private spinnerService: SpinnerService
  ) {}

  // ==================== HEADERS ====================

  private getHeaders(): HttpHeaders {
    const token = this.localStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== ENVIO DE WHATSAPP ====================

  /**
   * Envia mensagem via WhatsApp usando WAHA
   */
  async enviarWhatsApp(request: EnviarWhatsAppRequest): Promise<EnviarWhatsAppResponse> {
    this.spinnerService.show();

    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<EnviarWhatsAppResponse>>(
          `${this.CLIENT_API}/WhatsApp/Enviar`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao enviar mensagem WhatsApp');
    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao enviar mensagem WhatsApp'
      );
    } finally {
      this.spinnerService.hidden();
    }
  }

  /**
   * Envia mensagem de texto simples via WhatsApp
   */
  async enviarMensagemTexto(numeroDestino: string, mensagem: string): Promise<EnviarWhatsAppResponse> {
    return this.enviarWhatsApp({
      numeroDestino,
      mensagem,
      tipo: 'texto'
    });
  }

  /**
   * Envia mensagem com mídia via WhatsApp
   */
  async enviarMensagemComMidia(
    numeroDestino: string,
    mensagem: string,
    urlMidia: string,
    tipo: 'imagem' | 'audio' | 'video' | 'documento',
    nomeArquivo?: string
  ): Promise<EnviarWhatsAppResponse> {
    return this.enviarWhatsApp({
      numeroDestino,
      mensagem,
      tipo,
      urlMidia,
      nomeArquivo
    });
  }

  // ==================== PROCESSAMENTO N8N ====================

  /**
   * Envia mensagem para processamento pela IA via N8N
   */
  async processarMensagemN8N(request: ProcessarMensagemN8NRequest): Promise<RespostaIAResponse> {
    this.spinnerService.show();

    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<RespostaIAResponse>>(
          `${this.CLIENT_API}/N8N/Processar-Mensagens`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao processar mensagem com IA');
    } catch (error: any) {
      console.error('Erro ao processar mensagem N8N:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao processar mensagem com IA'
      );
    } finally {
      this.spinnerService.hidden();
    }
  }

  /**
   * Obtém contexto do projeto do cliente para IA
   */
  async obterContextoProjeto(idCliente: string): Promise<string> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ contexto: string }>>(
          `${this.CLIENT_API}/N8N/Cliente/${idCliente}/Contexto-Projeto`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data.contexto;
      }

      throw new Error(response.mensagem || 'Erro ao obter contexto do projeto');
    } catch (error: any) {
      console.error('Erro ao obter contexto:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao obter contexto do projeto'
      );
    }
  }

  /**
   * Obtém plano e features habilitadas do cliente
   */
  async obterPlanoCliente(idCliente: string): Promise<{
    planoDeAudio: boolean;
    planoDeDocumentos: boolean;
    planoAgendamentoDeAtendimentos: boolean;
  }> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(
          `${this.CLIENT_API}/N8N/Cliente/${idCliente}/Plano`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter plano do cliente');
    } catch (error: any) {
      console.error('Erro ao obter plano:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao obter plano do cliente'
      );
    }
  }

  /**
   * Lista documentos do cliente para IA
   */
  async listarDocumentosCliente(idCliente: string): Promise<Array<{
    id: string;
    nome: string;
    tipo: string;
    url: string;
  }>> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ documentos: any[] }>>(
          `${this.CLIENT_API}/N8N/Cliente/${idCliente}/Documentos`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data.documentos;
      }

      throw new Error(response.mensagem || 'Erro ao listar documentos');
    } catch (error: any) {
      console.error('Erro ao listar documentos:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao listar documentos'
      );
    }
  }
}
