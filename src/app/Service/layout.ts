import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Opções de exibição do sidebar:
 * - 'visible': Sidebar sempre visível (rotas protegidas)
 * - 'hidden': Sidebar oculto mas pode ser ativado
 * - 'never': Sidebar nunca deve ser exibido (rotas públicas)
 */
export type SidebarMode = 'visible' | 'hidden' | 'never';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

  private sidebarModeSubject = new BehaviorSubject<SidebarMode>('never');
  public sidebarMode$: Observable<SidebarMode> = this.sidebarModeSubject.asObservable();

  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(this.loadSidebarState());
  public sidebarCollapsed$: Observable<boolean> = this.sidebarCollapsedSubject.asObservable();

  // Subject para forçar reload do menu lateral
  private reloadMenuSubject = new BehaviorSubject<boolean>(false);
  public reloadMenu$: Observable<boolean> = this.reloadMenuSubject.asObservable();

  constructor() {}

  /**
   * Verifica se está em ambiente de navegador
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Carrega o estado do sidebar do localStorage
   */
  private loadSidebarState(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const saved = localStorage.getItem(this.SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  }

  /**
   * Salva o estado do sidebar no localStorage
   */
  private saveSidebarState(collapsed: boolean): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(this.SIDEBAR_COLLAPSED_KEY, collapsed.toString());
  }

  /**
   * Define o modo de exibição do sidebar
   */
  setSidebarMode(mode: SidebarMode): void {
    this.sidebarModeSubject.next(mode);
  }

  /**
   * Obtém o modo atual do sidebar
   */
  getSidebarMode(): SidebarMode {
    return this.sidebarModeSubject.value;
  }

  /**
   * Alterna o estado de colapso do sidebar
   */
  toggleSidebarCollapse(): void {
    const newState = !this.sidebarCollapsedSubject.value;
    this.sidebarCollapsedSubject.next(newState);
    this.saveSidebarState(newState);
  }

  /**
   * Define se o sidebar está colapsado ou não
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
    this.saveSidebarState(collapsed);
  }

  /**
   * Verifica se o sidebar está colapsado
   */
  isSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  /**
   * Mostra o sidebar (se não estiver em modo 'never')
   */
  showSidebar(): void {
    if (this.sidebarModeSubject.value !== 'never') {
      this.setSidebarMode('visible');
    }
  }

  /**
   * Oculta o sidebar (se não estiver em modo 'never')
   */
  hideSidebar(): void {
    if (this.sidebarModeSubject.value !== 'never') {
      this.setSidebarMode('hidden');
    }
  }

  /**
   * Dispara evento para forçar o reload do menu lateral
   */
  reloadMenu(): void {
    this.reloadMenuSubject.next(true);
  }
}
