import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { CarritoService } from "../services/carrito.service"
import { Producto } from "../models/producto"
import { Router } from "@angular/router"
import { RouterModule } from "@angular/router"
import { InventarioService } from "../inventario/inventario.service"
import { loadScript } from "@paypal/paypal-js"

declare var paypal: any;
@Component({
  selector: "app-carrito",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./carrito.component.html",
  styleUrl: "./carrito.component.css",
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = []
  stockDisponible: Map<number, number> = new Map()
  paypalScriptLoaded = false

  constructor(
    private carritoService: CarritoService,
    private inventarioService: InventarioService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Suscribirse al observable del carrito
    this.carritoService.carrito$.subscribe((productos) => {
      this.carrito = productos
      this.actualizarStockDisponible()
    })

   /* // Inicializar PayPal si hay productos en el carrito
    setTimeout(() => {
      if (this.carrito.length > 0) {
        this.initPayPal()
      }
    }, 1000)*/
    this.loadPayPalScript();
  }

  ngAfterViewInit() {
    // Si el script ya está cargado, renderizar el botón
    if (this.paypalScriptLoaded && this.carrito.length > 0) {
      this.renderPayPalButton()
    }
  }

  ngAfterViewChecked() {
    // Verificar si el contenedor existe
    const container = document.getElementById("paypal-button-container")
    console.log("¿Existe el contenedor de PayPal?", container ? "SÍ" : "NO")

    if (container) {
      console.log("Dimensiones del contenedor:", {
        width: container.offsetWidth,
        height: container.offsetHeight,
        visible: container.offsetParent !== null,
      })
    }
  }

 /* loadPayPalScript() {
    console.log("Iniciando carga del script de PayPal...")

    // Evitar cargar el script múltiples veces
    if (this.paypalScriptLoaded) {
      this.renderPayPalButton()
      return
    }

    // Crear el elemento script
    const script = document.createElement("script")
    script.src = "https://www.paypal.com/sdk/js?client-id=AQ7eModtB7MnB-V4QpbYm4nQ50m0xm6b_1h7DABF hJS8UQFxNtzf0mmOcaEz3hsZx-H6ZSJIAEpfj0l1&currency=MXN"
    script.async = true

    // Manejar eventos de carga
    script.onload = () => {
      console.log("Script de PayPal cargado correctamente")
      this.paypalScriptLoaded = true

      // Renderizar el botón si hay productos en el carrito
      if (this.carrito.length > 0) {
        setTimeout(() => {
          this.renderPayPalButton()
        }, 1000) // Pequeño retraso para asegurar que PayPal esté completamente inicializado
      }
    }

    script.onerror = (error) => {
      console.error("Error al cargar el script de PayPal:", error)
    }

    document.body.appendChild(script)
  }*/

    loadPayPalScript(): void {
      // Verificar si ya está cargado
      if (window.paypal) {
        this.renderPayPalButton();
        return;
      }
    
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AQ7eModtB7MnB-V4QpbYm4nQ50m0xm6b_1h7DABFhJS8UQFxNtzf0mmOcaEz3hsZx-H6ZSJIAEpfj0l1&currency=MXN';
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK cargado correctamente');
        this.paypalScriptLoaded = true;
        this.renderPayPalButton();
      };
      
      script.onerror = (error) => {
        console.error('Error al cargar PayPal SDK:', error);
      };
      
      document.body.appendChild(script);
    }
/*
  renderPayPalButton(): void {
    paypal.Buttons({
      createOrder: (data:any, actions:any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.calcularTotal().toFixed(2),
            }
          }]
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert('Pago completado por ' + details.payer.name.given_name);
          this.carritoService.vaciarCarrito();
          this.router.navigate(['/pago-exitoso']);
        });
      },
      onError: (err:any) => {
        console.error('Error en el pago: ', err);
        alert('Error en el pago. Intente nuevamente.');
      }
    }).render('#paypal-button-container');
  }*/

    renderPayPalButton() {
      if (!this.carrito.length) {
        console.log('No hay productos en el carrito, no se renderiza PayPal');
        return;
      }
    
      const container = document.getElementById('paypal-button-container');
      if (!container) {
        console.error('Contenedor de PayPal no encontrado');
        return;
      }
    
      container.innerHTML = '';
    
      try {
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: this.calcularTotal().toFixed(2),
                  currency_code: 'MXN'
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert(`Pago completado por ${details.payer.name.given_name}`);
              this.pagar();
              this.carritoService.vaciarCarrito();
              this.router.navigate(['/pago-exitoso']);
            });
          },
          onError: (err: any) => {
            console.error('Error en PayPal:', err);
            alert('Error al procesar el pago con PayPal');
          }
        }).render('#paypal-button-container');
      } catch (error) {
        console.error('Error al renderizar botón PayPal:', error);
      }
    }

  // Actualizar información de stock disponible
  actualizarStockDisponible() {
    this.inventarioService.obtenerProductos().subscribe((productos) => {
      productos.forEach((producto) => {
        this.stockDisponible.set(producto.id, producto.cantidad)
      })
    })
  }

  // Obtener stock disponible para un producto
  obtenerStockDisponible(producto: Producto): number {
    return this.stockDisponible.get(producto.id) || 0
  }

  // Mostrar alerta de stock bajo
  mostrarAlertaStock(producto: Producto): boolean {
    const stockDisponible = this.obtenerStockDisponible(producto)
    return stockDisponible > 0 && stockDisponible <= 5
  }

  // Incrementar cantidad de un producto
  incrementarCantidad(producto: Producto) {
    const stockDisponible = this.obtenerStockDisponible(producto)
    if (producto.cantidad < stockDisponible) {
      this.carritoService.actualizarCantidad(producto.id, producto.cantidad + 1)
    }
  }

  // Decrementar cantidad de un producto
  decrementarCantidad(producto: Producto) {
    if (producto.cantidad > 1) {
      this.carritoService.actualizarCantidad(producto.id, producto.cantidad - 1)
    } else {
      this.eliminarDelCarrito(producto.id)
    }
  }

  // Actualizar cantidad desde el input
  actualizarCantidad(producto: Producto, event: any) {
    const nuevaCantidad = Number.parseInt(event.target.value, 10)
    const stockDisponible = this.obtenerStockDisponible(producto)

    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
      this.eliminarDelCarrito(producto.id)
    } else if (nuevaCantidad > stockDisponible) {
      // Limitar a stock disponible
      this.carritoService.actualizarCantidad(producto.id, stockDisponible)
      event.target.value = stockDisponible
    } else {
      this.carritoService.actualizarCantidad(producto.id, nuevaCantidad)
    }
  }

  // Calcular subtotal (sin IVA)
  calcularSubtotal(): number {
    return this.carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0)
  }

  // Calcular IVA (16%)
  calcularIVA(): number {
    return this.calcularSubtotal() * 0.16
  }

  // Calcular total (subtotal + IVA)
  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIVA()
  }

  generaXML() {
    this.carritoService.generarXML()
  }

  eliminarDelCarrito(productoId: number) {
    this.carritoService.eliminarProducto(productoId)
  }

  volverAProductos() {
    this.router.navigate(["/"])
  }

  pagar() {
    const xml = this.carritoService.generarXML()
    const blob = new Blob([xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "recibo.xml"
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)

    // Vaciar el carrito después de pagar
    this.carritoService.vaciarCarrito()
  }
    // Método alternativo para pagar con PayPal
    iniciarPagoPayPal() {
      alert("Redirigiendo a PayPal...")
  
      // Crear un formulario para enviar a PayPal
      const form = document.createElement("form")
      form.method = "post"
      form.action = "https://www.sandbox.paypal.com/cgi-bin/webscr"
  
      // Añadir campos necesarios
      const campos: Record<string, string> = {
        cmd: "_xclick",
        business: "sb-47r8d25342552@business.example.com", // Email de sandbox para pruebas
        item_name: "Compra en Mi Tienda",
        amount: this.calcularTotal().toFixed(2),
        currency_code: "MXN",
        return: window.location.origin + "/pago-exitoso",
        cancel_return: window.location.origin + "/carrito",
      }
  
      // Crear inputs para cada campo
      for (const [name, value] of Object.entries(campos)) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        form.appendChild(input)
      }
  
      // Añadir el formulario al documento y enviarlo
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
}

