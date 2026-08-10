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
      this.errors = { purchase: { message: 'purchase is required' } };
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

const purchaseInfo = require('../controllers/purchase_information.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    purchase: '  Stationery  ',
    purchase_type: 'Consumable',
    year: '2024',
    cost: '500',
    company_id: 9,
    purchase_id: 'P-9',
    product_input: '1',
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { purchase_information_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('purchase_information.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should reject an existing purchase for the company', async () => {
      Common.selectWhere.mockResolvedValue([{ purchase_information_id: 1 }]);
      const res = mockRes();
      await purchaseInfo.add(req, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_purchase_information',
        expect.stringContaining('LOWER(purchase) = "stationery" AND company_id = 9')
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This purchase already exists under the selected company.' }));
    });

    it('should insert a new purchase', async () => {
      const res = mockRes();
      await purchaseInfo.add(req, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_purchase_information',
        expect.objectContaining({
          company_id: 9,
          purchase: '  Stationery  ',
          year: '2024',
          cost: '500',
          purchase_type: 'Consumable',
          is_active: 1,
          created_by: 1,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information has been added successfully' }));
    });

    it('should use userData.CompanyID for non-admin roles', async () => {
      const res = mockRes();
      const nonAdminReq = { ...req, body: { ...req.body, company_id: undefined }, userData: { RoleID: 2, CompanyID: 7 } };
      await purchaseInfo.add(nonAdminReq, res);
      expect(Common.insert).toHaveBeenCalledWith('tbl_purchase_information', expect.objectContaining({ company_id: 7 }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await purchaseInfo.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('getById', () => {
    it('should return the purchase information', async () => {
      Common.get_info.mockResolvedValue([{ purchase_information_id: 5 }]);
      const res = mockRes();
      await purchaseInfo.getById({ params: { purchase_information_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        5,
        'tbl_purchase_information p',
        'p.purchase_information_id',
        'p.flag_deleted = 0',
        expect.stringContaining('c.company_name'),
        false,
        [expect.objectContaining({ type: 'LEFT', table: 'tbl_company as c' })]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information Found' }));
    });

    it('should return 400 when not found', async () => {
      const res = mockRes();
      await purchaseInfo.getById({ params: { purchase_information_id: 999 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information Not Found' }));
    });
  });

  describe('edit', () => {
    it('should update the purchase on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ purchase_information_id: 5 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await purchaseInfo.edit(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_purchase_information',
        'purchase_information_id = 5',
        expect.objectContaining({ purchase: '  Stationery  ', year: '2024', cost: '500', modified_by: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information updated successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await purchaseInfo.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject a duplicate purchase on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ purchase_information_id: 5 }])
        .mockResolvedValueOnce([{ purchase_information_id: 6 }]);
      const res = mockRes();
      await purchaseInfo.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This Purchase already exists under the selected company.' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await purchaseInfo.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('should reject deletion when used in BE04', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 1 }]);
      const res = mockRes();
      await purchaseInfo.delete({ params: { purchase_information_id: 5 } }, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_be04', expect.stringContaining('purchase_information_id = 5'));
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete. Purchase Information is already used in BE04 data.' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]) // related
        .mockResolvedValueOnce([]); // existing
      const res = mockRes();
      await purchaseInfo.delete({ params: { purchase_information_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should soft delete the purchase', async () => {
      Common.selectWhere.mockResolvedValueOnce([]) // related
        .mockResolvedValueOnce([{ purchase_information_id: 5 }]); // existing
      const res = mockRes();
      await purchaseInfo.delete({ params: { purchase_information_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_purchase_information',
        'purchase_information_id = 5',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information deleted successfully (soft delete)' }));
    });
  });

  describe('Datatable', () => {
    it('should return a paginated purchase list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalPurchases: 4 }])
        .mockResolvedValueOnce([{ purchase_information_id: 1 }]);
      const res = mockRes();
      await purchaseInfo.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Purchase Information List Found' }));
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ TotalPurchases: 0 }]);
      const res = mockRes();
      await purchaseInfo.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'Stationery' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("p.purchase LIKE '%Stationery%'");
    });

    it('should scope to company for RoleID 2', async () => {
      Common.get_info.mockResolvedValue([{ TotalPurchases: 0 }]);
      const res = mockRes();
      const role2Req = { ...req, query: {}, userData: { RoleID: 2, CompanyID: 7 } };
      await purchaseInfo.Datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('p.company_id = 7');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalPurchases: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await purchaseInfo.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase Information List Empty' }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await purchaseInfo.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});