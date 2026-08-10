const tableName = require('../controllers/common/table.controller');

describe('table.controller', () => {
  it('should expose user and role table names', () => {
    expect(tableName.TBL_USERS).toBe('tbl_user');
    expect(tableName.TBL_ROLE).toBe('tbl_role');
  });

  it('should expose the be-form tables 01..23', () => {
    expect(tableName.TBL_BE01).toBe('tbl_be01');
    expect(tableName.TBL_BE23).toBe('tbl_be23');
  });

  it('should expose supporting tables', () => {
    expect(tableName.TBL_COMPANY).toBe('tbl_company');
    expect(tableName.TBL_EMPLOYEE).toBe('tbl_employee');
    expect(tableName.TBL_PRODUCT).toBe('tbl_product');
    expect(tableName.TBL_BE_REFERENCE_YEAR).toBe('tbl_be_reference_year');
    expect(tableName.TBL_TUTORIAL_VIDEOS).toBe('tutorial_videos');
  });
});