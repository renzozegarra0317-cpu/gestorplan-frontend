import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Movimiento {
  id: number;
  description: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense' | 'pending';
  icon: string;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss']
})
export class MovimientosComponent implements OnInit {
  currentMonth: string = 'Agosto 2025';
  movimientos: Movimiento[] = [];

  ngOnInit(): void {
    // Datos de ejemplo más completos
    this.movimientos = [
      {
        id: 1,
        description: 'Pago de planilla mensual',
        date: new Date('2025-08-31T19:00:00'),
        amount: 450000,
        type: 'expense',
        icon: 'fas fa-money-bill-wave'
      },
      {
        id: 2,
        description: 'Bonificación especial',
        date: new Date('2025-08-04T19:00:00'),
        amount: 25000,
        type: 'expense',
        icon: 'fas fa-gift'
      },
      {
        id: 3,
        description: 'Gratificación Julio 2025',
        date: new Date('2025-07-15T14:30:00'),
        amount: 380000,
        type: 'expense',
        icon: 'fas fa-award'
      },
      {
        id: 4,
        description: 'Pago de CTS Semestral',
        date: new Date('2025-05-15T10:00:00'),
        amount: 220000,
        type: 'expense',
        icon: 'fas fa-piggy-bank'
      },
      {
        id: 5,
        description: 'Ajuste por horas extras',
        date: new Date('2025-08-28T16:45:00'),
        amount: 18500,
        type: 'expense',
        icon: 'fas fa-clock'
      },
      {
        id: 6,
        description: 'Descuento por préstamo',
        date: new Date('2025-08-20T11:20:00'),
        amount: -12000,
        type: 'income',
        icon: 'fas fa-hand-holding-usd'
      }
    ];
  }
}