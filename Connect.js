import mysql from 'mysql2/promise'


const pool = mysql.createPool({
  host: '147.50.231.19',
  user: 'devsriwa_app_loan',
  password: '*Nattawut1234',
  database: 'devsriwa_app_loan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;