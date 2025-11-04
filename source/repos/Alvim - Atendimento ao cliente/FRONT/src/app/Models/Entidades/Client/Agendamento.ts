import { BaseEntidade } from "../BaseEntidade";

export interface ServicoAgendamento {
    nome: string;
    descricao: string | null;
    duracaoMinutos: number;
    valor: number | null;
}

export interface HistoricoAlteracaoAgendamento {
    dtaAlteracao: Date;
    tipo: TipoAlteracaoAgendamento;
    descricao: string;
    valorAntigo: string | null;
    valorNovo: string | null;
    usuarioId: string | null;
    usuarioNome: string | null;
}

export enum StatusAgendamento {
    Agendado = 'Agendado',
    Confirmado = 'Confirmado',
    EmAtendimento = 'EmAtendimento',
    Concluido = 'Concluido',
    Cancelado = 'Cancelado',
    NaoCompareceu = 'NaoCompareceu',
    Reagendado = 'Reagendado'
}

export enum OrigemAgendamento {
    Manual = 'Manual',
    WhatsApp = 'WhatsApp',
    API = 'API',
    AutoAgendamento = 'AutoAgendamento',
    CalendarioExterno = 'CalendarioExterno'
}

export enum TipoAlteracaoAgendamento {
    Criacao = 'Criacao',
    AlteracaoDataHora = 'AlteracaoDataHora',
    AlteracaoFuncionario = 'AlteracaoFuncionario',
    AlteracaoServicos = 'AlteracaoServicos',
    AlteracaoStatus = 'AlteracaoStatus',
    AlteracaoObservacoes = 'AlteracaoObservacoes',
    Cancelamento = 'Cancelamento',
    EnvioLembrete = 'EnvioLembrete',
    Confirmacao = 'Confirmacao'
}

export interface Agendamento extends BaseEntidade {
    clienteId: string;
    clienteNome: string;
    clienteTelefone: string;
    funcionarioId: string;
    funcionarioNome: string;
    dtHoraInicio: Date;
    dtHoraFim: Date;
    duracaoMinutos: number;
    servicos: ServicoAgendamento[];
    status: StatusAgendamento;
    observacoes: string | null;
    valorTotal: number | null;
    flgLembreteEnviado: boolean;
    dtEnvioLembrete: Date | null;
    flgConfirmadoPeloCliente: boolean;
    dtConfirmacao: Date | null;
    eventoCalendarioExternoId: string | null;
    tipoCalendarioExterno: string | null;
    dtCriacao: Date;
    dtUltimaAlteracao: Date;
    criadoPorUsuarioId: string | null;
    origem: OrigemAgendamento;
    historico: HistoricoAlteracaoAgendamento[];
    motivoCancelamento: string | null;
    dtCancelamento: Date | null;
}