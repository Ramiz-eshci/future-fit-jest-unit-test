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
      this.errors = { SiteName: { message: 'SiteName is required' } };
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

const siteinformation = require('../controllers/siteinformation.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    SiteName: '  HQ  ',
    CompanyID: 9,
    SiteID: 'S-1',
    Location: 'Berlin',
    GaseousReferenceyear: '2020',
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { site_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('siteinformation.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('get', () => {
    it('should return all sites for company_id 0', async () => {
      Common.get_info.mockResolvedValue([{ id: 1, name: 'HQ' }]);
      const res = mockRes();
      await siteinformation.get({ params: { company_id: 0 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(0, 'tbl_site_information', 'flag_deleted', '', 'site_id as id, site_name as name ,location, site_id_manual as siteIdManual');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'site List Found' }));
    });

    it('should return sites for a specific company', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await siteinformation.get({ params: { company_id: 9 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_site_information', 'company_id', 'flag_deleted=0', 'site_id as id, site_name as name ,location, site_id_manual as siteIdManual');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await siteinformation.get({ params: { company_id: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'site List Empty' }));
    });
  });

  describe('getById', () => {
    it('should return the site', async () => {
      Common.get_info.mockResolvedValue([{ site_id: 5 }]);
      const res = mockRes();
      await siteinformation.getById({ params: { site_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(5, 'tbl_site_information', 'site_id', 'flag_deleted = 0', expect.stringContaining('be05gaseous_ref_year'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site Information Found' }));
    });

    it('should return 400 when not found', async () => {
      const res = mockRes();
      await siteinformation.getById({ params: { site_id: 999 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site Information Not Found' }));
    });
  });

  describe('add', () => {
    it('should insert a new site', async () => {
      const res = mockRes();
      await siteinformation.add(req, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_site_information',
        expect.stringContaining("LOWER(site_name) = 'hq' AND company_id = 9")
      );
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_site_information',
        expect.objectContaining({ site_name: '  HQ  ', company_id: 9, location: 'Berlin', is_active: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'The site has been added successfully' }));
    });

    it('should reject a duplicate site name', async () => {
      Common.selectWhere.mockResolvedValue([{ site_id: 1 }]);
      const res = mockRes();
      await siteinformation.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'A site with this name already exists under the selected company.' }));
    });

    it('should use userData.CompanyID for non-admin roles', async () => {
      const res = mockRes();
      const nonAdminReq = { ...req, body: { ...req.body, CompanyID: undefined }, userData: { RoleID: 2, CompanyID: 7 } };
      await siteinformation.add(nonAdminReq, res);
      expect(Common.insert).toHaveBeenCalledWith('tbl_site_information', expect.objectContaining({ company_id: 7 }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await siteinformation.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('edit', () => {
    it('should update the site on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ site_id: 5 }]) // existing
        .mockResolvedValueOnce([]); // not duplicate
      const res = mockRes();
      await siteinformation.edit(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_site_information',
        'site_id = 5',
        expect.objectContaining({ site_name: '  HQ  ', company_id: 9 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site updated successfully' }));
    });

    it('should return 400 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await siteinformation.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site not found or already deleted' }));
    });

    it('should reject a duplicate site name on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ site_id: 5 }])
        .mockResolvedValueOnce([{ site_id: 6 }]);
      const res = mockRes();
      await siteinformation.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'A site with this name already exists under the selected company.' }));
    });
  });

  describe('delete', () => {
    it('should reject deletion when used in related tables', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 1 }]);
      const res = mockRes();
      await siteinformation.delete({ params: { site_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete site. It is already used' }));
    });

    it('should return 404 when not found', async () => {
      for (let i = 0; i < 8; i++) {
        Common.selectWhere.mockResolvedValueOnce([]);
      }
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await siteinformation.delete({ params: { site_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should soft delete the site', async () => {
      for (let i = 0; i < 8; i++) {
        Common.selectWhere.mockResolvedValueOnce([]);
      }
      Common.selectWhere.mockResolvedValueOnce([{ site_id: 5 }]);
      const res = mockRes();
      await siteinformation.delete({ params: { site_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_site_information',
        'site_id = 5',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site soft deleted successfully' }));
    });
  });

  describe('Datatable', () => {
    it('should return a paginated site list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalSites: 4 }])
        .mockResolvedValueOnce([{ site_id: 1 }]);
      const res = mockRes();
      await siteinformation.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Site List Found' }));
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ TotalSites: 0 }]);
      const res = mockRes();
      await siteinformation.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'HQ' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("site_name LIKE '%HQ%'");
    });

    it('should scope to company for RoleID 2', async () => {
      Common.get_info.mockResolvedValue([{ TotalSites: 0 }]);
      const res = mockRes();
      const role2Req = { ...req, query: {}, userData: { RoleID: 2, CompanyID: 7 } };
      await siteinformation.Datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('s.company_id = 7');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalSites: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await siteinformation.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site List Empty' }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await siteinformation.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});