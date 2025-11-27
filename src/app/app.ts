import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SpinnerComponent } from "./Components/spinner/spinner";
import { SnackbarComponent } from "./Components/snackbar/snackbar";
import { SidebarComponent } from "./Components/sidebar/sidebar.component";
import { LayoutService } from "./Service/layout";
import { AuthService } from "./Service/Api/auth.service";
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { SidebarMode } from "./Service/layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent, SnackbarComponent, SidebarComponent, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Projeto');
  protected readonly isAutenticado = signal<boolean>(false);

  // Observables para controle do layout
  sidebarMode$: Observable<SidebarMode>;
  sidebarCollapsed$: Observable<boolean>;

  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router
  ) {
    this.sidebarMode$ = this.layoutService.sidebarMode$;
    this.sidebarCollapsed$ = this.layoutService.sidebarCollapsed$;

    // Verificar autenticação inicial
    this.atualizarEstadoAutenticacao();

    // Atualizar estado de autenticação a cada mudança de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.atualizarEstadoAutenticacao();
    });
  }

  private atualizarEstadoAutenticacao(): void {
    this.isAutenticado.set(this.authService.isAutenticado());
  }

  hideSidebar(): void {
    this.layoutService.hideSidebar();
  }
}
