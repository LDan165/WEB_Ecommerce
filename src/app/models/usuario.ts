export interface Usuario {
  id: number
  email: string
  nombre?: string
  rol: "admin" | "cliente"
  activo?: boolean
  fecha_creacion?: Date
}

export interface LoginRequest {
  email: string
  contrasena: string
}

export interface LoginResponse {
  mensaje: string
  usuario: Usuario
}

export interface RegistroRequest {
  email: string
  contrasena: string
  nombre?: string
  rol?: "admin" | "cliente"
}

// Enum para roles
export enum RolUsuario {
  ADMIN = "admin",
  CLIENTE = "cliente",
}
