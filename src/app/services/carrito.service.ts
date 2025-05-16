import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoKey = 'carrito_productos';
  private carritoSubject = new BehaviorSubject<Producto[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor() {
    // Cargar carrito desde localStorage al iniciar
    this.cargarCarrito();
  }

  private cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem(this.carritoKey);
    if (carritoGuardado) {
      try {
        const productos = JSON.parse(carritoGuardado);
        this.carritoSubject.next(productos);
      } catch (error) {
        console.error('Error al cargar el carrito desde localStorage:', error);
        this.carritoSubject.next([]);
      }
    }
  }

  private guardarCarrito(productos: Producto[]): void {
    localStorage.setItem(this.carritoKey, JSON.stringify(productos));
    this.carritoSubject.next(productos);
  }

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const productos = this.carritoSubject.value;
    const productoExistente = productos.find(p => p.id === producto.id);

    if (productoExistente) {
      // Si el producto ya está en el carrito, aumentar la cantidad
      productoExistente.cantidad += cantidad;
    } else {
      // Si es un producto nuevo, añadirlo con la cantidad especificada
      const nuevoProducto = { ...producto, cantidad: cantidad };
      productos.push(nuevoProducto);
    }

    this.guardarCarrito([...productos]);
  }

  eliminarProducto(productoId: number): void {
    const productos = this.carritoSubject.value.filter(p => p.id !== productoId);
    this.guardarCarrito(productos);
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    const productos = this.carritoSubject.value;
    const productoIndex = productos.findIndex(p => p.id === productoId);
    
    if (productoIndex !== -1) {
      productos[productoIndex].cantidad = cantidad;
      this.guardarCarrito([...productos]);
    }
  }

  vaciarCarrito(): void {
    this.guardarCarrito([]);
  }

  obtenerTotal(): number {
    return this.carritoSubject.value.reduce(
      (total, producto) => total + producto.precio * producto.cantidad, 
      0
    );
  }

  generarXML(): string {
    const productos = this.carritoSubject.value;
    const fecha = new Date().toISOString();
    const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<recibo>\n';
    xml += `  <fecha>${fecha}</fecha>\n`;
    xml += '  <productos>\n';
    
    productos.forEach(producto => {
      xml += '    <producto>\n';
      xml += `      <id>${producto.id}</id>\n`;
      xml += `      <nombre>${this.escapeXML(producto.nombre)}</nombre>\n`;
      xml += `      <precio>${producto.precio.toFixed(2)}</precio>\n`;
      xml += `      <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `      <subtotal>${(producto.precio * producto.cantidad).toFixed(2)}</subtotal>\n`;
      xml += '    </producto>\n';
    });
    
    xml += '  </productos>\n';
    xml += `  <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `  <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `  <total>${total.toFixed(2)}</total>\n`;
    xml += '</recibo>';
    
    return xml;
  }
  
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
