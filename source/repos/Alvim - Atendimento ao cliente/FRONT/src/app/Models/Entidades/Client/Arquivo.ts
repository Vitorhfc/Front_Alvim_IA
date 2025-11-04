import { BaseEntidade } from "../BaseEntidade";

export interface ArquivoMetadata {
    duracaoSegundos: number | null;
    largura: number | null;
    altura: number | null;
    numeroPaginas: number | null;
    textoExtraido: string | null;
    outrosMetadados: Record<string, string> | null;
}

export enum TipoArquivo {
    Audio = 1,
    Imagem = 2,
    Video = 3,
    Documento = 4,
    Planilha = 5,
    PDF = 6,
    Outro = 7
}

export interface Arquivo extends BaseEntidade {
    clienteId: string;
    mensagemId: string | null;
    nomeOriginal: string;
    nomeArmazenado: string;
    caminhoCompleto: string | null;
    urlWasabi: string;
    mimeType: string | null;
    tamanhoBytes: number;
    hash: string;
    tipo: TipoArquivo;
    metadata: ArquivoMetadata | null;
    flgProcessado: boolean;
    dtProcessamento: Date | null;
    resultadoProcessamento: string | null;
    flgExcluido: boolean;
    dtExclusao: Date | null;
    dtUpload: Date;
    dtExpiracao: Date | null;
}