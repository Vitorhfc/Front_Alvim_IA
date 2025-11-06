// Pages/cadastro-empresa/cadastro-empresa.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CadastroEmpresaRequest, EmpresaService } from '../../../Service/Api/empresa.service';
import { SpinnerService } from '../../../Service/Local/spinner';

type CadastroStep = 'dados-basicos' | 'endereco' | 'confirmacao';

@Component({
  selector: 'app-cadastro-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-empresa.html',
  styleUrls: ['./cadastro-empresa.scss']
})
export class CadastroEmpresaComponent implements OnInit {
  // Controle de etapas
  currentStep: CadastroStep = 'dados-basicos';

  // Dados recebidos da navegação
  usuarioId: string = '';

  // Model do formulário
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

  // Feedback
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  buscandoCep: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    // Recuperar dados do state da navegação
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.usuarioId = navigation.extras.state['usuarioId'];
    }
  }

  ngOnInit(): void {
    // Verificar se temos o usuarioId
    if (!this.usuarioId) {
      this.errorMessage = 'Sessão inválida. Redirecionando...';
      this.router.navigate(['/auth']);
      return;
    }

    this.empresaModel.usuarioId = this.usuarioId;
  }

  // ==================== ETAPA 1: DADOS BÁSICOS ====================

  async avancarParaEndereco(): Promise<void> {
    this.resetMessages();

    if (!this.validateDadosBasicos()) {
      return;
    }

    this.currentStep = 'endereco';
  }

  // ==================== ETAPA 2: ENDEREÇO ====================

  async buscarCep(): Promise<void> {
    const cep = this.empresaModel.cep?.replace(/\D/g, '') || '';

    if (cep.length !== 8) {
      this.errorMessage = 'CEP inválido';
      return;
    }

    this.buscandoCep = true;
    this.resetMessages();

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      console.log('Dados do CEP:', data);
      if (data.erro) {
        this.errorMessage = 'CEP não encontrado';
        return;
      }

      // Preencher dados do endereço
      this.empresaModel.endereco = data.logradouro;
      this.empresaModel.bairro = data.bairro;
      this.empresaModel.cidade = data.localidade;
      this.empresaModel.estado = data.uf;

      this.successMessage = 'Endereço encontrado!';
    } catch (error) {
      this.errorMessage = 'Erro ao buscar CEP';
      console.error('Erro ao buscar CEP:', error);
    } finally {
      this.buscandoCep = false;
    }
  }

  async avancarParaConfirmacao(): Promise<void> {
    this.resetMessages();

    if (!this.validateEndereco()) {
      return;
    }

    this.currentStep = 'confirmacao';
  }

  // ==================== ETAPA 3: CONFIRMAÇÃO ====================

  async finalizarCadastro(): Promise<void> {
    this.resetMessages();
    this.loading = true;
    this.spinnerService.show();

    try {
      // Chamar serviço para cadastrar empresa
      const empresaCriada = await this.empresaService.cadastrarEmpresa(this.empresaModel);

      this.successMessage = 'Empresa cadastrada com sucesso! Redirecionando...';

      // Redirecionar para dashboard ou página de empresas
      this.router.navigate(['/dashboard'], {
        state: {
          empresaId: empresaCriada.id,
          empresaNome: empresaCriada.razaoSocial
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao cadastrar empresa';
      console.error('Erro no cadastro da empresa:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // ==================== VALIDAÇÕES ====================

  private validateDadosBasicos(): boolean {
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

  private validateEndereco(): boolean {
    const { cep, endereco, numero, bairro, cidade, estado } = this.empresaModel;

    if (!cep || !endereco || !numero || !bairro || !cidade || !estado) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
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

  // ==================== NAVEGAÇÃO ====================

  voltarParaDadosBasicos(): void {
    this.currentStep = 'dados-basicos';
    this.resetMessages();
  }

  voltarParaEndereco(): void {
    this.currentStep = 'endereco';
    this.resetMessages();
  }

  cancelarCadastro(): void {
    if (confirm('Deseja realmente cancelar o cadastro?')) {
      this.router.navigate(['/auth']);
    }
  }

  // ==================== UTILITÁRIOS ====================

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Formatação de CNPJ
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

  // Formatação de Telefone
  formatTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      this.empresaModel.telefone = value;
    }
  }

  // Formatação de CEP
  formatCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
      this.empresaModel.cep = value;
    }
  }

  // Getter para exibir progresso
  get progressPercentage(): number {
    const steps: Record<CadastroStep, number> = {
      'dados-basicos': 33,
      'endereco': 66,
      'confirmacao': 100
    };
    return steps[this.currentStep];
  }
}