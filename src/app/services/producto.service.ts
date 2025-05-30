import { Injectable, PLATFORM_ID, Inject } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { map, catchError } from "rxjs/operators"
import { isPlatformBrowser } from "@angular/common"
import { Producto } from "../models/producto"


@Injectable({
  providedIn: "root"
})
export class ProductoService {
  private xmlURL = "assets/productos.xml";

  constructor(
    private http: HttpClient
  ) {}

  // Obtener productos desde el XML
  obtenerProductos(): Observable<any[]> {
    // Verificamos si estamos en el navegador
    

    return this.http.get(this.xmlURL, { responseType: "text" }).pipe(
      map((xml) => {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xml, "text/xml");

          // Verificamos si hay errores de parsing
          const parserError = xmlDoc.querySelector("parsererror");
          if (parserError) {
            throw new Error("Error al parsear XML: " + parserError.textContent)
          }

          const productos = Array.from(xmlDoc.getElementsByTagName("producto"))
            .map((prod) => {
              // Extraemos todos los campos del XML con manejo de errores
              try {
                const id = prod.getElementsByTagName("id")[0]?.textContent || "0"
                const nombre = prod.getElementsByTagName("nombre")[0]?.textContent || "Sin nombre"
                const precioText = prod.getElementsByTagName("precio")[0]?.textContent || "0"
                const cantidadText = prod.getElementsByTagName("cantidad")[0]?.textContent || "0"
                const imagen = prod.getElementsByTagName("imagen")[0]?.textContent || "assets/images/default.jpg"
                const descripcion = prod.getElementsByTagName("descripcion")[0]?.textContent || ""

                // Convertimos los valores numéricos
                const precio = Number.parseFloat(precioText)
                const cantidad = Number.parseInt(cantidadText, 10)

                return {
                  id: Number(id),
                  nombre,
                  precio,
                  cantidad,
                  imagen,
                  descripcion,
                }
              } catch (err) {
                console.error("Error al procesar un producto:", err)
                return null
              }
            })
            .filter((item) => item !== null) // Filtramos los productos que fallaron

          console.log("Productos cargados desde XML:", productos)
          return productos
        } catch (error) {
          console.error("Error al procesar el XML:", error)
          throw error
        }
      }),
      catchError((error) => {
        console.error("Error al obtener o procesar el XML:", error)
        return of([]) // Devolvemos un array vacío en caso de error
      }),
    )
  }

  
}