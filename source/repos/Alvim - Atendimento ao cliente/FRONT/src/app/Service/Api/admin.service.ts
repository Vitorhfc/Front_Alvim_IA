import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../Environment/Environment';
import { BaseApiService } from './base-api.service';
import { LocalStorageService } from '../Local/local-storage';

// Importar modelos de entidades do Admin
import { Empresa } from '../../Models/Entidades/Adm/Empresa';
import { Usuario } from '../../Models/Entidades/Adm/Usuario';
import { UsuarioEmpresa } from '../../Models/Entidades/Adm/UsuarioEmpresa';
import { LogADM } from '../../Models/Entidades/Adm/LogADM';

// Interfaces para requisições específicas
export interface CadastroUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone?: string;
  cpf?: string;
}

export interface AtualizarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface RecuperarSenhaRequest {
  email: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface VincularUsuarioEmpresaRequest {
  usuarioId: string;
  empresaId: string;
  flgAdministrador: boolean;
}

/**
 * Service para integração com a API de Administração
 * Endpoints: https://localhost:5001/api
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseApiService {
  protected override baseUrl = environment.url_ADMIN;

  constructor(
    protected override http: HttpClient,
    protected override localStorageService: LocalStorageService
  ) {
    super(http, localStorageService);
  }

  // ==================== USUÁRIOS ====================

  /**
   * Lista todos os usuários
   */
  async listarUsuarios(): Promise<Usuario[]> {
    return this.get<Usuario[]>('/Usuario');
  }

  /**
   * Busca usuário por ID
   */
  async buscarUsuarioPorId(id: string): Promise<Usuario> {
    return this.get<Usuario>(`/Usuario/${id}`);
  }

  /**
   * Busca usuário por email
   */
  async buscarUsuarioPorEmail(email: string): Promise<Usuario> {
    return this.get<Usuario>(`/Usuario/email/${email}`);
  }

  /**
   * Busca usuário por CPF
   */
  async buscarUsuarioPorCpf(cpf: string): Promise<Usuario> {
    return this.get<Usuario>(`/Usuario/cpf/${cpf}`);
  }

  /**
   * Cadastra novo usuário
   */
  async cadastrarUsuario(request: CadastroUsuarioRequest): Promise<Usuario> {
    return this.post<CadastroUsuarioRequest, Usuario>('/Usuario/cadastrar', request);
  }

  /**
   * Atualiza dados do usuário
   */
  async atualizarUsuario(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    return this.put<Partial<Usuario>, Usuario>(`/Usuario/${id}`, usuario);
  }

  /**
   * Remove usuário
   */
  async removerUsuario(id: string): Promise<void> {
    return this.delete(`/Usuario/${id}`);
  }

  /**
   * Ativa/Desativa usuário
   */
  async toggleStatusUsuario(id: string, ativo: boolean): Promise<void> {
    return this.patch(`/Usuario/${id}/status`, { ativo });
  }

  /**
   * Atualiza senha do usuário
   */
  async atualizarSenha(id: string, request: AtualizarSenhaRequest): Promise<void> {
    return this.put(`/Usuario/${id}/senha`, request);
  }

  /**
   * Solicita recuperação de senha
   */
  async recuperarSenha(request: RecuperarSenhaRequest): Promise<void> {
    return this.postPublic<RecuperarSenhaRequest, void>('/Usuario/recuperar-senha', request);
  }

  /**
   * Redefine senha com token
   */
  async redefinirSenha(request: RedefinirSenhaRequest): Promise<void> {
    return this.postPublic<RedefinirSenhaRequest, void>('/Usuario/redefinir-senha', request);
  }

  // ==================== EMPRESAS ====================

  /**
   * Lista todas as empresas
   */
  async listarEmpresas(): Promise<Empresa[]> {
    return this.get<Empresa[]>('/Empresa');
  }

  /**
   * Busca empresa por ID
   */
  async buscarEmpresaPorId(id: string): Promise<Empresa> {
    return this.get<Empresa>(`/Empresa/${id}`);
  }

