import { BaseEntidade } from '../BaseEntidade';

/**
 * Modelo de configuração de menu da aplicação
 */
export interface MenuConfiguracao extends BaseEntidade {
  /**
   * Ícone do menu (Material Icons ou nome do ícone)
   */
  icone: string;

  /**
   * Label/Texto exibido no menu
   */
  label: string;

  /**
   * Rota/caminho da navegação
   */
  route: string;

  /**
   * Indica se o menu está desabilitado
   */
  disabled: boolean;

  /**
   * Ordem de exibição do menu
   */
  ordem: number;

  /**
   * ID do menu pai (null para menus de nível raiz)
   */
  menuPaiId?: string | null;

  /**
   * Submenus/itens filhos deste menu
   */
  filhos?: MenuConfiguracao[];
}
