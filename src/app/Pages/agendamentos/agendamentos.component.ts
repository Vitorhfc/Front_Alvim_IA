import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';
import { SpinnerService } from '../../Service/Local/spinner';
import { ClientService } from '../../Service/Api/client.service';
import { Agendamento, StatusAgendamento, OrigemAgendamento } from '../../Models/Entidades/Client/Agendamento';
import { Funcionario } from '../../Models/Entidades/Client/Funcionario';

interface EventoCalendario {
  agendamento: Agendamento;
  inicio: Date;
  fim: Date;
  funcionarioNome: string;
  funcionarioCor: string;
}

interface AgendamentoForm {
  id?: string;
  clienteNome: string;
  clienteTelefone: string;
  funcionarioId: string;
  funcionarioNome?: string;
  dtHoraInicio: string | Date;
  dtHoraFim: string | Date;
  duracaoMinutos: number;
  servicos?: any[];
  status: StatusAgendamento;
  origemAgendamento: OrigemAgendamento;
  valorTotal: number;
}

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.scss']
})
export class AgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  funcionarios: Funcionario[] = [];

  // Visualização atual
  visualizacao: 'calendario' | 'lista' = 'calendario';
  mesAtual: Date = new Date();

  // Controle de UI
  loading = false;
  mostrarModal = false;
  modoEdicao = false;
  errorMessage = '';
  successMessage = '';

  // Filtros
  filtroStatus: StatusAgendamento | null = null;
  filtroFuncionario: string | null = null;
  termoBusca = '';

  // Formulário
  agendamentoForm: AgendamentoForm = this.novoAgendamentoForm();

  // Enums
  StatusAgendamento = StatusAgendamento;
  OrigemAgendamento = OrigemAgendamento;

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private clientService: ClientService,
    private spinnerService: SpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarAgendamentos(),
      this.carregarFuncionarios()
    ]);
  }

  // ==================== CARREGAMENTO DE DADOS ====================

  async carregarAgendamentos(): Promise<void> {
    this.loading = true;
    this.spinnerService.show();
    this.errorMessage = '';

    try {
      this.agendamentos = await this.clientService.listarAgendamentos();
      console.log('Agendamentos carregados:', this.agendamentos.length);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao carregar agendamentos';
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async carregarFuncionarios(): Promise<void> {
    try {
      this.funcionarios = await this.clientService.listarFuncionarios();
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
    }
  }

  // ==================== CALENDÁRIO ====================

  get diasCalendario(): (EventoCalendario[] | null)[] {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const dias: (EventoCalendario[] | null)[] = [];

    // Dias vazios do início
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }

    // Dias do mês com agendamentos
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      const eventosDia = this.getEventosDia(dataAtual);
      dias.push(eventosDia);
    }

    return dias;
  }

  getEventosDia(data: Date): EventoCalendario[] {
    return this.agendamentosFiltrados
      .filter(ag => {
        const dataAg = new Date(ag.dtHoraInicio);
        return dataAg.getDate() === data.getDate() &&
               dataAg.getMonth() === data.getMonth() &&
               dataAg.getFullYear() === data.getFullYear();
      })
      .map(ag => this.criarEventoCalendario(ag))
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  criarEventoCalendario(agendamento: Agendamento): EventoCalendario {
    const funcionario = this.funcionarios.find(f => f.id === agendamento.funcionarioId);

    return {
      agendamento,
      inicio: new Date(agendamento.dtHoraInicio),
      fim: new Date(agendamento.dtHoraFim),
      funcionarioNome: funcionario?.nome || 'Não atribuído',
      funcionarioCor: funcionario?.corCalendario || '#3498db'
    };
  }

  mesAnterior(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1, 1);
  }

  proximoMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 1);
  }

  voltarHoje(): void {
    this.mesAtual = new Date();
  }

  // ==================== FILTROS ====================

  get agendamentosFiltrados(): Agendamento[] {
    let resultado = this.agendamentos;

    if (this.filtroStatus !== null) {
      resultado = resultado.filter(ag => ag.status === this.filtroStatus);
    }

    if (this.filtroFuncionario) {
      resultado = resultado.filter(ag => ag.funcionarioId === this.filtroFuncionario);
    }

    if (this.termoBusca) {
      const termo = this.termoBusca.toLowerCase();
      resultado = resultado.filter(ag =>
        ag.clienteNome.toLowerCase().includes(termo) ||
        ag.clienteTelefone.includes(termo) ||
        ag.funcionarioNome?.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.filtroStatus = null;
    this.filtroFuncionario = null;
  }

  // ==================== MODAL ====================

  abrirModalNovo(data?: Date): void {
    this.agendamentoForm = this.novoAgendamentoForm();

    if (data) {
      const hoje = new Date();
      data.setHours(hoje.getHours(), hoje.getMinutes());
      this.agendamentoForm.dtHoraInicio = data.toISOString().slice(0, 16);

      const fim = new Date(data);
      fim.setHours(fim.getHours() + 1);
      this.agendamentoForm.dtHoraFim = fim.toISOString().slice(0, 16);
    }

    this.modoEdicao = false;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  abrirModalEdicao(agendamento: Agendamento): void {
    // this.agendamentoForm = {
    //   ...agendamento,
    //   dtHoraInicio: new Date(agendamento.dtHoraInicio).toISOString().slice(0, 16),
    //   dtHoraFim: new Date(agendamento.dtHoraFim).toISOString().slice(0, 16)
    // };

    this.modoEdicao = true;
    this.mostrarModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.agendamentoForm = this.novoAgendamentoForm();
  }

  // ==================== CRUD ====================

  async salvarAgendamento(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    // Validação
    if (!this.agendamentoForm.clienteNome || !this.agendamentoForm.dtHoraInicio) {
      this.errorMessage = 'Cliente e data/hora são obrigatórios';
      return;
    }

    this.loading = true;
    this.spinnerService.show();

    try {
      // Converter dados do formulário para o formato correto
      const agendamentoData: Partial<Agendamento> = {
        ...this.agendamentoForm,
        dtHoraInicio: new Date(this.agendamentoForm.dtHoraInicio),
        dtHoraFim: new Date(this.agendamentoForm.dtHoraFim)
      };

      if (this.modoEdicao && this.agendamentoForm.id) {
        await this.clientService.atualizarAgendamento(
          this.agendamentoForm.id,
          agendamentoData as Agendamento
        );
        this.successMessage = 'Agendamento atualizado com sucesso!';
      } else {
        await this.clientService.criarAgendamento(
          agendamentoData as Agendamento
        );
        this.successMessage = 'Agendamento criado com sucesso!';
      }

      await this.carregarAgendamentos();

      setTimeout(() => {
        this.fecharModal();
      }, 1500);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao salvar agendamento';
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async cancelarAgendamento(agendamento: Agendamento): Promise<void> {
    const motivo = prompt('Digite o motivo do cancelamento:');

    if (!motivo) return;

    this.loading = true;
    this.spinnerService.show();

    try {
      // Nota: O motivo deve ser adicionado ao método da API no backend
      await this.clientService.cancelarAgendamento(agendamento.id);
      await this.carregarAgendamentos();
      this.successMessage = 'Agendamento cancelado com sucesso!';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao cancelar agendamento';
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  async confirmarAgendamento(agendamento: Agendamento): Promise<void> {
    this.loading = true;
    this.spinnerService.show();

    try {
      await this.clientService.confirmarAgendamento(agendamento.id);
      await this.carregarAgendamentos();
      this.successMessage = 'Agendamento confirmado com sucesso!';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao confirmar agendamento';
    } finally {
      this.loading = false;
      this.spinnerService.hidden();
    }
  }

  // ==================== HELPERS ====================

  private novoAgendamentoForm(): AgendamentoForm {
    const agora = new Date();
    const daquiUmaHora = new Date(agora.getTime() + 60 * 60 * 1000);

    return {
      clienteNome: '',
      clienteTelefone: '',
      funcionarioId: '',
      funcionarioNome: '',
      dtHoraInicio: agora.toISOString().slice(0, 16),
      dtHoraFim: daquiUmaHora.toISOString().slice(0, 16),
      duracaoMinutos: 60,
      servicos: [],
      status: StatusAgendamento.Agendado,
      origemAgendamento: OrigemAgendamento.Manual,
      valorTotal: 0
    };
  }

  getStatusNome(status: StatusAgendamento): string {
    const statusNomes: { [key in StatusAgendamento]: string } = {
      [StatusAgendamento.Agendado]: 'Agendado',
      [StatusAgendamento.Confirmado]: 'Confirmado',
      [StatusAgendamento.EmAtendimento]: 'Em Atendimento',
      [StatusAgendamento.Concluido]: 'Concluído',
      [StatusAgendamento.Cancelado]: 'Cancelado',
      [StatusAgendamento.NaoCompareceu]: 'Não Compareceu',
      [StatusAgendamento.Reagendado]: 'Reagendado'
    };
    return statusNomes[status];
  }

  getStatusCor(status: StatusAgendamento): string {
    const cores: { [key in StatusAgendamento]: string } = {
      [StatusAgendamento.Agendado]: '#3498db',
      [StatusAgendamento.Confirmado]: '#2ecc71',
      [StatusAgendamento.EmAtendimento]: '#f39c12',
      [StatusAgendamento.Concluido]: '#27ae60',
      [StatusAgendamento.Cancelado]: '#e74c3c',
      [StatusAgendamento.NaoCompareceu]: '#95a5a6',
      [StatusAgendamento.Reagendado]: '#9b59b6'
    };
    return cores[status];
  }

  formatarHora(data: Date | string): string {
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatarData(data: Date | string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: Date | string): string {
    const d = new Date(data);
    return d.toLocaleString('pt-BR');
  }

  getDiaMes(index: number): number {
    const primeiroDia = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth(), 1).getDay();
    return index - primeiroDia + 1;
  }

  ehHoje(index: number): boolean {
    const dia = this.getDiaMes(index);
    const hoje = new Date();

    return dia === hoje.getDate() &&
           this.mesAtual.getMonth() === hoje.getMonth() &&
           this.mesAtual.getFullYear() === hoje.getFullYear();
  }
}
