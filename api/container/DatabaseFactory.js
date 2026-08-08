
const CommonMySQLDatabase = require("../implementations/MySQLDatabase");
const CommonSQLServerDatabase = require("../implementations/SQLServerDatabase");

function DatabaseFactory() {
  const type = process.env.DB_TYPE; // "mysql" or "sqlserver"
  const baseConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "0"),
  };

  switch (type) {
    case "mysql":
      return new CommonMySQLDatabase(baseConfig);

    case "sqlserver":
      return new CommonSQLServerDatabase({
        user: baseConfig.user,
        password: baseConfig.password,
        server: baseConfig.host,
        database: baseConfig.database,
        port: baseConfig.port,
        options: { encrypt: false, trustServerCertificate: true },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
      });

    default:
      throw new Error(`Unsupported DB type: ${type}`);
  }
}

module.exports = DatabaseFactory;
