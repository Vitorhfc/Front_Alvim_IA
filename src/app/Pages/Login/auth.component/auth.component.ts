import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginModel, TipoValidacaoDuasEtapas, UsuarioModel } from '../../../Models/Objetos/auth.model';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SpinnerComponent } from '../../../Components/spinner/spinner';

type AuthStep = 'auth' | 'select-2fa' | 'validate-2fa';
type FluxoOrigem = 'login' | 'cadastro';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  currentStep: AuthStep = 'auth';
  activeTab: 'login' | 'cadastro' = 'login';
  fluxoOrigem: FluxoOrigem = 'login';

  loginModel: LoginModel = { email: '', senha: '' };
  cadastroModel: UsuarioModel = {
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    senha: '',
    dtaNascimento: '',
    flgInterno: false
  };

  usuarioId: string = '';
  destinoEnvio: string = '';
  tipoSelecionado: TipoValidacaoDuasEtapas = TipoValidacaoDuasEtapas.Email;
  tokenDigits: string[] = ['', '', '', '', '', ''];

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService
  ) { }

  setActiveTab(tab: 'login' | 'cadastro'): void {
    this.activeTab = tab;
    this.resetMessages();
    this.resetForms();
  }

  async onLogin(): Promise<void> {
    this.resetMessages();

    if (!this.validateLoginForm()) {
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.login(this.loginModel);
      this.usuarioId = response.usuarioId;
      this.fluxoOrigem = 'login';
      this.currentStep = 'select-2fa';
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao realizar login. Verifique suas credenciais.';
      console.error('Erro no login:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async onCadastro(): Promise<void> {
    this.resetMessages();

    if (!this.validateCadastroForm()) {
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.cadastrarUsuario(this.cadastroModel);
      this.usuarioId = response.id;
      this.fluxoOrigem = 'cadastro';

      // Avançar imediatamente para seleção de método 2FA
      this.currentStep = 'select-2fa';
      this.successMessage = 'Cadastro realizado! Agora, vamos validar sua identidade';
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao realizar cadastro. Tente novamente.';
      console.error('Erro no cadastro:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async solicitarValidacao2FA(tipo: TipoValidacaoDuasEtapas): Promise<void> {
    this.resetMessages();
    this.loading = true;
    this.tipoSelecionado = tipo;
    this.spinnerService.show();

    try {
      const response = await this.authService.solicitarValidacao2FA({
        usuarioId: this.usuarioId,
        tipoValidacao: tipo
      });

      this.destinoEnvio = response.destinoEnvio;
      this.currentStep = 'validate-2fa';
      this.successMessage = `Código enviado para ${response.destinoEnvio}`;
      this.focusFirstInput();
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao solicitar código de validação';
      console.error('Erro ao solicitar validação 2FA:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async confirmarValidacao2FA(): Promise<void> {
    this.resetMessages();

    const tokenCompleto = this.tokenDigits.join('');

    if (tokenCompleto.length !== 6) {
      this.errorMessage = 'Por favor, insira um código válido de 6 dígitos';
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.confirmarValidacao2FA({
        usuarioId: this.usuarioId,
        empresaId: '',
        token: tokenCompleto,
        tipoValidacao: this.tipoSelecionado
      });

      this.authService.salvarDadosAutenticacao(response);

      // Verificar de onde veio o fluxo
      if (this.fluxoOrigem === 'cadastro') {
        this.router.navigate(['/cadastro-empresa'], {
          state: {
            usuarioId: this.usuarioId,
            nomeUsuario: this.cadastroModel.nome || 'Usuário'
          }
        });
      } else {
        // Fluxo normal de login
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Código inválido. Tente novamente.';
      this.limparToken();
      console.error('Erro ao confirmar validação 2FA:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  onDigitInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value.replace(/\D/g, '');

    this.tokenDigits[index] = value.substring(0, 1);

    if (value && index < 5) {
      const nextInput = input.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }

    if (this.tokenDigits.every(digit => digit !== '')) {
      this.confirmarValidacao2FA();
    }
  }

  onDigitKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        this.tokenDigits[index - 1] = '';
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onDigitPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text').replace(/\D/g, '');

    if (pasteData && pasteData.length === 6) {
      for (let i = 0; i < 6; i++) {
        this.tokenDigits[i] = pasteData[i];
      }
      this.confirmarValidacao2FA();
    }
  }

  voltarParaLogin(): void {
    this.currentStep = 'auth';
    this.activeTab = 'login';
    this.fluxoOrigem = 'login';
    this.limparToken();
    this.resetMessages();
  }

  voltarParaSelecao2FA(): void {
    this.currentStep = 'select-2fa';
    this.limparToken();
    this.resetMessages();
  }

  async reenviarCodigo(): Promise<void> {
    await this.solicitarValidacao2FA(this.tipoSelecionado);
  }

  private validateLoginForm(): boolean {
    if (!this.loginModel.email || !this.loginModel.senha) {
      this.errorMessage = 'Preencha todos os campos';
      return false;
    }

    if (!this.isValidEmail(this.loginModel.email)) {
      this.errorMessage = 'E-mail inválido';
      return false;
    }

    return true;
  }

  private validateCadastroForm(): boolean {
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

    if (senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
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

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetForms(): void {
    this.loginModel = { email: '', senha: '' };
    this.cadastroModel = {
      nome: '',
      email: '',
      cpf: '',
      celular: '',
      senha: '',
      dtaNascimento: '',
      flgInterno: false
    };
    this.resetMessages();
  }

  private limparToken(): void {
    this.tokenDigits = ['', '', '', '', '', ''];
    this.focusFirstInput();
  }

  private focusFirstInput(): void {
    const firstInput = document.querySelector('.digit-input') as HTMLInputElement;
    if (firstInput) firstInput.focus();
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

  get TipoValidacao() {
    return TipoValidacaoDuasEtapas;
  }

  get isTokenIncompleto(): boolean {
    return this.tokenDigits.some(d => !d);
  }
}