const DatabaseFactory = require('./../container/DatabaseFactory');

const db = DatabaseFactory();

module.exports = db;

// const mysql = require('mysql');
// class Database {
//     constructor() {
//         var config = {
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASS,
//             database: process.env.DB_NAME,
//             port: process.env.DB_PORT 
//         }
//         this.connection = mysql.createPool(config);
//     }
//     query(sql, args) {
//         return new Promise((resolve, reject) => {
//             this.connection.query(sql, args, (err, rows) => {
//                 if (err) {
//                     console.log(err);
//                     return reject(err);
//                 }
//                 resolve(rows);
//             });
//         });
//     }
//     close() {
//         return new Promise((resolve, reject) => {
//             this.connection.end(err => {
//                 if (err)
//                     return reject(err);
//                 resolve();
//             });
//         });
//     }
// }

// module.exports = new Database();