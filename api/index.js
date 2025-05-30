const express = require("express")
const mysql = require("mysql")
const cors = require("cors")
const app = express()

// Middleware para CORS - permitir todas las solicitudes para pruebas
app.use(cors())

// Middleware para parsear JSON - configuración más permisiva
app.use(
  express.json({
    strict: false,
    limit: "1mb",
  }),
)

const productosRouter = require('./routes/producto');
app.use('/api/productos', productosRouter);



// Log de todas las requests para debugging
app.use((req, res, next) => {
  console.log(`\n📡 ${req.method} ${req.path}`)

  // Mostrar headers relevantes
  const relevantHeaders = {
    "content-type": req.headers["content-type"],
    origin: req.headers["origin"],
    "user-agent": req.headers["user-agent"],
  }
  console.log("Headers relevantes:", relevantHeaders)

  // Mostrar body si existe
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body recibido:", req.body)
  }

  next()
})

// Configuración de conexión a tu base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Cambia si usas contraseña
  database: "basededatos",
})

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a la base de datos:", err)
    return
  }
  console.log("✅ Conectado a la base de datos MySQL: basededatos")
})

// Ruta para verificar usuarios
app.get("/usuarios", (req, res) => {
  console.log("📋 Consultando usuarios...")
  const query = "SELECT id, email, password, rol FROM usuarios"
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error obteniendo usuarios:", err)
      return res.status(500).json({ error: "Error interno del servidor" })
    }
    console.log("✅ Usuarios encontrados:", results)
    res.json(results)
  })
})

// Ruta de login con manejo de errores mejorado
app.post("/login", (req, res) => {
  console.log("\n🔐 === INTENTO DE LOGIN ===")

  // Verificar si req.body existe y tiene la estructura esperada
  if (!req.body) {
    console.log("❌ Error: Body vacío o mal formateado")
    return res.status(400).json({
      error: "Datos de solicitud mal formateados",
    })
  }

  console.log("Body completo:", req.body)

  // Extraer email y contraseña del body
  const email = req.body.email
  const contrasena = req.body.contrasena || req.body.password // Aceptar ambos nombres

  console.log("Email extraído:", email)
  console.log("Contraseña extraída:", contrasena)

  // Validación de entrada
  if (!email || !contrasena) {
    console.log("❌ Error: Faltan datos")
    return res.status(400).json({
      error: "Email y contraseña son requeridos",
    })
  }

  // Consulta a la base de datos
  const query = "SELECT * FROM usuarios WHERE email = ?"

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("❌ Error en la base de datos:", err)
      return res.status(500).json({
        error: "Error interno del servidor",
      })
    }

    console.log("📊 Resultados encontrados:", results.length)

    if (results.length === 0) {
      console.log("❌ Usuario no encontrado")
      return res.status(401).json({
        error: "Usuario no encontrado",
      })
    }

    const usuario = results[0]
    console.log("👤 Usuario encontrado:")
    console.log("   - Email BD:", usuario.email)
    console.log("   - Password BD:", usuario.password)
    console.log("   - Password recibida:", contrasena)
    console.log("   - Rol:", usuario.rol)

    // Comparar contraseñas como strings
    const passwordBD = String(usuario.password)
    const passwordRecibida = String(contrasena)

    console.log("   - Password BD (string):", passwordBD)
    console.log("   - Password recibida (string):", passwordRecibida)
    console.log("   - ¿Coinciden?", passwordBD === passwordRecibida)

    if (passwordBD === passwordRecibida) {
      console.log("✅ Contraseñas coinciden - Login exitoso!")
      const respuesta = {
        mensaje: "Inicio de sesión exitoso",
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre || usuario.email.split("@")[0],
          rol: usuario.rol || "cliente",
        },
      }
      console.log("📤 Enviando respuesta:", respuesta)
      return res.json(respuesta)
    } else {
      console.log("❌ Contraseñas NO coinciden")
      return res.status(401).json({
        error: "Contraseña incorrecta",
      })
    }
  })
})

// Ruta de test
app.get("/test", (req, res) => {
  console.log("🧪 Test endpoint llamado")
  res.json({
    mensaje: "Servidor funcionando correctamente",
    timestamp: new Date(),
    database: "basededatos",
  })
})

// Iniciar servidor
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000")
  console.log("📋 Endpoints disponibles:")
  console.log("   - GET  /test")
  console.log("   - GET  /usuarios")
  console.log("   - POST /login")
  console.log("API corriendo en http://localhost:3000");
})


