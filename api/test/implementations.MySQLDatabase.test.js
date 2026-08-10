jest.mock('mysql');

const mysql = require('mysql');
const CommonMySQLDatabase = require('../implementations/MySQLDatabase');

function makePool() {
  return {
    query: jest.fn(),
  };
}

describe('CommonMySQLDatabase', () => {
  let pool;

  beforeEach(() => {
    pool = makePool();
    mysql.createPool.mockReturnValue(pool);
  });

  describe('query', () => {
    it('should resolve rows on success', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockImplementation((sql, args, cb) => cb(null, [{ id: 1 }]));
      const rows = await db.query('SELECT * FROM t', []);
      expect(rows).toEqual([{ id: 1 }]);
    });

    it('should reject on error', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockImplementation((sql, args, cb) => cb(new Error('db down')));
      await expect(db.query('SELECT 1', [])).rejects.toThrow('db down');
    });
  });

  describe('getAll', () => {
    it('should query all columns', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([[{ id: 1 }]]);
      const rows = await db.getAll('tbl_user');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM `tbl_user`');
      expect(rows).toEqual([{ id: 1 }]);
    });
  });

  describe('select', () => {
    it('should query by a key with a placeholder', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([[{ id: 5 }]]);
      const rows = await db.select(5, 'tbl_user', 'user_id');
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM `tbl_user` WHERE `user_id` = ?', [5]);
      expect(rows).toEqual([{ id: 5 }]);
    });
  });

  describe('selectWhere', () => {
    it('should build a where clause from an object', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([[]]);
      await db.selectWhere('tbl_user', { email: 'a@b.com' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM `tbl_user` WHERE `email` = ?', ['a@b.com']);
    });
  });

  describe('insert', () => {
    it('should insert with placeholders', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([{}]);
      const result = await db.insert('tbl_user', { name: 'A', age: 30 });
      expect(result).toEqual({ success: true });
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO `tbl_user` (`name`, `age`) VALUES (?, ?)', ['A', 30]);
    });
  });

  describe('update', () => {
    it('should update with set and where values', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([{}]);
      await db.update('tbl_user', { first_name: 'Rob' }, { user_id: 1 });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE `tbl_user` SET `first_name`=? WHERE `user_id`=?',
        ['Rob', 1]
      );
    });
  });

  describe('delete', () => {
    it('should delete by a where object', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([{}]);
      await db.delete('tbl_user', { user_id: 1 });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM `tbl_user` WHERE `user_id`=?', [1]);
    });
  });

  describe('get_info', () => {
    it('should build a paginated query with search and sort', async () => {
      const db = new CommonMySQLDatabase({});
      pool.query.mockResolvedValue([[]]);
      const rows = await db.get_info({
        table: 'tbl_user',
        where: { is_deleted: 0 },
        search: { field: ['name'], value: 'Bob' },
        sort: { field: 'name', order: 'DESC' },
        page: 2,
        limit: 5,
      });
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM `tbl_user` WHERE 1=1  AND `is_deleted` = ? AND (LOWER(`name`) LIKE ?) ORDER BY `name` DESC LIMIT 5, 5',
        [0, '%bob%']
      );
    });
  });
});