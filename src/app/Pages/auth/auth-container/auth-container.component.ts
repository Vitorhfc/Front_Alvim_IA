import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { SpinnerComponent } from '../../../Components/spinner/spinner';
import { LoginComponent } from '../login/login.component';
import { CadastroUsuarioComponent } from '../cadastro-usuario/cadastro-usuario.component';
import { Validacao2FAComponent } from '../validacao-2fa/validacao-2fa.component';
import { SelecaoEmpresaComponent } from '../selecao-empresa/selecao-empresa.component';
import { CadastroEmpresaComponent } from '../cadastro-empresa/cadastro-empresa.component';
import { AuthState, AuthStep, Selecao2FAData, Validacao2FAData } from '../shared/models/auth-state.model';
import { EmpresaVinculadaModel, LoginModel } from '../../../Models/Objetos/auth.model';
import { AuthService } from '../../../Service/Api/auth.service';
import { SignalRHubService } from '../../../Service/signalr-hub.service';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    SpinnerComponent,
    LoginComponent,
    CadastroUsuarioComponent,
    Validacao2FAComponent,
    SelecaoEmpresaComponent,
    CadastroEmpresaComponent
  ],
  templateUrl: './auth-container.component.html',
  styleUrls: ['./auth-container.component.scss']
})
export class AuthContainerComponent {
  authState: AuthState = {
    step: 'login',
    fluxoOrigem: 'login'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private signalRService: SignalRHubService
  ) {}

  // ==================== EVENTOS DO LOGIN ====================

  onLoginSuccess(data: {
    usuarioId: string;
    nome: string;
    email: string;
    tipoValidacao: 0 | 1;
    destinoEnvio: string;
  }): void {
    this.authState = {
      ...this.authState,
      step: 'validacao-2fa',
      usuarioId: data.usuarioId,
      nome: data.nome,
      email: data.email,
      tipoValidacao: data.tipoValidacao,
      destinoEnvio: data.destinoEnvio,
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

  /**
   * Após cadastro de usuário bem-sucedido:
   * - O componente de cadastro já fez login no ADMIN
   * - Já salvou o token ADM temporariamente
   * - Agora vai direto para cadastro de empresa
   */
  onCadastroSuccess(data: { usuarioId: string; nome: string; email: string }): void {
    this.authState = {
      ...this.authState,
      step: 'cadastro-empresa',
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

  /**
   * Após validação 2FA bem-sucedida:
   * - Recebe lista de empresas vinculadas ao usuário
   * - Navega para tela de seleção de empresa
   */
  onValidacaoSucesso(data: {
    empresas: EmpresaVinculadaModel[];
    requiresCadastroEmpresa: boolean;
  }): void {
    // Sempre vai para seleção de empresa após validação 2FA
    // O fluxo de cadastro de novo usuário não passa mais por validação 2FA
    this.authState = {
      ...this.authState,
      step: 'selecao-empresa',
      empresas: data.empresas
    };
  }

  onVoltarParaLogin(): void {
    this.authState = {
      step: 'login',
      fluxoOrigem: 'login'
    };
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

  // ==================== EVENTOS DA SELEÇÃO DE EMPRESA ====================

  /**
   * Empresa selecionada com sucesso:
   * - O componente de seleção já fez login no CLIENT
   * - Já salvou o token JWT final
   * - Conecta ao SignalR
   * - Redireciona para dashboard
   */
  async onEmpresaSelecionada(): Promise<void> {
    // Conectar ao SignalR após seleção de empresa
    await this.signalRService.startConnection();

    this.router.navigate(['/dashboard']);
  }

  /**
   * Criar nova empresa:
   * - O componente de seleção já fez login no ADMIN
   * - Já salvou token ADM temporariamente
   * - Navega para cadastro de empresa
   */
  onCadastrarNovaEmpresa(): void {
    this.authState = {
      ...this.authState,
      step: 'cadastro-empresa'
    };
  }

  /**
   * Empresa cadastrada com sucesso:
   * - O componente de cadastro já fez login no CLIENT
   * - Já salvou o token JWT final
   * - Já limpou o token ADM temporário
   * - Conecta ao SignalR
   * - Redireciona para dashboard
   */
  async onEmpresaCadastradaComSucesso(): Promise<void> {
    // Conectar ao SignalR após cadastro de empresa
    await this.signalRService.startConnection();

    this.router.navigate(['/dashboard']);
  }

  /**
   * Voltar para seleção de empresas:
   * - Usado quando usuário cancela o cadastro de empresa
   */
  onVoltarParaSelecaoEmpresa(): void {
    // Limpar token ADM temporário se existir
    localStorage.removeItem('temp_admin_token');
    localStorage.removeItem('temp_admin_token_expiration');

    this.authState = {
      ...this.authState,
      step: 'selecao-empresa'
    };
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
      'validacao-2fa': 'Verificação em 2 Etapas',
      'selecao-empresa': 'Selecionar Empresa',
      'cadastro-empresa': 'Cadastrar Nova Empresa'
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
      'validacao-2fa': 'Digite o código de verificação',
      'selecao-empresa': 'Escolha qual empresa acessar',
      'cadastro-empresa': 'Preencha os dados da sua empresa'
    };
    return subtitles[this.currentStep];
  }

  get showTabs(): boolean {
    return this.currentStep === 'login' || this.currentStep === 'cadastro';
  }
}
