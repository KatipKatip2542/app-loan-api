import mysql from 'mysql2/promise'


// const pool = mysql.createPool({
//   host: '147.50.231.19',
//   user: 'devsriwa_app_loan',
//   password: '*Nattawut1234',
//   database: 'devsriwa_app_loan',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const pool = mysql.createPool({
  host: 'db-mysql-nyc3-98575-do-user-16012941-0.c.db.ondigitalocean.com',
  user: 'doadmin',
  password: 'AVNS_ejmD-bpk8VHZJ1KfF9R',
  database: 'devsriwa_app_loan',
  port: 25060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;