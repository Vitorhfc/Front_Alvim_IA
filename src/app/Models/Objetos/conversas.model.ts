// ==================== CONVERSAS MODELS ====================

export interface Conversa {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  ultimaMensagem: string;
  horario: string;
  naoLidas: number;
  status: 'online' | 'offline';
  avatar?: string;
}

export interface Mensagem {
  id: string;
  conversaId: string;
  texto: string;
  horario: string;
  isUsuario: boolean;
  tipo: TipoMensagem;
  status?: StatusMensagem;
  midia?: MidiaInfo;
}

export type TipoMensagem = 'texto' | 'imagem' | 'audio' | 'video' | 'documento' | 'localizacao';
export type StatusMensagem = 'enviando' | 'enviado' | 'entregue' | 'lido' | 'erro';

export interface MidiaInfo {
  url: string;
  tipo: string;
  nome?: string;
  tamanho?: number;
}

export interface ClienteInfo {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  avatar?: string;
  status: 'online' | 'offline';
  totalConversas: number;
  ultimaInteracao: string;
}

// ==================== API REQUESTS ====================

export interface EnviarMensagemRequest {
  conversaId: string;
  texto: string;
  tipo?: TipoMensagem;
}

export interface ListarConversasRequest {
  pagina?: number;
  tamanhoPagina?: number;
  filtro?: string;
}

// ==================== API RESPONSES ====================

export interface ConversasResponse {
  conversas: Conversa[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface MensagensResponse {
  mensagens: Mensagem[];
  total: number;
}

export interface EnviarMensagemResponse {
  mensagem: Mensagem;
  sucesso: boolean;
}
