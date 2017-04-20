 var mysql = require('mysql')

 var pool = mysql.createPool({
   connectionLimit: 100, //important
   host: '127.0.0.1',
   user: 'yjd',
   password: 'YouJingDi4dashen!',
   database: 'mia_desktop',
   debug: false
 })

 module.exports = pool;

 /*var connection = mysql.createConnection({
   host: '192.168.99.100',
   user: 'yjd',
   password: 'youjingdi',
   database: 'mia_desktop'
 });

 connection.connect();

 connection.query('SELECT * from AppDimBrand', function(err, rows, fields) {
   if (!err)
     console.log('The solution is: ', rows);
   else
     console.log('Error while performing Query.');
 });

 connection.end();*/