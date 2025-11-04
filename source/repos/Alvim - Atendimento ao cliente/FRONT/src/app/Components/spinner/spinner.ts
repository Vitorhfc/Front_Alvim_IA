import { Component } from '@angular/core';
import { SpinnerService } from '../../Service/Local/spinner';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  standalone: true,
})
export class SpinnerComponent {
  // #region Properties
  isVisible$: Observable<boolean>;
  // #endregion

  // #region Constructor
  constructor(private spinner: SpinnerService) {
    this.isVisible$ = this.spinner.isVisible$;
  }
  // #endregion
}