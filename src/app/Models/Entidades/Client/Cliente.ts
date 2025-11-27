import { BaseEntidade } from "../BaseEntidade";

export interface ContextoAtual {
    intencaoIdentificada: string;
    entidadesExtraidas: Record<string, string>;
    proximaAcaoSugerida: string;
    dtUltimaAtualizacao: Date;
}

export enum StatusConversa {
    Ativa = 1,
    EmAtendimentoHumano = 2,
    Finalizada = 3,
    Aguardando = 4
}

export interface Cliente extends BaseEntidade {
    nome: string;
    numero: string;
    numeroTelefoneWaha: string;
    numeroInterno: string;
    email: string;
    cpf: string;
    statusConversa: StatusConversa;
    dtPrimeiroContato: Date;
    dtUltimaInteracao: Date;
    dtFinalizacaoConversa: Date | null;
    funcionarioResponsavelId: string;
    totalMensagens: number;
    contexto: ContextoAtual;
}