import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../Service/Api/client.service';
import { ConfiguracaoIA } from '../../Models/Entidades/Client/ConfiguracaoIa';
import { SnackbarService } from '../../Service/snackbar';
import { hideSpinner, ShowSpinner, SpinnerService } from '../../Service/Local/spinner';
import { IaMelhoramentoService, CampoMelhoramento } from '../../Service/Api/ia-melhoramento.service';

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
    nome: '',
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

  // Controle de melhoramento de texto com IA
  melhorandoCampo: { [key: number]: boolean } = {};

  // Mapeamento de campos com seus IDs
  camposMapeamento = [
    { id: 1, campo: 'nome', label: 'Nome da Configuração' },
    { id: 2, campo: 'funcaoPrincipalDoProduto', label: 'Função Principal do Produto' },
    { id: 3, campo: 'modulosFuncionalidadesDoProduto', label: 'Módulos e Funcionalidades' },
    { id: 4, campo: 'processoDeUsoProduto', label: 'Processo de Uso do Produto' },
    { id: 5, campo: 'perguntasFrequentesSobreProduto', label: 'Perguntas Frequentes' },
    { id: 6, campo: 'suporteEAtendimentoDoProduto', label: 'Suporte e atendimento' },
    { id: 7, campo: 'doresAtendidasPeloProduto', label: 'Dores atendidas' },
    { id: 8, campo: 'diferencasVantagensDoProduto', label: 'Diferenças e vantagens' },
    { id: 9, campo: 'integracoesRecursosExtrasProduto', label: 'Integrações e recursos extras' },
    { id: 10, campo: 'planosPrecosCondicoesComerciaisDoProduto', label: 'Planos, preços e condições comerciais' },
    { id: 11, campo: 'casosDeUsoExemplosPraticosEValoresSistema', label: 'Casos de uso e exemplos praticos' },
    { id: 12, campo: 'informacoesGerais', label: 'Informações adicionais' }
  ];

  constructor(
    private clientService: ClientService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private iaMelhoramentoService: IaMelhoramentoService
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
        nome: '',
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

  // ==================== MELHORAMENTO COM IA ====================

  /**
   * Verifica se deve exibir o botão de melhorar para um campo específico
   */
  deveExibirBotaoMelhorar(idCampo: number): boolean {
    const campo = this.camposMapeamento.find(c => c.id === idCampo);
    if (!campo) return false;

    const valor = (this.configuracao as any)[campo.campo];
    return valor && valor.trim().length > 0 && !this.melhorandoCampo[idCampo];
  }

  /**
   * Verifica se está melhorando um campo específico
   */
  estaMelhorando(idCampo: number): boolean {
    return this.melhorandoCampo[idCampo] || false;
  }

  /**
   * Melhora o texto de um campo usando IA
   */
  async melhorarTexto(idCampo: number): Promise<void> {
    const campo = this.camposMapeamento.find(c => c.id === idCampo);
    if (!campo) {
      this.snackbarService.error('Campo não encontrado');
      return;
    }

    const textoAtual = (this.configuracao as any)[campo.campo];
    if (!textoAtual || textoAtual.trim().length === 0) {
      this.snackbarService.error('Preencha o campo antes de melhorar');
      return;
    }

    // Marca como melhorando
    this.melhorandoCampo[idCampo] = true;
    this.cdr.detectChanges();

    try {
      // Prepara todos os campos para contexto
      const todosCampos: CampoMelhoramento[] = this.camposMapeamento.map(c => ({
        idCampo: c.id,
        texto: c.label
      }));

      // Chama o serviço de melhoramento
      const textoMelhorado = await this.iaMelhoramentoService.melhorarTexto(
        idCampo,
        textoAtual,
        todosCampos
      );

      // Atualiza o campo com o texto melhorado
      (this.configuracao as any)[campo.campo] = textoMelhorado;

      this.snackbarService.success('Texto melhorado com sucesso!');
      this.melhorandoCampo[idCampo] = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('Erro ao melhorar texto:', error);
      this.snackbarService.error(error.message || 'Erro ao melhorar texto');
      this.melhorandoCampo[idCampo] = false;
      this.cdr.detectChanges();
    }
  }
}