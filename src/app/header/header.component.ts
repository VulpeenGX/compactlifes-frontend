import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
    activeTab: string = ''; // Inicialmente no hay ninguna pestaña activa
  
    selectTab(tab: string): void {
      this.activeTab = tab; // Establece la pestaña activa
    }
  
  
}
