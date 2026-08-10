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

const beForm = require('../controllers/be-form.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('be-form.controller.submit_be01', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Common.selectWhere.mockResolvedValue([{ goal_id: 5 }]);
    Common.get_info.mockResolvedValue([]);
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  it('should return 400 with the validation errors on an invalid payload', async () => {
    const res = mockRes();
    await beForm.submit_be01({ body: {}, userData: { UserID: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Object) });
  });

  it('should insert a fitness row for each site input', async () => {
    const req = {
      userData: { UserID: 1, CompanyID: 9 },
      body: {
        goalCode_id: 'BE01',
        sites: [
          {
            site_id: 3,
            siteName: 'Plant A',
            siteId: 'A1',
            location: 'Karachi',
            fitnessInputs: [
              {
                id: 0,
                site_id: 3,
                relevance: 1,
                year: 2024,
                renewableEnergyUsed: 10,
                totalEnergyUsed: 100,
                siteFitness: 70,
                comments: 'ok',
              },
            ],
          },
        ],
      },
    };
    const res = mockRes();
    await beForm.submit_be01(req, res);

    expect(Common.selectWhere).toHaveBeenCalledWith(
      'tbl_break_even_goals',
      expect.stringContaining("goal_code = 'be01'")
    );

    const insertCall = Common.insert.mock.calls.find(([table]) => table === 'tbl_be01');
    expect(insertCall).toBeTruthy();
    expect(insertCall[1]).toEqual(
      expect.objectContaining({
        company_id: 9,
        site_id: 3,
        year: 2024,
        created_by: 1,
      })
    );
  });

  it('should delegate failures to Logs.ErrorHandler', async () => {
    Common.selectWhere.mockRejectedValue(new Error('db down'));
    const res = mockRes();
    await beForm.submit_be01(
      {
        userData: { UserID: 1, CompanyID: 9 },
        body: {
          goalCode_id: 'BE01',
          sites: [
            {
              site_id: 3,
              siteName: 'Plant A',
              siteId: 'A1',
              location: 'Karachi',
              fitnessInputs: [{ id: 0, site_id: 3, year: 2024 }],
            },
          ],
        },
      },
      res
    );
    expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
  });
});