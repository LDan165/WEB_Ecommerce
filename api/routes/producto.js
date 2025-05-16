const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', (req, res) => {
    db.query('SELECT * FROM productos', (err, resultados) => {
        if(err) return res.status(500).send(err);
        res.json(resultados);
    });
});

// Obtener un producto por ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, resultados) => {
        if(err) return res.status(500).send(err);
        if(resultados.length === 0) return res.status(404).send('Producto no encontrado');
        res.json(resultados[0]);
    });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
    const { nombre, precio, cantidad, imagen, descripcion } = req.body;
    db.query(
        'INSERT INTO productos (nombre, precio, cantidad, imagen, descripcion) VALUES (?, ?, ?, ?, ?)',
        [nombre, precio, cantidad, imagen, descripcion],
        (err, resultado) => {
            if(err) return res.status(500).send(err);
            res.status(201).json({ id: resultado.insertId, ...req.body });
        }
    );
});

// Actualizar un producto
router.put('/:id', (req, res) => {
    const { nombre, precio, cantidad, imagen, descripcion } = req.body;
    db.query(
        'UPDATE productos SET nombre = ?, precio = ?, cantidad = ?, imagen = ?, descripcion = ? WHERE id = ?',
        [nombre, precio, cantidad, imagen, descripcion, req.params.id],
        (err, resultado) => {
            if(err) return res.status(500).send(err);
            if(resultado.affectedRows === 0) return res.status(404).send('Producto no encontrado');
            res.json({ id: parseInt(req.params.id), ...req.body });
        }
    );
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err, resultado) => {
        if(err) return res.status(500).send(err);
        if(resultado.affectedRows === 0) return res.status(404).send('Producto no encontrado');
        res.status(204).send();
    });
});

module.exports = router;