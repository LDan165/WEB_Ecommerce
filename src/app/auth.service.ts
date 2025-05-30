import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders } from "@angular/common/http"
import { type Observable, tap, BehaviorSubject, catchError, throwError } from "rxjs"
import type { Usuario } from "./models/usuario"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000"
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    this.verificarSesionGuardada()
  }

  private verificarSesionGuardada(): void {
    const usuarioGuardado = localStorage.getItem("usuario")
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado)
        this.currentUserSubject.next(usuario)
      } catch (error) {
        console.error("Error al parsear usuario guardado:", error)
        this.logout()
      }
    }
  }

  login(email: string, contrasena: string): Observable<any> {
    console.log("=== LOGIN DESDE AUTH SERVICE ===")
    console.log("Email:", email)
    console.log("Contraseña:", contrasena)
    console.log("URL:", `${this.apiUrl}/login`)

    // Configurar headers explícitamente
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    })

    // Crear el objeto de datos y convertirlo a JSON manualmente
    const loginData = { email, contrasena }
    const body = JSON.stringify(loginData)

    console.log("Body a enviar:", body)

    // Usar la opción observe: 'response' para ver la respuesta completa
    return this.http
      .post(`${this.apiUrl}/login`, loginData, {
        headers: headers,
      })
      .pipe(
        tap((respuesta: any) => {
          console.log("Respuesta del servidor:", respuesta)

          // Guardar información del usuario en localStorage
          localStorage.setItem("usuario", JSON.stringify(respuesta.usuario))
          localStorage.setItem("email", respuesta.usuario.email)
          localStorage.setItem("rol", respuesta.usuario.rol)
          localStorage.setItem("id", respuesta.usuario.id.toString())

          const token = "sesion_" + Date.now()
          localStorage.setItem("token", token)

          // Actualizar el subject
          this.currentUserSubject.next(respuesta.usuario)

          console.log("Usuario autenticado y guardado:", respuesta.usuario)
        }),
        catchError((error) => {
          console.error("Error en login:", error)
          console.error("Status:", error.status)
          console.error("Error body:", error.error)
          return throwError(() => error)
        }),
      )
  }

  // Método para obtener usuarios (para debugging)
  obtenerUsuarios(): Observable<any> {
    console.log("Obteniendo usuarios desde:", `${this.apiUrl}/usuarios`)
    return this.http.get(`${this.apiUrl}/usuarios`).pipe(
      tap((usuarios) => {
        console.log("Usuarios obtenidos:", usuarios)
      }),
      catchError((error) => {
        console.error("Error obteniendo usuarios:", error)
        return throwError(() => error)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("rol")
    localStorage.removeItem("usuario")
    localStorage.removeItem("email")
    localStorage.removeItem("id")
    this.currentUserSubject.next(null)
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem("token") && !!localStorage.getItem("usuario")
  }

  esAdmin(): boolean {
    return localStorage.getItem("rol") === "admin"
  }

  esCliente(): boolean {
    return localStorage.getItem("rol") === "cliente"
  }

  obtenerToken(): string | null {
    return localStorage.getItem("token")
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem("usuario")
    return usuario ? JSON.parse(usuario) : null
  }

  obtenerRol(): string | null {
    return localStorage.getItem("rol")
  }

  obtenerEmail(): string | null {
    return localStorage.getItem("email")
  }

  obtenerNombre(): string {
    const usuario = this.obtenerUsuario()
    return usuario?.nombre || usuario?.email || "Usuario"
  }

  obtenerId(): number | null {
    const id = localStorage.getItem("id")
    return id ? Number.parseInt(id, 10) : null
  }
}
