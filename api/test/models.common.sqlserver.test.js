jest.mock('../config/database');

const db = require('../config/database');
const Common = require('../models/common.sqlserver');

const mockResult = [{ id: 1, name: 'A' }];
db.query = jest.fn().mockResolvedValue(mockResult);

describe('common.sqlserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.query.mockResolvedValue(mockResult);
  });

  describe('select', () => {
    it('should build a safe SELECT query with a parameterized id', async () => {
      const result = await Common.select(7, 'tbl_user', 'id');
      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM tbl_user WHERE id = @param1 AND 1=1',
        [7]
      );
    });

    it('should include an extra where clause when provided', async () => {
      await Common.select(7, 'tbl_user', 'id', 'is_deleted = 0');
      // second where passed via `where` parses `is_deleted = 0` -> parameterized
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_deleted = @param2'),
        [7, 0]
      );
    });
  });

  describe('selectWhere', () => {
    it('should parameterize string literals in the where clause', async () => {
      await Common.selectWhere('tbl_user', 'email = "a@b.com" AND is_deleted = 0');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = @param1 AND is_deleted = @param2'),
        ['a@b.com', 0]
      );
    });

    it('should accept an object where clause', async () => {
      await Common.selectWhere('tbl_user', { email: 'a@b.com' });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = @param1'),
        ['a@b.com']
      );
    });
  });

  describe('get_info', () => {
    it('should build a query with search and order', async () => {
      const search = { field: ['name'], value: 'bob' };
      const orderBy = { field: 'name', order: 'ASC' };
      await Common.get_info(0, 'tbl_user', 'is_deleted', '', '*', search, [], false, orderBy);
      const [sql, values] = db.query.mock.calls[0];
      expect(sql).toContain('SELECT * FROM tbl_user');
      expect(sql).toContain('LOWER(name) LIKE @param2');
      expect(sql).toContain('ORDER BY name ASC');
      expect(values).toEqual([0, '%bob%']);
    });

    it('should add joins with validated join type', async () => {
      const join = [{ type: 'LEFT', table: 'tbl_company c', on: 'c.user_id = u.user_id' }];
      await Common.get_info(0, 'tbl_user u', 'is_deleted', '', 'u.user_id', false, join);
      const [sql] = db.query.mock.calls[0];
      expect(sql).toContain('LEFT JOIN tbl_company c ON c.user_id = u.user_id');
    });

    it('should apply pagination with OFFSET/FETCH when limit is set', async () => {
      const orderBy = { field: 'id', order: 'ASC' };
      await Common.get_info(0, 'tbl_user', 'is_deleted', '', '*', false, [], false, orderBy, 10, 0);
      const [sql] = db.query.mock.calls[0];
      expect(sql).toContain('OFFSET @param2 ROWS FETCH NEXT @param3 ROWS ONLY');
    });
  });

  describe('check_is_exists', () => {
    it('should return true when a match exists', async () => {
      db.query.mockResolvedValue([{ id: 1 }]);
      const exists = await Common.check_is_exists('tbl_user', 'a@b.com', 'email');
      expect(exists).toBe(true);
    });

    it('should return false when no match exists', async () => {
      db.query.mockResolvedValue([]);
      const exists = await Common.check_is_exists('tbl_user', 'a@b.com', 'email');
      expect(exists).toBe(false);
    });
  });

  describe('insert', () => {
    it('should escape values and build an INSERT query', async () => {
      db.query.mockResolvedValue([{ insertId: 99 }]);
      const result = await Common.insert('tbl_user', { name: "O'Brien", age: 30, active: true });
      expect(result).toEqual({ insertId: 99 });
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO tbl_user ([name], [age], [active])"));
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("'O''Brien'"));
    });
  });

  describe('update', () => {
    it('should build an UPDATE query with parameterized where', async () => {
      await Common.update('tbl_user', 'user_id = 5', { first_name: 'Rob' });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tbl_user SET [first_name] = @param1 WHERE user_id = @param2'),
        ['Rob', 5]
      );
    });
  });

  describe('updateBulk', () => {
    it('should run one update per entry and return the count', async () => {
      const data = [
        { where: 'user_id = 1', values: { email: 'a@b.com' } },
        { where: 'user_id = 2', values: { email: 'c@d.com' } },
      ];
      const count = await Common.updateBulk('tbl_user', data);
      expect(count).toBe(2);
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('delete', () => {
    it('should build a DELETE query', async () => {
      await Common.delete('tbl_user', 'user_id = 5');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tbl_user WHERE user_id = @param1'),
        [5]
      );
    });
  });

  describe('CustomQuery', () => {
    it('should return the first row from the db response', async () => {
      db.query.mockResolvedValue([{ a: 1 }]);
      const result = await Common.CustomQuery('SELECT 1');
      expect(result).toEqual({ a: 1 });
    });

    it('should return the raw response when empty', async () => {
      db.query.mockResolvedValue([]);
      const result = await Common.CustomQuery('SELECT 1');
      expect(result).toEqual([]);
    });
  });

  describe('getPrimaryKeyColumn', () => {
    it('should query INFORMATION_SCHEMA and return the pk column', async () => {
      db.query.mockResolvedValue([{ COLUMN_NAME: 'user_id' }]);
      const col = await Common.getPrimaryKeyColumn('tbl_user');
      expect(col).toBe('user_id');
    });

    it('should return null when no pk column found', async () => {
      db.query.mockResolvedValue([]);
      const col = await Common.getPrimaryKeyColumn('tbl_user');
      expect(col).toBeNull();
    });
  });

  describe('query / queryBuilder', () => {
    it('should pass the query through to db.query', async () => {
      await Common.query('SELECT 1');
      expect(db.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should pass query and params through queryBuilder', async () => {
      await Common.queryBuilder('SELECT ?', [1]);
      expect(db.query).toHaveBeenCalledWith('SELECT ?', [1]);
    });
  });

  describe('SQL safety', () => {
    it('should throw on SQL control characters in table names', () => {
      expect(() => Common.selectWhere('tbl_user; DROP TABLE', '1=1')).toThrow('Unsafe SQL table');
    });

    it('should throw on SQL control characters in where clauses', () => {
      expect(() => Common.selectWhere('tbl_user', "email = 'a@b.com'; DROP")).toThrow('Unsafe SQL where');
    });

    it('should throw on unsafe order direction', async () => {
      await expect(
        Common.get_info(0, 'tbl_user', 'id', '', '*', false, [], false, { field: 'id', order: 'DROP' })
      ).rejects.toThrow('Unsafe SQL order direction');
    });
  });
});