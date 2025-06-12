import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InventarioService } from '../inventario/inventario.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-agregar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './agregar-producto.component.html',
  styleUrl: './agregar-producto.component.css'
})
export class AgregarProductoComponent {
  productoForm: FormGroup;
  guardando = false;
  error: string | null = null;
  
  // Lista de imágenes disponibles para seleccionar
  imagenesDisponibles = [
    { valor: 'assets/Figura_GokuSSJ.jpg', nombre: 'Figura Goku SSJ' },
    { valor: 'assets/Figura_Scarface.jpg', nombre: 'Figura Tony Montana' },
    { valor: 'assets/Comic_Invencible.jpg', nombre: 'Invencible'}
  ];
  
  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      imagen: ['assets/default.jpg', Validators.required],
      descripcion: ['', Validators.maxLength(200)]
    });
  }
  
  guardarProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }
    
    this.guardando = true;
    this.error = null;
    
    const formValues = this.productoForm.value;
    
    const nuevoProducto = new Producto(
      0, 
      formValues.nombre,
      parseFloat(formValues.precio),
      formValues.imagen,
      parseInt(formValues.cantidad, 10),
      formValues.descripcion
    );
    
    this.inventarioService.agregarProducto(nuevoProducto).subscribe({
      next: (producto: Producto) => {
        console.log('Producto agregado correctamente:', producto);
        this.guardando = false;
        this.router.navigate(['/inventario']);
      },
      error: (err: any) => {
        console.error('Error al guardar el producto:', err);
        this.error = 'Error al guardar el producto. Por favor, intente de nuevo.';
        this.guardando = false;
      }
    });
    this.mostrarMensaje('Producto guardado exitosamente');
  }

mostrarNotificacion = false;
mensajeNotificacion = '';


mostrarMensaje(mensaje: string): void {
  this.mensajeNotificacion = mensaje;
  this.mostrarNotificacion = true;
  
  setTimeout(() => {
    this.mostrarNotificacion = false;
  }, 3000);
}
  
  cancelar() {
    this.router.navigate(['/inventario']);
  }
}