const db = require('../config/database');

const SQL_CONTROL_PATTERN = /(;|--|\/\*|\*\/)/;
const IDENTIFIER_PATTERN = '(?:\\[[A-Za-z_][\\w]*\\]|[A-Za-z_][\\w]*)';
const RELATION_PATTERN = new RegExp(
  `^${IDENTIFIER_PATTERN}(?:\\.${IDENTIFIER_PATTERN})?(?:\\s+(?:AS\\s+)?${IDENTIFIER_PATTERN})?$`,
  'i'
);
const COLUMN_PATTERN = new RegExp(
  `^(?:\\d+|${IDENTIFIER_PATTERN}(?:\\.${IDENTIFIER_PATTERN})?)$`,
  'i'
);
const ORDER_DIRECTION_PATTERN = /^(ASC|DESC)$/i;

function assertSafeSqlFragment(fragment, name) {
  if (fragment === false || fragment === null || fragment === undefined || fragment === '') {
    return '';
  }

  const value = String(fragment).replace(/"/g, "'");
  if (SQL_CONTROL_PATTERN.test(value)) {
    throw new Error(`Unsafe SQL ${name}`);
  }
  return value;
}

function assertSafeRelation(value, name = 'relation') {
  const relation = assertSafeSqlFragment(value, name).trim();
  if (!RELATION_PATTERN.test(relation)) {
    throw new Error(`Unsafe SQL ${name}`);
  }
  return relation;
}

function assertSafeColumn(value, name = 'column') {
  const column = assertSafeSqlFragment(value, name).trim();
  if (!COLUMN_PATTERN.test(column)) {
    throw new Error(`Unsafe SQL ${name}`);
  }
  return column;
}

function assertSafeProjection(value) {
  return assertSafeSqlFragment(value || '*', 'projection');
}

function assertSafeGroupBy(value) {
  const groupBy = assertSafeSqlFragment(value, 'group by').trim();
  if (!/^[A-Za-z0-9_\.\[\],\s]+$/.test(groupBy)) {
    throw new Error('Unsafe SQL group by');
  }
  return groupBy;
}

function addParam(values, value) {
  values.push(value);
  return `@param${values.length}`;
}

function normalizeScalar(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      return trimmed.slice(1, -1);
    }
  }
  return value;
}

function parameterizeSqlFragment(fragment, values, name = 'where') {
  let sql = assertSafeSqlFragment(fragment, name);
  if (!sql) {
    return '';
  }

  sql = sql.replace(/'(?:''|[^'])*'/g, (match) => {
    const value = match.slice(1, -1).replace(/''/g, "'");
    return addParam(values, value);
  });

  sql = sql.replace(/\bIN\s*\(([^)]*)\)/gi, (match, content) => {
    const items = content.split(',').map(item => item.trim()).filter(Boolean);
    if (!items.length || !items.every(item => /^-?\d+(?:\.\d+)?$/.test(item))) {
      return match;
    }
    const params = items.map(item => addParam(values, Number(item)));
    return `IN (${params.join(', ')})`;
  });

  sql = sql.replace(
    new RegExp(`(${IDENTIFIER_PATTERN}(?:\\.${IDENTIFIER_PATTERN})?|\\))\\s*(=|<>|!=|>=|<=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)`, 'gi'),
    (match, left, operator, numberValue) => {
      return `${left} ${operator} ${addParam(values, Number(numberValue))}`;
    }
  );

  if (/\b(OR|AND)\s+@param\d+\s*(=|<>|!=|LIKE)\s*@param\d+/i.test(sql)) {
    throw new Error(`Unsafe SQL ${name}`);
  }

  return sql;
}

function buildWhereFromObject(whereObj, values) {
  return Object.keys(whereObj)
    .map((key) => `${assertSafeColumn(key, 'where column')} = ${addParam(values, whereObj[key])}`)
    .join(' AND ');
}

function buildWhere(where, values, name = 'where') {
  if (where && typeof where === 'object' && !Array.isArray(where)) {
    return buildWhereFromObject(where, values);
  }
  return parameterizeSqlFragment(where, values, name);
}

function getSafeOrderBy(OrderBy) {
  if (!OrderBy || OrderBy.length === 0) {
    return '';
  }

  const field = assertSafeColumn(OrderBy.field, 'order by field');
  const order = OrderBy.order ? String(OrderBy.order).toUpperCase() : 'ASC';
  if (!ORDER_DIRECTION_PATTERN.test(order)) {
    throw new Error('Unsafe SQL order direction');
  }
  return ` ORDER BY ${field} ${order}`;
}

