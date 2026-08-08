// implementations/CommonSQLServerDatabase.js
const sql = require("mssql");

class CommonSQLServerDatabase {
  constructor(config) {
    this.poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then(pool => {
        console.log("✅ Connected to SQL Server");
        return pool;
      })
      .catch(err => {
        console.error("❌ SQL Server Connection Error:", err);
        throw err;
      });
  }

  async query(query, values = []) {
    // console.log("Executing SQL Query:");
    // console.log(query, values);
    const pool = await this.poolPromise;
    const request = pool.request();


    if (Array.isArray(values)) {
      // Positional parameters
      values.forEach((val, idx) => {
        request.input(`param${idx + 1}`, val);
      });
    } else if (typeof values === 'object') {
      // Named parameters
      for (const [key, val] of Object.entries(values)) {
        request.input(key, val);
      }
    }
    return request.query(query).then(result => result.recordset);
  }
  async runQuery(query, values = []) {
    const pool = await this.poolPromise;
    const request = pool.request();

    values.forEach((val, idx) => {
      request.input(`param${idx + 1}`, val);
    });

    return request.query(query);
  }

  // ---------- SELECT ALL ----------
  async getAll(table) {
    const result = await this.runQuery(`SELECT * FROM ${table}`);
    return result.recordset;
  }

  // ---------- SELECT ONE BY ID ----------
  async select(id, table, key) {
    const result = await this.runQuery(
      `SELECT * FROM ${table} WHERE ${key} = @param1`,
      [id]
    );
    return result.recordset;
  }

  // ---------- SELECT WITH CONDITIONS ----------
  async selectWhere(table, whereObj) {
    const keys = Object.keys(whereObj);
    const where = keys.map((k, i) => `${k} = @param${i + 1}`).join(" AND ");
    const values = Object.values(whereObj);

    const result = await this.runQuery(
      `SELECT * FROM ${table} WHERE ${where}`,
      values
    );
    return result.recordset;
  }

  // ---------- INSERT ----------
  async insert(table, data) {
    const keys = Object.keys(data);
    const cols = keys.join(", ");
    const placeholders = keys.map((_, i) => `@param${i + 1}`).join(", ");
    const values = Object.values(data);

    const sqlQuery = `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`;
    await this.runQuery(sqlQuery, values);
    return { success: true };
  }

  // ---------- UPDATE ----------
  async update(table, data, whereObj) {
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `${k} = @param${i + 1}`).join(", ");
    const values = Object.values(data);

    const whereKeys = Object.keys(whereObj);
    const whereClause = whereKeys
      .map((k, i) => `${k} = @param${keys.length + i + 1}`)
      .join(" AND ");
    const whereValues = Object.values(whereObj);

    const sqlQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    await this.runQuery(sqlQuery, [...values, ...whereValues]);
    return { success: true };
  }

  // ---------- DELETE ----------
  async delete(table, whereObj) {
    const keys = Object.keys(whereObj);
    const whereClause = keys.map((k, i) => `${k} = @param${i + 1}`).join(" AND ");
    const values = Object.values(whereObj);

    const sqlQuery = `DELETE FROM ${table} WHERE ${whereClause}`;
    await this.runQuery(sqlQuery, values);
    return { success: true };
  }

  // ---------- GET INFO WITH SEARCH / SORT / PAGINATION ----------
  async get_info({ table, where = {}, search = {}, sort = {}, page = 1, limit = 10 }) {
    let sqlQuery = `SELECT * FROM ${table} WHERE 1=1 `;
    const values = [];

    // WHERE
    if (Object.keys(where).length > 0) {
      const where_query = Object.keys(where)
        .map((k, i) => {
          values.push(where[k]);
          return `${k} = @param${values.length}`;
        })
        .join(" AND ");
      sqlQuery += ` AND ${where_query}`;
    }

    // SEARCH
    if (search && search.field.length > 0 && search.value !== '') {
      const offsetIndex = params.length + 1;
      const search_query = search.field
        .map((e, i) => `(CAST(${e} AS NVARCHAR(MAX)) LIKE @param${offsetIndex + i})`)
        .join(" OR ");

      query += ` AND (${search_query})`;

      // 👇 push the WHOLE string, not its characters
      search.field.forEach(() => params.push(`%${search.value}%`));
    }

    // SORT
    if (sort.field) {
      sqlQuery += ` ORDER BY ${sort.field} ${sort.order || "ASC"}`;
    }

    // PAGINATION
    const offset = (page - 1) * limit;
    sqlQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const result = await this.runQuery(sqlQuery, values);
    return result.recordset;
  }
}

module.exports = CommonSQLServerDatabase;