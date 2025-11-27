import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MetricCardAdmin {
  title: string;
  value: string | number;
  change: string;
  changePositive: boolean;
  icon: string;
  iconColor: string;
}

interface TopCliente {
  nome: string;
  mensagens: number;
  plano: 'premium' | 'standard';
  rating: number;
}

interface SystemHealth {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading: boolean = true;

  // Métricas administrativas
  metrics: MetricCardAdmin[] = [
    {
      title: 'Total de Clientes',
      value: '2,847',
      change: '+18% vs mês anterior',
      changePositive: true,
      icon: 'groups',
      iconColor: '#4F85FF'
    },
    {
      title: 'Empresas Ativas',
      value: 124,
      change: '+12% vs mês anterior',
      changePositive: true,
      icon: 'business',
      iconColor: '#8B5CF6'
    },
    {
      title: 'Mensagens Processadas',
      value: '1.2M',
      change: '+34% vs mês anterior',
      changePositive: true,
      icon: 'chat',
      iconColor: '#10B981'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 147k',
      change: '+23% vs mês anterior',
      changePositive: true,
      icon: 'attach_money',
      iconColor: '#F59E0B'
    },
    {
      title: 'Taxa de Atividade',
      value: '89%',
      change: '+5% vs mês anterior',
      changePositive: true,
      icon: 'trending_up',
      iconColor: '#EC4899'
    },
    {
      title: 'Crescimento',
      value: '+156',
      change: '+28% vs mês anterior',
      changePositive: true,
      icon: 'show_chart',
      iconColor: '#06B6D4'
    }
  ];

  // Top 5 Clientes
  topClientes: TopCliente[] = [
    { nome: 'TechCorp Inc', mensagens: 45678, plano: 'premium', rating: 4.9 },
    { nome: 'Digital Solutions', mensagens: 38920, plano: 'premium', rating: 4.8 },
    { nome: 'Smart Business', mensagens: 32145, plano: 'standard', rating: 4.7 },
    { nome: 'Global Trade', mensagens: 28456, plano: 'premium', rating: 4.9 },
    { nome: 'Innovation Hub', mensagens: 24890, plano: 'standard', rating: 4.6 }
  ];

  // Saúde do Sistema
  systemHealth: SystemHealth[] = [
    { label: 'Uptime', value: '99.8%', icon: 'check_circle', iconColor: '#10B981' },
    { label: 'Latência Média', value: '1.2s', icon: 'speed', iconColor: '#4F85FF' },
    { label: 'Taxa de Erro', value: '0.02%', icon: 'error_outline', iconColor: '#F59E0B' },
    { label: 'Satisfação Geral', value: '4.7/5', icon: 'groups', iconColor: '#8B5CF6' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
    } catch (error) {
      console.error('Erro ao carregar dados do admin dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  // ==================== HELPERS ====================


  formatarNumero(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  getPlanoClass(plano: string): string {
    return plano === 'premium' ? 'plano-premium' : 'plano-standard';
  }
}
