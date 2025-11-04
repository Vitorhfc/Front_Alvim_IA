import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../Components/sidebar/sidebar.component';

type TabType = 'geral' | 'ia' | 'integrações' | 'notificações' | 'segurança';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {
  loading: boolean = true;
  activeTab: TabType = 'geral';

  tabs = [
    { id: 'geral' as TabType, label: 'Geral', icon: 'settings' },
    { id: 'ia' as TabType, label: 'Configuração IA', icon: 'psychology' },
    { id: 'integrações' as TabType, label: 'Integrações', icon: 'extension' },
    { id: 'notificações' as TabType, label: 'Notificações', icon: 'notifications' },
    { id: 'segurança' as TabType, label: 'Segurança', icon: 'security' }
  ];

  // Configurações gerais
  configGeral = {
    nomeEmpresa: 'Minha Empresa',
    email: 'contato@empresa.com',
    telefone: '+55 11 99999-9999',
    horarioAtendimento: '9h - 18h'
  };

  // Configurações de IA
  configIA = {
    modelo: 'gpt-4',
    temperatura: 0.7,
    maxTokens: 150,
    contextoHistorico: 10,
    respostasAutomaticas: true
  };

  constructor() {}

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.loading = true;
    try {
      // TODO: Carregar configurações da API
      // const config = await this.configService.buscarConfiguracoes();
      // this.configGeral = config.geral;
      // this.configIA = config.ia;

      console.log('Configurações: Usando dados mockados. Implementar integração com API.');
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // TODO: Exibir mensagem de erro usando SnackBar
    } finally {
      this.loading = false;
    }
  }

  // ==================== TABS ====================

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  // ==================== SALVAR ====================

  async salvarConfiguracoes(): Promise<void> {
    // TODO: Implementar salvamento via API
    // await this.configService.atualizarConfiguracoes({
    //   geral: this.configGeral,
    //   ia: this.configIA
    // });

    console.log('Configurações: Salvando configurações. Implementar integração com API.');
    // TODO: Exibir mensagem de sucesso usando SnackBar
  }
}