function toPositiveInteger(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInteger(value, fallback = 0) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

const commonSQLServer = {
  select: function (id, table, field = "id", where = "1=1", all_field = '*') {
    const values = [normalizeScalar(id)];
    const safeTable = assertSafeRelation(table, 'table');
    const safeField = assertSafeColumn(field, 'field');
    const safeFields = assertSafeProjection(all_field);
    const whereClause = buildWhere(where, values);
    const query = `SELECT ${safeFields} FROM ${safeTable} WHERE ${safeField} = @param1${whereClause ? ` AND ${whereClause}` : ''}`;
    return db.query(query, values);
  },
  // selectWhere: function (table, where, all_field = '*') {
  //   const values = [];
  //   const safeTable = assertSafeRelation(table, 'table');
  //   const safeFields = assertSafeProjection(all_field);
  //   const whereClause = buildWhere(where || '1=1', values);
  //   return db.query(`SELECT ${safeFields} FROM ${safeTable} WHERE ${whereClause}`, values);
  // },
  selectWhere(table, where, all_field = '*') {
    const values = [];
    const safeTable = assertSafeRelation(table, "table");
    const safeFields = assertSafeProjection(all_field);
    const whereClause = buildWhere(where || '1=1', values);

    return db.query(
      `SELECT *
         FROM ${safeTable}
         WHERE ${whereClause}`,values
    );
  },
  get_info: async function (id, table, field = "id", where = "", all_field = '*', search = false, join = [], GroupBy = false, OrderBy = [], limit = false, offset = false, QueryGet = false) {
    const values = [normalizeScalar(id)];
    const safeTable = assertSafeRelation(table, 'table');
    const safeField = assertSafeColumn(field, 'field');
    var query = `SELECT ${assertSafeProjection(all_field)} FROM ${safeTable}`;
    if (join && join.length != 0) {
      join.forEach(e => {
        const joinType = String(e.type || '').toUpperCase();
        if (!/^(INNER|LEFT|RIGHT|FULL|CROSS)$/.test(joinType)) {
          throw new Error('Unsafe SQL join type');
        }
        const joinOn = buildWhere(e.on, values, 'join on');
        query += ` ${joinType} JOIN ${assertSafeRelation(e.table, 'join table')} ON ${joinOn}`;
      });
    }
    query += ` WHERE ${safeField} = @param1`;
    if (where !== "" && where !== false && where !== null && where !== undefined) {
      const whereClause = buildWhere(where, values);
      if (whereClause) {
        query += ` AND ${whereClause}`;
      }
    }
    if (search && search.field.length > 0 && search.value != '') {
      let search_query = '';
      search.field.forEach(function (e, i) {
        const safeSearchField = assertSafeColumn(e, 'search field');
        const param = addParam(values, `%${search.value}%`);
        search_query += `(${safeSearchField} LIKE ${param})`;
        if ((i + 1) !== search.field.length) {
          search_query += ' OR ';
        }
      });
      query += ` AND (${search_query})`;
    }
    if (GroupBy) {
      query += ` GROUP BY ${assertSafeGroupBy(GroupBy)}`;
    }
    query += getSafeOrderBy(OrderBy);
    if (limit) {
      // ORDER BY is mandatory in SQL Server when using OFFSET
      if (!OrderBy || OrderBy.length === 0) {
        query += ` ORDER BY ${safeField} ASC`;
      }
      query += ` OFFSET ${addParam(values, toNonNegativeInteger(offset))} ROWS FETCH NEXT ${addParam(values, toPositiveInteger(limit, 10))} ROWS ONLY`;
    }
    // if (offset) {
    //     query += ` LIMIT ${offset},${limit}`;
    // }
    // else if (limit) {
    //     query += ` LIMIT ${limit}`;
    // }
    var result = await db.query(query, values);
    if (QueryGet) {
      return { query: query, result: result };
    }
    else {
      return result;
    }
  },
  check_is_exists: async function (table = "", value, field_name = "", id = 0, field = "id", spec_char = true, where = '') {
    const values = [];
    const safeTable = assertSafeRelation(table, 'table');
    const safeFieldName = assertSafeColumn(field_name, 'field name');
    const safeField = assertSafeColumn(field, 'field');
    const conditions = [];
    if (id != '' && id > 0) {
      conditions.push(`${safeField} != ${addParam(values, normalizeScalar(id))}`);
    }
    if (where != '') {
      const whereClause = buildWhere(where, values);
      if (whereClause) {
        conditions.push(whereClause);
      }
    }
    conditions.push(`${safeFieldName} = ${addParam(values, value)}`);
    var query = `SELECT ${safeFieldName} FROM ${safeTable} WHERE ${conditions.join(' AND ')}`;
    var result = await db.query(query, values);
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
    if (exeQuery && exeQuery[0]) {
      // console.log(exeQuery[0], ' --- 127');
      return exeQuery[0];
    } else {
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
    if (exeQuery && exeQuery[0]) {
      // console.log(exeQuery[0], ' --- 127');
      return exeQuery[0];
    } else {
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

    const safeTable = assertSafeRelation(table, 'table');
    const keys = Object.keys(data);
    const setClauses = keys.map((key, i) => `[${assertSafeColumn(key, 'update column')}] = @param${i + 1}`).join(', ');
    const values = Object.values(data); // Convert object to array of values
    const whereClause = buildWhere(where, values);
    const query = `UPDATE ${safeTable} SET ${setClauses} WHERE ${whereClause}`;
    // console.log(query, 'query');
    return db.query(query, values);
  },

  updateBulk: async function (table, data) {
    var total_update = 0;
    for (const e of data) {
      await this.update(table, e.where, e.values);
      total_update += 1;
    }
    return total_update;
  },
  delete: function (table, where) {
    const values = [];
    const safeTable = assertSafeRelation(table, 'table');
    const whereClause = buildWhere(where, values);
    return db.query(`DELETE FROM ${safeTable} WHERE ${whereClause}`, values);
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
