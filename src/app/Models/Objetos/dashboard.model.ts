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
  status: string;
  ultimaMensagem: string;
}

export interface SentimentosData {
  positivo: number;
  neutro: number;
  negativo: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DashboardResponse {
  metrics: MetricCard[];
  sentimentosData: SentimentosData;
  volumeMensagensData: ChartDataPoint[];
  categoriasData: ChartDataPoint[];
  conversasRecentes: ConversaRecente[];
}