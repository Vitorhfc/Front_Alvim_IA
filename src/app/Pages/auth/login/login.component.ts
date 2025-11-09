import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { LoginData } from '../shared/models/auth-state.model';
import { TipoValidacaoDuasEtapas } from '../../../Models/Objetos/auth.model';

/**
 * Componente de Login - PASSO 1 do fluxo de autenticação
 *
 * Fluxo:
 * 1. Usuário insere email, senha e escolhe tipo de validação (Email ou WhatsApp)
 * 2. Chama API de login que envia token 2FA
 * 3. Redireciona para tela de validação 2FA
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatRadioModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<{
    usuarioId: string;
    nome: string;
    email: string;
    tipoValidacao: 0 | 1;
    destinoEnvio: string;
  }>();
  @Output() switchToCadastro = new EventEmitter<void>();

  loginModel: LoginData = {
    email: '',
    senha: '',
    tipoValidacao: 0
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) {}

  async onLogin(): Promise<void> {
    this.errorMessage = '';

    if (!this.validateForm()) {
      this.snackBar.error(this.errorMessage);
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.login({
        email: this.loginModel.email,
        senha: this.loginModel.senha,
        tipoValidacao: this.loginModel.tipoValidacao as TipoValidacaoDuasEtapas
      });

      this.snackBar.success(response.mensagem || 'Token enviado com sucesso!');

      this.loginSuccess.emit({
        usuarioId: response.usuarioId,
        nome: response.nome,
        email: response.email,
        tipoValidacao: this.loginModel.tipoValidacao,
        destinoEnvio: response.destinoEnvio
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Email ou senha inválidos';
      this.snackBar.error(this.errorMessage);
      console.error('Erro no login:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
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