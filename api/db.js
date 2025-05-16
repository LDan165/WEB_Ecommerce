const MySQL = require('mysql');
const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',               // Verifica que este sea tu usuario de MySQL
    password: '',               // Si no tienes contraseña, déjalo vacío
    database: 'basededatos'     // Asegúrate de que este sea el nombre correcto de tu base de datos
});

connection.connect((err) => {
    if(err) throw err;
    console.log('Conectado a MySQL');
});

module.exports = connection;