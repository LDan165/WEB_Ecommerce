import { Component } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  usuario = ""
  contrasena = ""
  cargando = false
  error = ""

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  login() {
    // Validación básica
    if (!this.usuario || !this.contrasena) {
      this.error = "Por favor, completa todos los campos"
      return
    }

    if (!this.isValidEmail(this.usuario)) {
      this.error = "Por favor, ingresa un email válido"
      return
    }

    this.cargando = true
    this.error = ""

    // Usar AuthService para login con base de datos
    this.authService.login(this.usuario, this.contrasena).subscribe({
      next: (respuesta) => {
        console.log("Login exitoso:", respuesta)
        this.cargando = false

        // Mostrar mensaje de bienvenida
        const nombreUsuario = respuesta.usuario.nombre || respuesta.usuario.email
        console.log(`Bienvenido ${nombreUsuario} (${respuesta.usuario.rol})`)

        // Redirigir según el rol
        const rol = respuesta.usuario.rol
        if (rol === "admin") {
          this.router.navigate(["/inventario"])
        } else {
          this.router.navigate(["/productos"])
        }
      },
      error: (err) => {
        console.error("Error en login:", err)
        this.cargando = false

        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.error = "Email o contraseña incorrectos"
        } else if (err.status === 500) {
          this.error = "Error del servidor. Intenta más tarde"
        } else if (err.status === 0) {
          this.error = "No se puede conectar al servidor. Verifica que esté ejecutándose"
        } else {
          this.error = err.error?.error || "Error al iniciar sesión"
        }
      },
    })
  }

   // Validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

   // Limpiar formulario
  limpiarFormulario(): void {
    this.usuario = ""
    this.contrasena = ""
    this.error = ""
  }
}
