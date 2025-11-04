import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { CadastroUsuarioData } from '../shared/models/auth-state.model';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss']
})
export class CadastroUsuarioComponent {
  @Output() cadastroSuccess = new EventEmitter<{ usuarioId: string; nome: string; email: string }>();
  @Output() switchToLogin = new EventEmitter<void>();

  cadastroModel: CadastroUsuarioData = {
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    senha: '',
    dtaNascimento: '',
    flgInterno: false
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) {}

  async onCadastro(): Promise<void> {
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
      const response = await this.authService.cadastrarUsuario(this.cadastroModel);

      // Cadastro bem-sucedido
      this.snackBar.success('Cadastro realizado com sucesso!');

      // Emitir evento para próxima etapa (2FA)
      this.cadastroSuccess.emit({
        usuarioId: response.id,
        nome: this.cadastroModel.nome,
        email: this.cadastroModel.email
      });
    } catch (error: any) {
      // Tratar erro
      this.errorMessage = error.message || 'Erro ao realizar cadastro. Tente novamente.';
      this.snackBar.error(this.errorMessage);
      console.error('Erro no cadastro:', error);
    } finally {
      // SEMPRE esconder o spinner, independente de sucesso ou erro
      this.loading = false;
      this.spinnerService.hidden();

      // Debug: verificar se o spinner foi realmente escondido
      console.log('Spinner escondido. Estado visível:', this.spinnerService.isVisible());
    }
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }

  private validateForm(): boolean {
    const { nome, email, cpf, celular, senha, dtaNascimento } = this.cadastroModel;

    if (!nome || !email || !cpf || !celular || !senha || !dtaNascimento) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return false;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'E-mail inválido';
      return false;
    }

    if (!this.isValidCPF(cpf)) {
      this.errorMessage = 'CPF inválido';
      return false;
    }

    if (!this.isValidCelular(celular)) {
      this.errorMessage = 'Celular inválido';
      return false;
    }

    if (senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return false;
    }

    if (!this.isValidDataNascimento(dtaNascimento)) {
      this.errorMessage = 'Data de nascimento inválida';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length === 11;
  }

  private isValidCelular(celular: string): boolean {
    const celularDigits = celular.replace(/[^\d]/g, '');
    return celularDigits.length === 10 || celularDigits.length === 11;
  }

  private isValidDataNascimento(data: string): boolean {
    if (!data) return false;

    const dataNascimento = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNascimento.getFullYear();

    return idade >= 18 && idade <= 120;
  }

  formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.cadastroModel.cpf = value;
    }
  }

  formatCelular(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      this.cadastroModel.celular = value;
    }
  }
}
