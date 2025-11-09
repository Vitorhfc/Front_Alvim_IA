import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { TipoValidacaoDuasEtapas } from '../../../Models/Objetos/auth.model';
import { Selecao2FAData } from '../shared/models/auth-state.model';

@Component({
  selector: 'app-selecao-2fa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selecao-2fa.component.html',
  styleUrls: ['./selecao-2fa.component.scss']
})
export class Selecao2FAComponent {
  @Input() usuarioId!: string;
  @Input() fluxoOrigem: 'login' | 'cadastro' = 'login';

  @Output() metodoSelecionado = new EventEmitter<Selecao2FAData>();
  @Output() cancelar = new EventEmitter<void>();

  loading = false;
  errorMessage = '';

  TipoValidacao = TipoValidacaoDuasEtapas;

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {}

  async selecionarMetodo(tipo: TipoValidacaoDuasEtapas): Promise<void> {
    this.errorMessage = '';

    if (!this.usuarioId) {
      this.errorMessage = 'Sessão inválida';
      return;
    }

    // Log para debugging
    console.log('Solicitando validação 2FA:', {
      usuarioId: this.usuarioId,
      tipoValidacao: tipo,
      fluxoOrigem: this.fluxoOrigem
    });

    this.loading = true;
    this.spinnerService.show();

    try {
      // TODO: Validar se usuário tem email/telefone cadastrado antes de permitir seleção
      // TODO: Implementar rate limiting para evitar spam de códigos

      const response = await this.authService.solicitarValidacao2FA({
        usuarioId: this.usuarioId,
        tipoValidacao: tipo
      });

      console.log('Resposta da validação 2FA:', response);

      // TODO: Exibir mensagem de sucesso informando onde o código foi enviado
      this.metodoSelecionado.emit({
        tipoValidacao: tipo,
        destinoEnvio: response.destinoEnvio
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao solicitar código de validação';
      console.error('Erro ao solicitar validação 2FA:', error);
      // TODO: Exibir erro usando SnackBar
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  get tituloVoltar(): string {
    return this.fluxoOrigem === 'cadastro' ? 'Cancelar Cadastro' : 'Voltar para Login';
  }
}
