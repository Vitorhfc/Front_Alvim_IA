import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuConfiguracaoService } from '../../Service/Api/menu-configuracao.service';
import { MenuConfiguracao } from '../../Models/Entidades/Adm/MenuConfiguracao';
import { LocalStorageService } from '../../Service/Local/local-storage';
import { SnackbarService } from '../../Service/snackbar';
import { LayoutService } from '../../Service/layout';
import { ConfirmationDialogComponent } from '../../Components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-menu-configuracao',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, DragDropModule],
  templateUrl: './menu-configuracao.component.html',
  styleUrls: ['./menu-configuracao.component.scss']
})
export class MenuConfiguracaoComponent implements OnInit {
  loading: boolean = true;
  menus: MenuConfiguracao[] = [];
  menuSelecionado: MenuConfiguracao | null = null;
  modoEdicao: boolean = false;
  empresaId: string | null = null;

  // Formulário de edição/criação
  formularioMenu: Partial<MenuConfiguracao> = {};

  // Ícones disponíveis (Material Icons)
  iconesDisponiveis = [
    'dashboard', 'chat', 'event', 'people', 'analytics',
    'description', 'menu_book', 'phone', 'phone_missed',
    'receipt_long', 'settings', 'home', 'folder',
    'favorite', 'search', 'help', 'info', 'person',
    'shopping_cart', 'calendar_today', 'build', 'assignment'
  ];

  constructor(
    private menuService: MenuConfiguracaoService,
    private localStorageService: LocalStorageService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.obterEmpresaId();
    this.formularioMenu = this.resetFormulario();
    this.carregarMenus();
  }

  // ==================== CARREGAMENTO ====================

  obterEmpresaId(): void {
    this.empresaId = this.localStorageService.getEmpresaId();
  }

  async carregarMenus(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      const resultado = await this.menuService.buscarMenusPorEmpresa(this.empresaId);
      this.menus = resultado || [];
      this.menus.sort((a, b) => a.ordem - b.ordem);
    } catch (error) {
      console.error('Erro ao carregar menus:', error);
      this.menus = [];
      this.snackbarService.error('Erro ao carregar menus. Tente novamente.');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ==================== FORMULÁRIO ====================

  resetFormulario(): Partial<MenuConfiguracao> {
    return {
      icone: '',
      label: '',
      route: '',
      disabled: false,
      ordem: this.menus.length,
      menuPaiId: null,
      flgAtivo: true
    };
  }

  novoMenu(): void {
    console.log('novoMenu() chamado');
    this.modoEdicao = true;
    this.menuSelecionado = null;
    this.formularioMenu = this.resetFormulario();
    console.log('Modo edição ativo:', this.modoEdicao);
    this.cdr.detectChanges();
  }

  editarMenu(menu: MenuConfiguracao): void {
    console.log('editarMenu() chamado', menu);
    this.modoEdicao = true;
    this.menuSelecionado = menu;
    this.formularioMenu = { ...menu };
    this.cdr.detectChanges();
  }

  cancelarEdicao(): void {
    console.log('cancelarEdicao() chamado');
    this.modoEdicao = false;
    this.menuSelecionado = null;
    this.formularioMenu = this.resetFormulario();
    this.cdr.detectChanges();
  }

  async salvarMenu(): Promise<void> {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      // Se estiver editando, inclui o ID no payload
      const menuParaSalvar = this.menuSelecionado
        ? { ...this.formularioMenu, id: this.menuSelecionado.id }
        : this.formularioMenu;

      await this.menuService.salvarMenu(menuParaSalvar);

      const mensagem = this.menuSelecionado
        ? 'Menu atualizado com sucesso!'
        : 'Menu criado com sucesso!';

      this.snackbarService.success(mensagem);

      this.cancelarEdicao();
      await this.carregarMenus();
    } catch (error) {
      console.error('Erro ao salvar menu:', error);
      this.snackbarService.error('Erro ao salvar menu. Tente novamente.');
    }
  }

