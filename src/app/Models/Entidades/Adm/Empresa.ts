import { BaseEntidade } from "../BaseEntidade";

export interface Empresa extends BaseEntidade {
    razaoSocial: string;
    nome: string | null;
    email: string | null;
    cnpj: string;
    connectionString: string;
    nomeBaseDados: string;
    wahaApiUrl: string | null;
    wahaApiKey: string | null;
    wahaInstanceName: string | null;
    wahaNumeroWhatsApp: string | null;
    flgWahaAtivo: boolean;
    wahaDataConexao: Date | null;
    wahaUltimaVerificacao: Date | null;
    flgSuspensa: boolean;
}