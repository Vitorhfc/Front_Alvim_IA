import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';
import { SpinnerService } from '../../Service/Local/spinner';
import { ClientService } from '../../Service/Api/client.service';
import { Funcionario, HorarioTrabalho, TipoAusencia } from '../../Models/Entidades/Client/Funcionario';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './funcionarios.component.html',
  styleUrls: ['./funcionarios.component.scss']
})
export class FuncionariosComponent implements OnInit {
  funcionarios: Funcionario[] = [];
  funcionarioSelecionado: Funcionario | null = null;
  intervaloFim: string = '';

  // Controle de UI
  loading = false;
  mostrarModal = false;
  modoEdicao = false;
  errorMessage = '';
  successMessage = '';

  // Filtros e busca
  termoBusca = '';
  filtroAtivo: boolean | null = null;

  // Formulário
  funcionarioForm: Partial<Funcionario> = this.novoFuncionarioForm();

  // Enums para template
  TipoAusencia = TipoAusencia;
  diasSemana = [
    { valor: 0, nome: 'Domingo' },
    { valor: 1, nome: 'Segunda-feira' },
    { valor: 2, nome: 'Terça-feira' },
    { valor: 3, nome: 'Quarta-feira' },
    { valor: 4, nome: 'Quinta-feira' },
    { valor: 5, nome: 'Sexta-feira' },
    { valor: 6, nome: 'Sábado' }
  ];

  constructor(
    private clientService: ClientService,
    private spinnerService: SpinnerService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.carregarFuncionarios();
  }

  // ==================== LISTAGEM ====================

  async carregarFuncionarios(): Promise<void> {
    this.loading = true;
    this.spinnerService.show();
    this.errorMessage = '';

    try {
      this.funcionarios = await this.clientService.listarFuncionarios();
      console.log('Funcionários carregados:', this.funcionarios.length);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar funcionários';
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  get funcionariosFiltrados(): Funcionario[] {
    let resultado = this.funcionarios;

    // Filtrar por busca
    if (this.termoBusca) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        f.email.toLowerCase().includes(termo) ||
        f.cargo?.toLowerCase().includes(termo) ||
        f.telefone.includes(termo)
      );
    }

    // Filtrar por status ativo
    if (this.filtroAtivo !== null) {
      resultado = resultado.filter(f => f.flgAtivo === this.filtroAtivo);
    }

    return resultado;
  }

  // ==================== MODAL ====================

  abrirModalNovo(): void {
    this.funcionarioForm = this.novoFuncionarioForm();
    this.modoEdicao = false;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  abrirModalEdicao(funcionario: Funcionario): void {
    this.funcionarioForm = { ...funcionario };
    this.modoEdicao = true;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.funcionarioForm = this.novoFuncionarioForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ==================== CRUD ====================

  async salvarFuncionario(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    // Validação básica
    if (!this.funcionarioForm.nome || !this.funcionarioForm.email) {
      this.errorMessage = 'Nome e email são obrigatórios';
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      if (this.modoEdicao && this.funcionarioForm.id) {
        // Atualizar
        await this.clientService.atualizarFuncionario(
          this.funcionarioForm.id,
          this.funcionarioForm as Funcionario
        );
        this.successMessage = 'Funcionário atualizado com sucesso!';
      } else {
        // Criar
        await this.clientService.cadastrarFuncionario(
          this.funcionarioForm as Funcionario
        );
        this.successMessage = 'Funcionário cadastrado com sucesso!';
      }

      await this.carregarFuncionarios();

      setTimeout(() => {
        this.fecharModal();
      }, 1500);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar funcionário';
      console.error('Erro ao salvar funcionário:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async toggleStatus(funcionario: Funcionario): Promise<void> {
    if (!confirm(`Deseja ${funcionario.flgAtivo ? 'desativar' : 'ativar'} ${funcionario.nome}?`)) {
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      const novoStatus = !funcionario.flgAtivo;
      await this.clientService.toggleStatusFuncionario(funcionario.id, novoStatus);
      await this.carregarFuncionarios();
      this.successMessage = `Funcionário ${funcionario.flgAtivo ? 'desativado' : 'ativado'} com sucesso!`;

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao alterar status';
      console.error('Erro ao toggle status:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async removerFuncionario(funcionario: Funcionario): Promise<void> {
    if (!confirm(`Deseja realmente remover ${funcionario.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      await this.clientService.removerFuncionario(funcionario.id);
      await this.carregarFuncionarios();
      this.successMessage = 'Funcionário removido com sucesso!';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao remover funcionário';
      console.error('Erro ao remover funcionário:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // ==================== HORÁRIOS ====================

  adicionarHorario(): void {
    if (!this.funcionarioForm.horariosTrabalho) {
      this.funcionarioForm.horariosTrabalho = [];
    }

    this.funcionarioForm.horariosTrabalho.push({
      diaSemana: 1,
      flgTrabalha: true,
      horarioEntrada: '09:00',
      horarioSaida: '18:00',
      intervalo: {
        horarioInicio: '12:00',
        horarioFim: '13:00',
        descricao: null
      }
    });
  }

  removerHorario(index: number): void {
    if (this.funcionarioForm.horariosTrabalho) {
      this.funcionarioForm.horariosTrabalho.splice(index, 1);
    }
  }

  // ==================== AUSÊNCIAS ====================

  adicionarAusencia(): void {
    if (!this.funcionarioForm.ausencias) {
      this.funcionarioForm.ausencias = [];
    }

    this.funcionarioForm.ausencias.push({
      tipo: TipoAusencia.Folga,
      dataInicio: new Date().toISOString(),
      dataFim: new Date().toISOString(),
      motivo: '',
      flgAprovada: false
    } as any);
  }

  removerAusencia(index: number): void {
    if (this.funcionarioForm.ausencias) {
      this.funcionarioForm.ausencias.splice(index, 1);
    }
  }

  // ==================== HELPERS ====================

  private novoFuncionarioForm(): Partial<Funcionario> {
    return {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      cargo: '',
      especialidades: [],
      horariosTrabalho: [],
      ausencias: [],
      calendarioExterno: null,
      totalAgendamentos: 0,
      corCalendario: '#3498db',
      flgAtivo: true
    };
  }

  getNomeDiaSemana(dia: number): string {
    return this.diasSemana.find(d => d.valor === dia)?.nome || '';
  }

  getTipoAusenciaNome(tipo: TipoAusencia): string {
    const tipos: { [key in TipoAusencia]: string } = {
      [TipoAusencia.Ferias]: 'Férias',
      [TipoAusencia.Folga]: 'Folga',
      [TipoAusencia.Atestado]: 'Atestado',
      [TipoAusencia.Licenca]: 'Licença',
      [TipoAusencia.Treinamento]: 'Treinamento',
      [TipoAusencia.Outros]: 'Outros'
    };
    return tipos[tipo];
  }

  formatarData(data: Date | string): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.filtroAtivo = null;
  }
}
