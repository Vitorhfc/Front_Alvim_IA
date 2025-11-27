import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private visibilitySubject = new BehaviorSubject<boolean>(false);

  public isVisible$: Observable<boolean> = this.visibilitySubject.asObservable();

  /**
   * Mostra o spinner
   */
  show(): void {
    this.visibilitySubject.next(true);
  }

  /**
   * Esconde o spinner
   */
  hidden(): void {
    this.visibilitySubject.next(false);
  }

  /**
   * Retorna se o spinner está visível
   */
  isVisible(): boolean {
    return this.visibilitySubject.value;
  }
}


export function ShowSpinner(): void {
  var spinner = new SpinnerService();
  spinner.show();
}

export function hideSpinner(): void {
  var spinner = new SpinnerService();
  spinner.hidden();
}