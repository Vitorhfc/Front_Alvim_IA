import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SnackBarType = 'success' | 'error' | 'warning' | 'info';

export interface SnackBarMessage {
  id: string;
  message: string;
  type: SnackBarType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private messagesSubject = new BehaviorSubject<SnackBarMessage[]>([]);
  public messages$: Observable<SnackBarMessage[]> = this.messagesSubject.asObservable();

  constructor() {}

  /**
   * Exibe uma mensagem de sucesso
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Exibe uma mensagem de erro
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Exibe uma mensagem de aviso
   */
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Exibe uma mensagem de informação
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Exibe uma mensagem genérica
   */
  private show(message: string, type: SnackBarType, duration: number): void {
    const id = this.generateId();
    const snackbarMessage: SnackBarMessage = {
      id,
      message,
      type,
      duration
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, snackbarMessage]);

    // Auto-remove após a duração
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  /**
   * Remove uma mensagem específica
   */
  remove(id: string): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next(currentMessages.filter(msg => msg.id !== id));
  }

  /**
   * Limpa todas as mensagens
   */
  clear(): void {
    this.messagesSubject.next([]);
  }

  /**
   * Gera um ID único para a mensagem
   */
  private generateId(): string {
    return `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
