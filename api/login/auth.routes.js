// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión MySQL
const bcrypt = require('bcrypt');

// Ruta de login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    // Comparar contraseñas (asumiendo que están encriptadas con bcrypt)
    bcrypt.compare(password, usuario.password, (err, match) => {
      if (match) {
        res.json({
          success: true,
          user: {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
    });
  });
});

module.exports = router;
