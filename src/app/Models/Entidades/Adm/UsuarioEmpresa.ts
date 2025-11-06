import { BaseEntidade } from "../BaseEntidade";

export interface UsuarioEmpresa extends BaseEntidade {
    usuarioId: string;
    empresaId: string;
    flgAdministrador: boolean;
    dtaVinculo: Date;
    flgEmpresaPadrao: boolean;
}
