import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

interface Template {
  id: string;
  nome: string;
  conteudo: string;
  categoria: string;
  ativo: boolean;
  variaveis: string[];
  dataCriacao: string;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  loading: boolean = true;
  searchTerm: string = '';
  selectedCategoria: string = 'todas';

  templates: Template[] = [
    {
      id: '1',
      nome: 'Boas-vindas',
      conteudo: 'Olá {nome}! Bem-vindo(a) à nossa empresa. Como posso ajudá-lo(a) hoje?',
      categoria: 'Saudação',
      ativo: true,
      variaveis: ['nome'],
      dataCriacao: '2024-01-15'
    },
    {
      id: '2',
      nome: 'Confirmação de Pedido',
      conteudo: 'Seu pedido #{numero_pedido} foi confirmado! Previsão de entrega: {data_entrega}.',
      categoria: 'Pedidos',
      ativo: true,
      variaveis: ['numero_pedido', 'data_entrega'],
      dataCriacao: '2024-01-20'
    },
    {
      id: '3',
      nome: 'Horário de Atendimento',
      conteudo: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
      categoria: 'Informação',
      ativo: true,
      variaveis: [],
      dataCriacao: '2024-01-10'
    }
  ];

  categorias = ['todas', 'Saudação', 'Pedidos', 'Informação', 'Despedida'];

  templateSelecionado: Template | null = null;
  modoEdicao: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Integrar com TemplatesService
      // const templates = await this.templatesService.listarTemplates();
      // this.templates = templates;

      console.log('Templates: Usando dados mockados. Implementar integração com API.');
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      // TODO: Exibir mensagem de erro usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // ==================== FILTROS ====================

  get templatesFiltrados(): Template[] {
    let filtered = this.templates;

    if (this.selectedCategoria !== 'todas') {
      filtered = filtered.filter(t => t.categoria === this.selectedCategoria);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(t =>
        t.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.conteudo.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  // ==================== AÇÕES ====================

  selecionarTemplate(template: Template): void {
    this.templateSelecionado = template;
    this.modoEdicao = false;
  }

  novoTemplate(): void {
    this.templateSelecionado = {
      id: '',
      nome: '',
      conteudo: '',
      categoria: 'Informação',
      ativo: true,
      variaveis: [],
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    this.modoEdicao = true;
  }

  editarTemplate(): void {
    this.modoEdicao = true;
  }

  async salvarTemplate(): Promise<void> {
    if (!this.templateSelecionado) return;

    // TODO: Implementar validação de campos obrigatórios
    // TODO: Implementar salvamento via API
    // if (this.templateSelecionado.id) {
    //   await this.templatesService.atualizarTemplate(this.templateSelecionado.id, this.templateSelecionado);
    // } else {
    //   await this.templatesService.criarTemplate(this.templateSelecionado);
    // }

    console.log('Templates: Salvando template. Implementar integração com API.');
    this.modoEdicao = false;
    this.carregarDados();
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    if (!this.templateSelecionado?.id) {
      this.templateSelecionado = null;
    }
  }

  async excluirTemplate(template: Template): Promise<void> {
    // TODO: Adicionar confirmação antes de excluir
    // TODO: Implementar exclusão via API
    // await this.templatesService.excluirTemplate(template.id);

    console.log('Templates: Excluindo template. Implementar integração com API.');
    this.templates = this.templates.filter(t => t.id !== template.id);
    if (this.templateSelecionado?.id === template.id) {
      this.templateSelecionado = null;
    }
  }

  async toggleStatus(template: Template): Promise<void> {
    template.ativo = !template.ativo;

    // TODO: Implementar atualização de status via API
    // await this.templatesService.atualizarTemplate(template.id, { ativo: template.ativo });

    console.log('Templates: Alternando status. Implementar integração com API.');
  }
}
