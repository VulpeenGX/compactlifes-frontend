import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'cart' | 'wishlist';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  constructor() {}

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'cart' | 'wishlist' = 'success') {
    this.notificationSubject.next({ message, type });
  }
}
