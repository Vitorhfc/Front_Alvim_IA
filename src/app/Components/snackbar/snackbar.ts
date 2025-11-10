import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { SnackbarService, SnackBarMessage } from '../../Service/snackbar';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.html',
  styleUrls: ['./snackbar.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class SnackbarComponent implements OnInit, OnDestroy {
  messages: SnackBarMessage[] = [];
  private subscription?: Subscription;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.subscription = this.snackbarService.messages$.subscribe(
      messages => {
        this.messages = messages;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Remove uma mensagem manualmente (ao clicar no botão de fechar)
   */
  removeMessage(id: string): void {
    this.snackbarService.remove(id);
  }

  /**
   * Retorna o ícone apropriado para cada tipo de mensagem
   */
  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}
