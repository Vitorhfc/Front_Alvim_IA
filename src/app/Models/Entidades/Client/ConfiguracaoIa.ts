import { BaseEntidade } from "../BaseEntidade";

export enum PreferenciaResposta {
    SomenteTexto = 1,
    PreferenciaAudio = 2,
    Misto = 3
}

export interface ConfiguracaoArquivos {
    tamanhoMaximoMB: number;
    diasRetencao: number;
    tiposPermitidos: string[];
    flgProcessarAutomaticamente: boolean;
}

export interface ConfiguracaoIA extends BaseEntidade {
    funcaoPrincipalDoProduto: string;
    modulosFuncionalidadesDoProduto: string;
    processoDeUsoProduto: string;
    perguntasFrequentesSobreProduto: string;
    doresAtendidasPeloProduto: string;
    diferencasVantagensDoProduto: string;
    integracoesRecursosExtrasProduto: string;
    suporteEAtendimentoDoProduto: string;
    planosPrecosCondicoesComerciaisDoProduto: string;
    casosDeUsoExemplosPraticosEValoresSistema: string;
    informacoesGerais: string;
    instrucoesDocumentos: string;
    instrucoesAgendamento: string;
    instrucoesArquivos: string;
    preferenciaResposta: PreferenciaResposta;
    urlWebhookN8N: string;
    tempoAgrupamentoSegundos: number;
    limiteHistoricoMensagens: number;
    intervaloNovoDiaHoras: number;
    arquivos: ConfiguracaoArquivos;
    dtCriacao: Date;
}