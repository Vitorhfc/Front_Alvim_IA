// Service/Api/empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../Environment/Environment';
import { ApiResponse, isSuccessResponse } from '../../Models/api-response.model';
import { Empresa } from '../../Models/Entidades/Adm/Empresa';

/**
 * Request para cadastro de empresa
 */
export interface CadastroEmpresaRequest {
  usuarioId: string;
  razaoSocial: string;
  nome?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

/**
 * Request para configuração WAHA
 */
export interface ConfigurarWahaRequest {
  wahaApiUrl: string;
  wahaApiKey: string;
  numeroWhatsApp: string;
  webhookUrl?: string;
}

/**
 * Response de status WAHA
 */
export interface StatusWahaResponse {
  configurado: boolean;
  conectado?: boolean;
  status?: string;
  mensagem?: string;
  ultimaVerificacao?: Date;
  instanceName?: string;
  numeroWhatsApp?: string;
  dataConexao?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly apiUrl = `${environment.url_ADMIN}/Empresa`;

  constructor(private http: HttpClient) { }

  /**
   * Obtém headers com token de autenticação
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Trata erros HTTP e retorna mensagem amigável
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao processar requisição';

    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiResponse;
      errorMessage = apiError.mensagem || errorMessage;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erro na requisição:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Lista todas as empresas
   */
  async listarEmpresas(): Promise<Empresa[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Empresa[]>>(this.apiUrl, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response)) {
        return response.data || [];
      }

      throw new Error(response.mensagem);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao listar empresas');
    }
  }

  /**
   * Busca empresa por ID
   */
  async buscarEmpresaPorId(id: string): Promise<Empresa> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Empresa>>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response) && response.data) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Empresa não encontrada');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar empresa');
    }
  }

  /**
   * Busca empresa por CNPJ
   */
  async buscarEmpresaPorCnpj(cnpj: string): Promise<Empresa> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Empresa>>(`${this.apiUrl}/cnpj/${cnpj}`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response) && response.data) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Empresa não encontrada');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar empresa');
    }
  }

  /**
   * Cadastra nova empresa
   */
  async cadastrarEmpresa(request: CadastroEmpresaRequest): Promise<Empresa> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Empresa>>(this.apiUrl, request, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response) && response.data) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao cadastrar empresa');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao cadastrar empresa');
    }
  }

  /**
   * Atualiza empresa existente
   */
  async atualizarEmpresa(id: string, empresa: Partial<Empresa>): Promise<Empresa> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Empresa>>(`${this.apiUrl}/${id}`, empresa, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response) && response.data) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao atualizar empresa');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar empresa');
    }
  }

  /**
   * Remove empresa
   */
  async removerEmpresa(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!isSuccessResponse(response)) {
        throw new Error(response.mensagem || 'Erro ao remover empresa');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao remover empresa');
    }
  }

  /**
   * Provisiona empresa (cria instância WAHA)
   */
  async provisionarEmpresa(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.apiUrl}/${id}/provisionar`, {}, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao provisionar empresa');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao provisionar empresa');
    }
  }

  /**
   * Obtém QR Code para conectar WhatsApp
   */
  async obterQrCode(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse>(`${this.apiUrl}/${id}/qrcode`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter QR Code');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter QR Code');
    }
  }

  /**
   * Verifica status de conexão WAHA
   */
  async obterStatusWaha(id: string): Promise<StatusWahaResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<StatusWahaResponse>>(`${this.apiUrl}/${id}/status-waha`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response) && response.data) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter status WAHA');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter status WAHA');
    }
  }

  /**
   * Reconecta instância WAHA
   */
  async reconectarInstancia(id: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.apiUrl}/${id}/reconectar`, {}, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!isSuccessResponse(response)) {
        throw new Error(response.mensagem || 'Erro ao reconectar instância');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao reconectar instância');
    }
  }

  /**
   * Configura ou reconfigura WAHA para uma empresa
   */
  async configurarWaha(id: string, config: ConfigurarWahaRequest): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.apiUrl}/${id}/configurar-waha`, config, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (isSuccessResponse(response)) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao configurar WAHA');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao configurar WAHA');
    }
  }
}