import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoValidacaoDuasEtapas } from '../../../Models/Objetos/auth.model';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';

@Component({
  selector: 'app-validacao-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-validcao2-fa.html',
  styleUrls: ['./login-validcao2-fa.scss']
})
export class Validacao2FAComponent implements OnInit {
  // Controle de etapas
  currentStep: 'select' | 'validate' = 'select';

  // Dados recebidos
  usuarioId: string = '';
  email: string = '';

  // Dados do 2FA
  token2FA: string = '';
  destinoEnvio: string = '';
  tipoSelecionado: TipoValidacaoDuasEtapas = TipoValidacaoDuasEtapas.Email;

  // Feedback
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    // Recuperar dados do state da navegação
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.usuarioId = navigation.extras.state['usuarioId'];
      this.email = navigation.extras.state['email'] || '';
    }
  }

  ngOnInit(): void {
    // Verificar se temos o usuarioId
    if (!this.usuarioId) {
      this.errorMessage = 'Sessão inválida. Redirecionando...';
      this.router.navigate(['/auth']);
    }
  }

  // ==================== SELEÇÃO DE MÉTODO 2FA ====================

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
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao solicitar código de validação';
      console.error('Erro ao solicitar validação 2FA:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // ==================== VALIDAÇÃO DE CÓDIGO ====================

  async confirmarValidacao2FA(): Promise<void> {
    this.resetMessages();

    if (!this.token2FA || this.token2FA.length !== 6) {
      this.errorMessage = 'Por favor, insira um código válido de 6 dígitos';
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const response = await this.authService.confirmarValidacao2FA({
        usuarioId: this.usuarioId,
        empresaId: '', // Será preenchido no backend ou selecionado
        token: this.token2FA,
        tipoValidacao: this.tipoSelecionado
      });

      // Salvar token e dados do usuário
      this.authService.salvarDadosAutenticacao(response);

      this.successMessage = 'Login realizado com sucesso! Redirecionando...';

      // Redirecionar para dashboard
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Código inválido. Tente novamente.';
      this.token2FA = '';
      console.error('Erro ao confirmar validação 2FA:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // ==================== NAVEGAÇÃO ====================

  voltarParaSelecao(): void {
    this.currentStep = 'select';
    this.token2FA = '';
    this.resetMessages();
  }

  voltarParaLogin(): void {
    this.router.navigate(['/auth']);
  }

  // ==================== UTILITÁRIOS ====================

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Formatação de Token 2FA (apenas números)
  formatToken2FA(event: any): void {
    const value = event.target.value.replace(/\D/g, '');
    this.token2FA = value.substring(0, 6);
  }

  // Getter para facilitar o uso no template
  get TipoValidacao() {
    return TipoValidacaoDuasEtapas;
  }
}