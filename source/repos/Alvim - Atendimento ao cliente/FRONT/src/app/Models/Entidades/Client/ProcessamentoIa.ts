import { BaseEntidade } from "../BaseEntidade";

export enum StatusProcessamento {
    Sucesso = 1,
    Erro = 2,
    Timeout = 3
}

export interface ProcessamentoIA extends BaseEntidade {
    clienteId: string;
    grupoProcessamentoId: string;
    mensagensIds: string[];
    qtdMensagensProcessadas: number;
    flgPrimeiraMensagemDoDia: boolean;
    payloadEnviadoJson: string;
    respostaCompletaJson: string;
    tokensUtilizados: number;
    tempoProcessamentoMs: number;
    modeloUtilizado: string;
    modulosUtilizados: string[];
    documentosConsultados: string[];
    agendamentoGeradoId: string;
    status: StatusProcessamento;
    erroDescricao: string;
    dtProcessamento: Date;
}