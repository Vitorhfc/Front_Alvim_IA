import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../Service/Api/auth.service';
import { SpinnerService } from '../../../Service/Local/spinner';
import { SnackBar } from '../../../Service/Local/snack-bar';
import { CadastroUsuarioData } from '../shared/models/auth-state.model';

/**
 * Componente de Cadastro de Usuário
 *
 * Fluxo completo:
 * 1. Usuário preenche formulário de cadastro
 * 2. Sistema cadastra usuário no ADMIN
 * 3. Faz login automático no ADMIN com o usuarioId
 * 4. Emite evento para AuthContainer navegar para cadastro de empresa
 * 5. Após cadastrar empresa, faz login no CLIENT
 */
@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px)'
        }),
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({
          opacity: 0,
          transform: 'translateY(-10px)'
        }))
      ])
    ])
  ]
})
export class CadastroUsuarioComponent implements OnInit {
  @Output() cadastroSuccess = new EventEmitter<{ usuarioId: string; nome: string; email: string }>();
  @Output() switchToLogin = new EventEmitter<void>();

  cadastroModel: CadastroUsuarioData = {
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    senha: '',
    dtaNascimento: '',
    flgInterno: false
  };

  loading = false;
  errorMessage = '';
  showPassword = false;
  termsAccepted = false;
  showProgress = false;
  formProgress = 0;
  
  // Controle de datas
  maxDate: string = '';
  minDate: string = '';
  
