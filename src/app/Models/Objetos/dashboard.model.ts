// ==================== DASHBOARD MODELS ====================

export interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changePositive: boolean;
  icon: string;
  iconColor: string;
}

export interface ConversaRecente {
  id: string;
  clienteNome: string;
  ultimaMensagem: string;
  minutosAtras: number;
  status: 'Ativa' | 'Pendente' | 'Finalizada';
}

export interface SentimentosData {
  positivo: number;
  neutro: number;
  negativo: number;
}

// ==================== ADMIN DASHBOARD MODELS ====================

export interface MetricCardAdmin {
  title: string;
  value: string | number;
  change: string;
  changePositive: boolean;
  icon: string;
  iconColor: string;
}

export interface TopCliente {
  nome: string;
  mensagens: number;
  plano: 'premium' | 'standard';
  rating: number;
}

export interface SystemHealth {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
}

// ==================== API RESPONSES ====================

export interface DashboardResponse {
  metricas: {
    conversasAtivas: number;
    mensagensHoje: number;
    tempoMedio: string;
    satisfacao: number;
  };
  conversasRecentes: ConversaRecente[];
  sentimentos: SentimentosData;
}

export interface AdminDashboardResponse {
  metricas: {
    totalClientes: number;
    empresasAtivas: number;
    mensagensProcessadas: number;
    receitaMensal: number;
    taxaAtividade: number;
    crescimento: number;
  };
  topClientes: TopCliente[];
  saudeDoSistema: SystemHealth[];
}
