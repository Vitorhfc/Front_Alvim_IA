import { BaseEntidade } from "../BaseEntidade";

export interface LogADM extends BaseEntidade {
    usuarioId: string;
    empresaId: string;
    acao: string;
    sucesso: boolean;
    descricao: string;
    ipAddress: string;
    userAgent: string;
}