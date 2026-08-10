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
      this.errors = { EmployeeGroup: { message: 'EmployeeGroup is required' } };
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

const employee = require('../controllers/employee.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    EmployeeGroup: 'Group A',
    GroupID: 'G-1',
    CompanyID: 9,
    SiteID: 3,
    Year: '2024',
    NumberOfEmployees: '10',
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { employee_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('employee.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should reject a duplicate group for the selected company', async () => {
      Common.selectWhere.mockResolvedValue([{ employee_id: 1 }]);
      const res = mockRes();
      await employee.add(req, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_employee',
        expect.stringContaining("employee_group='Group A'")
      );
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_employee',
        expect.stringContaining(' AND site_id=3')
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate Group ID for the selected company.' }));
    });

    it('should insert a new employee', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await employee.add(req, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_employee',
        expect.objectContaining({ company_id: 9, employee_group: 'Group A', group_id: 'G-1', site_id: 3, year: '2024', number_of_employees: '10', is_active: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee added successfully' }));
    });

    it('should use userData.CompanyID for non-admin roles', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      const nonAdminReq = { ...req, body: { ...req.body, CompanyID: null }, userData: { RoleID: 2, CompanyID: 7 } };
      await employee.add(nonAdminReq, res);
      expect(Common.insert).toHaveBeenCalledWith('tbl_employee', expect.objectContaining({ company_id: 7 }));
    });

    it('should use site_id IS NULL when SiteID is missing', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      const noSiteReq = { ...req, body: { ...req.body, SiteID: undefined } };
      await employee.add(noSiteReq, res);
      expect(Common.selectWhere).toHaveBeenCalledWith(
        'tbl_employee',
        expect.stringContaining(' AND site_id IS NULL')
      );
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await employee.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('getById', () => {
    it('should return the employee with joined company info', async () => {
      Common.get_info.mockResolvedValue([{ employee_id: 5 }]);
      const res = mockRes();
      await employee.getById({ params: { employee_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(
        5,
        'tbl_employee as e',
        'e.employee_id',
        'e.flag_deleted=0',
        expect.stringContaining('c.company_name'),
        false,
        [expect.objectContaining({ type: 'LEFT', table: 'tbl_company as c' })]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee Found' }));
    });

    it('should return 400 when the employee is not found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await employee.getById({ params: { employee_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee Not Found' }));
    });
  });

  describe('edit', () => {
    it('should update the employee on non-duplicate', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ employee_id: 5 }]) // existing
        .mockResolvedValueOnce([]) // group duplicate
        .mockResolvedValueOnce([]); // group id duplicate
      const res = mockRes();
      await employee.edit(req, res);
      expect(Common.selectWhere).toHaveBeenCalledWith('tbl_employee', expect.stringContaining('employee_id = 5 AND flag_deleted = 0'));
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_employee',
        'employee_id = 5',
        expect.objectContaining({ employee_group: 'Group A', modified_on: expect.any(Date) })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when the employee does not exist', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await employee.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee not found' }));
    });

    it('should reject a duplicate employee group', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ employee_id: 5 }])
        .mockResolvedValueOnce([{ employee_id: 6 }]);
      const res = mockRes();
      await employee.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate Employee Group for the selected company.' }));
    });

    it('should reject a duplicate group ID', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([{ employee_id: 5 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ employee_id: 6 }]);
      const res = mockRes();
      await employee.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate Group ID for the selected company.' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await employee.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }));
    });
  });

  describe('delete', () => {
    it('should reject deletion when used in related tables', async () => {
      Common.selectWhere.mockResolvedValueOnce([]) // be10
        .mockResolvedValueOnce([]) // be11
        .mockResolvedValueOnce([]) // be12
        .mockResolvedValueOnce([]) // be13
        .mockResolvedValueOnce([]) // be14
        .mockResolvedValueOnce([{ id: 1 }]); // be20
      const res = mockRes();
      await employee.delete({ params: { employee_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete Employee. It is already used.' }));
    });

    it('should reject an invalid employee_id', async () => {
      const res = mockRes();
      await employee.delete({ params: { employee_id: 'abc' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid or missing employee_id' }));
    });

    it('should return 404 when already deleted', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await employee.delete({ params: { employee_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should soft delete the employee', async () => {
      for (let i = 0; i < 6; i++) {
        Common.selectWhere.mockResolvedValueOnce([]); // six related tables all empty
      }
      Common.selectWhere.mockResolvedValueOnce([{ employee_id: 5 }]);
      const res = mockRes();
      await employee.delete({ params: { employee_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_employee',
        'employee_id = 5',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee soft deleted successfully' }));
    });
  });

  describe('Datatable', () => {
    it('should return a paginated employee list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalEmployees: 4 }])
        .mockResolvedValueOnce([{ employee_id: 1 }]);
      const res = mockRes();
      await employee.Datatable({ ...req, query: { page: 1, per_page: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Employee List Found' }));
    });

    it('should include filter conditions when a filter is provided', async () => {
      Common.get_info.mockResolvedValue([{ TotalEmployees: 0 }]);
      const res = mockRes();
      await employee.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'Group A' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("e.employee_group LIKE '%Group A%'");
    });

    it('should scope to the company for RoleID 2', async () => {
      Common.get_info.mockResolvedValue([{ TotalEmployees: 0 }]);
      const res = mockRes();
      const role2Req = { ...req, userData: { RoleID: 2, CompanyID: 7 } };
      await employee.Datatable(role2Req, res);
      expect(Common.get_info.mock.calls[0][3]).toContain('e.company_id = 7');
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalEmployees: 0 }]);
      Common.get_info.mockResolvedValueOnce([]);
      const res = mockRes();
      await employee.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee List Empty' }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.selectWhere.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await employee.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});