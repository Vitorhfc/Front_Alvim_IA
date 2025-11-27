import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset?: 'today' | 'week' | 'month' | 'year' | 'custom';
}

@Component({
  selector: 'app-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent {
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  selectedPreset: string = 'week';
  customStartDate: string = '';
  customEndDate: string = '';
  showCustomDatePicker: boolean = false;

  presets = [
    { id: 'today', label: 'Hoje', icon: 'today' },
    { id: 'week', label: 'Última Semana', icon: 'date_range' },
    { id: 'month', label: 'Último Mês', icon: 'calendar_month' },
    { id: 'year', label: 'Último Ano', icon: 'calendar_today' },
    { id: 'custom', label: 'Personalizado', icon: 'tune' }
  ];

  constructor() {
    // Emitir filtro inicial (última semana)
    this.selectPreset('week');
  }

  selectPreset(presetId: string): void {
    this.selectedPreset = presetId;
    this.showCustomDatePicker = presetId === 'custom';

    if (presetId !== 'custom') {
      const dateRange = this.getDateRangeForPreset(presetId);
      this.dateRangeChange.emit(dateRange);
    }
  }

  applyCustomDateRange(): void {
    if (!this.customStartDate || !this.customEndDate) {
      return;
    }

    // TODO: Validar se data inicial é menor que data final
    // TODO: Validar se datas não são futuras

    const dateRange: DateRange = {
      startDate: this.customStartDate,
      endDate: this.customEndDate,
      preset: 'custom'
    };

    this.dateRangeChange.emit(dateRange);
  }

  private getDateRangeForPreset(preset: string): DateRange {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: Date;

    switch (preset) {
      case 'today':
        startDate = now;
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate,
      preset: preset as any
    };
  }

  get maxDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