  /**
   * Busca empresa por CNPJ
   */
  async buscarEmpresaPorCnpj(cnpj: string): Promise<Empresa> {
    return this.get<Empresa>(`/Empresa/cnpj/${cnpj}`);
  }

  /**
   * Cadastra nova empresa
   */
  async cadastrarEmpresa(empresa: Partial<Empresa>): Promise<Empresa> {
    return this.post<Partial<Empresa>, Empresa>('/Empresa', empresa);
  }

  /**
   * Atualiza dados da empresa
   */
  async atualizarEmpresa(id: string, empresa: Partial<Empresa>): Promise<Empresa> {
    return this.put<Partial<Empresa>, Empresa>(`/Empresa/${id}`, empresa);
  }

  /**
   * Remove empresa
   */
  async removerEmpresa(id: string): Promise<void> {
    return this.delete(`/Empresa/${id}`);
  }

  /**
   * Ativa/Desativa empresa
   */
  async toggleStatusEmpresa(id: string, ativo: boolean): Promise<void> {
    return this.patch(`/Empresa/${id}/status`, { ativo });
  }

  /**
   * Provisiona empresa (configura WhatsApp/WAHA)
   */
  async provisionarEmpresa(id: string): Promise<any> {
    return this.post(`/Empresa/${id}/provisionar`, {});
  }

  /**
   * Obtém QR Code para conexão WhatsApp
   */
  async obterQrCodeEmpresa(id: string): Promise<any> {
    return this.get<any>(`/Empresa/${id}/qrcode`);
  }

  /**
   * Obtém status de conexão WAHA
   */
  async obterStatusWaha(id: string): Promise<any> {
    return this.get<any>(`/Empresa/${id}/status-waha`);
  }

  /**
   * Reconecta instância WAHA
   */
  async reconectarInstanciaWaha(id: string): Promise<void> {
    return this.post(`/Empresa/${id}/reconectar`, {});
  }

  /**
   * Configura WAHA para empresa
   */
  async configurarWaha(id: string, config: any): Promise<any> {
    return this.post(`/Empresa/${id}/configurar-waha`, config);
  }

  // ==================== USUÁRIO-EMPRESA (VÍNCULO) ====================

  /**
   * Lista usuários de uma empresa
   */
  async listarUsuariosEmpresa(empresaId: string): Promise<UsuarioEmpresa[]> {
    return this.get<UsuarioEmpresa[]>(`/UsuarioEmpresa/empresa/${empresaId}`);
  }

  /**
   * Lista empresas de um usuário
   */
  async listarEmpresasUsuario(usuarioId: string): Promise<UsuarioEmpresa[]> {
    return this.get<UsuarioEmpresa[]>(`/UsuarioEmpresa/usuario/${usuarioId}`);
  }

  /**
   * Vincula usuário a uma empresa
   */
  async vincularUsuarioEmpresa(request: VincularUsuarioEmpresaRequest): Promise<UsuarioEmpresa> {
    return this.post<VincularUsuarioEmpresaRequest, UsuarioEmpresa>('/UsuarioEmpresa', request);
  }

  /**
   * Remove vínculo usuário-empresa
   */
  async removerVinculoUsuarioEmpresa(usuarioId: string, empresaId: string): Promise<void> {
    return this.delete(`/UsuarioEmpresa/${usuarioId}/${empresaId}`);
  }

  /**
   * Atualiza permissões de administrador
   */
  async atualizarPermissoesUsuarioEmpresa(
    usuarioId: string,
    empresaId: string,
    flgAdministrador: boolean
  ): Promise<UsuarioEmpresa> {
    return this.patch(`/UsuarioEmpresa/${usuarioId}/${empresaId}`, { flgAdministrador });
  }

  // ==================== LOGS ADM ====================

  /**
   * Lista logs administrativos
   */
  async listarLogsAdm(
    tipo?: string,
    usuarioId?: string,
    dataInicio?: string,
    dataFim?: string
  ): Promise<LogADM[]> {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (usuarioId) params.append('usuarioId', usuarioId);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<LogADM[]>(`/Log${query}`);
  }

