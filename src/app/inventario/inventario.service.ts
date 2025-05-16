import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Producto } from '../models/producto';
import { MySqlProductoService } from '../services/mysql-producto.service';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private xmlURL = 'assets/productos.xml';
  private productos: Producto[] = [];
  private usarMySQL = true;

  constructor(private http: HttpClient,
  private mysqlService: MySqlProductoService
  ) {
    // Cargar productos al inicializar el servicio
    //this.cargarProductos();
    this.cargarProductosDesdeMySQL();
  }

  // Cargar productos desde el XML
  private cargarProductos(): void {
    this.http.get(this.xmlURL, { responseType: 'text' }).subscribe({
      next: (xml: string) => {
        try {
          this.productos = this.parseXML(xml);
          console.log('Productos cargados en el servicio de inventario:', this.productos);
        } catch (error) {
          console.error('Error al procesar el XML en el servicio de inventario:', error);
          // Usar datos de respaldo si hay error
          //this.productos = this.obtenerProductosFallback();
        }
      },
      error: (error: any) => {
        console.error('Error al obtener el XML en el servicio de inventario:', error);
        // Usar datos de respaldo si hay error
        //this.productos = this.obtenerProductosFallback();
      }
    });
  }

  private cargarProductosDesdeMySQL(): void {
    if(this.usarMySQL){
      this.mysqlService.obtenerProductos().subscribe({
        next: (productos: Producto[]) => {
          this.productos = productos;
          console.log('Productos cargados desde MySQL', this.productos);
        },
        error: (error: any) => {
          console.error('Error al obtener productos desde MySQL:', error);
          console.log('Cambiando a XML como respaldo...');
          this.usarMySQL = false;
          this.cargarProductos(); //desde xml
        }
      });
   
    }
    else{
      this.cargarProductos();
    }
  }

  // Parsear XML a array de productos
  private parseXML(xml: string): Producto[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    // Verificar errores de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Error al parsear XML: ' + parserError.textContent);
    }

    return Array.from(xmlDoc.getElementsByTagName('producto'))
      .map((prod) => {
        try {
          const id = prod.getElementsByTagName('id')[0]?.textContent || '0';
          const nombre = prod.getElementsByTagName('nombre')[0]?.textContent || 'Sin nombre';
          const precioText = prod.getElementsByTagName('precio')[0]?.textContent || '0';
          const cantidadText = prod.getElementsByTagName('cantidad')[0]?.textContent || '0';
          const imagen = prod.getElementsByTagName('imagen')[0]?.textContent || 'assets/default.jpg';
          const descripcion = prod.getElementsByTagName('descripcion')[0]?.textContent || '';

          // Convertir valores numéricos
          const precio = Number.parseFloat(precioText);
          const cantidad = Number.parseInt(cantidadText, 10);

          return new Producto(
            Number(id),
            nombre,
            precio,
            imagen,
            cantidad,
            descripcion
          );
        } catch (err) {
          console.error('Error al procesar un producto:', err);
          return null;
        }
      })
      .filter((item): item is Producto => item !== null);
  }

  // Datos de respaldo
 /* private obtenerProductosFallback(): Producto[] {
    return [
      new Producto(1, "Figura de colección Dragon Ball Z Super Saiyan Goku articulada", 2999.99, "assets/Figura_GokuSSJ.jpg", 15, "Figura Goku Super Saiyajin. 3 caras intercambiables: sonriendo, gritando, dientes apretados. 5 pares de manos intercambiables. Postizo intercambiable (flequillo). Parte del efecto de ataque de Kamehameha"),
      new Producto(2, 'Tablet', 349.99, 'assets/images/tablet.jpg', 10, 'Tablet con pantalla HD'),
      new Producto(3, 'Producto sin imagen', 99.99, 'assets/images/default.jpg', 5, 'Producto de ejemplo sin imagen específica')
    ];
  }*/

  // OPERACIONES CRUD

  // Obtener todos los productos
  obtenerProductos(): Observable<Producto[]> {
    if(this.usarMySQL){
      return this.mysqlService.obtenerProductos().pipe(
        catchError(error => {
          console.error('Error al obtener desde MySQL:', error);
          this.usarMySQL = false;
          return of([...this.productos]);
        })
      );
    }
    return of([...this.productos]);
  }

  // Obtener un producto por ID
  obtenerProductoPorId(id: number): Observable<Producto> {
    if(this.usarMySQL){
      return this.mysqlService.obtenerProductoPorId(id).pipe(
        catchError(error => {
          console.error('Error al obtener productoc on su ID ${id} desde MySQL:' , error);
          this.usarMySQL = false;

          const producto = this.productos.find(p => p.id === id);
          if(!producto){
            return throwError(() => new Error('Producto con ID ${id} no encontrado'));
          }
          return of({...producto});
        })
      );
    }else{
      const producto = this.productos.find(p => p.id === id);
    if (!producto) {
      return throwError(() => new Error(`Producto con ID ${id} no encontrado`));
    }
    return of({...producto});
    }
  }

  // Agregar un nuevo producto
  agregarProducto(producto: Producto): Observable<Producto> {
    // Verificar si ya existe un producto con ese ID
    if (this.productos.some(p => p.id === producto.id)) {
      return throwError(() => new Error(`Ya existe un producto con ID ${producto.id}`));
    }

    // Generar un nuevo ID si no se proporciona uno
    if (!producto.id || producto.id === 0) {
      const maxId = this.productos.reduce((max, p) => p.id > max ? p.id : max, 0);
      producto.id = maxId + 1;
    }

    if(this.usarMySQL){
      return this.mysqlService.crearProducto(producto).pipe(
        map(productoCreado => {
          this.productos.push({...productoCreado});
          console.log('Producto agregado al inventario (MySQL):', productoCreado);
          return productoCreado;
        }),
        catchError(error => {
          console.error('Error al agregar producto en MySQL:', error);
          this.usarMySQL = false;
          //agregar localmente si falla
          this.productos.push({...producto});
          console.log('Producto agregado al inventario (local):', producto);
          return of({...producto});
        })
      );
    }else{
      //Agrega e producto localmente
      // Agregar el producto localmente
    this.productos.push({...producto});
    console.log('Producto agregado al inventario:', producto);
    
    return of({...producto});
    }
  }

  // Actualizar un producto existente
  actualizarProducto(producto: Producto): Observable<Producto> {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index === -1) {
      return throwError(() => new Error(`Producto con ID ${producto.id} no encontrado`));
    }

    if(this.usarMySQL){
      return this.mysqlService.actualizarProducto(producto).pipe(
        map(productoActualizado => {
          this.productos[index] = {...productoActualizado};
          console.log('Producto actualizado en el inventario (MySQL):', productoActualizado);
          return productoActualizado;
        }),
        catchError(error => {
          console.error('Error al actualizar en el inventario(local):', producto);
          this.usarMySQL = false;

          this.productos[index] = {...producto};
          console.log('')
          return of({...producto});
        })
      );
    }else{
      // Actualizar el producto
    this.productos[index] = {...producto};
    console.log('Producto actualizado en el inventario:', producto);  
    return of({...producto});
    }
  }

  actualizarCantidad(id: number, cantidad: number): Observable<Producto> {
    const index = this.productos.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Producto con ID ${id} no encontrado`));
    }

    if (this.usarMySQL) {
      // Primero obtenemos el producto completo
      return this.obtenerProductoPorId(id).pipe(
        switchMap(producto => {
          const productoActualizado = {...producto, cantidad};
          return this.mysqlService.actualizarProducto(productoActualizado).pipe(
            map(resultado => {
              // Actualizar caché local
              this.productos[index].cantidad = cantidad;
              console.log(`Cantidad actualizada para producto ID=${id} (MySQL): ${cantidad}`);
              return resultado;
            }),
            catchError(error => {
              console.error(`Error al actualizar cantidad en MySQL para ID=${id}:`, error);
              this.usarMySQL = false;
              
              // Actualizar localmente si falla MySQL
              this.productos[index].cantidad = cantidad;
              console.log(`Cantidad actualizada para producto ID=${id} (local): ${cantidad}`);
              return of({...this.productos[index]});
            })
          );
        })
      );
    } else {
      // Actualizar solo la cantidad localmente
      this.productos[index].cantidad = cantidad;
      console.log(`Cantidad actualizada para producto ID=${id} (local): ${cantidad}`);
      return of({...this.productos[index]});
    }
  }

  // Eliminar un producto
  eliminarProducto(id: number): Observable<boolean> {
    const index = this.productos.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Producto con ID ${id} no encontrado`));
    }

    if (this.usarMySQL) {
      return this.mysqlService.eliminarProducto(id).pipe(
        map(() => {
          // Eliminar de caché local
          this.productos.splice(index, 1);
          console.log(`Producto con ID ${id} eliminado del inventario (MySQL)`);
          return true;
        }),
        catchError(error => {
          console.error(`Error al eliminar producto en MySQL para ID=${id}:`, error);
          this.usarMySQL = false;
          
          // Eliminar localmente si falla MySQL
          this.productos.splice(index, 1);
          console.log(`Producto con ID ${id} eliminado del inventario (local)`);
          return of(true);
        })
      );
    } else {
      // Eliminar el producto localmente
      this.productos.splice(index, 1);
      console.log(`Producto con ID ${id} eliminado del inventario (local)`);
      return of(true);
    }
  }

  // GENERACIÓN DE XML

  // Generar XML con la lista actual de productos
  generarXML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n';

    // Agregar cada producto al XML
    this.productos.forEach(producto => {
      xml += `  <producto>\n`;
      xml += `    <id>${producto.id}</id>\n`;
      xml += `    <nombre>${this.escapeXML(producto.nombre)}</nombre>\n`;
      xml += `    <precio>${producto.precio.toFixed(2)}</precio>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `    <imagen>${this.escapeXML(producto.imagen)}</imagen>\n`;
      xml += `    <descripcion>${this.escapeXML(producto.descripcion)}</descripcion>\n`;
      xml += `  </producto>\n`;
    });

    xml += '</productos>';
    return xml;
  }

  // Escapar caracteres especiales para XML
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Descargar el XML generado
  descargarXML(): void {
    const xml = this.generarXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.xml';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // En un entorno real, aquí habría un método para enviar el XML al servidor
  // para sobrescribir el archivo existente. Como estamos en el navegador,
  // solo podemos simular esto con una descarga.
  guardarXML(): Observable<boolean> {
    // Simular guardado (en un entorno real, esto enviaría el XML al servidor)
    console.log('Guardando XML de productos...');
    this.descargarXML();
    return of(true);
  }

  // Método para cambiar la fuente de datos manualmente
  cambiarFuenteDeDatos(usarMySQL: boolean): void {
    if (this.usarMySQL !== usarMySQL) {
      this.usarMySQL = usarMySQL;
      this.cargarProductos(); // Recargar productos de la nueva fuente
    }
  }
}