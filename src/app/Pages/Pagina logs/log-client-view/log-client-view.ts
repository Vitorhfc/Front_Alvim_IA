import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../Service/Api/client.service';
import { LogClient, LogClientPaginado, TipoLog, NivelSeveridade } from '../../../Models/Entidades/Client/LogClient';

@Component({
  selector: 'app-log-client-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-client-view.html',
  styleUrl: './log-client-view.scss',
})
export class LogClientView implements OnInit {
  // Dados dos logs
  logs: LogClient[] = [];

  // Paginação
  currentPage: number = 1;
  pageSize: number = 50;
  totalItems: number = 0;
  totalPages: number = 0;

  // Estados da interface
  loading: boolean = false;
  erro: string | null = null;

  // Log selecionado para visualização detalhada
  logSelecionado: LogClient | null = null;
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
      const resultado: LogClientPaginado = await this.clientService.listarLogsClient(
        this.currentPage,
        this.pageSize
      );

      this.logs = resultado.items;
      this.totalItems = resultado.totalItems;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    } catch (error: any) {
      this.erro = error.message || 'Erro ao carregar logs';
      console.error('Erro ao carregar logs do cliente:', error);
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
  visualizarDetalhes(log: LogClient): void {
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
   * Formata JSON para exibição
   */
  formatarJson(json: string | null): string {
    if (!json) return 'N/A';

    try {
      const obj = JSON.parse(json);
      return JSON.stringify(obj, null, 2);
    } catch {
      return json;
    }
  }

  /**
   * Retorna a classe CSS baseada no tipo de log
   */
  getClasseTipoLog(tipo: TipoLog): string {
    const classes: { [key: number]: string } = {
      [TipoLog.Sistema]: 'badge-system',
      [TipoLog.Integracao]: 'badge-integration',
      [TipoLog.Processamento]: 'badge-processing',
      [TipoLog.Erro]: 'badge-error',
      [TipoLog.Webhook]: 'badge-webhook'
    };

    return classes[tipo] || 'badge-default';
  }

  /**
   * Retorna o nome do tipo de log
   */
  getNomeTipoLog(tipo: TipoLog): string {
    const nomes: { [key: number]: string } = {
      [TipoLog.Sistema]: 'Sistema',
      [TipoLog.Integracao]: 'Integração',
      [TipoLog.Processamento]: 'Processamento',
      [TipoLog.Erro]: 'Erro',
      [TipoLog.Webhook]: 'Webhook'
    };

    return nomes[tipo] || 'Desconhecido';
  }

  /**
   * Retorna a classe CSS baseada no nível de severidade
   */
  getClasseSeveridade(severidade: NivelSeveridade): string {
    const classes: { [key: number]: string } = {
      [NivelSeveridade.Info]: 'severity-info',
      [NivelSeveridade.Warning]: 'severity-warning',
      [NivelSeveridade.Error]: 'severity-error',
      [NivelSeveridade.Critical]: 'severity-critical'
    };

    return classes[severidade] || 'severity-default';
  }

  /**
   * Retorna o nome do nível de severidade
   */
  getNomeSeveridade(severidade: NivelSeveridade): string {
    const nomes: { [key: number]: string } = {
      [NivelSeveridade.Info]: 'Info',
      [NivelSeveridade.Warning]: 'Aviso',
      [NivelSeveridade.Error]: 'Erro',
      [NivelSeveridade.Critical]: 'Crítico'
    };

    return nomes[severidade] || 'Desconhecido';
  }

  /**
   * Copia o conteúdo para a área de transferência
   */
  copiarConteudo(conteudo: string): void {
    navigator.clipboard.writeText(conteudo).then(
      () => alert('Conteúdo copiado para a área de transferência!'),
      (err) => console.error('Erro ao copiar conteúdo:', err)
    );
  }

  /**
   * Recarrega os logs
   */
  recarregar(): void {
    this.carregarLogs();
  }
}
