import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changePositive: boolean;
  icon: string;
  iconColor: string;
}

interface ConversaRecente {
  id: string;
  clienteNome: string;
  ultimaMensagem: string;
  minutosAtras: number;
  status: 'Ativa' | 'Pendente' | 'Finalizada';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;

  // Métricas principais
  metrics: MetricCard[] = [
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

  // Conversas recentes
  conversasRecentes: ConversaRecente[] = [
    {
      id: '1',
      clienteNome: 'Cliente 1',
      ultimaMensagem: 'Última mensagem enviada há 5 minutos',
      minutosAtras: 5,
      status: 'Ativa'
    },
    {
      id: '2',
      clienteNome: 'Cliente 2',
      ultimaMensagem: 'Última mensagem enviada há 10 minutos',
      minutosAtras: 10,
      status: 'Ativa'
    },
    {
      id: '3',
      clienteNome: 'Cliente 3',
      ultimaMensagem: 'Última mensagem enviada há 15 minutos',
      minutosAtras: 15,
      status: 'Ativa'
    },
    {
      id: '4',
      clienteNome: 'Cliente 4',
      ultimaMensagem: 'Última mensagem enviada há 20 minutos',
      minutosAtras: 20,
      status: 'Ativa'
    },
    {
      id: '5',
      clienteNome: 'Cliente 5',
      ultimaMensagem: 'Última mensagem enviada há 25 minutos',
      minutosAtras: 25,
      status: 'Ativa'
    }
  ];

  // Dados de sentimentos (pizza chart)
  sentimentosData = {
    positivo: 65,
    neutro: 25,
    negativo: 10
  };

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Integrar com ClientService
      // const stats = await this.clientService.buscarEstatisticas();
      // this.atualizarMetricas(stats);

      // TODO: Carregar conversas recentes
      // const conversas = await this.clientService.listarClientes();
      // this.conversasRecentes = this.formatarConversasRecentes(conversas);

      // TODO: Carregar dados de sentimentos
      // const sentimentos = await this.analisesService.buscarSentimentos();
      // this.sentimentosData = sentimentos;

      // Dados mockados por enquanto
      console.log('Dashboard: Usando dados mockados. Implementar integração com API.');
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // TODO: Exibir mensagem de erro para o usuário usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // TODO: Implementar método para atualizar métricas
  // private atualizarMetricas(stats: any): void {
  //   this.metrics[0].value = stats.conversasAtivas;
  //   this.metrics[1].value = stats.mensagensHoje;
  //   this.metrics[2].value = stats.tempoMedio;
  //   this.metrics[3].value = stats.satisfacao;
  // }

  // TODO: Implementar método para formatar conversas
  // private formatarConversasRecentes(clientes: Cliente[]): ConversaRecente[] {
  //   return clientes.slice(0, 5).map(cliente => ({
  //     id: cliente.id,
  //     clienteNome: cliente.nome,
  //     ultimaMensagem: cliente.ultimaMensagem?.texto || 'Sem mensagens',
  //     minutosAtras: this.calcularMinutosAtras(cliente.ultimaInteracao),
  //     status: this.definirStatusConversa(cliente)
  //   }));
  // }

  // ==================== HELPERS ====================

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
}
