import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { Router, ActivatedRoute } from "@angular/router"
import  { AuthService } from "../../auth.service"
import  { LoginRequest } from "../../models/usuario"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: "",
    contrasena: "",
  }

  cargando = false
  error: string | null = null
  returnUrl = "/productos"

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/productos"
  }

  onSubmit(): void {
    console.log("🔐 === INTENTO DE LOGIN DESDE FRONTEND ===")
    console.log("📧 Email:", this.loginData.email)
    console.log("🔑 Contraseña:", this.loginData.contrasena)

    if (!this.loginData.email || !this.loginData.contrasena) {
      this.error = "Por favor, completa todos los campos"
      return
    }

    this.cargando = true
    this.error = null

    this.authService.login(this.loginData.email, this.loginData.contrasena).subscribe({
      next: (response) => {
        console.log("✅ Login exitoso:", response)
        this.cargando = false
        this.router.navigate([this.returnUrl])
      },
      error: (error) => {
        console.error("❌ Error en login:", error)
        this.cargando = false

        // Manejo de errores más específico
        if (error.status === 0) {
          this.error = "No se puede conectar al servidor. ¿Está ejecutándose en http://localhost:3000?"
        } else if (error.status === 401) {
          this.error = error.error?.error || "Credenciales incorrectas"
        } else if (error.status === 500) {
          this.error = "Error del servidor. Revisa la consola del backend."
        } else {
          this.error = error.error?.error || "Error al iniciar sesión"
        }
      },
    })
  }

  // Método para probar conexión
  probarConexion(): void {
    console.log("🧪 Probando conexión...")
    this.authService.obtenerUsuarios().subscribe({
      next: (usuarios: string | any[]) => {
        console.log("✅ Usuarios obtenidos:", usuarios)
        alert(`Conexión exitosa! Usuarios encontrados: ${usuarios.length}`)
      },
      error: (error: any) => {
        console.error("❌ Error de conexión:", error)
        alert("Error de conexión. Revisa la consola.")
      },
    })
  }

  // Métodos para usar credenciales rápidamente
  usarAdmin(): void {
    this.loginData.email = "admin@correo.com"
    this.loginData.contrasena = "1234"
  }

  usarCliente(): void {
    this.loginData.email = "cliente@correo.com"
    this.loginData.contrasena = "abcd"
  }
}
