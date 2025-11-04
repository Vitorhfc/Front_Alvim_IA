// auth-state.model.ts - Modelos para gerenciar estado da autenticação

export interface AuthState {
  step: AuthStep;
  usuarioId?: string;
  email?: string;
  nome?: string;
  tipoValidacao?: 'Email' | 'WhatsApp';
  destinoEnvio?: string;
  fluxoOrigem: 'login' | 'cadastro';
}

export type AuthStep =
  | 'login'
  | 'cadastro'
  | 'selecao-2fa'
  | 'validacao-2fa';

export interface LoginData {
  email: string;
  senha: string;
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
  tipoValidacao: 'Email' | 'WhatsApp';
  destinoEnvio: string;
}

export interface Validacao2FAData {
  sucesso: boolean;
  requiresCadastroEmpresa: boolean;
}
