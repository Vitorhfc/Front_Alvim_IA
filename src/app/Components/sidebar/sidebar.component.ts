import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from '../../Service/Local/local-storage';
import { AuthService } from '../../Service/Api/auth.service';
import { LayoutService } from '../../Service/layout';
import { Observable } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
  disabled?: boolean; // Flag para desabilitar temporariamente itens do menu
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

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'chat', label: 'Conversas', route: '/conversas', disabled: true }, // Desabilitado temporariamente
    { icon: 'event', label: 'Agendamentos', route: '/agendamentos', disabled: true  }, // Desabilitado temporariamente
    { icon: 'people', label: 'Funcionários', route: '/funcionarios', disabled: true }, // Desabilitado temporariamente
    { icon: 'analytics', label: 'Análises', route: '/analises', disabled: true }, // Desabilitado temporariamente
    { icon: 'description', label: 'Templates', route: '/templates', disabled: true }, // Desabilitado temporariamente
    { icon: 'menu_book', label: 'Base de Conhecimento', route: '/base-conhecimento' },
    { icon: 'phone', label: 'WhatsApp', route: '/whatsapp-config' },
    { icon: 'phone_missed', label: 'Log WhatsApp', route: '/LogWhatsapp', disabled: true  },
    { icon: 'receipt_long', label: 'Logs Client', route: '/LogsClient', disabled: true  },
    { icon: 'settings', label: 'Configurações', route: '/configuracoes', disabled: true } // Desabilitado temporariamente
  ];

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private layoutService: LayoutService
  ) {
    this.sidebarCollapsed$ = this.layoutService.sidebarCollapsed$;
  }

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarTemaPreferido();
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
