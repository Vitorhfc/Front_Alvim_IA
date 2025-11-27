import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Usuario } from '../../Models/Entidades/Adm/Usuario';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly TOKEN_KEY = 'token_acesso';
  private readonly USER_KEY = 'usuario_logado';
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  setUsuario(usuario: Usuario): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    }
  }

  getUsuario(): Usuario | null {
    if (this.isBrowser()) {
      const usuario = localStorage.getItem(this.USER_KEY);
      return usuario ? JSON.parse(usuario) : null;
    }
    return null;
  }

  removeUsuario(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  limparDados(): void {
    this.removeToken();
    this.removeUsuario();
  }

  /**
   * Obtém o ID da empresa do usuário logado
   * Retorna null se não houver usuário logado ou empresa vinculada
   */
  getEmpresaId(): string | null {
    const usuario = this.getUsuario();
    if (!usuario) return null;

    // Se o usuário tiver empresaId diretamente (pode ser adicionado no login)
    return (usuario as any).empresaId || null;
  }

  /**
   * Define o ID da empresa no storage
   */
  setEmpresaId(empresaId: string): void {
    if (this.isBrowser()) {
      const usuario = this.getUsuario();
      if (usuario) {
        (usuario as any).empresaId = empresaId;
        this.setUsuario(usuario);
      }
    }
  }
}


export function IsAutenticado(): boolean {
  const local = new LocalStorageService();
  return local.isAutenticado();
}