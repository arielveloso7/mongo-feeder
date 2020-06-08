import mysql from 'mysql';

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mymovies'
});


connection.connect();


export default connection;