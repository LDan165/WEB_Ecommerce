import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductoComponent } from "./components/producto/producto.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet> </router-outlet>',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Nuevo_proyecto_angular';
}
