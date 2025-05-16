import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-pago-exitoso",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./pago-exitoso.component.html",
  styleUrl: "./pago-exitoso.component.css",
})
export class PagoExitosoComponent implements OnInit {
  fechaActual = ""

  constructor() {}

  ngOnInit() {
    this.fechaActual = new Date().toLocaleString()
  }
}
