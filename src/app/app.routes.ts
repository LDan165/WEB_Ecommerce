import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './carrito/carrito.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AgregarProductoComponent } from './agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { PagoExitosoComponent } from './pago-exitoso/pago-exitoso.component';

export const routes: Routes = [
  
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },
  

  { path: 'login', component: LoginComponent },

  // Página principal protegida (requiere login)
  { path: 'productos', component: ProductoComponent},

  // Accesibles sin autenticación (o protégelas si quieres)
  { path: 'carrito', component: CarritoComponent },
  { path: 'pago-exitoso', component: PagoExitosoComponent },

  // Zonas protegidas solo para usuarios logueados (puedes refinar más con un AdminGuard si quieres)
  { path: 'inventario', component: InventarioComponent, canActivate: [AuthGuard] },
  { path: 'agregar-producto', component: AgregarProductoComponent, canActivate: [AuthGuard] },
  { path: 'editar-producto/:id', component: EditarProductoComponent, canActivate: [AuthGuard] },

  // Ruta comodín
  { path: '**', redirectTo: '/login' }
];
