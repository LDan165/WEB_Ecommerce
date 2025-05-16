import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './carrito/carrito.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AgregarProductoComponent } from './agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
export const routes: Routes = [
    {path:'', component:ProductoComponent},
    {path:'carrito', component:CarritoComponent},
    { path: 'inventario', component: InventarioComponent },
  { path: 'agregar-producto', component: AgregarProductoComponent },
  { path: 'editar-producto/:id', component: EditarProductoComponent },
  { path: '**', redirectTo: '' },
  {
    path: "",
    loadComponent: () => import("./inventario/inventario.component").then((m) => m.InventarioComponent),
  },
  {
    path: "carrito",
    loadComponent: () => import("./carrito/carrito.component").then((m) => m.CarritoComponent),
  },
  {
    path: "pago-exitoso",
    loadComponent: () => import("./pago-exitoso/pago-exitoso.component").then((m) => m.PagoExitosoComponent),
  },
  {
    path: "**",
    redirectTo: "",
  },
  
];
