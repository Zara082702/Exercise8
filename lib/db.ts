import mysql from 'mysql2/promise';

// Create the connection pool to your local XAMPP MySQL
export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',       // Default XAMPP user
  password: '',       // Default XAMPP password (usually empty)
  database: 'neighbornotes', 
});