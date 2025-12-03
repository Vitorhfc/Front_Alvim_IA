import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../Environment/Environment';
import { BaseApiService } from './base-api.service';
import { LocalStorageService } from '../Local/local-storage';
import { MenuConfiguracao } from '../../Models/Entidades/Adm/MenuConfiguracao';

/**
 * Service para gerenciar configurações de menu
 */
@Injectable({
  providedIn: 'root'
})
export class MenuConfiguracaoService extends BaseApiService {
  protected override baseUrl = environment.url_ADMIN;

  constructor(
    http: HttpClient,
    localStorageService: LocalStorageService
  ) {
    super(http, localStorageService);
  }

  /**
   * Busca todos os menus de uma empresa (ou global se empresaId for null)
   */
  async buscarMenusPorEmpresa(empresaId?: string | null): Promise<MenuConfiguracao[]> {
    // const queryParam = empresaId ? `?empresaId=${empresaId}` : '';
    // ${queryParam}
    return await this.get<MenuConfiguracao[]>(`/MenuConfiguracao/menu`);
  }

  /**
   * Carrega o menu lateral com apenas os itens ativos
   */
  async carregarMenuLateral(empresaId?: string | null): Promise<MenuConfiguracao[]> {
    // const queryParam = empresaId ? `?empresaId=${empresaId}` : '';
    // ${queryParam}
    return await this.get<MenuConfiguracao[]>(`/MenuConfiguracao/CarregarMenuLateral`);
  }

  /**
   * Busca menu por ID
   */
  async buscarMenuPorId(id: string): Promise<MenuConfiguracao> {
    return await this.get<MenuConfiguracao>(`/MenuConfiguracao/menu/${id}`);
  }

  /**
   * Cria ou atualiza menu
   * Se o menu tiver ID, será atualizado. Caso contrário, será criado.
   */
  async salvarMenu(menu: Partial<MenuConfiguracao>): Promise<MenuConfiguracao> {
    return await this.post<Partial<MenuConfiguracao>, MenuConfiguracao>('/MenuConfiguracao/menu', menu);
  }

  /**
   * Remove menu
   */
  async removerMenu(id: string): Promise<void> {
    return await this.delete(`/MenuConfiguracao/menu/${id}`);
  }

  /**
   * Alterna o status ativo/inativo de um menu
   */
  async alternarStatus(id: string): Promise<void> {
    return await this.post('/MenuConfiguracao/menu/alternar-status', { id });
  }

  /**
   * Reordena menus
   */
  async reordenarMenus(menus: { id: string; ordem: number }[]): Promise<void> {
    return await this.post('/MenuConfiguracao/menu/reordenar', menus);
  }
}
