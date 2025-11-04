import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { LoginModel, LoginResponseModel, SolicitarValidacaoDuasEtapasModel, ValidacaoDuasEtapasResponseModel, ConfirmarValidacaoDuasEtapasClientModel, AutenticacaoClientCompletaResponseModel, UsuarioModel } from '../../Models/Objetos/auth.model';
import { ApiResponse } from '../../Models/Objetos/resposta.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CLIENT_API = environment.url_Client;
  private readonly ADMIN_API = environment.url_ADMIN;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  // ==================== LOGIN (CLIENT) ====================

  async login(model: LoginModel): Promise<LoginResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/login`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao realizar login');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao conectar com o servidor'
      );
    }
  }

  async solicitarValidacao2FA(
    model: SolicitarValidacaoDuasEtapasModel
  ): Promise<ValidacaoDuasEtapasResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ValidacaoDuasEtapasResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/solicitar-validacao-2fa`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao solicitar validação');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao solicitar código de validação'
      );
    }
  }

  async confirmarValidacao2FA(
    model: ConfirmarValidacaoDuasEtapasClientModel
  ): Promise<AutenticacaoClientCompletaResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AutenticacaoClientCompletaResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/confirmar-validacao-2fa`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Código inválido');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao confirmar código'
      );
    }
  }

  // ==================== CADASTRO (ADMIN) ====================

  async cadastrarUsuario(model: UsuarioModel): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<any>>(
          `${this.ADMIN_API}/Usuario/cadastrar`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao realizar cadastro');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao cadastrar usuário'
      );
    }
  }

  // ==================== STORAGE ====================

  salvarDadosAutenticacao(data: AutenticacaoClientCompletaResponseModel): void {
    this.localStorageService.setToken(data.token);

    // Salvar dados do usuário
    const usuario = {
      usuarioId: data.usuarioId,
      empresaId: data.empresaId,
      nome: data.nome,
      email: data.email,
      flgAdministrador: data.flgAdministrador
    };

    this.localStorageService.setUsuario(usuario as any);
  }

  logout(): void {
    this.localStorageService.limparDados();
  }

  isAutenticado(): boolean {
    return this.localStorageService.isAutenticado();
  }
}