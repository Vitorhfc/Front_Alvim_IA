/**
 * Modelos de autenticação baseados nos Models do backend C#
 */

// ==================== ENUMS ====================

export enum TipoValidacaoDuasEtapas {
    Email = 0,
    WhatsApp = 1
}

// ==================== LOGIN ====================

export interface LoginModel {
    email: string;
    senha: string;
    tipoValidacao: TipoValidacaoDuasEtapas;
}

export interface LoginResponseModel {
    usuarioId: string;
    nome: string;
    email: string;
    requerValidacaoDuasEtapas: boolean;
    temEmail: boolean;
    temWhatsApp: boolean;
    destinoEnvio: string;
    mensagem: string;
}

export interface ValidarToken2FAModel {
    usuarioId: string;
    token: string;
    tipoValidacao: TipoValidacaoDuasEtapas;
}

export interface ValidarToken2FAResponseModel {
    empresas: EmpresaVinculadaModel[];
}

export interface SelecionarEmpresaModel {
    usuarioId: string;
    empresaId: string;
}

export interface LoginUsuarioModel {
    usuarioId: string;
    tipoValidacao?: TipoValidacaoDuasEtapas; // Opcional - não necessário para login direto ADM
}

export interface LoginUsuarioResponseModel {
    usuarioId: string;
    nome: string;
    email: string;
    celular?: string;
    token: string;
    dataExpiracao: string;
    empresas: EmpresaVinculadaModel[];
    requerValidacaoDuasEtapas?: boolean; // Opcional - quando não há 2FA
    destinoEnvio?: string; // Opcional - quando não há 2FA
    mensagem?: string; // Opcional
}

export interface LoginEmpresaModel {
    empresaId: string;
}

// ==================== VALIDAÇÃO 2FA ====================

export interface SolicitarValidacaoDuasEtapasModel {
    usuarioId: string;
    tipoValidacao: TipoValidacaoDuasEtapas;
}

export interface ValidacaoDuasEtapasResponseModel {
    sucesso: boolean;
    mensagem: string;
    destinoEnvio: string;
}

// ==================== CONFIRMAÇÃO 2FA - CLIENT ====================

export interface ConfirmarValidacaoDuasEtapasClientModel {
    usuarioId: string;
    empresaId: string;
    token: string;
    tipoValidacao: TipoValidacaoDuasEtapas;
}

export interface AutenticacaoClientCompletaResponseModel {
    usuarioId: string;
    empresaId: string;
    nome: string;
    email: string;
    flgAdministrador: boolean;
    token: string;
    refreshToken: string;
    dataExpiracao: string;
    proximoReloginObrigatorio: string;
    tokenGoogle?: string;
    flgEmpresaPier : boolean;
}

// ==================== CONFIRMAÇÃO 2FA - ADMIN ====================

export interface ConfirmarValidacaoDuasEtapasModel {
    usuarioId: string;
    token: string;
    tipoValidacao: TipoValidacaoDuasEtapas;
}

export interface AutenticacaoCompletaResponseModel {
    usuarioId: string;
    nome: string;
    email: string;
    token: string;
    dataExpiracao: string;
    empresas: EmpresaVinculadaModel[];
}

export interface EmpresaVinculadaModel {
    empresaId: string;
    nomeEmpresa: string;
    flgAdministrador: boolean;
}

// ==================== REFRESH TOKEN ====================

export interface RefreshTokenModel {
    refreshToken: string;
}

export interface RefreshTokenResponseModel {
    usuarioId: string;
    empresaId: string;
    token: string;
    refreshToken: string;
    dataExpiracao: string;
    proximoReloginObrigatorio: string;
}

// ==================== REGISTRO ====================

export interface UsuarioModel {
    nome: string;
    email: string;
    cpf: string;
    celular: string;
    senha: string;
    dtaNascimento: string;
    flgInterno: boolean;
}


