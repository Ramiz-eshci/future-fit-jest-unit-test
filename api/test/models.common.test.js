jest.mock('../config/database', () => ({
  query: jest.fn(() => Promise.resolve([])),
}));

describe('models/common dispatcher', () => {
  const OLD_DB_TYPE = process.env.DB_TYPE;

  afterEach(() => {
    process.env.DB_TYPE = OLD_DB_TYPE;
    jest.resetModules();
  });

  it('should load the sqlserver implementation when DB_TYPE=sqlserver', () => {
    process.env.DB_TYPE = 'sqlserver';
    jest.resetModules();
    const Common = require('../models/common');
    expect(Common.selectWhere).toBeDefined();
    expect(Common.get_info).toBeDefined();
    expect(Common.insert).toBeDefined();
  });
});