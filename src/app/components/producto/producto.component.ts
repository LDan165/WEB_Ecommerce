import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"
import { Router } from "@angular/router";
import { RouterModule } from "@angular/router";
import { Producto } from "../../models/producto"
import { InventarioService } from "../../inventario/inventario.service"
import { CarritoService } from "../../services/carrito.service"
import { AuthService } from "../../auth.service";



@Component({
  selector: "app-producto",
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  providers: [],
  templateUrl: "./producto.component.html",
  styleUrl: "./producto.component.css",
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = []
  cargando = true
  error: string | null = null
  productosEnCarrito: Producto[] = [];
  cantidadesSeleccionadas: Map<number, number> = new Map();
  
  // Variables para la notificación declarativa
  mostrarNotificacion = false;
  mensajeNotificacion = '';

  constructor(
    private inventarioService: InventarioService,
    private carritoService: CarritoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargando = true

    // Suscribirse al observable del carrito
    this.carritoService.carrito$.subscribe(productos => {
      this.productosEnCarrito = productos;
    });

    // Usar inventarioService en lugar de productoService
    this.inventarioService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log("Productos cargados:", this.productos);
        
        // Inicializar cantidades seleccionadas a 1 para cada producto
        this.productos.forEach(producto => {
          this.cantidadesSeleccionadas.set(producto.id, 1);
        });
        
        this.cargando = false;
      },
      error: (error) => {
        console.error("Error al cargar productos:", error);
        this.error = "Error al cargar productos. Usando datos de respaldo.";
        this.cargando = false;
      },
    })
  }

  

 estaAutenticado(): boolean {
    return this.authService.estaAutenticado()
  }

  esAdmin() {
    return this.authService.esAdmin();
  }

  obtenerUsuario(): any {
    return this.authService.obtenerUsuarios()
  }

  obtenerRol(): string | null {
    return this.authService.obtenerRol()
  }

  cerrarSesion(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  irAlLogin(): void {
    this.router.navigate(["/login"])
  }

  // Obtener la cantidad seleccionada para un producto
  getCantidadSeleccionada(productoId: number): number {
    return this.cantidadesSeleccionadas.get(productoId) || 1;
  }

  // Incrementar la cantidad seleccionada
  incrementarCantidad(producto: Producto): void {
    const cantidadActual = this.getCantidadSeleccionada(producto.id);
    if (cantidadActual < producto.cantidad) {
      this.cantidadesSeleccionadas.set(producto.id, cantidadActual + 1);
    }
  }

  // Decrementar la cantidad seleccionada
  decrementarCantidad(producto: Producto): void {
    const cantidadActual = this.getCantidadSeleccionada(producto.id);
    if (cantidadActual > 1) {
      this.cantidadesSeleccionadas.set(producto.id, cantidadActual - 1);
    }
  }

  // Actualizar la cantidad seleccionada desde el input
  actualizarCantidad(producto: Producto, event: any): void {
    const nuevaCantidad = parseInt(event.target.value, 10);
    
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
      this.cantidadesSeleccionadas.set(producto.id, 1);
      event.target.value = 1;
    } else if (nuevaCantidad > producto.cantidad) {
      this.cantidadesSeleccionadas.set(producto.id, producto.cantidad);
      event.target.value = producto.cantidad;
    } else {
      this.cantidadesSeleccionadas.set(producto.id, nuevaCantidad);
    }
  }

  agregarACarrito(producto: Producto) {
    const cantidad = this.getCantidadSeleccionada(producto.id);
    this.carritoService.agregarProducto(producto, cantidad);
    
    // Usar el método actualizado para mostrar notificaciones
    this.mostrarMensaje(`${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} ${cantidad === 1 ? 'agregada' : 'agregadas'} al carrito`);
    
    // Resetear la cantidad seleccionada a 1 después de agregar al carrito
    this.cantidadesSeleccionadas.set(producto.id, 1);
  }

  irAlCarrito() {
    this.router.navigate(["/carrito"])
  }

  irAlInventario() {
    this.router.navigate(['/inventario']);
  }

  verDetalleProducto(id: number): void {
    this.router.navigate(['/producto', id]);
  }

  // Método para mostrar notificaciones
  mostrarMensaje(mensaje: string): void {
    this.mensajeNotificacion = mensaje;
    this.mostrarNotificacion = true;
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }


  
}