import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CadastroEmpresaRequest, EmpresaService } from '../../../Service/Api/empresa.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { AuthService } from '../../../Service/Api/auth.service';
import { SnackBar } from '../../../Service/Local/snack-bar';

@Component({
  selector: 'app-cadastro-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-empresa.component.html',
  styleUrls: ['./cadastro-empresa.component.scss']
})
export class CadastroEmpresaComponent implements OnInit {
  @Input() usuarioId: string = '';
  @Input() usarFluxoAuth: boolean = false;
  @Output() empresaCadastradaComSucesso = new EventEmitter<void>();
  @Output() voltarParaSelecao = new EventEmitter<void>();

  empresaModel: CadastroEmpresaRequest = {
    usuarioId: '',
    razaoSocial: '',
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  loading: boolean = false;
  errorMessage: string = '';
  isAuthenticatingAdm: boolean = false;
  admTokenValid: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private router: Router,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private snackBar: SnackBar
  ) {
    if (!this.usuarioId) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state) {
        this.usuarioId = navigation.extras.state['usuarioId'];
      }
    }
  }

  async ngOnInit(): Promise<void> {
    if (!this.usuarioId) {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state || history.state;

      if (state && state['usuarioId']) {
        this.usuarioId = state['usuarioId'];
      }
    }

    if (!this.usuarioId) {
      this.errorMessage = 'Sessão inválida. Redirecionando...';
      this.snackBar.error(this.errorMessage);

      setTimeout(() => {
        if (this.usarFluxoAuth) {
          this.voltarParaSelecao.emit();
        } else {
          this.router.navigate(['/auth']);
        }
      }, 2000);
      return;
    }

    this.empresaModel.usuarioId = this.usuarioId;
    await this.fazerLoginAdm();
  }

  private async fazerLoginAdm(): Promise<void> {
    const tempAdmToken = localStorage.getItem('temp_admin_token');
    if (tempAdmToken) {
      this.admTokenValid = true;
      return;
    }

    this.isAuthenticatingAdm = true;
    this.spinnerService.show();

    try {
      const loginResponse = await this.authService.loginUsuario({
        usuarioId: this.usuarioId
      });

      localStorage.setItem('temp_admin_token', loginResponse.token);
      localStorage.setItem('temp_admin_token_expiration', loginResponse.dataExpiracao);

      this.admTokenValid = true;
      this.snackBar.success('Autenticação administrativa realizada com sucesso!');

    } catch (error: any) {
      this.errorMessage = 'Erro ao autenticar no sistema administrativo. Redirecionando...';
      this.snackBar.error(this.errorMessage);

      setTimeout(() => {
        if (this.usarFluxoAuth) {
          this.voltarParaSelecao.emit();
        } else {
          this.router.navigate(['/auth']);
        }
      }, 2000);
    } finally {
      this.isAuthenticatingAdm = false;
      this.spinnerService.hidden();
    }
  }

  async onCadastro(): Promise<void> {
    this.errorMessage = '';

    if (!this.validateForm()) {
      this.snackBar.error(this.errorMessage);
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const empresaCriada = await this.empresaService.cadastrarEmpresa(this.empresaModel);

      this.snackBar.success('Empresa cadastrada com sucesso!');

      localStorage.removeItem('temp_admin_token');
      localStorage.removeItem('temp_admin_token_expiration');

      await this.fazerLoginAutomaticoNaEmpresa(empresaCriada.id);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao cadastrar empresa';
      this.snackBar.error(this.errorMessage);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  private async fazerLoginAutomaticoNaEmpresa(empresaId: string): Promise<void> {
    try {
      const loginResponse = await this.authService.selecionarEmpresa({
        usuarioId: this.usuarioId,
        empresaId: empresaId
      });

      this.authService.salvarDadosAutenticacao(loginResponse);
      this.snackBar.success('Login realizado com sucesso! Redirecionando para o dashboard...');

      setTimeout(() => {
        if (this.usarFluxoAuth) {
          this.empresaCadastradaComSucesso.emit();
        } else {
          this.router.navigate(['/dashboard']);
        }
      }, 1500);

    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao fazer login na empresa';
      this.snackBar.error(this.errorMessage);

      setTimeout(() => {
        this.router.navigate(['/auth']);
      }, 2000);
    }
  }

  private validateForm(): boolean {
    const { razaoSocial, cnpj, email } = this.empresaModel;

    if (!razaoSocial || !cnpj) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return false;
    }

    if (email && !this.isValidEmail(email)) {
      this.errorMessage = 'E-mail inválido';
      return false;
    }

    if (!this.isValidCNPJ(cnpj)) {
      this.errorMessage = 'CNPJ inválido';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.length === 14;
  }

  onSwitchToLogin(): void {
    if (confirm('Deseja realmente cancelar o cadastro?')) {
      localStorage.removeItem('temp_admin_token');
      localStorage.removeItem('temp_admin_token_expiration');

      if (this.usarFluxoAuth) {
        this.voltarParaSelecao.emit();
      } else {
        this.router.navigate(['/auth']);
      }
    }
  }

  formatCNPJ(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
      this.empresaModel.cnpj = value;
    }
  }

  formatTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      this.empresaModel.telefone = value;
    }
  }
}