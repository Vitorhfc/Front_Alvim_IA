import { BaseEntidade } from "../BaseEntidade";

export enum TipoLog {
    Sistema = 1,
    Integracao = 2,
    Processamento = 3,
    Erro = 4,
    Webhook = 5
}

export enum NivelSeveridade {
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4
}

export interface LogClient extends BaseEntidade {
    usuarioId: string;
    empresaId: string;
    tipo: TipoLog;
    origem: string;
    acao: string;
    endpoint: string;
    metodoHttp: string;
    controller: string;
    metodo: string;
    mensagem: string;
    dadoAntigo: string;
    dadoNovo: string;
    descricao: string;
    sucesso: boolean;
    ipAddress: string;
    userAgent: string;
    nivelSeveridade: NivelSeveridade;
}