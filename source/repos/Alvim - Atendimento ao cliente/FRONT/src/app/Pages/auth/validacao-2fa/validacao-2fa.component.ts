import { Component, EventEmitter, Input, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { TipoValidacaoDuasEtapas } from '../../../Models/Objetos/auth.model';
import { Validacao2FAData } from '../shared/models/auth-state.model';

@Component({
  selector: 'app-validacao-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validacao-2fa.component.html',
  styleUrls: ['./validacao-2fa.component.scss']
})
export class Validacao2FAComponent implements AfterViewInit {
  @Input() usuarioId!: string;
  @Input() tipoValidacao!: 'Email' | 'WhatsApp';
  @Input() destinoEnvio!: string;
  @Input() fluxoOrigem: 'login' | 'cadastro' = 'login';

  @Output() validacaoSucesso = new EventEmitter<Validacao2FAData>();
  @Output() voltarParaSelecao = new EventEmitter<void>();
  @Output() reenviar = new EventEmitter<void>();

  tokenDigits: string[] = ['', '', '', '', '', ''];
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService
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
      const tipoEnum = this.tipoValidacao === 'Email'
        ? TipoValidacaoDuasEtapas.Email
        : TipoValidacaoDuasEtapas.WhatsApp;

      // TODO: Implementar contador de tentativas (máx 3-5 tentativas)
      // TODO: Adicionar tempo de expiração do código (ex: 5 minutos)

      const response = await this.authService.confirmarValidacao2FA({
        usuarioId: this.usuarioId,
        empresaId: '',
        token: tokenCompleto,
        tipoValidacao: tipoEnum
      });

      this.authService.salvarDadosAutenticacao(response);

      this.successMessage = 'Validação realizada com sucesso!';

      const requiresCadastroEmpresa = this.fluxoOrigem === 'cadastro';

      // TODO: Registrar login no histórico de acessos
      // TODO: Enviar notificação de novo acesso para email/WhatsApp

      this.validacaoSucesso.emit({
        sucesso: true,
        requiresCadastroEmpresa
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Código inválido. Tente novamente.';
      this.limparToken();
      console.error('Erro ao confirmar validação 2FA:', error);
      // TODO: Exibir erro usando SnackBar
      // TODO: Bloquear após muitas tentativas inválidas
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

  onVoltarParaSelecao(): void {
    this.voltarParaSelecao.emit();
  }

  onReenviarCodigo(): void {
    this.limparToken();
    this.errorMessage = '';
    this.successMessage = 'Código reenviado! Verifique seu ' + (this.tipoValidacao === 'Email' ? 'e-mail' : 'WhatsApp');
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
    return this.fluxoOrigem === 'cadastro' ? 'Continuar Cadastro' : 'Confirmar';
  }
}
