jest.mock('mssql');

const sql = require('mssql');
const CommonSQLServerDatabase = require('../implementations/SQLServerDatabase');

const recordset = [{ id: 1, name: 'A' }];
const request = {
  input: jest.fn().mockReturnValue(null),
  query: jest.fn().mockResolvedValue({ recordset }),
};
const pool = {
  request: jest.fn(() => request),
};

const poolPromise = Promise.resolve(pool);
sql.ConnectionPool = jest.fn(() => ({ connect: jest.fn(() => poolPromise) }));

const db = () => Object.values(require.cache)
  .filter(m => m && m.exports instanceof CommonSQLServerDatabase)
  .map(m => m.exports)[0];

describe('CommonSQLServerDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    request.query.mockResolvedValue({ recordset });
    pool.request.mockReturnValue(request);
  });

  describe('query', () => {
    it('should add positional params and return the recordset', async () => {
      const db = new CommonSQLServerDatabase({});
      const result = await db.query('SELECT * FROM t WHERE id = @param1', [5]);
      expect(result).toEqual(recordset);
      expect(request.input).toHaveBeenCalledWith('param1', 5);
      expect(request.query).toHaveBeenCalledWith('SELECT * FROM t WHERE id = @param1');
    });

    it('should support named parameters via object values', async () => {
      const db = new CommonSQLServerDatabase({});
      await db.query('SELECT * FROM t WHERE id = @id', { id: 3 });
      expect(request.input).toHaveBeenCalledWith('id', 3);
    });
  });

  describe('runQuery', () => {
    it('should return the full query result including recordset', async () => {
      const db = new CommonSQLServerDatabase({});
      const result = await db.runQuery('SELECT * FROM t', [1]);
      expect(result).toEqual({ recordset });
    });
  });

  describe('getAll', () => {
    it('should select all columns from the table', async () => {
      const db = new CommonSQLServerDatabase({});
      const result = await db.getAll('tbl_user');
      expect(result).toEqual(recordset);
      expect(request.query).toHaveBeenCalledWith('SELECT * FROM tbl_user');
    });
  });

  describe('select', () => {
    it('should select a row by key', async () => {
      const db = new CommonSQLServerDatabase({});
      const result = await db.select(9, 'tbl_user', 'user_id');
      expect(result).toEqual(recordset);
      expect(request.query).toHaveBeenCalledWith('SELECT * FROM tbl_user WHERE user_id = @param1');
      expect(request.input).toHaveBeenCalledWith('param1', 9);
    });
  });

  describe('selectWhere', () => {
    it('should build a WHERE clause from an object', async () => {
      const db = new CommonSQLServerDatabase({});
      await db.selectWhere('tbl_user', { email: 'a@b.com', is_active: 1 });
      expect(request.query).toHaveBeenCalledWith('SELECT * FROM tbl_user WHERE email = @param1 AND is_active = @param2');
      expect(request.input).toHaveBeenCalledWith('param1', 'a@b.com');
      expect(request.input).toHaveBeenCalledWith('param2', 1);
    });
  });

  describe('insert', () => {
    it('should build an INSERT query', async () => {
      const db = new CommonSQLServerDatabase({});
      const result = await db.insert('tbl_user', { name: 'A', age: 30 });
      expect(result).toEqual({ success: true });
      expect(request.query).toHaveBeenCalledWith('INSERT INTO tbl_user (name, age) VALUES (@param1, @param2)');
    });
  });

  describe('update', () => {
    it('should build an UPDATE query with where values appended', async () => {
      const db = new CommonSQLServerDatabase({});
      await db.update('tbl_user', { first_name: 'Rob' }, { user_id: 1 });
      expect(request.query).toHaveBeenCalledWith('UPDATE tbl_user SET first_name = @param1 WHERE user_id = @param2');
      expect(request.input).toHaveBeenCalledWith('param1', 'Rob');
      expect(request.input).toHaveBeenCalledWith('param2', 1);
    });
  });

  describe('delete', () => {
    it('should build a DELETE query', async () => {
      const db = new CommonSQLServerDatabase({});
      await db.delete('tbl_user', { user_id: 1 });
      expect(request.query).toHaveBeenCalledWith('DELETE FROM tbl_user WHERE user_id = @param1');
    });
  });

  describe('get_info', () => {
    it('should build a paginated query with where/sort', async () => {
      const db = new CommonSQLServerDatabase({});
      await db.get_info({
        table: 'tbl_user',
        where: { is_deleted: 0 },
        search: { field: [], value: '' },
        sort: { field: 'name', order: 'ASC' },
        page: 2,
        limit: 5,
      });
      expect(request.query).toHaveBeenCalledWith('SELECT * FROM tbl_user WHERE 1=1  AND is_deleted = @param1 ORDER BY name ASC OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY');
    });
  });
});