jest.mock('../implementations/MySQLDatabase');
jest.mock('../implementations/SQLServerDatabase');

const MySQLDatabase = require('../implementations/MySQLDatabase');
const SQLServerDatabase = require('../implementations/SQLServerDatabase');
const DatabaseFactory = require('../container/DatabaseFactory');

const OLD_DB_TYPE = process.env.DB_TYPE;

afterEach(() => {
  process.env.DB_TYPE = OLD_DB_TYPE;
  jest.clearAllMocks();
});

describe('DatabaseFactory', () => {
  it('should return a MySQLDatabase for DB_TYPE=mysql', () => {
    process.env.DB_TYPE = 'mysql';
    const db = DatabaseFactory();
    expect(db).toBeInstanceOf(MySQLDatabase);
    expect(MySQLDatabase).toHaveBeenCalledWith({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '0', 10),
    });
  });

  it('should return a SQLServerDatabase for DB_TYPE=sqlserver', () => {
    process.env.DB_TYPE = 'sqlserver';
    const db = DatabaseFactory();
    expect(db).toBeInstanceOf(SQLServerDatabase);
    expect(SQLServerDatabase).toHaveBeenCalledWith({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '0', 10),
      options: { encrypt: false, trustServerCertificate: true },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    });
  });

  it('should throw for an unsupported DB type', () => {
    process.env.DB_TYPE = 'postgres';
    expect(() => DatabaseFactory()).toThrow('Unsupported DB type: postgres');
  });
});