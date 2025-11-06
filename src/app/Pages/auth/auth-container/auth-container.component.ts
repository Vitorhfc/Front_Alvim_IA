import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../Components/spinner/spinner';
import { LoginComponent } from '../login/login.component';
import { CadastroUsuarioComponent } from '../cadastro-usuario/cadastro-usuario.component';
import { Selecao2FAComponent } from '../selecao-2fa/selecao-2fa.component';
import { Validacao2FAComponent } from '../validacao-2fa/validacao-2fa.component';
import { AuthState, AuthStep, Selecao2FAData, Validacao2FAData } from '../shared/models/auth-state.model';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    LoginComponent,
    CadastroUsuarioComponent,
    Selecao2FAComponent,
    Validacao2FAComponent
  ],
  templateUrl: './auth-container.component.html',
  styleUrls: ['./auth-container.component.scss']
})
export class AuthContainerComponent {
  authState: AuthState = {
    step: 'login',
    fluxoOrigem: 'login'
  };

  constructor(private router: Router) {}

  // ==================== EVENTOS DO LOGIN ====================

  onLoginSuccess(data: { usuarioId: string; email: string }): void {
    this.authState = {
      ...this.authState,
      step: 'selecao-2fa',
      usuarioId: data.usuarioId,
      email: data.email,
      fluxoOrigem: 'login'
    };
  }

  onSwitchToCadastro(): void {
    this.authState = {
      ...this.authState,
      step: 'cadastro',
      fluxoOrigem: 'cadastro'
    };
  }

  // ==================== EVENTOS DO CADASTRO ====================

  onCadastroSuccess(data: { usuarioId: string; nome: string; email: string }): void {
    this.authState = {
      ...this.authState,
      step: 'selecao-2fa',
      usuarioId: data.usuarioId,
      nome: data.nome,
      email: data.email,
      fluxoOrigem: 'cadastro'
    };
  }

  onSwitchToLogin(): void {
    this.authState = {
      ...this.authState,
      step: 'login',
      fluxoOrigem: 'login'
    };
  }

  // ==================== EVENTOS DA SELEÇÃO 2FA ====================

  onMetodoSelecionado(data: Selecao2FAData): void {
    this.authState = {
      ...this.authState,
      step: 'validacao-2fa',
      tipoValidacao: data.tipoValidacao,
      destinoEnvio: data.destinoEnvio
    };
  }

  onCancelar2FA(): void {
    this.authState = {
      step: 'login',
      fluxoOrigem: 'login'
    };
  }

  // ==================== EVENTOS DA VALIDAÇÃO 2FA ====================

  onValidacaoSucesso(data: Validacao2FAData): void {
    if (data.requiresCadastroEmpresa) {
      this.router.navigate(['/cadastro-empresa'], {
        state: {
          usuarioId: this.authState.usuarioId,
          nomeUsuario: this.authState.nome || 'Usuário'
        }
      });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onVoltarParaSelecao(): void {
    this.authState = {
      ...this.authState,
      step: 'selecao-2fa'
    };
  }

  onReenviarCodigo(): void {
    // O componente de validação já mostra a mensagem de sucesso
    // Aqui podemos adicionar lógica adicional se necessário
    console.log('Código reenviado');
  }

  // ==================== GETTERS ====================

  get currentStep(): AuthStep {
    return this.authState.step;
  }

  get pageTitle(): string {
    const titles: Record<AuthStep, string> = {
      'login': 'Bem-vindo',
      'cadastro': 'Criar Conta',
      'selecao-2fa': 'Verificação em 2 Etapas',
      'validacao-2fa': 'Verificação em 2 Etapas'
    };
    return titles[this.currentStep];
  }

  get pageSubtitle(): string {
    const subtitles: Record<AuthStep, string> = {
      'login': 'Faça login para continuar',
      'cadastro': 'Preencha seus dados para criar sua conta',
      'selecao-2fa': this.authState.fluxoOrigem === 'cadastro'
        ? 'Valide sua identidade para continuar o cadastro'
        : 'Confirme sua identidade para continuar',
      'validacao-2fa': 'Digite o código de verificação'
    };
    return subtitles[this.currentStep];
  }

  get showTabs(): boolean {
    return this.currentStep === 'login' || this.currentStep === 'cadastro';
  }
}
