jest.mock('../controllers/common/logs.controller', () => ({ ErrorHandler: jest.fn() }));
jest.mock('../models/common', () => ({
  selectWhere: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  get_info: jest.fn(),
  query: jest.fn(),
}));

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const list = require('../controllers/list.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.resetAllMocks();
  Common.get_info.mockResolvedValue([]);
});

describe('list.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Common.get_info.mockResolvedValue([]);
  });

  describe('company_list', () => {
    it('should return the company list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1, name: 'ACME' }]);
      const res = mockRes();
      await list.company_list({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(0, 'tbl_company', 'is_deleted', '', 'company_id as id, company_name as name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Company List Found' }));
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.company_list({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Company List Empty' }));
    });
  });

  describe('Common_fitness_criteria', () => {
    it('should return the list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1, name: 'C' }]);
      const res = mockRes();
      await list.Common_fitness_criteria({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_common_fitness_criteria', '1', 'flag_deleted = 0 AND is_active = 1', 'id as id, name as name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Common fitness criteria List Found' }));
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.Common_fitness_criteria({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Common fitness criteria List Empty' }));
    });
  });

  describe('Resourcetypes', () => {
    it('should return the list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await list.Resourcetypes({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_resourcetypes', '1', 'flag_deleted = 0 AND is_active = 1', 'id as id, name as name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Resourcetypes List Found' }));
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.Resourcetypes({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Siteassessed', () => {
    it('should return the list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await list.Siteassessed({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_siteassessed', '1', 'flag_deleted = 0 AND is_active = 1', 'id as id, name as name');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.Siteassessed({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Siteassessed List Empty' }));
    });
  });

  describe('Siteassessedwaste', () => {
    it('should return the list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await list.Siteassessedwaste({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_siteassessedwaste', '1', 'flag_deleted = 0 AND is_active = 1', 'id as id, name as name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Siteassessedwaste List Found' }));
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.Siteassessedwaste({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('ProductType', () => {
    it('should return the list', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await list.ProductType({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_product_type', '1', 'flag_deleted = 0 AND is_active = 1', 'product_type_id as id, product_typename as name');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await list.ProductType({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ProductType List Empty' }));
    });
  });
});
describe('getCompanySites', () => {
  it('should return sites for an admin', async () => {
    Common.get_info.mockResolvedValue([{ site_id: 1, site_name: 'Site' }]);
    const res = mockRes();
    await list.getCompanySites({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_site_information', 'company_id', 'flag_deleted = 0 AND is_active = 1', 'site_id,site_name,site_id_manual,location', false, false, false, { field: 'site_name', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site List Found' }));
  });

  it('should return 403 for a non-admin requesting another company', async () => {
    const res = mockRes();
    await list.getCompanySites({ params: { company_id: 1 }, userData: { RoleID: 2, CompanyID: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(Common.get_info).not.toHaveBeenCalled();
  });

  it('should allow a non-admin to access their own company', async () => {
    Common.get_info.mockResolvedValue([{ site_id: 1 }]);
    const res = mockRes();
    await list.getCompanySites({ params: { company_id: 9 }, userData: { RoleID: 2, CompanyID: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getCompanySites({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Site List Empty' }));
  });
});

describe('product_list', () => {
  it('should return the product list', async () => {
    Common.get_info.mockResolvedValue([{ product_id: 1 }]);
    const res = mockRes();
    await list.product_list({ params: { company_id: 9 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_product p', 'p.company_id', 'p.flag_deleted = 0 AND p.is_active = 1', expect.stringContaining('type.product_typename'), false, [expect.objectContaining({ type: 'LEFT', table: 'tbl_product_type as type' })], false, { field: 'p.product_name', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product List Found' }));
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.product_list({ params: { company_id: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getEmployeeList', () => {
  it('should return the employee list', async () => {
    Common.get_info.mockResolvedValue([{ employee_id: 1 }]);
    const res = mockRes();
    await list.getEmployeeList({ params: { company_id: 9 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_employee as e', 'e.company_id', 'e.flag_deleted=0', expect.stringContaining('c.company_name'), false, [
      expect.objectContaining({ type: 'LEFT', table: 'tbl_company as c' }),
      expect.objectContaining({ type: 'LEFT', table: 'tbl_site_information as st' })
    ], false, { field: 'employee_group', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee Found' }));
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getEmployeeList({ params: { company_id: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('relevance lists', () => {
  const cases = [
    ['getRelevanaceList', 'tbl_relevance'],
    ['getRelevanaceListBE03', 'tbl_relevance4_data'],
    ['getRelevanaceListBE05', 'tbl_relevancebe05'],
    ['getNoGhgEmissionsListBE06', 'tbl_no_ghg_emissions_be06'],
  ];
  cases.forEach(([method, table]) => {
    it(`${method} should return the list from ${table}`, async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await list[method]({}, res);
      expect(Common.get_info).toHaveBeenCalledWith(1, table, 1, 'flag_deleted=0 AND is_active=1', 'relevance_id as id,relevance_name as name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevanace Found' }));
    });

    it(`${method} should return 400 when empty`, async () => {
      const res = mockRes();
      await list[method]({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Relevanace Not Found' }));
    });
  });
});

describe('be04_category_list', () => {
  it('should return the category list', async () => {
    Common.get_info.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await list.be04_category_list({}, res);
    expect(Common.get_info).toHaveBeenCalledWith(1, 'tbl_be04_category', 1, 'flag_deleted=0', 'category_id as id, category_name as name');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Category List Found' }));
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.be04_category_list({}, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getCompanyPurchase', () => {
  it('should return the purchase list', async () => {
    Common.get_info.mockResolvedValue([{ purchase_information_id: 1 }]);
    const res = mockRes();
    await list.getCompanyPurchase({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_purchase_information', 'company_id', 'flag_deleted = 0 AND is_active = 1', 'purchase_information_id,purchase,purchase_id,year,cost,purchase_type', false, false, false, { field: 'purchase', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Purchase List Found' }));
  });

  it('should return 403 for a non-admin requesting another company', async () => {
    const res = mockRes();
    await list.getCompanyPurchase({ params: { company_id: 1 }, userData: { RoleID: 2, CompanyID: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getCompanyPurchase({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getCompanyFinanicialAsset', () => {
  it('should return the asset list', async () => {
    Common.get_info.mockResolvedValue([{ finanical_id: 1 }]);
    const res = mockRes();
    await list.getCompanyFinanicialAsset({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(9, 'tbl_finanicial_asset', 'company_id', 'flag_deleted = 0 AND is_active = 1', expect.stringContaining('monetary_value'), false, false, false, { field: 'financial_asset', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 403 for a non-admin requesting another company', async () => {
    const res = mockRes();
    await list.getCompanyFinanicialAsset({ params: { company_id: 1 }, userData: { RoleID: 2, CompanyID: 9 } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getCompanyFinanicialAsset({ params: { company_id: 9 }, userData: { RoleID: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getMenuList', () => {
  it('should return the menu list', async () => {
    Common.get_info.mockResolvedValue([{ MenuId: 1 }]);
    const res = mockRes();
    await list.getMenuList({}, res);
    expect(Common.get_info).toHaveBeenCalledWith(1, 'MenuMaster', 1, 'FlagDeleted = 0 AND IsActive = 1', expect.stringContaining('MenuId'), false, false, false, { field: 'SortOrder', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Menu List Found' }));
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getMenuList({}, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('getRolePermissions', () => {
  it('should return permissions for a role', async () => {
    Common.get_info.mockResolvedValue([{ RoleId: 1, PermissionKey: 'x' }]);
    const res = mockRes();
    await list.getRolePermissions({ params: { role_id: 1 } }, res);
    expect(Common.get_info).toHaveBeenCalledWith(1, 'RoleDetail as rd', 'rd.RoleId', expect.stringContaining('rd.FlagDeleted = 0'), expect.stringContaining('mm.MenuName'), false, [
      expect.objectContaining({ type: 'LEFT', table: 'MenuMaster as mm' }),
      expect.objectContaining({ type: 'LEFT', table: 'MenuMaster as pm' })
    ], false, { field: 'mm.SortOrder', order: 'ASC' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Permissions Found' }));
  });

  it('should return 400 when empty', async () => {
    const res = mockRes();
    await list.getRolePermissions({ params: { role_id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('error handling', () => {
  it('should delegate failures to Logs.ErrorHandler', async () => {
    Common.get_info.mockRejectedValue(new Error('db down'));
    const res = mockRes();
    await list.company_list({}, res);
    expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
  });
});
