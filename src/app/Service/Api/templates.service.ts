import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import {
  TemplatesResponse,
  TemplateResponse,
  Template,
  CriarTemplateRequest,
  AtualizarTemplateRequest,
  ListarTemplatesRequest
} from '../../Models/Objetos/templates.model';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
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

  // ==================== TEMPLATES ====================

  async listarTemplates(request?: ListarTemplatesRequest): Promise<TemplatesResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (request?.categoria) params = params.set('categoria', request.categoria);
      if (request?.busca) params = params.set('busca', request.busca);
      if (request?.pagina) params = params.set('pagina', request.pagina.toString());
      if (request?.tamanhoPagina) params = params.set('tamanhoPagina', request.tamanhoPagina.toString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<TemplatesResponse>>(
          `${this.CLIENT_API}/Templates`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao listar templates');
    } catch (error: any) {
      console.error('Erro ao listar templates:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar templates'
      );
    }
  }

  async obterTemplatePorId(templateId: string): Promise<Template> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<TemplateResponse>>(
          `${this.CLIENT_API}/Templates/${templateId}`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data.template;
      }

      throw new Error(response.mensagem || 'Erro ao obter template');
    } catch (error: any) {
      console.error('Erro ao obter template:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar template'
      );
    }
  }

  async criarTemplate(request: CriarTemplateRequest): Promise<Template> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<TemplateResponse>>(
          `${this.CLIENT_API}/Templates`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data.template;
      }

      throw new Error(response.mensagem || 'Erro ao criar template');
    } catch (error: any) {
      console.error('Erro ao criar template:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao criar template'
      );
    }
  }

  async atualizarTemplate(templateId: string, request: AtualizarTemplateRequest): Promise<Template> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.put<ApiResponse<TemplateResponse>>(
          `${this.CLIENT_API}/Templates/${templateId}`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data.template;
      }

      throw new Error(response.mensagem || 'Erro ao atualizar template');
    } catch (error: any) {
      console.error('Erro ao atualizar template:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao atualizar template'
      );
    }
  }

  async excluirTemplate(templateId: string): Promise<void> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<void>>(
          `${this.CLIENT_API}/Templates/${templateId}`,
          { headers }
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao excluir template');
      }
    } catch (error: any) {
      console.error('Erro ao excluir template:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao excluir template'
      );
    }
  }
}
