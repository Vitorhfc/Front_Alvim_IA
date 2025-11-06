import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

type TabType = 'sentimentos' | 'heatmap' | 'resolucao' | 'palavras-chave';

@Component({
  selector: 'app-analises',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './analises.component.html',
  styleUrls: ['./analises.component.scss']
})
export class AnalisesComponent implements OnInit {
  loading: boolean = true;
  activeTab: TabType = 'sentimentos';

  tabs = [
    { id: 'sentimentos' as TabType, label: 'Sentimentos', icon: 'sentiment_satisfied' },
    { id: 'heatmap' as TabType, label: 'Heatmap', icon: 'grid_on' },
    { id: 'resolucao' as TabType, label: 'Resolução', icon: 'check_circle' },
    { id: 'palavras-chave' as TabType, label: 'Palavras-chave', icon: 'key' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Carregar dados de análises de acordo com a aba ativa
      await this.carregarDadosTab(this.activeTab);

      console.log('Análises: Usando dados mockados. Implementar integração com API.');
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      // TODO: Exibir mensagem de erro usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // TODO: Implementar método para carregar dados específicos de cada aba
  async carregarDadosTab(tab: TabType): Promise<void> {
    // switch (tab) {
    //   case 'sentimentos':
    //     // const sentimentos = await this.analisesService.buscarSentimentos();
    //     break;
    //   case 'heatmap':
    //     // const heatmap = await this.analisesService.buscarHeatmap();
    //     break;
    //   case 'resolucao':
    //     // const resolucao = await this.analisesService.buscarTaxaResolucao();
    //     break;
    //   case 'palavras-chave':
    //     // const palavrasChave = await this.analisesService.buscarPalavrasChave();
    //     break;
    // }
  }

  // ==================== TABS ====================

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
    // TODO: Carregar dados da nova aba selecionada
    // this.carregarDadosTab(tab);
  }
}
