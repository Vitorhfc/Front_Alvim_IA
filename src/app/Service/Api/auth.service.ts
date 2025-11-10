import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { LoginModel, LoginResponseModel, LoginEmpresaModel, SolicitarValidacaoDuasEtapasModel, ValidacaoDuasEtapasResponseModel, ConfirmarValidacaoDuasEtapasClientModel, AutenticacaoClientCompletaResponseModel, UsuarioModel, ValidarToken2FAModel, ValidarToken2FAResponseModel, SelecionarEmpresaModel, LoginUsuarioModel, LoginUsuarioResponseModel } from '../../Models/Objetos/auth.model';
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

  /**
   * PASSO 1: Login inicial - Envia credenciais e recebe informações de 2FA
   * Endpoint: POST /api/Autenticacao/login
   *
   * Fluxo:
   * - Usuário envia email, senha e tipo de validação (0=Email, 1=WhatsApp)
   * - Sistema envia token de validação para o destino escolhido
   * - Retorna informações do usuário e destino de envio do token
   */
  async login(model: LoginModel): Promise<LoginResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/login`,
          model
        )
      );

      if (!response.sucesso)
        throw new Error(response.error || 'Erro ao realizar login');

      return response.data;
    } catch (error: any) {
      // Log detalhado do erro para debugging
      console.error('Erro detalhado no login:', {
        status: error.status,
        statusText: error.statusText,
        errorResponse: error.error,
        message: error.message,
        url: error.url
      });

      // Tentar extrair mensagem mais específica do erro
      let mensagemErro =
        error.error?.mensagem ||
        error.error?.message ||
        error.error?.error ||
        (typeof error.error === 'string' ? error.error : null);

      // Se não houver mensagem específica da API, usar mensagens customizadas baseadas no status HTTP
      if (!mensagemErro) {
        switch (error.status) {
          case 400:
            mensagemErro = 'Email ou senha inválidos. Verifique suas credenciais e tente novamente.';
            break;
          case 401:
            mensagemErro = 'Credenciais inválidas. Por favor, verifique seu email e senha.';
            break;
          case 404:
            mensagemErro = 'Serviço de autenticação não encontrado. Entre em contato com o suporte.';
            break;
          case 500:
            mensagemErro = 'Erro no servidor. Por favor, tente novamente em alguns instantes.';
            break;
          case 503:
            mensagemErro = 'Serviço temporariamente indisponível. Tente novamente em breve.';
            break;
          case 0:
            mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.';
            break;
          default:
            mensagemErro = 'Erro ao realizar login. Por favor, tente novamente.';
        }
      }

      throw new Error(mensagemErro);
    }
  }

  /**
   * PASSO 2: Validação do token 2FA - Valida o código recebido
   * Endpoint: POST /api/Autenticacao/validar-token-2fa
   *
   * Fluxo:
   * - Usuário envia o token de 6 dígitos recebido
   * - Sistema valida o token
   * - Retorna lista de empresas vinculadas ao usuário
   */
  async validarToken2FA(model: ValidarToken2FAModel): Promise<ValidarToken2FAResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ValidarToken2FAResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/validar-token-2fa`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Token inválido');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao validar token'
      );
    }
  }

  /**
   * PASSO 3A: Seleção de empresa existente - Login completo no CLIENT
   * Endpoint: POST /api/Autenticacao/selecionar-empresa
   *
   * Fluxo:
   * - Usuário seleciona uma empresa da lista
   * - Sistema autentica o usuário na empresa selecionada
   * - Retorna token JWT final para acesso ao sistema CLIENT
   */
  async selecionarEmpresa(model: SelecionarEmpresaModel): Promise<AutenticacaoClientCompletaResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AutenticacaoClientCompletaResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/selecionar-empresa`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao selecionar empresa');
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

  /**
   * PASSO 3B: Login no ADMIN para cadastro de empresa
   * Endpoint: POST /api/Autenticacao/login-usuario (ADMIN)
   *
   * Fluxo:
   * - Usado quando usuário opta por criar nova empresa
   * - Autentica o usuário no sistema ADMIN
   * - Retorna token ADM temporário para cadastrar empresa
   * - Token ADM será descartado após cadastro da empresa
   */
  async loginUsuario(model: LoginUsuarioModel): Promise<LoginUsuarioResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginUsuarioResponseModel>>(
          `${this.ADMIN_API}/Autenticacao/login-usuario`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao realizar login de usuário');
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

  async loginEmpresa(model: LoginEmpresaModel): Promise<AutenticacaoClientCompletaResponseModel> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AutenticacaoClientCompletaResponseModel>>(
          `${this.CLIENT_API}/Autenticacao/login-empresa`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.mensagem || 'Erro ao realizar login da empresa');
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
      // Log detalhado do erro para debugging
      console.error('Erro detalhado ao solicitar 2FA:', {
        status: error.status,
        statusText: error.statusText,
        errorResponse: error.error,
        message: error.message,
        url: error.url
      });

      // Tentar extrair mensagem mais específica do erro
      const mensagemErro =
        error.error?.mensagem ||
        error.error?.message ||
        error.error?.data?.mensagem ||
        (typeof error.error === 'string' ? error.error : null) ||
        error.message ||
        'Erro ao solicitar código de validação';

      throw new Error(mensagemErro);
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

  /**
   * FLUXO DE CADASTRO - PASSO 1: Cadastrar novo usuário
   * Endpoint: POST /api/Usuario/cadastrar (ADMIN)
   *
   * Fluxo de cadastro:
   * 1. Cadastrar usuário (este método)
   * 2. Fazer login no ADMIN com usuarioId (loginUsuario)
   * 3. Cadastrar empresa no ADMIN (EmpresaService.cadastrarEmpresa)
   * 4. Fazer login no CLIENT com empresa criada (selecionarEmpresa)
   */
  async cadastrarUsuario(model: UsuarioModel): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<any>>(
          `${this.ADMIN_API}/Usuario/cadastrar`,
          model
        )
      );

      if (!response.sucesso) {
        throw new Error(response.error || 'Erro ao realizar cadastro');
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.error ||
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