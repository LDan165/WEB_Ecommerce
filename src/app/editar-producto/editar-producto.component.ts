import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InventarioService } from '../inventario/inventario.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit {
  productoForm: FormGroup;
  guardando = false;
  cargando = true;
  error: string | null = null;
  productoId: number;
  producto: Producto | null = null;
  
  // Lista de imágenes disponibles para seleccionar
  imagenesDisponibles = [
    { valor: 'assets/Figura_GokuSSJ.jpg', nombre: 'Figura Goku SSJ' },
    { valor: 'assets/Figura_Scarface.jpg', nombre: 'Figura Scarface' },
    { valor: 'assets/default.jpg', nombre: 'Imagen por defecto' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      imagen: ['', Validators.required],
      descripcion: ['', Validators.maxLength(200)]
    });
    
    this.productoId = 0;
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productoId = +params['id']; // Convertir a número
      this.cargarProducto();
    });
  }
  
  cargarProducto(): void {
    this.cargando = true;
    this.error = null;
    
    this.inventarioService.obtenerProductoPorId(this.productoId).subscribe({
      next: (producto: Producto) => {
        this.producto = producto;
        this.productoForm.patchValue({
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
          imagen: producto.imagen,
          descripcion: producto.descripcion
        });
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar el producto:', error);
        this.error = 'Error al cargar el producto. Por favor, intente de nuevo.';
        this.cargando = false;
      }
    });
  }
  
  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }
    
    this.guardando = true;
    this.error = null;
    
    const formValues = this.productoForm.value;
    
    const productoActualizado = new Producto(
      this.productoId,
      formValues.nombre,
      parseFloat(formValues.precio),
      formValues.imagen,
      parseInt(formValues.cantidad, 10),
      formValues.descripcion
    );
    
    this.inventarioService.actualizarProducto(productoActualizado).subscribe({
      next: () => {
        console.log('Producto actualizado correctamente');
        this.guardando = false;
        this.router.navigate(['/inventario']);
      },
      error: (err: any) => {
        console.error('Error al actualizar el producto:', err);
        this.error = 'Error al actualizar el producto. Por favor, intente de nuevo.';
        this.guardando = false;
      }
    });
  }
  
  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}