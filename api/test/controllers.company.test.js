jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('node-input-validator', () => {
  class Validator {
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const bcrypt = require('bcryptjs');
const tableName = require('../controllers/common/table.controller');

const company = require('../controllers/company.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('company.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Common.insert.mockResolvedValue({ insertId: 1 });
    bcrypt.hash.mockResolvedValue('hashed');
  });

  describe('index', () => {
    it('should return the company list when found', async () => {
      Common.get_info.mockResolvedValue([{ company_id: 1, company_name: 'A' }]);
      const res = mockRes();
      await company.index({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, message: 'Company List Found' })
      );
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await company.index({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Company List Empty' })
      );
    });

    it('should delegate errors to Logs.ErrorHandler', async () => {
      Common.get_info.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await company.index({}, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });

  describe('add', () => {
    const body = {
      CompanyName: 'ESH',
      CompanyNumber: '123',
      CompanyEmail: 'a@b.com',
      CompanyAddress: 'addr',
      FirstName: 'A',
      LastName: 'B',
      password: 'secret',
    };

    it('should reject a duplicate company name', async () => {
      Common.selectWhere.mockResolvedValue([{ company_id: 1 }]);
      const res = mockRes();
      await company.add({ body }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Client Name already exits' })
      );
    });

    it('should reject a duplicate email', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([]) // company name
        .mockResolvedValueOnce([{ user_id: 1 }]); // email
      const res = mockRes();
      await company.add({ body }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Email already exits' })
      );
    });

    it('should insert company, user and reference year on success', async () => {
      Common.selectWhere.mockResolvedValue([]);
      Common.get_info.mockResolvedValue([{ ref_year: 2024, ref_year_value: 1 }]);
      const res = mockRes();
      await company.add({ body }, res);
      expect(Common.insert).toHaveBeenCalledWith(
        tableName.TBL_COMPANY,
        expect.objectContaining({ company_name: 'ESH' })
      );
      expect(Common.insert).toHaveBeenCalledWith(
        tableName.TBL_USERS,
        expect.objectContaining({ company_id: 1, password: 'hashed' })
      );
      expect(Common.insert).toHaveBeenCalledWith(
        tableName.TBL_BE_REFERENCE_YEAR,
        expect.objectContaining({ ref_year: 2024, company_id: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('edit', () => {
    it('should return 400 for an invalid company id', async () => {
      const res = mockRes();
      await company.edit({ params: { company_id: 'abc' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid company_id' })
      );
    });

    it('should reject a duplicate company name', async () => {
      Common.selectWhere.mockResolvedValue([{ company_id: 1 }]);
      const res = mockRes();
      await company.edit(
        { params: { company_id: 5 }, body: { CompanyName: 'ESH', CompanyEmail: 'a@b.com' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Company Name already exits' })
      );
    });

    it('should update company and admin user on success', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await company.edit(
        {
          params: { company_id: 5 },
          body: { CompanyName: 'ESH', CompanyEmail: 'a@b.com', CompanyNumber: '1', CompanyAddress: 'x' },
        },
        res
      );
      expect(Common.update).toHaveBeenCalledWith(
        tableName.TBL_COMPANY,
        'company_id = 5',
        expect.objectContaining({ company_name: 'ESH' })
      );
      expect(Common.update).toHaveBeenCalledWith(
        tableName.TBL_USERS,
        'role_id = 2 AND company_id = 5',
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getById', () => {
    it('should return the company data with a join', async () => {
      Common.get_info.mockResolvedValue([{ company_name: 'ESH' }]);
      const res = mockRes();
      await company.getById({ params: { company_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        0,
        expect.stringContaining('c'),
        'c.is_deleted',
        'c.company_id=5',
        expect.any(String),
        false,
        expect.arrayContaining([expect.objectContaining({ type: 'LEFT' })])
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when no company is found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await company.getById({ params: { company_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('should soft-delete the company and its users', async () => {
      Common.get_info.mockResolvedValue([{ company_id: 5 }]);
      const res = mockRes();
      await company.delete({ params: { company_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        tableName.TBL_COMPANY,
        'company_id = 5',
        expect.objectContaining({ is_deleted: 1 })
      );
      expect(Common.update).toHaveBeenCalledWith(
        tableName.TBL_USERS,
        'company_id = 5',
        expect.objectContaining({ is_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for an unknown company', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await company.delete({ params: { company_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Company Not Found' })
      );
    });
  });

  describe('list', () => {
    it('should return an ordered company dropdown list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1, name: 'ESH' }]);
      const res = mockRes();
      await company.list({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        0,
        tableName.TBL_COMPANY,
        'is_deleted',
        '1=1',
        'company_id as id,company_name as name',
        false,
        false,
        false,
        { field: 'company_name', order: 'ASC' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('datatable', () => {
    it('should return paginated company data with total counts', async () => {
      Common.get_info.mockResolvedValueOnce([{ Totalcompanys: 10 }])
        .mockResolvedValueOnce([{ company_id: 1 }]);
      const res = mockRes();
      await company.datatable(
        { query: { page: 1, per_page: 5, filter: '' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 10, total_pages: 2, page: 1, per_page: 5 })
      );
    });
  });
});