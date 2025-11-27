import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '../../Models/api-response.model';
import { LocalStorageService } from '../Local/local-storage';

/**
 * Service base abstrato para operações de API
 * Fornece métodos reutilizáveis para requisições HTTP
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService {
  protected abstract baseUrl: string;

  constructor(
    protected http: HttpClient,
    protected localStorageService: LocalStorageService
  ) {}

  /**
   * Obtém headers com token de autenticação
   */
  protected getHeaders(): HttpHeaders {
    const token = this.localStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Trata erros HTTP e retorna mensagem amigável
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao processar requisição';

    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiResponse;
      errorMessage = apiError.mensagem || errorMessage;

      // Se houver erros de validação, concatena as mensagens
      if (apiError.errors) {
        const validationErrors = Object.values(apiError.errors)
          .flat()
          .join(', ');
        errorMessage = `${errorMessage}: ${validationErrors}`;
      }
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erro na requisição:', {
      status: error.status,
      message: errorMessage,
      error: error.error
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Executa requisição GET
   */
  protected async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as T;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar dados');
    }
  }

  /**
   * Executa requisição POST
   */
  protected async post<T, R = T>(endpoint: string, data: T): Promise<R> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<R>>(`${this.baseUrl}${endpoint}`, data, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as R;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar dados');
    }
  }

  /**
   * Executa requisição PUT
   */
  protected async put<T, R = T>(endpoint: string, data: T): Promise<R> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<R>>(`${this.baseUrl}${endpoint}`, data, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as R;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar dados');
    }
  }

  /**
   * Executa requisição PATCH
   */
  protected async patch<T, R = T>(endpoint: string, data: Partial<T>): Promise<R> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<R>>(`${this.baseUrl}${endpoint}`, data, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as R;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar dados');
    }
  }

  /**
   * Executa requisição DELETE
   */
  protected async delete<T = void>(endpoint: string): Promise<T | void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders()
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar dados');
    }
  }

  /**
   * Executa requisição sem autenticação (para endpoints públicos)
   */
  protected async postPublic<T, R = T>(endpoint: string, data: T): Promise<R> {
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(
        this.http.post<ApiResponse<R>>(`${this.baseUrl}${endpoint}`, data, {
          headers
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as R;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar dados');
    }
  }

  /**
   * Executa requisição GET sem autenticação
   */
  protected async getPublic<T>(endpoint: string): Promise<T> {
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(
        this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
          headers
        }).pipe(catchError(this.handleError))
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro na requisição');
      }

      return response.data as T;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar dados');
    }
  }
}
