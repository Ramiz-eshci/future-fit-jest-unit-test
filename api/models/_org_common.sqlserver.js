
const db = require('../config/database');

const commonSQLServer = {
  select: function (id, table, field = "id", where = "1=1", all_field = '*') {
    const sanitizedWhere = where.replace(/"/g, "'");
    // console.log(sanitizedWhere, "sanitizedWhere");
    return db.query(`SELECT ${all_field} FROM ${table} WHERE ${field}=${id} AND ${sanitizedWhere}`);
  },
  selectWhere: function (table, where) {
    const sanitizedWhere = where.replace(/"/g, "'");
    // console.log(sanitizedWhere, "sanitizedWhere");
    return db.query(`SELECT * FROM ${table} WHERE ${sanitizedWhere}`);
  },
  get_info: async function (id, table, field = "id", where = "", all_field = '*', search = false, join = [], GroupBy = false, OrderBy = [], limit = false, offset = false, QueryGet = false) {
    var query = `SELECT ${all_field} FROM ${table}`;
    if (join && join.length != 0) {
      join.forEach(e => {
        query += ` ${e.type} JOIN ${e.table} ON ${e.on}`;
      });
    }
    query += ` WHERE ${field}=${id}`;
    if (where != "") {
      
      const sanitizedWhere = where.replace(/"/g, "'");
      query += ` AND ${sanitizedWhere}`;
    }
    if (search && search.field.length > 0 && search.value != '') {
      search_query = '';
      search.field.forEach(function (e, i) {
        if ((i + 1) == search.field.length) {
          search_query += `(LOWER(${e}) LIKE '%${search.value}%')`; // changes ""
        }
        else {
          search_query += `(LOWER(${e}) LIKE '%${search.value}%') OR `; // changes ""
        }
      });
      query += ` AND ${search_query}`;
    }
    if (GroupBy) {
      query += ` GROUP BY ${GroupBy}`;
    }
    if (OrderBy && OrderBy.length != 0) {
      query += ` ORDER BY ${OrderBy.field} ${OrderBy.order}`;
    }
    if (limit) {
      // ORDER BY is mandatory in SQL Server when using OFFSET
      if (!OrderBy || OrderBy.length === 0) {
        query += ` ORDER BY ${field} ASC`;
      }
      query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    }
    // if (offset) {
    //     query += ` LIMIT ${offset},${limit}`;
    // }
    // else if (limit) {
    //     query += ` LIMIT ${limit}`;
    // }
    var result = await db.query(query);
    if (QueryGet) {
      return { query: query, result: result };
    }
    else {
      return result;
    }
  },
  check_is_exists: async function (table = "", value, field_name = "", id = 0, field = "id", spec_char = true, where = '') {
    var query = `SELECT ${field_name} FROM ${table}`;
    query += ` WHERE `;
    if (id != '' && id > 0) {
      query += ` AND ${field} != ${id}`;
    }
    if (where != '') {
      query += ` ${where}`;
    }
    query += ` AND ${field_name} = '${value}'`;
    var result = await db.query(query);
    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  query: function (query) {
    return db.query(query);
  },
  CustomQuery: async function (query) {
    // return db.query(query);
     const exeQuery = await db.query(query);
    // console.log(exeQuery, 'query -125');
    if(exeQuery && exeQuery[0]){
      // console.log(exeQuery[0], ' --- 127');
      return exeQuery[0];
    }else{
      return exeQuery;
    }
  },
  queryBuilder: function (query, params = []) {
    return db.query(query, params);
  },
  // insert: function (table, data) {
  //     return db.query(`INSERT INTO ${table} SET ?`, [data]);
  // },
  getPrimaryKeyColumn: async function (table) {
    const sql = `
    SELECT ccu.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
         ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
    WHERE tc.TABLE_NAME = @table AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
  `;
    const result = await db.query(sql, { table });
    // console.log(result, 'result');
    return result[0]?.COLUMN_NAME || null;
  },
  insert: async function (table, data) {
    // Escape values for SQL Server
    const escapeValue = val => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (val instanceof Date) {
        // Format date for SQL Server
        return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      }
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    // Build query
    const columns = Object.keys(data).map(col => `[${col}]`).join(', ');
    const values = Object.values(data).map(escapeValue).join(', ');
    const pkColumn = await this.getPrimaryKeyColumn(table);
    const outputColumn = pkColumn ? `OUTPUT INSERTED.[${pkColumn}] as insertId` : '';
    // SQL Server insert syntax + return inserted ID
    const query = `INSERT INTO ${table} (${columns}) ${outputColumn} VALUES (${values})`;
    const exeQuery = await db.query(query);
    // console.log(exeQuery, 'query -125');
    if(exeQuery && exeQuery[0]){
      // console.log(exeQuery[0], ' --- 127');
      return exeQuery[0];
    }else{
      return exeQuery;
    }
  },
  insertSubscribeEmail: function (table, data) {
    // Escape values for SQL Server
    const escapeValue = val => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (val instanceof Date) {
        // Format date for SQL Server
        return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      }
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    // Build query
    const columns = Object.keys(data).map(col => `[${col}]`).join(', ');
    const values = Object.values(data).map(escapeValue).join(', ');

    // SQL Server insert syntax + return inserted ID
    const query = `INSERT INTO ${table} (${columns}) OUTPUT INSERTED.id VALUES (${values})`;

    return db.query(query);
  },
  insertBulk: async function (values, table, fields) {
    var sql = `INSERT INTO ${table} (${fields}) VALUES ?`;
    return db.query(sql, [values]);
  },
  update: async function (table, where, data) {
    // console.log(data, 'data');
    // console.log(where, 'where');
    // console.log(table, 'table');

    const keys = Object.keys(data);
    const setClauses = keys.map((key, i) => `[${key}] = @param${i + 1}`).join(', ');
    const values = Object.values(data); // Convert object to array of values
    const sanitizedWhere = where.replace(/"/g, "'");
    const query = `UPDATE [${table}] SET ${setClauses} WHERE ${sanitizedWhere}`;
    // console.log(query, 'query');
    return db.query(query, values);
  },

  updateBulk: async function (table, data) {
    var total_update = 0;
    await data.forEach(async (e, i) => {
      var is_update = await db.query(`UPDATE ${table} SET ? WHERE ${e.where}`, [e.values]);
      // if(is_update.affectedRows == 1){
      //     total_update +=1;
      // }
      // if(i == data.length){
      //     return total_update;
      // }
    });
  },
  delete: function (table, where) {
    return db.query(`DELETE FROM ${table} WHERE ${where}`);
  },
  remove_file: async function (filename, directory) {
    try {
      if (fs.existsSync(uploadPath + directory + filename)) {
        try {
          fs.unlinkSync(uploadPath + directory + filename);
          return true;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  send_email: function (toemail, dataobj, subject) {
    var frommail = dataobj.email_cred.EmailID;
    var transporter = nodemailer.createTransport({
      host: dataobj.email_cred.Host,
      port: dataobj.email_cred.Port,
      secure: true,
      auth: {
        user: frommail,
        pass: dataobj.email_cred.Password,
      }
    });
    ejs.renderFile('demo1.ejs', { dataobj }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: {
            name: dataobj.email_cred.Name,
            address: frommail
          },
          to: toemail,
          subject: subject,
          html: data,
          attachments: [
            {
              filename: dataobj.ResumeURL,
              path: dataobj.ResumeFile
            }
          ]
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
    });
  },
};

module.exports = commonSQLServer;
