import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoValidacaoDuasEtapas } from '../../../Models/Objetos/auth.model';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SpinnerComponent } from '../../../Components/spinner/spinner';

@Component({
  selector: 'app-validacao-token',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './validacao-token.html',
  styleUrls: ['./validacao-token.scss']
})
export class ValidacaoTokenComponent implements OnInit {
  // #region Propriedades

  currentStep: 'select' | 'validate' = 'select';
  usuarioId: string = '';
  email: string = '';
  token: string = '';
  destinoEnvio: string = '';
  tipoSelecionado: TipoValidacaoDuasEtapas = TipoValidacaoDuasEtapas.Email;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  tokenDigits: string[] = ['', '', '', '', '', ''];

  // #endregion

  // #region Construtor

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.usuarioId = navigation.extras.state['usuarioId'];
      this.email = navigation.extras.state['email'] || '';
    }
  }

  // #endregion

  // #region Lifecycle

  ngOnInit(): void {
    if (!this.usuarioId) {
      this.errorMessage = 'Sessão inválida. Redirecionando...';
      this.router.navigate(['/auth']);
    }
  }

  // #endregion

  // #region Seleção de Método 2FA

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
      this.currentStep = 'validate';
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

  // #endregion

  // #region Validação de Código

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
      this.successMessage = 'Login realizado com sucesso! Redirecionando...';

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Código inválido. Tente novamente.';
      this.limparToken();
      console.error('Erro ao confirmar validação 2FA:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // #endregion

  // #region Manipulação de Input

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

  // #endregion

  // #region Navegação

  voltarParaSelecao(): void {
    this.currentStep = 'select';
    this.limparToken();
    this.resetMessages();
  }

  voltarParaLogin(): void {
    this.router.navigate(['/auth']);
  }

  async reenviarCodigo(): Promise<void> {
    await this.solicitarValidacao2FA(this.tipoSelecionado);
  }

  // #endregion

  // #region Utilitários

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private limparToken(): void {
    this.tokenDigits = ['', '', '', '', '', ''];
    this.focusFirstInput();
  }

  private focusFirstInput(): void {
    const firstInput = document.querySelector('.digit-input') as HTMLInputElement;
    if (firstInput) firstInput.focus();
  }

  get TipoValidacao() {
    return TipoValidacaoDuasEtapas;
  }

  get isTokenIncompleto(): boolean {
    return this.tokenDigits.some(d => !d);
  }

  // #endregion
}