import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { DashboardService } from '../../Service/Api/dashboard.service';
import { SnackbarService } from '../../Service/snackbar';
import { MetricCard, ConversaRecente, SentimentosData, DashboardResponse, ChartDataPoint } from '../../Models/Objetos/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;

  metrics: MetricCard[] = [];
  conversasRecentes: ConversaRecente[] = [];
  sentimentosData: SentimentosData = {
    positivo: 0,
    neutro: 0,
    negativo: 0
  };

  volumeMensagensData: any[] = [];
  categoriasData: any[] = [];
  sentimentosChartData: any[] = [];

  view: any[] = []; // Será definido dinamicamente
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4F85FF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
  };
  sentimentosColorScheme: Color = {
    name: 'sentimentos',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#10B981', '#F59E0B', '#EF4444']
  };

  constructor(
    private dashboardService: DashboardService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef  // Adicionar ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.loading = true;
    
    // Forçar detecção de mudanças para mostrar o loading
    this.cdr.detectChanges();
    
    try {
      console.log('Iniciando carregamento do dashboard...');
      
      // Aguardar a resposta da API
      const dashboardData = await this.dashboardService.obterDadosDashboard();
      
      console.log('Dados recebidos da API:', dashboardData);

      // Verificar se os dados existem e atribuir com valores padrão
      this.metrics = dashboardData?.metrics || [];
      this.sentimentosData = dashboardData?.sentimentosData || { positivo: 0, neutro: 0, negativo: 0 };
      this.volumeMensagensData = dashboardData?.volumeMensagensData || [];
      this.categoriasData = dashboardData?.categoriasData || [];
      this.conversasRecentes = dashboardData?.conversasRecentes || [];

      // Preparar dados dos sentimentos
      this.prepararDadosSentimentos();

      console.log('Métricas processadas:', this.metrics);
      console.log('Volume de mensagens:', this.volumeMensagensData);
      console.log('Categorias:', this.categoriasData);
      console.log('Conversas recentes:', this.conversasRecentes);
      console.log('Sentimentos:', this.sentimentosChartData);

      // Se não houver dados reais, carregar dados de exemplo
      if (this.metrics.length === 0 && this.volumeMensagensData.length === 0) {
        console.warn('Nenhum dado retornado pela API, carregando dados de exemplo');
        this.carregarDadosExemplo();
      }

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      this.snackbarService.error(error?.message || 'Erro ao carregar dashboard');
      
      // Carregar dados de exemplo em caso de erro
      this.carregarDadosExemplo();
      
    } finally {
      this.loading = false;
      
      // Forçar detecção de mudanças após carregar os dados
      this.cdr.detectChanges();
      
      console.log('Carregamento finalizado. Loading:', this.loading);
    }
  }

  private prepararDadosSentimentos(): void {
    // Criar array para o gráfico de pizza
    this.sentimentosChartData = [
      { name: 'Positivo', value: this.sentimentosData.positivo || 0 },
      { name: 'Neutro', value: this.sentimentosData.neutro || 0 },
      { name: 'Negativo', value: this.sentimentosData.negativo || 0 }
    ].filter(item => item.value > 0); // Remover valores zerados
    
    console.log('Dados de sentimentos preparados:', this.sentimentosChartData);
  }

  private carregarDadosExemplo(): void {
    console.log('Carregando dados de exemplo...');
    
    this.metrics = [
      {
        title: 'Conversas Ativas',
        value: 124,
        change: '+12% vs mês anterior',
        changePositive: true,
        icon: 'forum',
        iconColor: '#4F85FF'
      },
      {
        title: 'Mensagens Hoje',
        value: '1,847',
        change: '+23% vs mês anterior',
        changePositive: true,
        icon: 'chat_bubble',
        iconColor: '#10B981'
      },
      {
        title: 'Tempo Médio',
        value: '2.3s',
        change: '-8% vs mês anterior',
        changePositive: false,
        icon: 'schedule',
        iconColor: '#F59E0B'
      },
      {
        title: 'Satisfação',
        value: '4.8/5',
        change: '+5% vs mês anterior',
        changePositive: true,
        icon: 'star',
        iconColor: '#8B5CF6'
      }
    ];

    this.sentimentosData = { positivo: 65, neutro: 25, negativo: 10 };
    this.prepararDadosSentimentos();

    this.volumeMensagensData = [
      { name: '00:00', value: 45 },
      { name: '04:00', value: 23 },
      { name: '08:00', value: 78 },
      { name: '12:00', value: 120 },
      { name: '16:00', value: 95 },
      { name: '20:00', value: 67 }
    ];

    this.categoriasData = [
      { name: 'Suporte', value: 45 },
      { name: 'Vendas', value: 32 },
      { name: 'Informações', value: 28 },
      { name: 'Reclamações', value: 15 },
      { name: 'Outros', value: 10 }
    ];

    this.conversasRecentes = [
      {
        id: '1',
        clienteNome: 'João Silva',
        ultimaMensagem: 'Obrigado pelo atendimento!',
        status: 'Finalizada'
      },
      {
        id: '2',
        clienteNome: 'Maria Santos',
        ultimaMensagem: 'Qual o prazo de entrega?',
        status: 'Ativa'
      },
      {
        id: '3',
        clienteNome: 'Pedro Oliveira',
        ultimaMensagem: 'Preciso de ajuda com...',
        status: 'Pendente'
      }
    ];

    // Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Ativa':
        return '#10B981';
      case 'Pendente':
        return '#F59E0B';
      case 'Finalizada':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  }

  formatarValor(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  formatarPercentual(value: number): string {
    return `${value}%`;
  }

  // Método para recarregar os dados manualmente (útil para debug)
  recarregarDados(): void {
    this.carregarDados();
  }
}