import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { LoginData } from '../shared/models/auth-state.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<{ usuarioId: string; email: string }>();
  @Output() switchToCadastro = new EventEmitter<void>();

  loginModel: LoginData = {
    email: '',
    senha: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) {}

  async onLogin(): Promise<void> {
    // Limpar estado anterior
    this.errorMessage = '';

    // Validar formulário
    if (!this.validateForm()) {
      this.snackBar.error(this.errorMessage);
      return;
    }

    // Ativar loading
    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.login(this.loginModel);

      // Login bem-sucedido
      this.snackBar.success('Login realizado com sucesso!');

      // Emitir evento para próxima etapa (2FA)
      this.loginSuccess.emit({
        usuarioId: response.usuarioId,
        email: this.loginModel.email
      });
    } catch (error: any) {
      // Tratar erro
      this.errorMessage = error.message || 'Email ou senha inválidos';
      this.snackBar.error(this.errorMessage);
      console.error('Erro no login:', error);
    } finally {
      // SEMPRE esconder o spinner, independente de sucesso ou erro
      this.loading = false;
      this.spinnerService.hidden();

      // Debug: verificar se o spinner foi realmente escondido
      console.log('Spinner escondido. Estado visível:', this.spinnerService.isVisible());
    }
  }

  onSwitchToCadastro(): void {
    this.switchToCadastro.emit();
  }

  private validateForm(): boolean {
    const { email, senha } = this.loginModel;

    if (!email || !senha) {
      this.errorMessage = 'Preencha todos os campos';
      return false;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'E-mail inválido';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
