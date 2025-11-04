import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

interface Documento {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  dataCriacao: string;
  dataAtualizacao: string;
}

@Component({
  selector: 'app-base-conhecimento',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './base-conhecimento.component.html',
  styleUrls: ['./base-conhecimento.component.scss']
})
export class BaseConhecimentoComponent implements OnInit {
  loading: boolean = true;
  searchTerm: string = '';
  selectedCategoria: string = 'todas';

  documentos: Documento[] = [
    {
      id: '1',
      titulo: 'Política de Devolução',
      conteudo: 'Aceitamos devoluções em até 30 dias após a compra...',
      categoria: 'Políticas',
      tags: ['devolução', 'garantia', 'troca'],
      dataCriacao: '2024-01-10',
      dataAtualizacao: '2024-01-15'
    },
    {
      id: '2',
      titulo: 'Formas de Pagamento',
      conteudo: 'Aceitamos cartão de crédito, débito, PIX e boleto bancário...',
      categoria: 'Financeiro',
      tags: ['pagamento', 'pix', 'cartão'],
      dataCriacao: '2024-01-12',
      dataAtualizacao: '2024-01-12'
    },
    {
      id: '3',
      titulo: 'Prazo de Entrega',
      conteudo: 'Os prazos variam de acordo com a região e método de envio...',
      categoria: 'Logística',
      tags: ['entrega', 'prazo', 'frete'],
      dataCriacao: '2024-01-08',
      dataAtualizacao: '2024-01-20'
    }
  ];

  categorias = ['todas', 'Políticas', 'Financeiro', 'Logística', 'Produtos', 'Atendimento'];

  documentoSelecionado: Documento | null = null;
  modoEdicao: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Integrar com API de Base de Conhecimento
      // const documentos = await this.baseConhecimentoService.listarDocumentos();
      // this.documentos = documentos;

      console.log('Base Conhecimento: Usando dados mockados. Implementar integração com API.');
    } catch (error) {
      console.error('Erro ao carregar base de conhecimento:', error);
      // TODO: Exibir mensagem de erro usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // ==================== FILTROS ====================

  get documentosFiltrados(): Documento[] {
    let filtered = this.documentos;

    if (this.selectedCategoria !== 'todas') {
      filtered = filtered.filter(d => d.categoria === this.selectedCategoria);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(d =>
        d.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.conteudo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }

  // ==================== AÇÕES ====================

  selecionarDocumento(documento: Documento): void {
    this.documentoSelecionado = documento;
    this.modoEdicao = false;
  }

  novoDocumento(): void {
    this.documentoSelecionado = {
      id: '',
      titulo: '',
      conteudo: '',
      categoria: 'Produtos',
      tags: [],
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0]
    };
    this.modoEdicao = true;
  }

  editarDocumento(): void {
    this.modoEdicao = true;
  }

  async salvarDocumento(): Promise<void> {
    if (!this.documentoSelecionado) return;

    // TODO: Implementar validação de campos obrigatórios
    // TODO: Implementar salvamento via API
    // if (this.documentoSelecionado.id) {
    //   await this.baseConhecimentoService.atualizarDocumento(this.documentoSelecionado.id, this.documentoSelecionado);
    // } else {
    //   await this.baseConhecimentoService.criarDocumento(this.documentoSelecionado);
    // }

    console.log('Base Conhecimento: Salvando documento. Implementar integração com API.');
    this.modoEdicao = false;
    this.carregarDados();
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    if (!this.documentoSelecionado?.id) {
      this.documentoSelecionado = null;
    }
  }

  async excluirDocumento(documento: Documento): Promise<void> {
    // TODO: Adicionar confirmação antes de excluir
    // TODO: Implementar exclusão via API
    // await this.baseConhecimentoService.excluirDocumento(documento.id);

    console.log('Base Conhecimento: Excluindo documento. Implementar integração com API.');
    this.documentos = this.documentos.filter(d => d.id !== documento.id);
    if (this.documentoSelecionado?.id === documento.id) {
      this.documentoSelecionado = null;
    }
  }

  async treinarIA(): Promise<void> {
    // TODO: Implementar treinamento da IA com documentos da base de conhecimento
    // await this.iaService.treinarComBaseConhecimento();

    console.log('Base Conhecimento: Treinando IA. Implementar integração com API.');
  }
}
