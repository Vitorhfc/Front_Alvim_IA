import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../Service/Api/client.service';
import { ConfiguracaoIA } from '../../Models/Entidades/Client/ConfiguracaoIa';
import { SnackbarService } from '../../Service/snackbar';
import { hideSpinner, ShowSpinner, SpinnerService } from '../../Service/Local/spinner';

@Component({
  selector: 'app-base-conhecimento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-conhecimento.component.html',
  styleUrls: ['./base-conhecimento.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseConhecimentoComponent implements OnInit {
  salvando: boolean = false;
  carregando: boolean = true;

  configuracao: Partial<ConfiguracaoIA> = {
    funcaoPrincipalDoProduto: '',
    modulosFuncionalidadesDoProduto: '',
    processoDeUsoProduto: '',
    perguntasFrequentesSobreProduto: '',
    doresAtendidasPeloProduto: '',
    diferencasVantagensDoProduto: '',
    integracoesRecursosExtrasProduto: '',
    suporteEAtendimentoDoProduto: '',
    planosPrecosCondicoesComerciaisDoProduto: '',
    casosDeUsoExemplosPraticosEValoresSistema: '',
    informacoesGerais: '',
    limiteHistoricoMensagens: 50
  };

  configuracaoOriginal: Partial<ConfiguracaoIA> | null = null;

  constructor(
    private clientService: ClientService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  // ==================== CARREGAMENTO ====================

  async carregarDados(): Promise<void> {
    this.carregando = true;
    this.cdr.detectChanges();
    
    ShowSpinner();
    try {
      const configExistente = await this.clientService.buscarConfiguracaoIa();
      
      if (configExistente) {
        this.configuracao = { ...configExistente };
        this.configuracaoOriginal = { ...configExistente };
      } else {
        this.configuracaoOriginal = null;
      }
      
      this.carregando = false;
      this.cdr.detectChanges();
      hideSpinner();
    } catch (error: any) {
      console.error('Erro ao carregar configuração de IA:', error);
      this.snackbarService.error('Erro ao carregar configuração de IA');
      this.carregando = false;
      this.cdr.detectChanges();
      hideSpinner();
    }
  }

  // ==================== AÇÕES ====================

  async salvarConfiguracao(): Promise<void> {
    if (!this.validarConfiguracao()) {
      this.snackbarService.error('Preencha todos os campos obrigatórios');
      return;
    }

    this.salvando = true;
    this.cdr.detectChanges();
    
    try {
      let resultado: ConfiguracaoIA;
      
      if (this.configuracao.id) {
        resultado = await this.clientService.atualizarConfiguracaoIa(
          this.configuracao.id,
          this.configuracao
        );
        this.snackbarService.success('Configuração atualizada com sucesso');
      } else {
        resultado = await this.clientService.criarConfiguracaoIa(this.configuracao);
        this.snackbarService.success('Configuração criada com sucesso');
      }

      this.configuracao = { ...resultado };
      this.configuracaoOriginal = { ...resultado };
      this.salvando = false;
      this.cdr.detectChanges();
      
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      this.snackbarService.error(error.message || 'Erro ao salvar configuração');
      this.salvando = false;
      this.cdr.detectChanges();
    }
  }

  resetarFormulario(): void {
    if (this.configuracaoOriginal) {
      this.configuracao = { ...this.configuracaoOriginal };
    } else {
      this.configuracao = {
        funcaoPrincipalDoProduto: '',
        modulosFuncionalidadesDoProduto: '',
        processoDeUsoProduto: '',
        perguntasFrequentesSobreProduto: '',
        doresAtendidasPeloProduto: '',
        diferencasVantagensDoProduto: '',
        integracoesRecursosExtrasProduto: '',
        suporteEAtendimentoDoProduto: '',
        planosPrecosCondicoesComerciaisDoProduto: '',
        casosDeUsoExemplosPraticosEValoresSistema: '',
        informacoesGerais: '',
        limiteHistoricoMensagens: 50
      };
    }
    this.cdr.detectChanges();
    this.snackbarService.info('Formulário resetado');
  }

  validarConfiguracao(): boolean {
    return !!(
      this.configuracao.funcaoPrincipalDoProduto &&
      this.configuracao.limiteHistoricoMensagens &&
      this.configuracao.limiteHistoricoMensagens > 0
    );
  }

  get configuracaoExiste(): boolean {
    return !!this.configuracaoOriginal;
  }

  get formularioAlterado(): boolean {
    if (!this.configuracaoOriginal) return true;
    
    return JSON.stringify(this.configuracao) !== JSON.stringify(this.configuracaoOriginal);
  }
}