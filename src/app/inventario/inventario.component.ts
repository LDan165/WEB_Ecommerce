import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Producto } from '../models/producto';
import { InventarioService } from './inventario.service';
import { Router } from "@angular/router";


@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error: string | null = null;
  mensajeExito: string | null = null;
  
  constructor(private inventarioService: InventarioService, 
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarProductos();
  }

  mostrarNotificacion = false;
  mensajeNotificacion = '';
  
  cargarProductos(): void {
    this.cargando = true;
    this.error = null;
    
    this.inventarioService.obtenerProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
        this.cargando = false;
        console.log('Productos cargados en el componente de inventario:', this.productos);
      },
      error: (error: any) => {
        console.error('Error al cargar productos en el componente de inventario:', error);
        this.error = 'Error al cargar el inventario. Por favor, intente de nuevo.';
        this.cargando = false;
      }
    });
  }
  
  actualizarCantidad(producto: Producto, event: any): void {
    const nuevaCantidad = parseInt(event.target.value, 10);
    
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
      event.target.value = producto.cantidad; // Restaurar valor anterior
      return;
    }
    
    this.inventarioService.actualizarCantidad(producto.id, nuevaCantidad).subscribe({
      next: (productoActualizado: Producto) => {
        console.log(`Stock actualizado para ${producto.nombre}: ${nuevaCantidad}`);
        this.mostrarMensaje(`Stock de ${producto.nombre} actualizado a ${nuevaCantidad}`);
        // La cantidad ya se actualizó en el objeto producto
      },
      error: (error: any) => {
        console.error('Error al actualizar stock:', error);
        this.error = 'Error al actualizar el stock. Por favor, intente de nuevo.';
        event.target.value = producto.cantidad; // Restaurar valor anterior
      }
    });
    this.mostrarMensaje(`Stock de ${producto.nombre} actualizado a ${nuevaCantidad}`);
  }
  
  eliminarProducto(producto: Producto): void {
    if (confirm(`¿Está seguro que desea eliminar el producto "${producto.nombre}"?`)) {
      this.inventarioService.eliminarProducto(producto.id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== producto.id);
          this.mostrarMensaje(`Producto "${producto.nombre}" eliminado correctamente`);
        },
        error: (error: any) => {
          console.error('Error al eliminar producto:', error);
          this.error = 'Error al eliminar el producto. Por favor, intente de nuevo.';
        }
      });
    }
     this.mostrarMensaje(`Producto ${producto.nombre} eliminado correctamente`);
  }
  
  volverAProductos() {
    this.router.navigate(["/"]);
  }

  guardarInventario(): void {
    this.inventarioService.guardarXML().subscribe({
      next: () => {
        this.mostrarMensaje('Inventario guardado correctamente. Se ha descargado el archivo XML.');
      },
      error: (error: any) => {
        console.error('Error al guardar inventario:', error);
        this.error = 'Error al guardar el inventario. Por favor, intente de nuevo.';
      }
    });
     this.mostrarMensaje('Inventario guardado correctamente');
  }
  
  private mostrarMensaje(mensaje: string): void {

    this.mensajeNotificacion = mensaje;
    this.mostrarNotificacion = true;
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    this.mostrarNotificacion = false;
  }, 3000);
  }
}