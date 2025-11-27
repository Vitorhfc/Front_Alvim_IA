import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import { DashboardResponse } from '../../Models/Objetos/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly CLIENT_API = environment.url_Client;
  private readonly ADMIN_API = environment.url_ADMIN;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  // ==================== HEADERS ====================

  private getHeaders(): HttpHeaders {
    const token = this.localStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== DASHBOARD USUÁRIO ====================

  async obterDadosDashboard(): Promise<DashboardResponse> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<DashboardResponse>(`${this.CLIENT_API}/Dashboard`, { headers })
      );

      return this.normalizarDados(response);
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);

      if (error instanceof HttpErrorResponse) {
        throw new Error(`Erro na API: ${error.status} - ${error.message}`);
      }

      throw new Error('Erro ao conectar com o servidor');
    }
  }

  private normalizarDados(data: any): DashboardResponse {
    return {
      metrics: data.metrics || [],
      sentimentosData: data.sentimentosData || { positivo: 0, neutro: 0, negativo: 0 },
      volumeMensagensData: (data.volumeMensagensData || []).map((item: any) => ({
        name: item.name || '',
        value: item.value || 0
      })),
      categoriasData: (data.categoriasData || []).map((item: any) => ({
        name: item.name || '',
        value: item.value || 0
      })),
      conversasRecentes: data.conversasRecentes || []
    };
  }
}
