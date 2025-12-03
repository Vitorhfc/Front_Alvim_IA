import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from '../../Service/Local/local-storage';
import { AuthService } from '../../Service/Api/auth.service';
import { LayoutService } from '../../Service/layout';
import { MenuConfiguracaoService } from '../../Service/Api/menu-configuracao.service';
import { MenuConfiguracao } from '../../Models/Entidades/Adm/MenuConfiguracao';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isDarkMode: boolean = false;
  usuario: any = null;
  isAdministrador: boolean = false;

  // Controle de colapso
  sidebarCollapsed$: Observable<boolean>;

  // Menus carregados da API ou fallback
  menuItems: MenuItem[] = [];

  // Menus padrão como fallback caso a API falhe
  private menuItemsFallback: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'chat', label: 'Conversas', route: '/conversas' },
    { icon: 'event', label: 'Agendamentos', route: '/agendamentos', disabled: true },
    { icon: 'people', label: 'Funcionários', route: '/funcionarios', disabled: true },
    { icon: 'analytics', label: 'Análises', route: '/analises', disabled: true },
    { icon: 'description', label: 'Templates', route: '/templates', disabled: true },
    { icon: 'menu_book', label: 'Base de Conhecimento', route: '/base-conhecimento' },
    { icon: 'phone', label: 'WhatsApp', route: '/whatsapp-config' },
    { icon: 'phone_missed', label: 'Log WhatsApp', route: '/LogWhatsapp', disabled: true },
    { icon: 'receipt_long', label: 'Logs Client', route: '/LogsClient', disabled: true },
    { icon: 'settings', label: 'Configurações', route: '/configuracoes', disabled: true }
  ];

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private layoutService: LayoutService,
    private menuConfiguracaoService: MenuConfiguracaoService
  ) {
    this.sidebarCollapsed$ = this.layoutService.sidebarCollapsed$;
  }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarTemaPreferido();
    this.carregarMenus();

    // Escuta eventos de reload do menu
    this.layoutService.reloadMenu$.subscribe((reload) => {
      if (reload) {
        this.forcarReloadMenu();
      }
    });
  }

  /**
   * Força o reload do menu limpando o cache e recarregando da API
   */
  private async forcarReloadMenu(): Promise<void> {
    try {
      console.log('Forçando reload do menu lateral...');
      // Limpa o cache
      if (this.isBrowser()) {
        localStorage.removeItem('menu_items_cache');
      }
      // Recarrega direto da API
      await this.buscarMenusDaApi();
      console.log('Menu lateral recarregado com sucesso!');
    } catch (error) {
      console.error('Erro ao forçar reload do menu:', error);
      this.usarMenusFallback();
    }
  }

  // ==================== CARREGAMENTO DE MENUS ====================

  /**
   * Carrega os menus da API ou do cache localStorage
   */
  async carregarMenus(): Promise<void> {
    try {
      // Tenta buscar do cache primeiro
      const menusCache = this.obterMenusDoCache();
      if (menusCache && menusCache.length > 0) {
        this.menuItems = menusCache;
        console.log('Menus carregados do cache');

        // Carrega da API em background para atualizar o cache
        this.atualizarMenusEmBackground();
        return;
      }

      // Se não houver cache, busca da API
      await this.buscarMenusDaApi();
    } catch (error) {
      console.error('Erro ao carregar menus:', error);
      this.usarMenusFallback();
    }
  }

  /**
   * Busca menus da API e atualiza o cache
   */
  private async buscarMenusDaApi(): Promise<void> {
    try {
      const empresaId = this.localStorageService.getEmpresaId();
      const menusApi = await this.menuConfiguracaoService.carregarMenuLateral(empresaId);

      if (menusApi && menusApi.length > 0) {
        // Converte MenuConfiguracao para MenuItem
        this.menuItems = this.converterMenusApiParaMenuItem(menusApi);

        // Salva no cache
        this.salvarMenusNoCache(this.menuItems);
        console.log('Menus carregados da API e salvos no cache');
      } else {
        console.warn('Nenhum menu retornado da API, usando fallback');
        this.usarMenusFallback();
      }
    } catch (error) {
      console.error('Erro ao buscar menus da API:', error);
      throw error;
    }
  }

  /**
   * Atualiza menus em background sem bloquear a UI
   */
  private async atualizarMenusEmBackground(): Promise<void> {
    try {
      await this.buscarMenusDaApi();
    } catch (error) {
      console.warn('Erro ao atualizar menus em background:', error);
    }
  }

  /**
   * Converte array de MenuConfiguracao para MenuItem
   */
  private converterMenusApiParaMenuItem(menus: MenuConfiguracao[]): MenuItem[] {
    return menus
      .sort((a, b) => a.ordem - b.ordem)
      .map(menu => ({
        icon: menu.icone,
        label: menu.label,
        route: menu.route,
        disabled: menu.disabled
      }));
  }

  /**
   * Obtém menus do cache localStorage
   */
  private obterMenusDoCache(): MenuItem[] | null {
    if (!this.isBrowser()) return null;

    try {
      const cache = localStorage.getItem('menu_items_cache');
      if (!cache) return null;

      const cacheData = JSON.parse(cache);
      const agora = new Date().getTime();
      const tempoCache = 24 * 60 * 60 * 1000; // 24 horas

      // Verifica se o cache ainda é válido
      if (cacheData.timestamp && (agora - cacheData.timestamp) < tempoCache) {
        return cacheData.menus;
      }

      return null;
    } catch (error) {
      console.error('Erro ao ler cache de menus:', error);
      return null;
    }
  }

  /**
   * Salva menus no cache localStorage
   */
  private salvarMenusNoCache(menus: MenuItem[]): void {
    if (!this.isBrowser()) return;

    try {
      const cacheData = {
        menus: menus,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('menu_items_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache de menus:', error);
    }
  }

  /**
   * Usa menus fallback quando a API falhar
   */
  private usarMenusFallback(): void {
    this.menuItems = this.menuItemsFallback;
    console.warn('Usando menus fallback');
  }

  /**
   * Limpa o cache de menus (útil quando houver atualização)
   */
  limparCacheMenus(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('menu_items_cache');
    console.log('Cache de menus limpo');
  }

  // ==================== DADOS USUÁRIO ====================

  carregarDadosUsuario(): void {
    this.usuario = this.localStorageService.getUsuario();
    this.isAdministrador = this.usuario?.flgAdministrador || false;
  }

  getInitials(): string {
    if (!this.usuario?.nome) return 'U';
    const names = this.usuario.nome.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.usuario.nome.substring(0, 2).toUpperCase();
  }

  // ==================== TEMA ====================

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  carregarTemaPreferido(): void {
    if (!this.isBrowser()) {
      this.isDarkMode = false;
      return;
    }
    const tema = localStorage.getItem('tema_preferido');
    this.isDarkMode = tema === 'dark';
    this.aplicarTema();
  }

  toggleTheme(): void {
    console.log(this.usuario);
    this.isDarkMode = !this.isDarkMode;
    if (this.isBrowser()) {
      localStorage.setItem('tema_preferido', this.isDarkMode ? 'dark' : 'light');
    }
    this.aplicarTema();
  }

  aplicarTema(): void {
    if (!this.isBrowser()) {
      return;
    }
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // ==================== FILTRO MENU ====================

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      // Não exibe itens desabilitados
      if (item.disabled) {
        return false;
      }
      // Só exibe itens adminOnly para administradores
      if (item.adminOnly) {
        return this.isAdministrador;
      }
      return true;
    });
  }

  // ==================== NAVEGAÇÃO ====================

  toggleSidebar(): void {
    this.layoutService.toggleSidebarCollapse();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
