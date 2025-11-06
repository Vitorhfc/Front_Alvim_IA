import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from '../../Service/Local/local-storage';
import { AuthService } from '../../Service/Api/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
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

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'admin_panel_settings', label: 'Admin Dashboard', route: '/admin-dashboard', adminOnly: true },
    { icon: 'chat', label: 'Conversas', route: '/conversas' },
    { icon: 'event', label: 'Agendamentos', route: '/agendamentos' },
    { icon: 'people', label: 'Funcionários', route: '/funcionarios' },
    { icon: 'analytics', label: 'Análises', route: '/analises' },
    { icon: 'description', label: 'Templates', route: '/templates' },
    { icon: 'menu_book', label: 'Base de Conhecimento', route: '/base-conhecimento' },
    { icon: 'settings', label: 'Configurações', route: '/configuracoes' }
  ];

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService
  ) {}

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

  carregarTemaPreferido(): void {
    const tema = localStorage.getItem('tema_preferido');
    this.isDarkMode = tema === 'dark';
    this.aplicarTema();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('tema_preferido', this.isDarkMode ? 'dark' : 'light');
    this.aplicarTema();
  }

  aplicarTema(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // ==================== FILTRO MENU ====================

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (item.adminOnly) {
        return this.isAdministrador;
      }
      return true;
    });
  }

  // ==================== NAVEGAÇÃO ====================

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