  // Controle de força da senha
  passwordStrength: 'weak' | 'medium' | 'strong' | '' = '';

  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private snackBar: SnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupDateLimits();
    this.calculateFormProgress();
  }

  setupDateLimits(): void {
    const today = new Date();
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
    
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    
    this.maxDate = eighteenYearsAgo.toISOString().split('T')[0];
    this.minDate = hundredYearsAgo.toISOString().split('T')[0];
  }

  async onCadastro(): Promise<void> {
    // Limpar estado anterior
    this.errorMessage = '';

    // Verificar se os termos foram aceitos
    if (!this.termsAccepted) {
      this.errorMessage = 'Você deve aceitar os termos de uso para continuar';
      this.snackBar.error(this.errorMessage);
      return;
    }

    // Validar formulário
    if (!this.validateForm()) {
      this.snackBar.error(this.errorMessage);
      return;
    }

    // Ativar loading
    this.loading = true;
    this.spinnerService.show();

    try {
      // PASSO 1: Cadastrar usuário no ADMIN
      const response = await this.authService.cadastrarUsuario(this.cadastroModel);

      this.snackBar.success('Usuário cadastrado com sucesso!');

      // PASSO 2: Fazer login no ADMIN com o usuarioId
      const loginResponse = await this.authService.loginUsuario({
        usuarioId: response.id
      });

      // Salvar token ADM temporariamente para cadastro de empresa
      localStorage.setItem('temp_admin_token', loginResponse.token);
      localStorage.setItem('temp_admin_token_expiration', loginResponse.dataExpiracao);

      this.snackBar.success('Autenticação administrativa realizada!');

      // PASSO 3: Emitir evento para AuthContainer navegar para cadastro de empresa
      this.cadastroSuccess.emit({
        usuarioId: response.id,
        nome: this.cadastroModel.nome,
        email: this.cadastroModel.email
      });

    } catch (error: any) {
      // Tratar erro
      this.errorMessage = this.getErrorMessage(error);
      this.snackBar.error(this.errorMessage);
      console.error('Erro no cadastro:', error);
    } finally {
      // SEMPRE esconder o spinner, independente de sucesso ou erro
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.errors) {
        return Object.values(error.error.errors).join(', ');
      }
    }
    
    if (error.status === 409) {
      return 'E-mail ou CPF já cadastrado';
    }
    
    if (error.status === 400) {
      return 'Dados inválidos. Verifique os campos e tente novamente';
    }
    
    return 'Erro ao realizar cadastro. Tente novamente.';
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    const { nome, email, cpf, celular, senha, dtaNascimento } = this.cadastroModel;
    
    return !!(
      nome && nome.length >= 3 &&
      email && this.isValidEmail(email) &&
      cpf && this.isValidCPF(cpf) &&
      celular && this.isValidCelular(celular) &&
      senha && senha.length >= 6 &&
      dtaNascimento && !this.isValidDataNascimento(dtaNascimento) &&
      this.termsAccepted
    );
  }

  private validateForm(): boolean {
    const { nome, email, cpf, celular, senha, dtaNascimento } = this.cadastroModel;

    if (!nome || nome.length < 3) {
      this.errorMessage = 'Nome deve ter pelo menos 3 caracteres';
      return false;
    }

    if (!email || !this.isValidEmail(email)) {
      this.errorMessage = 'E-mail inválido';
      return false;
    }

    if (!cpf || !this.isValidCPF(cpf)) {
      this.errorMessage = 'CPF inválido';
      return false;
    }

    if (!celular || !this.isValidCelular(celular)) {
      this.errorMessage = 'Celular inválido';
      return false;
    }

    if (!senha || senha.length < 6) {
      this.errorMessage = 'A senha deve ter no mínimo 6 caracteres';
      return false;
    }

    if (this.isValidDataNascimento(dtaNascimento)) {
      this.errorMessage = 'Data de nascimento obrigatória';
      return false;
    }

    const dataNascimento = new Date(dtaNascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNascimento.getFullYear();

    if (dataNascimento >= hoje) {
      this.errorMessage = 'Data de nascimento não pode ser igual ou maior que a data atual';
      return false;
    }

    if (idade < 18) {
      this.errorMessage = 'Você deve ter pelo menos 18 anos';
      return false;
    }

    if (idade > 120) {
      this.errorMessage = 'Data de nascimento inválida';
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  isValidCelular(celular: string): boolean {
    const celularDigits = celular.replace(/[^\d]/g, '');
    return celularDigits.length === 10 || celularDigits.length === 11;
  }

  private isValidDataNascimento(data: string): boolean {
    return !data;
  }

  formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.cadastroModel.cpf = value;
    }
    this.calculateFormProgress();
  }

  formatCelular(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      this.cadastroModel.celular = value;
    }
    this.calculateFormProgress();
  }

  validateCPF(): void {
    if (this.cadastroModel.cpf && !this.isValidCPF(this.cadastroModel.cpf)) {
      // Pode adicionar visual feedback aqui
    }
  }

  validateCelular(): void {
    if (this.cadastroModel.celular && !this.isValidCelular(this.cadastroModel.celular)) {
      // Pode adicionar visual feedback aqui
    }
  }

  calculateFormProgress(): void {
    const fields = [
      this.cadastroModel.nome,
      this.cadastroModel.email,
      this.cadastroModel.cpf,
      this.cadastroModel.celular,
      this.cadastroModel.senha,
      this.cadastroModel.dtaNascimento
    ];
    
    const filledFields = fields.filter(field => field && field.length > 0).length;
    this.formProgress = Math.round((filledFields / fields.length) * 100);
    
    // Verificar força da senha
    if (this.cadastroModel.senha) {
      this.checkPasswordStrength();
    }
  }

  checkPasswordStrength(): void {
    const password = this.cadastroModel.senha;
    
    if (!password) {
      this.passwordStrength = '';
      return;
    }
    
    let strength = 0;
    
    // Comprimento
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Contém números
    if (/\d/.test(password)) strength++;
    
    // Contém letras maiúsculas e minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    // Contém caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) {
      this.passwordStrength = 'weak';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'weak':
        return '⚠️ Senha fraca';
      case 'medium':
        return '🔒 Senha média';
      case 'strong':
        return '✅ Senha forte';
      default:
        return '';
    }
  }
}