/**
 * Modelos para integração com a API WAHA (WhatsApp HTTP API)
 */

/**
 * Resposta do QR Code
 */
export interface WAHAQRCodeResponse {
  sessionName?: string;
  qrCode?: string;
  qr?: string; // QR Code raw do backend
  qrImage?: string | null;
  qrCodeBase64?: string | null;
  qrCodeUrl?: string;
  state?: string;
  message?: string;
  sucesso?: boolean;
  status?: string | null;
  erro?: string | null;
  timestamp?: Date;
}

/**
 * Resposta de status da sessão
 */
export interface WAHAStatusResponse {
  sessionName: string;
  status: WAHASessionStatus;
  message?: string;
  timestamp: Date;
}

/**
 * Status possíveis da sessão WAHA
 */
export enum WAHASessionStatus {
  STARTING = 'STARTING',
  SCAN_QR_CODE = 'SCAN_QR_CODE',
  WORKING = 'WORKING',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}

/**
 * Resposta de ações (iniciar, parar, reiniciar, remover)
 */
export interface WAHAActionResponse {
  success: boolean;
  message: string;
  sessionName: string;
  timestamp: Date;
}

/**
 * Informações da sessão
 */
export interface WAHASessionInfo {
  name: string;
  status: WAHASessionStatus;
  estaConectado: boolean;
  me?: {
    id: string;
    pushName?: string;
  };
  config?: {
    webhooks?: string[];
    proxy?: string;
  };
}

/**
 * Informações da conta conectada
 */
export interface WAHAAccountInfo {
  id: string;
  pushName?: string;
  me?: string;
  platform?: string;
  status?: string;
}

/**
 * Request para iniciar uma sessão
 */
export interface IniciarSessaoRequest {
  sessionName: string;
  config?: {
    webhooks?: string[];
    proxy?: string;
  };
}

/**
 * Informações de saúde do WAHA
 */
export interface WAHAHealthInfo {
  totalSessoes: number;
  sessoesAtivas: number;
  sessoesInativas: number;
  sessoes: Array<{
    nome: string;
    status: WAHASessionStatus;
    conectado: boolean;
  }>;
}
