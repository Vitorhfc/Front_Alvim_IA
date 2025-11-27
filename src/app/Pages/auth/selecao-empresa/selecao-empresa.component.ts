import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { EmpresaVinculadaModel } from '../../../Models/Objetos/auth.model';

/**
 * Componente de Seleção de Empresa - PASSO 3 do fluxo de autenticação
 *
 * Fluxo OPÇÃO A - Selecionar empresa existente:
 * 1. Usuário seleciona uma empresa da lista
 * 2. Sistema faz login no CLIENT com a empresa selecionada
 * 3. Recebe token JWT final e redireciona para dashboard
 *
 * Fluxo OPÇÃO B - Criar nova empresa:
 * 1. Usuário clica em "Criar nova empresa"
 * 2. Sistema faz login no ADMIN com o usuarioId
 * 3. Recebe token ADMIN temporário
 * 4. Redireciona para tela de cadastro de empresa
 * 5. Após cadastrar, faz login no CLIENT automaticamente
 */
@Component({
  selector: 'app-selecao-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selecao-empresa.component.html',
  styleUrls: ['./selecao-empresa.component.scss']
})
export class SelecaoEmpresaComponent implements OnInit {
  @Input() usuarioId!: string;
  @Input() empresas: EmpresaVinculadaModel[] = [];

  @Output() empresaSelecionada = new EventEmitter<void>();
  @Output() voltarParaLogin = new EventEmitter<void>();
  @Output() cadastrarNovaEmpresa = new EventEmitter<void>();

  empresaSelecionadaId: string = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar
  ) {}

  ngOnInit(): void {
    // Se houver apenas uma empresa, seleciona automaticamente
    if (this.empresas.length === 1) {
      this.empresaSelecionadaId = this.empresas[0].empresaId;
    }
  }

  async onSelecionarEmpresa(): Promise<void> {
    if (!this.empresaSelecionadaId) {
      this.errorMessage = 'Por favor, selecione uma empresa';
      this.snackBar.error(this.errorMessage);
      return;
    }

    this.loading = true;
    this.spinnerService.show();
    this.errorMessage = '';

    try {
      const response = await this.authService.selecionarEmpresa({
        usuarioId: this.usuarioId,
        empresaId: this.empresaSelecionadaId
      });

      // Salvar dados da autenticação
      this.authService.salvarDadosAutenticacao(response);

      this.snackBar.success('Login realizado com sucesso!');

      // Emitir evento de sucesso
      this.empresaSelecionada.emit();
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao selecionar empresa';
      this.snackBar.error(this.errorMessage);
      console.error('Erro ao selecionar empresa:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  onVoltarParaLogin(): void {
    this.voltarParaLogin.emit();
  }

  /**
   * FLUXO: Criar nova empresa
   * 1. Faz login no ADMIN com o usuarioId
   * 2. Salva token ADMIN temporariamente
   * 3. Emite evento para navegar para cadastro de empresa
   */
  async onCadastrarNovaEmpresa(): Promise<void> {
    this.loading = true;
    this.spinnerService.show();
    this.errorMessage = '';

    try {
      // Fazer login no ADMIN para permitir cadastro de empresa
      const admResponse = await this.authService.loginUsuario({
        usuarioId: this.usuarioId
      });

      // Salvar token ADM temporariamente
      // Este token será usado no cadastro da empresa
      // e descartado após o cadastro
      localStorage.setItem('temp_admin_token', admResponse.token);
      localStorage.setItem('temp_admin_token_expiration', admResponse.dataExpiracao);

      this.snackBar.success('Autenticação administrativa realizada!');

      // Emitir evento para navegar para cadastro de empresa
      this.cadastrarNovaEmpresa.emit();
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao autenticar no sistema administrativo';
      this.snackBar.error(this.errorMessage);
      console.error('Erro ao fazer login ADM:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  getEmpresaNome(empresaId: string): string {
    const empresa = this.empresas.find(e => e.empresaId === empresaId);
    return empresa?.nomeEmpresa || '';
  }

  isAdministrador(empresaId: string): boolean {
    const empresa = this.empresas.find(e => e.empresaId === empresaId);
    return empresa?.flgAdministrador || false;
  }
}
