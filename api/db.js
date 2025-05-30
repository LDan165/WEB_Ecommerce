const MySQL = require('mysql');
const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',               
    password: '',               
    database: 'basededatos'     
});

connection.connect((err) => {
    if(err) throw err;
    console.log('Conectado a MySQL');
});

module.exports = connection;