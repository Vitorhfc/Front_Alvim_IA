import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../Service/Api/client.service';
import { LogWaha, LogWahaPaginado } from '../../../Models/Entidades/Client/LogWaha';
import { JsonViewerComponent } from '../../../Components/json-viewer/json-viewer.component';

@Component({
  selector: 'app-log-waha-view',
  standalone: true,
  imports: [CommonModule, JsonViewerComponent],
  templateUrl: './log-waha-view.html',
  styleUrl: './log-waha-view.scss',
})
export class LogWahaView implements OnInit {
  // Dados dos logs
  logs: LogWaha[] = [];

  // Paginação
  currentPage: number = 1;
  pageSize: number = 80;
  totalItems: number = 0;
  totalPages: number = 0;

  // Estados da interface
  loading: boolean = false;
  erro: string | null = null;

  // Log selecionado para visualização detalhada
  logSelecionado: LogWaha | null = null;
  mostrarDetalhes: boolean = false;

  constructor(
    private clientService: ClientService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarLogs();
  }

  /**
   * Carrega os logs da página atual
   */
  async carregarLogs(): Promise<void> {
    this.loading = true;
    this.erro = null;
    this.cdr.detectChanges();

    try {
      const resultado: LogWahaPaginado = await this.clientService.listarLogsWaha(
        this.currentPage,
        this.pageSize
      );

      this.logs = resultado.items;
      this.totalItems = resultado.totalItems;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    } catch (error: any) {
      this.erro = error.message || 'Erro ao carregar logs';
      console.error('Erro ao carregar logs WAHA:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Navega para a próxima página
   */
  proximaPagina(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.carregarLogs();
    }
  }

  /**
   * Navega para a página anterior
   */
  paginaAnterior(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.carregarLogs();
    }
  }

  /**
   * Vai para uma página específica
   */
  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      this.carregarLogs();
    }
  }

  /**
   * Abre modal com detalhes do log
   */
  visualizarDetalhes(log: LogWaha): void {
    this.logSelecionado = log;
    this.mostrarDetalhes = true;
    this.cdr.detectChanges();
  }

  /**
   * Fecha modal de detalhes
   */
  fecharDetalhes(): void {
    this.mostrarDetalhes = false;
    this.logSelecionado = null;
    this.cdr.detectChanges();
  }

  /**
   * Retorna a classe CSS baseada no tipo de evento
   */
  getClasseTipoEvento(tipoEvento: string): string {
    const classes: { [key: string]: string } = {
      'ENTRADA': 'badge-info',
      'SAIDA_SUCESSO': 'badge-success',
      'SAIDA_ERRO_PROCESSAMENTO': 'badge-error',
      'ERRO': 'badge-error'
    };

    return classes[tipoEvento] || 'badge-default';
  }

  /**
   * Recarrega os logs
   */
  recarregar(): void {
    this.carregarLogs();
  }
}
