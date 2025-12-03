import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { SignalRHubService } from '../../../Service/signalr-hub.service';

@Component({
  selector: 'app-login-fixo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-fixo.component.html',
  styleUrls: ['./login-fixo.component.scss']
})
export class LoginFixoComponent implements OnInit {
  empresaId: string = '690df402c4066150d1e1f899'; // ID padrão
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar,
    private signalRService: SignalRHubService
  ) { }

  ngOnInit(): void {
    this.authService.logout();

    // Verifica se há empresaId na rota, senão usa o ID padrão
    this.route.params.subscribe(params => {
      if (params['empresaId']) {
        this.empresaId = params['empresaId'];
      }
      // Sempre realiza o login com o empresaId (da rota ou padrão)
      this.realizarLogin();
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

      // Conectar ao SignalR após autenticação bem-sucedida
      await this.signalRService.startConnection();

      this.snackBar.success('Login realizado com sucesso!');

      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      this.error = error.message || 'Erro ao realizar login';
      this.snackBar.error(this.error!);
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
