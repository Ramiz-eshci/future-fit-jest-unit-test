jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));
jest.mock('node-input-validator', () => {
  class Validator {
    constructor() {
      this.errors = { category_name: { message: 'category_name is required' } };
    }
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

const be04 = require('../controllers/be04_category.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('be04_category.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should reject a duplicate category name', async () => {
      Common.selectWhere.mockResolvedValue([{ category_id: 1 }]);
      const res = mockRes();
      await be04.add({ body: { category_name: 'Cat' }, userData: { UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This category already exists.' }));
    });

    it('should insert a new category on success', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await be04.add({ body: { category_name: 'Cat' }, userData: { UserID: 1 } }, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_be04_category',
        expect.objectContaining({ category_name: 'Cat', created_by: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await be04.add({ body: {}, userData: { UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('getById', () => {
    it('should return the category', async () => {
      Common.get_info.mockResolvedValue([{ category_id: 1, category_name: 'Cat' }]);
      const res = mockRes();
      await be04.getById({ params: { category_id: 1 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_be04_category c', 'c.category_id', '1=1', expect.stringContaining('category_name'), false, []);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when the category is not found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await be04.getById({ params: { category_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Category Not Found' }));
    });
  });

  describe('delete', () => {
    it('should soft-delete the category', async () => {
      Common.selectWhere.mockResolvedValue([{ category_id: 1 }]);
      const res = mockRes();
      await be04.delete({ params: { category_id: 1 }, userData: { UserID: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be04_category',
        'category_id = 1',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when not found or already deleted', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await be04.delete({ params: { category_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Datatable', () => {
    it('should return paginated categories with totals', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalCategories: 4 }])
        .mockResolvedValueOnce([{ category_id: 1 }]);
      const res = mockRes();
      await be04.Datatable({ query: { page: 1, per_page: 5, filter: 'cat' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1 }));
      const where = Common.get_info.mock.calls[0][3];
      expect(where).toContain("category_name LIKE");
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalCategories: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await be04.Datatable({ query: { page: 1, per_page: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('edit', () => {
    it('should update the category name', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ category_id: 1 }])  // exists
        .mockResolvedValueOnce([]); // not duplicate
      const res = mockRes();
      await be04.edit({ params: { category_id: 1 }, body: { category_name: 'New' }, userData: { UserID: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be04_category',
        'category_id = 1',
        expect.objectContaining({ category_name: 'New', modified_by: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when the category does not exist', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await be04.edit({ params: { category_id: 1 }, body: { category_name: 'New' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject a duplicate category name on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ category_id: 1 }])
        .mockResolvedValueOnce([{ category_id: 2 }]);
      const res = mockRes();
      await be04.edit({ params: { category_id: 1 }, body: { category_name: 'Dup' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate category name already exists.' }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await be04.add({ body: { category_name: 'Cat' } }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});