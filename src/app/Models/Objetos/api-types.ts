/**
 * Tipos e interfaces compartilhadas para os services de API
 */

/**
 * Parâmetros de paginação padrão
 */
export interface PaginacaoParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Resposta paginada padrão
 */
export interface PaginacaoResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Parâmetros de filtro por data
 */
export interface FiltroDataParams {
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Parâmetros de ordenação
 */
export interface OrdenacaoParams {
  ordenarPor?: string;
  direcao?: 'asc' | 'desc';
}

/**
 * Parâmetros de busca genérica
 */
export interface BuscaParams extends PaginacaoParams, OrdenacaoParams {
  termo?: string;
  campo?: string;
}

/**
 * Status de requisição
 */
export enum StatusRequisicao {
  PENDENTE = 'Pendente',
  EM_ANDAMENTO = 'EmAndamento',
  CONCLUIDO = 'Concluido',
  CANCELADO = 'Cancelado',
  ERRO = 'Erro'
}

/**
 * Tipo de mensagem
 */
export enum TipoMensagem {
  TEXTO = 'texto',
  IMAGEM = 'imagem',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENTO = 'documento',
  LOCALIZACAO = 'localizacao',
  CONTATO = 'contato',
  STICKER = 'sticker'
}

/**
 * Remetente de mensagem
 */
export enum RemetenteMensagem {
  CLIENTE = 'cliente',
  ATENDENTE = 'atendente',
  SISTEMA = 'sistema',
  IA = 'ia'
}

/**
 * Status de agendamento
 */
export enum StatusAgendamento {
  PENDENTE = 'Pendente',
  CONFIRMADO = 'Confirmado',
  CANCELADO = 'Cancelado',
  REALIZADO = 'Realizado',
  NAO_COMPARECEU = 'NaoCompareceu'
}

/**
 * Tipo de log
 */
export enum TipoLog {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  CRITICAL = 'CRITICAL'
}

/**
 * Formato de exportação
 */
export enum FormatoExportacao {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

/**
 * Interface para request de upload de arquivo
 */
export interface UploadArquivoRequest {
  file: File;
  clienteId?: string;
  empresaId?: string;
  tipo?: string;
  descricao?: string;
}

/**
 * Interface para response de upload
 */
export interface UploadArquivoResponse {
  id: string;
  nomeArquivo: string;
  url: string;
  tipo: string;
  tamanho: number;
  dataCriacao: string;
}

/**
 * Interface para estatísticas gerais
 */
export interface EstatisticasGerais {
  totalClientes: number;
  totalMensagens: number;
  totalAgendamentos: number;
  mensagensHoje: number;
  agendamentosHoje: number;
  taxaRespostaIA?: number;
  tempoMedioResposta?: number;
}

/**
 * Interface para estatísticas de atendimento
 */
export interface EstatisticasAtendimento {
  totalAtendimentos: number;
  atendimentosAbertos: number;
  atendimentosFechados: number;
  tempoMedioAtendimento: number;
  satisfacaoMedia?: number;
  atendimentosPorPeriodo?: {
    data: string;
    total: number;
  }[];
}

/**
 * Interface para estatísticas de IA
 */
export interface EstatisticasIA {
  totalProcessamentos: number;
  processamentosRealizados: number;
  processamentosFalhos: number;
  taxaSucesso: number;
  tempoMedioProcessamento: number;
  custoTotal?: number;
  tokensUtilizados?: number;
}

/**
 * Interface para configuração de IA
 */
export interface ConfiguracaoIARequest {
  modelo?: string;
  temperatura?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  promptSistema?: string;
  ativo?: boolean;
}

/**
 * Interface para teste de IA
 */
export interface TesteIARequest {
  mensagem: string;
  contexto?: any;
}

/**
 * Interface para response de teste de IA
 */
export interface TesteIAResponse {
  resposta: string;
  tempoProcessamento: number;
  tokensUtilizados: number;
  modelo: string;
  sucesso: boolean;
}

/**
 * Interface para configuração WAHA
 */
export interface ConfiguracaoWAHA {
  wahaApiUrl: string;
  wahaApiKey: string;
  numeroWhatsApp: string;
  webhookUrl?: string;
  sessionName?: string;
}

/**
 * Interface para status WAHA
 */
export interface StatusWAHA {
  configurado: boolean;
  conectado: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  mensagem?: string;
  ultimaVerificacao: string;
  numeroWhatsApp?: string;
  dataConexao?: string;
  instanceName?: string;
}

/**
 * Interface para QR Code
 */
export interface QRCodeResponse {
  qrCode: string;
  qrCodeBase64?: string;
  urlQrCode?: string;
  expiraEm?: string;
}

/**
 * Interface para resultado de importação
 */
export interface ResultadoImportacao {
  totalLinhas: number;
  sucessos: number;
  falhas: number;
  erros?: {
    linha: number;
    mensagem: string;
  }[];
  advertencias?: string[];
}

/**
 * Interface para filtros avançados de log
 */
export interface FiltroLog extends FiltroDataParams {
  tipo?: TipoLog | string;
  usuarioId?: string;
  empresaId?: string;
  acao?: string;
  nivel?: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG' | 'CRITICAL';
}

/**
 * Interface para notificação
 */
export interface Notificacao {
  id?: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensagem: string;
  timestamp?: string;
  lida?: boolean;
}

/**
 * Interface para validação de formulário
 */
export interface ErrosValidacao {
  campo: string;
  mensagem: string;
  codigo?: string;
}

/**
 * Interface para ação em massa
 */
export interface AcaoEmMassaRequest {
  ids: string[];
  acao: string;
  parametros?: Record<string, any>;
}

/**
 * Interface para resultado de ação em massa
 */
export interface AcaoEmMassaResponse {
  totalProcessado: number;
  sucessos: number;
  falhas: number;
  erros?: {
    id: string;
    mensagem: string;
  }[];
}

/**
 * Type guard para verificar se é uma resposta paginada
 */
export function isPaginacaoResponse<T>(obj: any): obj is PaginacaoResponse<T> {
  return (
    obj &&
    Array.isArray(obj.items) &&
    typeof obj.total === 'number' &&
    typeof obj.page === 'number' &&
    typeof obj.pageSize === 'number'
  );
}

/**
 * Função auxiliar para criar parâmetros de paginação
 */
export function criarParamsPaginacao(
  page: number = 1,
  pageSize: number = 10
): PaginacaoParams {
  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize
  };
}

/**
 * Função auxiliar para criar parâmetros de filtro por data
 */
export function criarParamsFiltroData(
  dataInicio?: Date,
  dataFim?: Date
): FiltroDataParams {
  return {
    dataInicio: dataInicio?.toISOString().split('T')[0],
    dataFim: dataFim?.toISOString().split('T')[0]
  };
}

/**
 * Função auxiliar para formatar data para a API
 */
export function formatarDataParaApi(data: Date): string {
  return data.toISOString();
}

/**
 * Função auxiliar para parsear data da API
 */
export function parsearDataDaApi(dataString: string): Date {
  return new Date(dataString);
}
