const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const refYear = require('../controllers/reference-year.controller');

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
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});
const { Validator } = require('node-input-validator');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('reference-year.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
  });

  describe('getById', () => {
    it('should return 400 for an invalid site_id', async () => {
      const res = mockRes();
      await refYear.getById({ userData: { CompanyID: 1, RoleID: 2 }, params: { site_id: 'abc' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid site_id' })
      );
    });

    it('should fetch reference years for a non-admin user scoped to the company', async () => {
      Common.get_info.mockResolvedValue([{ site_id: 1 }]);
      const res = mockRes();
      await refYear.getById({ userData: { CompanyID: 9, RoleID: 2 }, params: { site_id: '1' } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        9,
        'tbl_site_information',
        'company_id',
        expect.stringContaining('site_id = 1'),
        expect.stringContaining('be05gaseous_ref_year')
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fetch with id 0 for an admin user', async () => {
      Common.get_info.mockResolvedValue([{ site_id: 1 }]);
      const res = mockRes();
      await refYear.getById({ userData: { CompanyID: 9, RoleID: 1 }, params: { site_id: '1' } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(0, 'tbl_site_information', 'company_id', expect.any(String), expect.any(String));
    });

    it('should return 400 when no reference year is found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await refYear.getById({ userData: { CompanyID: 9, RoleID: 2 }, params: { site_id: '1' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('edit', () => {
    it('should update the reference year', async () => {
      Common.selectWhere.mockResolvedValue([{ company_id: 9 }]);
      const res = mockRes();
      await refYear.edit(
        {
          userData: { UserID: 1, CompanyID: 9, RoleID: 2 },
          body: { RefYear: 2024, RefYearValue: 100 },
        },
        res
      );
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be_reference_year',
        'company_id = 9',
        expect.objectContaining({ ref_year: 2024 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when no reference record exists', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await refYear.edit(
        { userData: { UserID: 1, CompanyID: 9, RoleID: 2 }, body: { RefYear: 2024, RefYearValue: 100 } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});