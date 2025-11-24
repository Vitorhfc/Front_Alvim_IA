import { BaseEntidade } from '../BaseEntidade';

/**
 * Interface para os logs do WAHA
 */
export interface LogWaha extends BaseEntidade {
    idLog: string;
    empresaId: string | null;
    tipoEvento: string;
    origem: string;
    acao: string;
    payload: string;
    payloadLimpo: string | null;
    sucesso: boolean;
    mensagemErro: string | null;
    stackTrace: string | null;
    sessionId: string | null;
    telefoneOrigem: string | null;
    telefoneDestino: string | null;
    messageId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    tempoProcessamentoMs: number | null;
    statusHttp: number | null;
    metadados: { [key: string]: string } | null;
}

/**
 * Interface para resposta paginada de logs
 */
export interface LogWahaPaginado {
    page: number;
    pageSize: number;
    totalItems: number;
    items: LogWaha[];
}