  /**
   * Busca log por ID
   */
  async buscarLogAdmPorId(id: string): Promise<LogADM> {
    return this.get<LogADM>(`/Log/${id}`);
  }

  /**
   * Lista logs de um usuário específico
   */
  async listarLogsPorUsuario(usuarioId: string): Promise<LogADM[]> {
    return this.get<LogADM[]>(`/Log/usuario/${usuarioId}`);
  }

  /**
   * Lista logs de uma empresa específica
   */
  async listarLogsPorEmpresa(empresaId: string): Promise<LogADM[]> {
    return this.get<LogADM[]>(`/Log/empresa/${empresaId}`);
  }

  // ==================== CONFIGURAÇÕES GERAIS ====================

  /**
   * Busca configurações gerais do sistema
   */
  async buscarConfiguracoesGerais(): Promise<any> {
    return this.get<any>('/Configuracao');
  }

  /**
   * Atualiza configurações gerais
   */
  async atualizarConfiguracoesGerais(configuracoes: any): Promise<any> {
    return this.put('/Configuracao', configuracoes);
  }

  // ==================== DASHBOARD ADM ====================

  /**
   * Busca estatísticas gerais do sistema
   */
  async buscarEstatisticasGerais(): Promise<any> {
    return this.get<any>('/Dashboard/estatisticas-gerais');
  }

  /**
   * Busca estatísticas de empresas
   */
  async buscarEstatisticasEmpresas(): Promise<any> {
    return this.get<any>('/Dashboard/empresas');
  }

  /**
   * Busca estatísticas de usuários
   */
  async buscarEstatisticasUsuarios(): Promise<any> {
    return this.get<any>('/Dashboard/usuarios');
  }

  /**
   * Busca estatísticas de uso do sistema
   */
  async buscarEstatisticasUso(dataInicio?: string, dataFim?: string): Promise<any> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<any>(`/Dashboard/uso${query}`);
  }

  // ==================== RELATÓRIOS ====================

  /**
   * Gera relatório de empresas
   */
  async gerarRelatorioEmpresas(formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const token = this.localStorageService.getToken();

    const response = await fetch(`${this.baseUrl}/Relatorio/empresas?formato=${formato}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar relatório');
    }

    return response.blob();
  }

  /**
   * Gera relatório de usuários
   */
  async gerarRelatorioUsuarios(formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const token = this.localStorageService.getToken();

    const response = await fetch(`${this.baseUrl}/Relatorio/usuarios?formato=${formato}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar relatório');
    }

    return response.blob();
  }

  /**
   * Gera relatório de uso do sistema
   */
  async gerarRelatorioUso(
    dataInicio: string,
    dataFim: string,
    formato: 'pdf' | 'excel' = 'pdf'
  ): Promise<Blob> {
    const token = this.localStorageService.getToken();

    const response = await fetch(
      `${this.baseUrl}/Relatorio/uso?dataInicio=${dataInicio}&dataFim=${dataFim}&formato=${formato}`,
      {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao gerar relatório');
    }

    return response.blob();
  }

  // ==================== IMPORTAÇÃO/EXPORTAÇÃO ====================

  /**
   * Importa empresas via arquivo
   */
  async importarEmpresas(formData: FormData): Promise<any> {
    const token = this.localStorageService.getToken();

    try {
      const response = await fetch(`${this.baseUrl}/Empresa/importar`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const result = await response.json();

      if (!result.sucesso) {
        throw new Error(result.mensagem || 'Erro ao importar empresas');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao importar empresas');
    }
  }

  /**
   * Exporta empresas
   */
  async exportarEmpresas(formato: 'csv' | 'excel' = 'excel'): Promise<Blob> {
    const token = this.localStorageService.getToken();

    const response = await fetch(`${this.baseUrl}/Empresa/exportar?formato=${formato}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar empresas');
    }

    return response.blob();
  }
}
