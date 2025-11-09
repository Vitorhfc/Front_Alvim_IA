// auth-state.model.ts - Modelos para gerenciar estado da autenticação

import { EmpresaVinculadaModel } from '../../../../Models/Objetos/auth.model';

/**
 * Estado global da autenticação
 * Gerencia o fluxo completo de login/cadastro
 */
export interface AuthState {
  step: AuthStep;
  usuarioId?: string;
  email?: string;
  nome?: string;
  tipoValidacao?: 0 | 1; // 0 = Email, 1 = WhatsApp
  destinoEnvio?: string;
  empresas?: EmpresaVinculadaModel[];
  fluxoOrigem: 'login' | 'cadastro' | 'empresa';
  tokenAdm?: string; // Token temporário do ADMIN (usado no fluxo de cadastro de empresa)
}

/**
 * Etapas do fluxo de autenticação
 *
 * FLUXO DE LOGIN:
 * login -> validacao-2fa -> selecao-empresa -> [dashboard]
 *                          -> cadastro-empresa -> [dashboard]
 *
 * FLUXO DE CADASTRO:
 * cadastro -> cadastro-empresa -> [dashboard]
 */
export type AuthStep =
  | 'login'
  | 'cadastro'
  | 'selecao-2fa'
  | 'validacao-2fa'
  | 'selecao-empresa'
  | 'cadastro-empresa';

export interface LoginData {
  email: string;
  senha: string;
  tipoValidacao: 0 | 1;
}

export interface CadastroUsuarioData {
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  senha: string;
  dtaNascimento: string;
  flgInterno: boolean;
}

export interface Selecao2FAData {
  tipoValidacao: 0 | 1;
  destinoEnvio: string;
}

export interface Validacao2FAData {
  sucesso: boolean;
  requiresCadastroEmpresa: boolean;
}
