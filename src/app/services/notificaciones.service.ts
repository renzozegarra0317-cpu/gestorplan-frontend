import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  icon: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type?: 'success' | 'warning' | 'info' | 'error';
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor() {
    // Cargar notificaciones guardadas del localStorage
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem('notificaciones');
    if (saved) {
      try {
        const notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    }
  }

  private saveNotifications(): void {
    const notifications = this.notificationsSubject.value;
    localStorage.setItem('notificaciones', JSON.stringify(notifications));
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Hace unos segundos';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'min' : 'min'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return timestamp.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    }
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    const current = this.notificationsSubject.value;
    const updated = [newNotification, ...current].slice(0, 50); // Mantener máximo 50 notificaciones
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  // Métodos de conveniencia para tipos específicos
  notificarPlanillaGenerada(codigo: string, periodo: string): void {
    this.addNotification({
      icon: '✅',
      title: 'Planilla generada',
      message: `Planilla ${codigo} (${periodo}) generada exitosamente`,
      type: 'success',
      actionUrl: '/planillas/historial'
    });
  }

  notificarPlanillaAprobada(codigo: string, periodo: string): void {
    this.addNotification({
      icon: '✅',
      title: 'Planilla aprobada',
      message: `Planilla ${codigo} (${periodo}) aprobada exitosamente`,
      type: 'success',
      actionUrl: '/planillas/historial'
    });
  }

  notificarPlanillaPagada(codigo: string, periodo: string): void {
    this.addNotification({
      icon: '💳',
      title: 'Planilla pagada',
      message: `Planilla ${codigo} (${periodo}) marcada como pagada`,
      type: 'success',
      actionUrl: '/planillas/historial'
    });
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  markAsRead(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  deleteNotification(id: string): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
    this.saveNotifications();
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveNotifications();
  }

  getTimeAgo(notification: Notification): string {
    return this.formatTimeAgo(notification.timestamp);
  }
}






