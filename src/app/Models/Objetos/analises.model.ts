// ==================== ANÁLISES MODELS ====================

export interface AnalisesSentimentos {
  positivo: number;
  neutro: number;
  negativo: number;
  evolucaoTemporal: EvolucaoSentimento[];
}

export interface EvolucaoSentimento {
  data: string;
  positivo: number;
  neutro: number;
  negativo: number;
}

export interface HeatmapAtividade {
  dia: string;
  hora: number;
  valor: number;
}

export interface TaxaResolucao {
  resolvidas: number;
  pendentes: number;
  escaladas: number;
  total: number;
}

export interface PalavraChave {
  palavra: string;
  frequencia: number;
  sentimento: 'positivo' | 'neutro' | 'negativo';
}

export interface MetricasAnalises {
  taxaResposta: number;
  intervencaoHumana: number;
  satisfacaoMedia: number;
  tempoMedioResposta: number;
}

// ==================== API RESPONSES ====================

export interface AnalisesResponse {
  sentimentos: AnalisesSentimentos;
  heatmap: HeatmapAtividade[];
  resolucao: TaxaResolucao;
  palavrasChave: PalavraChave[];
  metricas: MetricasAnalises;
}

export interface AnalisesSentimentosResponse {
  sentimentos: AnalisesSentimentos;
  metricas: MetricasAnalises;
}

export interface HeatmapResponse {
  heatmap: HeatmapAtividade[];
}

export interface ResolucaoResponse {
  resolucao: TaxaResolucao;
}

export interface PalavrasChaveResponse {
  palavrasChave: PalavraChave[];
}
