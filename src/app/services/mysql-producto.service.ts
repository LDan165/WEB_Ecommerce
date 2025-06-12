import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"; // Cambiado: eliminado 'type'
import { Observable, catchError, map, of } from "rxjs";
import { Producto } from "../models/producto"; 

@Injectable({
  providedIn: "root",
})
export class MySqlProductoService {
  private apiUrl = "http://localhost:3000/api/productos";

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((productos) => {
        console.log("Productos cargados desde MySQL:", productos);
        return productos;
      }),
      catchError((error) => {
        console.error("Error al obtener productos desde MySQL:", error);
        return of([]);
      })
    );
  }

  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizarProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${producto.id}`, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}