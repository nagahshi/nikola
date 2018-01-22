const mysql      = require('mysql');

const connection = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
});

const errorHandler = (error, msg, reject) => {
  console.error(error)
  reject({ error: msg })
}


module.exports = {
  connection,
  errorHandler
}
