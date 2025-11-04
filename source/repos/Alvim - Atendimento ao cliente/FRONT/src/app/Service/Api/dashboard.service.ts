import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import { DashboardResponse, AdminDashboardResponse } from '../../Models/Objetos/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly CLIENT_API = environment.url_Client;
  private readonly ADMIN_API = environment.url_ADMIN;

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

  // ==================== DASHBOARD USUÁRIO ====================

  async obterDadosDashboard(): Promise<DashboardResponse> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<DashboardResponse>>(
          `${this.CLIENT_API}/Dashboard`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter dados do dashboard');
    } catch (error: any) {
      console.error('Erro ao obter dados do dashboard:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar dashboard'
      );
    }
  }

  // ==================== DASHBOARD ADMIN ====================

  async obterDadosAdminDashboard(): Promise<AdminDashboardResponse> {
    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.get<ApiResponse<AdminDashboardResponse>>(
          `${this.ADMIN_API}/Dashboard/Admin`,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao obter dados do dashboard administrativo');
    } catch (error: any) {
      console.error('Erro ao obter dados do admin dashboard:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao carregar dashboard administrativo'
      );
    }
  }
}
