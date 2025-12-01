import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatcardComponent {
  @Input() label: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = '';
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'success';
  @Input() prefix: string = '';
  @Input() suffix: string = '';

  formatValue(value: string | number): string {
    if (typeof value === 'number') {
      // Formatear números con comas
      return value.toLocaleString('es-PE');
    }
    return value.toString();
  }
}