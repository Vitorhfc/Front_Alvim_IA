import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';

@Component({
  selector: 'app-login-empresa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-empresa.component.html',
  styleUrls: ['./login-empresa.component.scss']
})
export class LoginEmpresaComponent implements OnInit {
  empresaId: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) { }

  ngOnInit(): void {
    this.authService.logout();

    this.route.params.subscribe(params => {
      this.empresaId = params['empresaId'];

      if (this.empresaId) {
        this.realizarLogin();
      } else {
        this.error = 'ID da empresa não foi fornecido';
        this.loading = false;
      }
    });
  }

  async realizarLogin(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.spinnerService.show();

      const response = await this.authService.loginEmpresa({
        empresaId: this.empresaId
      });

      this.authService.salvarDadosAutenticacao(response);

      this.snackBar.success('Login realizado com sucesso!');

      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      this.error = error.message || 'Erro ao realizar login';
      this.snackBar.error(this.error!);
      console.error('Erro no login da empresa:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  tentarNovamente(): void {
    this.realizarLogin();
  }

  voltarParaHome(): void {
    this.router.navigate(['/']);
  }
}