import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import {
  AnalisesResponse,
  AnalisesSentimentosResponse,
  HeatmapResponse,
  ResolucaoResponse,
  PalavrasChaveResponse
} from '../../Models/Objetos/analises.model';

@Injectable({
  providedIn: 'root'
})
export class AnalisesService {
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

  // ==================== ANÁLISES ====================

  async obterAnalises(dataInicio?: Date, dataFim?: Date): Promise<AnalisesResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString());
      if (dataFim) params = params.set('dataFim', dataFim.toISOString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AnalisesResponse>>(
          `${this.CLIENT_API}/Analises`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter análises');
    } catch (error: any) {
      console.error('Erro ao obter análises:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar análises'
      );
    }
  }

  async obterSentimentos(dataInicio?: Date, dataFim?: Date): Promise<AnalisesSentimentosResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString());
      if (dataFim) params = params.set('dataFim', dataFim.toISOString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<AnalisesSentimentosResponse>>(
          `${this.CLIENT_API}/Analises/Sentimentos`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter análise de sentimentos');
    } catch (error: any) {
      console.error('Erro ao obter sentimentos:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar análise de sentimentos'
      );
    }
  }

  async obterHeatmap(dataInicio?: Date, dataFim?: Date): Promise<HeatmapResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString());
      if (dataFim) params = params.set('dataFim', dataFim.toISOString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<HeatmapResponse>>(
          `${this.CLIENT_API}/Analises/Heatmap`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter heatmap');
    } catch (error: any) {
      console.error('Erro ao obter heatmap:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar heatmap'
      );
    }
  }

  async obterResolucao(dataInicio?: Date, dataFim?: Date): Promise<ResolucaoResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString());
      if (dataFim) params = params.set('dataFim', dataFim.toISOString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<ResolucaoResponse>>(
          `${this.CLIENT_API}/Analises/Resolucao`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter taxa de resolução');
    } catch (error: any) {
      console.error('Erro ao obter resolução:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar taxa de resolução'
      );
    }
  }

  async obterPalavrasChave(dataInicio?: Date, dataFim?: Date): Promise<PalavrasChaveResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams();

      if (dataInicio) params = params.set('dataInicio', dataInicio.toISOString());
      if (dataFim) params = params.set('dataFim', dataFim.toISOString());

      const response = await firstValueFrom(
        this.http.get<ApiResponse<PalavrasChaveResponse>>(
          `${this.CLIENT_API}/Analises/Palavras-Chave`,
          { headers, params }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter palavras-chave');
    } catch (error: any) {
      console.error('Erro ao obter palavras-chave:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar palavras-chave'
      );
    }
  }
}
