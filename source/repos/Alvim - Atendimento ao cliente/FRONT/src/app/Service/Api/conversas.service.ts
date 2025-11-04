import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import {
  ConversasResponse,
  MensagensResponse,
  EnviarMensagemRequest,
  EnviarMensagemResponse,
  ListarConversasRequest,
  ClienteInfo
} from '../../Models/Objetos/conversas.model';

@Injectable({
  providedIn: 'root'
})
export class ConversasService {
  private readonly CLIENT_API = environment.url_Client;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  // ==================== HEADERS ====================

  private getHeaders(): HttpHeaders {
    const token = this.localStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== CONVERSAS ====================

  async listarConversas(request?: ListarConversasRequest): Promise<ConversasResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (request?.pagina) params = params.set('pagina', request.pagina.toString());
      if (request?.tamanhoPagina) params = params.set('tamanhoPagina', request.tamanhoPagina.toString());
      if (request?.filtro) params = params.set('filtro', request.filtro);

      const response = await firstValueFrom(
        this.http.get<ApiResponse<ConversasResponse>>(
          `${this.CLIENT_API}/Conversas`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao listar conversas');
    } catch (error: any) {
      console.error('Erro ao listar conversas:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar conversas'
      );
    }
  }

  async obterConversaPorId(conversaId: string): Promise<ClienteInfo> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ClienteInfo>>(
          `${this.CLIENT_API}/Conversas/${conversaId}`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter conversa');
    } catch (error: any) {
      console.error('Erro ao obter conversa:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar conversa'
      );
    }
  }

  // ==================== MENSAGENS ====================

  async listarMensagens(conversaId: string): Promise<MensagensResponse> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<MensagensResponse>>(
          `${this.CLIENT_API}/Conversas/${conversaId}/Mensagens`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao listar mensagens');
    } catch (error: any) {
      console.error('Erro ao listar mensagens:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar mensagens'
      );
    }
  }

  async enviarMensagem(request: EnviarMensagemRequest): Promise<EnviarMensagemResponse> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<EnviarMensagemResponse>>(
          `${this.CLIENT_API}/Conversas/${request.conversaId}/Mensagens`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao enviar mensagem');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao enviar mensagem'
      );
    }
  }
}
