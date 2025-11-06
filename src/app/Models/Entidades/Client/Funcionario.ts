import { BaseEntidade } from "../BaseEntidade";

export interface IntervaloDescanso {
    horarioInicio: string;
    horarioFim: string;
    descricao: string | null;
}

export interface HorarioTrabalho {
    diaSemana: number;
    flgTrabalha: boolean;
    horarioEntrada: string;
    horarioSaida: string;
    intervalo: IntervaloDescanso | null;
}

export enum TipoAusencia {
    Ferias = 'Ferias',
    Folga = 'Folga',
    Atestado = 'Atestado',
    Licenca = 'Licenca',
    Treinamento = 'Treinamento',
    Outros = 'Outros'
}

export interface Ausencia {
    id: string;
    tipo: TipoAusencia;
    dtInicio: Date;
    dtFim: Date;
    motivo: string | null;
    flgDiaInteiro: boolean;
    flgRecorrente: boolean;
    padraoRecorrencia: string | null;
    dtaCadastro: Date;
}

export interface ConfiguracaoCalendarioExterno {
    tipoCalendario: string;
    calendarioId: string | null;
    emailConta: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    dtExpiracaoToken: Date | null;
    flgSincronizacaoAtiva: boolean;
    dtUltimaSincronizacao: Date | null;
}

export interface Funcionario extends BaseEntidade {
    nome: string;
    email: string;
    telefone: string;
    cpf: string | null;
    cargo: string | null;
    especialidades: string[];
    horariosTrabalho: HorarioTrabalho[];
    ausencias: Ausencia[];
    corCalendario: string | null;
    observacoes: string | null;
    dtAdmissao: Date | null;
    totalAgendamentos: number;
    calendarioExterno: ConfiguracaoCalendarioExterno | null;
}