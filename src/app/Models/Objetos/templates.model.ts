// ==================== TEMPLATES MODELS ====================

export interface Template {
  id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  variaveis?: string[];
  dtaCriacao: Date;
  dtaAlteracao?: Date;
  flgAtivo: boolean;
  empresaId: string;
}

export type CategoriaTemplate =
  | 'Saudação'
  | 'Produto'
  | 'Informações'
  | 'Despedida'
  | 'Suporte'
  | 'Outros';

// ==================== API REQUESTS ====================

export interface CriarTemplateRequest {
  titulo: string;
  categoria: CategoriaTemplate;
  conteudo: string;
  variaveis?: string[];
}

export interface AtualizarTemplateRequest {
  titulo?: string;
  categoria?: CategoriaTemplate;
  conteudo?: string;
  variaveis?: string[];
  flgAtivo?: boolean;
}

export interface ListarTemplatesRequest {
  categoria?: CategoriaTemplate;
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

// ==================== API RESPONSES ====================

export interface TemplatesResponse {
  templates: Template[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface TemplateResponse {
  template: Template;
}
