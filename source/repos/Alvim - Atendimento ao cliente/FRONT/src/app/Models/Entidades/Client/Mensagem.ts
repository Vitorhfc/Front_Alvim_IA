import { BaseEntidade } from "../BaseEntidade";

export interface MidiaInfo {
    url: string;
    tipo: string;
    tamanho: number;
    duracao?: number;
}

export interface Reacao {
    emoji: string;
    dtReacao: Date;
    flgEnviada: boolean;
    dtEnvio: Date | null;
}

export enum TipoMensagem {
    Texto = 1,
    Audio = 2,
    Imagem = 3,
    Video = 4,
    Documento = 5,
    Contato = 6,
    Localizacao = 7,
    Sticker = 8
}

export enum OrigemMensagem {
    Cliente = 1,
    IA = 2,
    Funcionario = 3
}

export enum StatusEntrega {
    Enviada = 1,
    Entregue = 2,
    Lida = 3,
    Falha = 4
}

export interface Mensagem extends BaseEntidade {
    clienteId: string;
    idMensagemWhatsApp: string;
    tipoMensagem: TipoMensagem;
    origem: OrigemMensagem;
    flgMensagemCliente: boolean;
    conteudoTexto: string;
    midia: MidiaInfo;
    idMensagemResposta: string;
    reacoes: Reacao[];
    dtRecebido: Date;
    dtProcessamento: Date | null;
    timestampWhatsApp: Date;
    statusEntrega: StatusEntrega;
    flgEnviadaAoN8N: boolean;
    grupoProcessamentoId: string;
    metadados: Record<string, any>;
}