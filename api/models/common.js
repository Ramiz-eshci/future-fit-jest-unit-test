let common;
if (process.env.DB_TYPE === 'mysql') {
  common = require('./common.mysql');
 // console.log("Mysql common")
} else if (process.env.DB_TYPE === 'sqlserver') {
  common = require('./common.sqlserver');
 // console.log("Sql common")
}

module.exports = common;

// const db = require('../config/database');
// var async = require('async'), moment = require('moment')
 
// var ejs = require('ejs');
// var fs = require('fs');
// var nodemailer = require('nodemailer');

// var common = {
//     select: function (id, table, field = "id", where = "1=1", all_field = '*') {
//         return db.query(`SELECT ${all_field} FROM ${table} WHERE ${field}="${id}" AND ${where}`);
//     },
//     selectWhere: function (table, where) {
//         return db.query(`SELECT * FROM ${table} WHERE ${where}`);
//     },
//     get_info: async function (id, table, field = "id", where = "", all_field = '*', search = false, join = [], GroupBy = false, OrderBy = [], limit = false, offset = false, QueryGet = false) {
//         var query = `SELECT ${all_field} FROM ${table}`;
//         if (join && join.length != 0) {
//             join.forEach(e => {
//                 query += ` ${e.type} JOIN ${e.table} ON ${e.on}`;
//             });
//         }
//         query += ` WHERE ${field}='${id}'`;
//         if (where != "") {
//             query += ` AND ${where}`;
//         }
//         if (search && search.field.length > 0 && search.value != '') {
//             search_query = '';
//             search.field.forEach(function (e, i) {
//                 if ((i + 1) == search.field.length) {
//                     search_query += `(LOWER(${e}) LIKE "%${search.value}%")`;
//                 }
//                 else {
//                     search_query += `(LOWER(${e}) LIKE "%${search.value}%") OR `;
//                 }
//             });
//             query += ` AND ${search_query}`;
//         }
//         if (GroupBy) {
//             query += ` GROUP BY ${GroupBy}`;
//         }
//         if (OrderBy && OrderBy.length != 0) {
//             query += ` ORDER BY ${OrderBy.field} ${OrderBy.order}`;
//         }
//         if (offset) {
//             query += ` LIMIT ${offset},${limit}`;
//         }
//         else if (limit) {
//             query += ` LIMIT ${limit}`;
//         }
//         var result = await db.query(query);
//         if (QueryGet) {
//             return { query: query, result: result };
//         }
//         else {
//             return result;
//         }
//     },
//     check_is_exists: async function (table = "", value, field_name = "", id = 0, field = "id", spec_char = true, where = '') {
//         var query = `SELECT ${field_name} FROM ${table}`;
//         query += ` WHERE `;
//         if (id != '' && id > 0) {
//             query += ` AND ${field} != ${id}`;
//         }
//         if (where != '') {
//             query += ` ${where}`;
//         }
//         query += ` AND ${field_name} = '${value}'`;
//         var result = await db.query(query);
//         if (result.length > 0) {
//             return true;
//         } else {
//             return false;
//         }
//     },
//     query: function (query) {
//         return db.query(query);
//     },
//     CustomQuery: function (query) {
//         return db.query(query);
//     },
//     queryBuilder: function (query, params = []) {
//         return db.query(query, params);
//     },
//     insert: function (table, data) {
//         return db.query(`INSERT INTO ${table} SET ?`, [data]);
//     },
//     insertBulk: async function (values, table, fields) {
//         var sql = `INSERT INTO ${table} (${fields}) VALUES ?`;
//         return db.query(sql, [values]);
//     },
//     update: function (table, where, data) {
//         return db.query(`UPDATE ${table} SET ? WHERE ${where}`, [data]);
//     },
//     updateBulk: async function (table, data) {
//         var total_update = 0;
//         await data.forEach(async (e, i) => {
//             var is_update = await db.query(`UPDATE ${table} SET ? WHERE ${e.where}`, [e.values]);
             
//         });
//     },
//     delete: function (table, where) {
//         return db.query(`DELETE FROM ${table} WHERE ${where}`);
//     },
//     remove_file: async function (filename, directory) {
//         try {
//             if (fs.existsSync(uploadPath + directory + filename)) {
//                 try {
//                     fs.unlinkSync(uploadPath + directory + filename);
//                     return true;
//                 } catch (error) {
//                     console.log(error);
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     },
//     send_email: function (toemail, dataobj, subject) {
//         var frommail = dataobj.email_cred.EmailID;
//         var transporter = nodemailer.createTransport({
//             host: dataobj.email_cred.Host,
//             port: dataobj.email_cred.Port,
//             secure: true,
//             auth: {
//                 user: frommail,
//                 pass: dataobj.email_cred.Password,
//             }
//         });
//         ejs.renderFile('demo1.ejs', { dataobj }, (err, data) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 var mailOptions = {
//                     from: {
//                         name: dataobj.email_cred.Name,
//                         address: frommail
//                     },
//                     to: toemail,
//                     subject: subject,
//                     html: data,
//                     attachments: [
//                         {
//                             filename: dataobj.ResumeURL,
//                             path: dataobj.ResumeFile
//                         }
//                     ]
//                 };

//                 transporter.sendMail(mailOptions, function (error, info) {
//                     if (error) {
//                         console.log(error);
//                     } else {
//                         console.log('Email sent: ' + info.response);
//                     }
//                 });
//             }
//         });
//     },
// }

// module.exports = common;