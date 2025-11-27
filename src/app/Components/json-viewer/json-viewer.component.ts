import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-viewer.component.html',
  styleUrl: './json-viewer.component.scss',
})
export class JsonViewerComponent {
  @Input() content: string | null = null;
  @Input() showCopyButton: boolean = true;
  @Input() showMaximizeButton: boolean = true;

  copiado: boolean = false;
  maximizado: boolean = false;
  termoBusca: string = '';
  resultadosBusca: number = 0;
  indiceAtualBusca: number = 0;

  /**
   * Formata e coloriza o JSON para exibição
   */
  get formattedJson(): string {
    if (!this.content) return 'N/A';

    try {
      const obj = JSON.parse(this.content);
      return JSON.stringify(obj, null, 2);
    } catch {
      return this.content;
    }
  }

  /**
   * Retorna o HTML colorido do JSON
   */
  get colorizedJson(): string {
    if (!this.content) return '<span class="json-null">N/A</span>';

    try {
      const obj = JSON.parse(this.content);
      let highlighted = this.syntaxHighlight(obj);

      // Aplicar highlight de busca se houver termo
      if (this.termoBusca && this.termoBusca.length > 0) {
        highlighted = this.aplicarHighlightBusca(highlighted);
      }

      return highlighted;
    } catch {
      return `<span class="json-string">${this.escapeHtml(this.content)}</span>`;
    }
  }

  /**
   * Aplica syntax highlighting ao JSON
   */
  private syntaxHighlight(obj: any): string {
    let json = JSON.stringify(obj, null, 2);

    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Colorir diferentes tipos de valores
    json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      let cls = 'json-string';
      if (/:$/.test(match)) {
        cls = 'json-key';
      }
      return `<span class="${cls}">${match}</span>`;
    });

    // Colorir números
    json = json.replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');

    // Colorir booleanos
    json = json.replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>');

    // Colorir null
    json = json.replace(/\bnull\b/g, '<span class="json-null">null</span>');

    return json;
  }

  /**
   * Escapa caracteres HTML
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Copia o conteúdo para a área de transferência
   */
  copiar(): void {
    if (!this.content) return;

    const textoCopiar = this.formattedJson;

    navigator.clipboard.writeText(textoCopiar).then(
      () => {
        this.copiado = true;
        setTimeout(() => {
          this.copiado = false;
        }, 2000);
      },
      (err) => {
        console.error('Erro ao copiar conteúdo:', err);
        alert('Erro ao copiar para a área de transferência');
      }
    );
  }

  /**
   * Verifica se o conteúdo é um JSON válido
   */
  get isValidJson(): boolean {
    if (!this.content) return false;

    try {
      JSON.parse(this.content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Abre o modal maximizado
   */
  maximizar(): void {
    this.maximizado = true;
  }

  /**
   * Fecha o modal maximizado
   */
  fecharMaximizado(): void {
    this.maximizado = false;
    this.limparBusca();
  }

  /**
   * Aplica highlight de busca no JSON
   */
  private aplicarHighlightBusca(html: string): string {
    if (!this.termoBusca) return html;

    const termo = this.escapeRegex(this.termoBusca);
    const regex = new RegExp(termo, 'gi');

    // Conta o número de ocorrências
    const matches = html.match(regex);
    this.resultadosBusca = matches ? matches.length : 0;

    if (this.resultadosBusca === 0) {
      this.indiceAtualBusca = 0;
      return html;
    }

    // Garante que o índice atual está dentro dos limites
    if (this.indiceAtualBusca > this.resultadosBusca) {
      this.indiceAtualBusca = 1;
    }

    // Substitui todas as ocorrências com highlight
    let contador = 0;
    return html.replace(regex, (match) => {
      contador++;
      const classe = contador === this.indiceAtualBusca ? 'search-highlight-active' : 'search-highlight';
      return `<mark class="${classe}">${match}</mark>`;
    });
  }

  /**
   * Escapa caracteres especiais para regex
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Busca no JSON
   */
  buscar(termo: string): void {
    this.termoBusca = termo;
    this.indiceAtualBusca = termo ? 1 : 0;
  }

  /**
   * Vai para o próximo resultado da busca
   */
  proximoResultado(): void {
    if (this.resultadosBusca > 0) {
      this.indiceAtualBusca = this.indiceAtualBusca < this.resultadosBusca ? this.indiceAtualBusca + 1 : 1;
    }
  }

  /**
   * Vai para o resultado anterior da busca
   */
  resultadoAnterior(): void {
    if (this.resultadosBusca > 0) {
      this.indiceAtualBusca = this.indiceAtualBusca > 1 ? this.indiceAtualBusca - 1 : this.resultadosBusca;
    }
  }

  /**
   * Limpa a busca
   */
  limparBusca(): void {
    this.termoBusca = '';
    this.resultadosBusca = 0;
    this.indiceAtualBusca = 0;
  }
}
