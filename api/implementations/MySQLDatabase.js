const mysql = require("mysql");

class CommonMySQLDatabase {
  constructor(config) {
    this.pool = mysql.createPool(config);
    console.log("✅ Connected to MySQL");
  }
  async query(sql, args) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, args, (err, rows) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
  // ---------- SELECT ALL ----------
  async getAll(table) {
    const [rows] = await this.pool.query(`SELECT * FROM \`${table}\``);
    return rows;
  }

  // ---------- SELECT ONE BY ID ----------
  async select(id, table, key) {
    const [rows] = await this.pool.query(
      `SELECT * FROM \`${table}\` WHERE \`${key}\` = ?`,
      [id]
    );
    return rows;
  }

  // ---------- SELECT WITH CONDITIONS ----------
  async selectWhere(table, whereObj) {
    const keys = Object.keys(whereObj);
    const where = keys.map(k => `\`${k}\` = ?`).join(" AND ");
    const values = Object.values(whereObj);

    const [rows] = await this.pool.query(
      `SELECT * FROM \`${table}\` WHERE ${where}`,
      values
    );
    return rows;
  }

  // ---------- INSERT ----------
  async insert(table, data) {
    const keys = Object.keys(data);
    const cols = keys.map(k => `\`${k}\``).join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const values = Object.values(data);

    const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`;
    await this.pool.query(sql, values);
    return { success: true };
  }

  // ---------- UPDATE ----------
  async update(table, data, whereObj) {
    const keys = Object.keys(data);
    const setClause = keys.map(k => `\`${k}\`=?`).join(", ");
    const values = Object.values(data);

    const whereKeys = Object.keys(whereObj);
    const whereClause = whereKeys.map(k => `\`${k}\`=?`).join(" AND ");
    const whereValues = Object.values(whereObj);

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
    await this.pool.query(sql, [...values, ...whereValues]);
    return { success: true };
  }

  // ---------- DELETE ----------
  async delete(table, whereObj) {
    const keys = Object.keys(whereObj);
    const whereClause = keys.map(k => `\`${k}\`=?`).join(" AND ");
    const values = Object.values(whereObj);

    const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
    await this.pool.query(sql, values);
    return { success: true };
  }

  // ---------- GET INFO WITH SEARCH / SORT / PAGINATION ----------
  async get_info({ table, where = {}, search = {}, sort = {}, page = 1, limit = 10 }) {
    let sql = `SELECT * FROM \`${table}\` WHERE 1=1 `;
    const values = [];

    // WHERE
    if (Object.keys(where).length > 0) {
      const where_query = Object.keys(where)
        .map(k => {
          values.push(where[k]);
          return `\`${k}\` = ?`;
        })
        .join(" AND ");
      sql += ` AND ${where_query}`;
    }

    // SEARCH
    if (search.field && search.field.length > 0 && search.value !== "") {
      const search_query = search.field
        .map(f => {
          values.push(`%${search.value.toLowerCase()}%`);
          return `LOWER(\`${f}\`) LIKE ?`;
        })
        .join(" OR ");
      sql += ` AND (${search_query})`;
    }

    // SORT
    if (sort.field) {
      sql += ` ORDER BY \`${sort.field}\` ${sort.order || "ASC"}`;
    }

    // PAGINATION
    const offset = (page - 1) * limit;
    sql += ` LIMIT ${offset}, ${limit}`;

    const [rows] = await this.pool.query(sql, values);
    return rows;
  }
}

module.exports = CommonMySQLDatabase;