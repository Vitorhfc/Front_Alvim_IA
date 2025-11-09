import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { TipoValidacaoDuasEtapas, EmpresaVinculadaModel } from '../../../Models/Objetos/auth.model';
import { Validacao2FAData } from '../shared/models/auth-state.model';
import { SnackBar } from '../../../Service/Local/snack-bar';

/**
 * Componente de Validação 2FA - PASSO 2 do fluxo de autenticação
 *
 * Fluxo:
 * 1. Usuário recebe token de 6 dígitos por email ou WhatsApp
 * 2. Insere o token neste componente
 * 3. Sistema valida o token e retorna lista de empresas
 * 4. Redireciona para tela de seleção de empresa
 */
@Component({
  selector: 'app-validacao-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validacao-2fa.component.html',
  styleUrls: ['./validacao-2fa.component.scss']
})
export class Validacao2FAComponent implements AfterViewInit {
  @Input() usuarioId!: string;
  @Input() tipoValidacao!: 0 | 1;
  @Input() destinoEnvio!: string;
  @Input() fluxoOrigem: 'login' | 'cadastro' | 'empresa' = 'login';

  @Output() validacaoSucesso = new EventEmitter<{
    empresas: EmpresaVinculadaModel[];
    requiresCadastroEmpresa: boolean;
  }>();
  @Output() voltarParaLogin = new EventEmitter<void>();
  @Output() reenviar = new EventEmitter<void>();

  tokenDigits: string[] = ['', '', '', '', '', ''];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) {}

  ngAfterViewInit(): void {
    this.focusFirstInput();
  }

  async confirmarValidacao(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const tokenCompleto = this.tokenDigits.join('');

    if (tokenCompleto.length !== 6) {
      this.errorMessage = 'Por favor, insira um código válido de 6 dígitos';
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      // Chama API para validar token 2FA
      // Retorna lista de empresas vinculadas ao usuário
      const response = await this.authService.validarToken2FA({
        usuarioId: this.usuarioId,
        token: tokenCompleto,
        tipoValidacao: this.tipoValidacao as TipoValidacaoDuasEtapas
      });

      this.successMessage = 'Token validado com sucesso!';
      this.snackBar.success(this.successMessage);

      const requiresCadastroEmpresa = this.fluxoOrigem === 'cadastro';

      // Emitir evento para próxima etapa:
      // - Se fluxo de login: vai para seleção de empresa
      // - Se fluxo de cadastro: vai direto para cadastro de empresa
      this.validacaoSucesso.emit({
        empresas: response.empresas,
        requiresCadastroEmpresa
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Código inválido. Tente novamente.';
      this.snackBar.error(this.errorMessage);
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
      this.confirmarValidacao();
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
      this.confirmarValidacao();
    }
  }

  onVoltarParaLogin(): void {
    this.voltarParaLogin.emit();
  }

  onReenviarCodigo(): void {
    this.limparToken();
    this.errorMessage = '';
    this.successMessage = 'Código reenviado! Verifique seu ' + (this.tipoValidacao === 0 ? 'e-mail' : 'WhatsApp');
    this.reenviar.emit();
  }

  private limparToken(): void {
    this.tokenDigits = ['', '', '', '', '', ''];
    this.focusFirstInput();
  }

  private focusFirstInput(): void {
    setTimeout(() => {
      const firstInput = document.querySelector('.digit-input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  get isTokenIncompleto(): boolean {
    return this.tokenDigits.some(d => !d);
  }

  get tituloBotao(): string {
    if (this.loading) return 'Verificando...';
    return this.fluxoOrigem === 'cadastro' ? 'Continuar Cadastro' : 'Validar Token';
  }

  get getTipoValidacaoTexto(): string {
    return this.tipoValidacao === 0 ? 'E-mail' : 'WhatsApp';
  }
}
