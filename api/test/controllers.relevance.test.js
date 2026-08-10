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
      this.errors = { relevance_name: { message: 'relevance_name is required' } };
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

const relevance = require('../controllers/relevance.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('relevance.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should insert a new relevance', async () => {
      const res = mockRes();
      await relevance.add({ body: { relevance_name: 'High' } }, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_relevance',
        expect.objectContaining({ relevance_name: 'High', is_active: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance added successfully' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await relevance.add({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('edit', () => {
    it('should update the relevance on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ relevance_id: 1 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await relevance.edit({ params: { relevance_id: 1 }, body: { relevance_name: 'Low' } }, res);
      expect(Common.update).toHaveBeenCalledWith('tbl_relevance', 'relevance_id = 1', expect.objectContaining({ relevance_name: 'Low' }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance updated successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await relevance.edit({ params: { relevance_id: 1 }, body: { relevance_name: 'Low' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject a duplicate relevance name', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ relevance_id: 1 }])
        .mockResolvedValueOnce([{ relevance_id: 2 }]);
      const res = mockRes();
      await relevance.edit({ params: { relevance_id: 1 }, body: { relevance_name: 'Dup' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance name already exists' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await relevance.edit({ params: { relevance_id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('should soft delete the relevance', async () => {
      Common.selectWhere.mockResolvedValue([{ relevance_id: 1 }]);
      const res = mockRes();
      await relevance.delete({ params: { relevance_id: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith('tbl_relevance', 'relevance_id = 1', expect.objectContaining({ flag_deleted: 1 }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance soft deleted successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await relevance.delete({ params: { relevance_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('get', () => {
    it('should return the relevance list', async () => {
      Common.get_info.mockResolvedValue([{ relevance_id: 1 }]);
      const res = mockRes();
      await relevance.get({}, res);
      expect(Common.get_info).toHaveBeenCalledWith('', 'tbl_relevance', 'flag_deleted', 'flag_deleted = 0', 'relevance_id, relevance_name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance list found' }));
    });

    it('should return 404 when empty', async () => {
      const res = mockRes();
      await relevance.get({}, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'No records found' }));
    });
  });

  describe('getById', () => {
    it('should return the relevance', async () => {
      Common.get_info.mockResolvedValue([{ relevance_id: 1 }]);
      const res = mockRes();
      await relevance.getById({ params: { relevance_id: 1 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_relevance', 'relevance_id', 'flag_deleted = 0', 'relevance_id, relevance_name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevance Found' }));
    });

    it('should return 404 when not found', async () => {
      const res = mockRes();
      await relevance.getById({ params: { relevance_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Datatable', () => {
    it('should return paginated results', async () => {
      Common.get_info.mockResolvedValueOnce([{ Total: 4 }])
        .mockResolvedValueOnce([{ relevance_id: 1 }]);
      const res = mockRes();
      await relevance.Datatable({ query: { page: 1, per_page: 10 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Relevance list found' }));
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ Total: 0 }]);
      const res = mockRes();
      await relevance.Datatable({ query: { page: 1, per_page: 10, filter: 'High' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("relevance_name LIKE '%High%'");
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.insert.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await relevance.add({ body: { relevance_name: 'High' } }, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});