  validarFormulario(): boolean {
    if (!this.formularioMenu.icone || this.formularioMenu.icone.trim() === '') {
      this.snackbarService.warning('O ícone é obrigatório');
      return false;
    }
    if (!this.formularioMenu.label || this.formularioMenu.label.trim() === '') {
      this.snackbarService.warning('O label é obrigatório');
      return false;
    }
    if (!this.formularioMenu.route || this.formularioMenu.route.trim() === '') {
      this.snackbarService.warning('A rota é obrigatória');
      return false;
    }
    return true;
  }

  // ==================== AÇÕES ====================

  confirmarRemocao(menu: MenuConfiguracao): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmar Remoção',
        message: `Tem certeza que deseja remover o menu "${menu.label}"?`,
        confirmText: 'Remover',
        cancelText: 'Cancelar',
        confirmButtonClass: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removerMenu(menu);
      }
    });
  }

  async removerMenu(menu: MenuConfiguracao): Promise<void> {
    try {
      await this.menuService.removerMenu(menu.id);
      this.snackbarService.success('Menu removido com sucesso!');
      await this.carregarMenus();
    } catch (error) {
      console.error('Erro ao remover menu:', error);
      this.snackbarService.error('Erro ao remover menu. Tente novamente.');
    }
  }

  async alternarStatus(menu: MenuConfiguracao): Promise<void> {
    try {
      // Salva o status atual para mostrar a mensagem correta
      const statusAtual = menu.flgAtivo;

      // Chama o endpoint que inverte o status automaticamente
      await this.menuService.alternarStatus(menu.id);

      // Recarrega a lista completa para garantir sincronia com o servidor
      await this.carregarMenus();

      // Mensagem baseada no status invertido
      const novoStatus = !statusAtual;
      this.snackbarService.success(`Menu ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do menu:', error);
      this.snackbarService.error('Erro ao alterar status do menu. Tente novamente.');

      // Em caso de erro, recarrega os menus para garantir sincronia
      await this.carregarMenus();
    }
  }

  async moverParaCima(index: number): Promise<void> {
    if (index === 0) return;

    const menuAtual = this.menus[index];
    const menuAnterior = this.menus[index - 1];

    const ordemTemp = menuAtual.ordem;
    menuAtual.ordem = menuAnterior.ordem;
    menuAnterior.ordem = ordemTemp;

    await this.salvarOrdenacao();
  }

  async moverParaBaixo(index: number): Promise<void> {
    if (index === this.menus.length - 1) return;

    const menuAtual = this.menus[index];
    const menuProximo = this.menus[index + 1];

    const ordemTemp = menuAtual.ordem;
    menuAtual.ordem = menuProximo.ordem;
    menuProximo.ordem = ordemTemp;

    await this.salvarOrdenacao();
  }

  async salvarOrdenacao(): Promise<void> {
    try {
      const menusOrdenados = this.menus.map(m => ({ id: m.id, ordem: m.ordem }));
      await this.menuService.reordenarMenus(menusOrdenados);
      await this.carregarMenus();
    } catch (error) {
      console.error('Erro ao reordenar menus:', error);
      this.snackbarService.error('Erro ao reordenar menus. Tente novamente.');
    }
  }

  // ==================== DRAG AND DROP ====================

  onDrop(event: CdkDragDrop<MenuConfiguracao[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Move o item no array
    moveItemInArray(this.menus, event.previousIndex, event.currentIndex);

    // Atualiza a ordem de todos os menus
    this.menus.forEach((menu, index) => {
      menu.ordem = index;
    });

    // Salva a nova ordenação
    this.salvarOrdenacao();
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Recarrega o menu lateral forçando busca na API
   */
  recarregarMenuLateral(): void {
    this.layoutService.reloadMenu();
    this.snackbarService.success('Menu lateral recarregado com sucesso!');
  }
}
