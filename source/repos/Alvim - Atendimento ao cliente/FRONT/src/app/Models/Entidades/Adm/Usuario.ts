import { BaseEntidade } from "../BaseEntidade";

export interface Usuario extends BaseEntidade {
    nome: string;
    email: string;
    cpf: string;
    celular: string | null;
    senha: string;
    dtaNascimento: Date;
    dtaUltimoAcesso: Date | null;
    flgAutenticacaoDuasEtapas: boolean;
    flgInterno: boolean;
    tokenEmailConfirmacao: string | null;
    dtaTokenEmailGerado: Date | null;
    tokenCelularConfirmacao: string | null;
    dtaTokenCelularGerado: Date | null;
    tokenAcesso: string;
    dtaTokenAcessoGerado: Date | null;
    dtaTokenUtilizado: Date | null;
    tokenGoogle: string | null;
}
