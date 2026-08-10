const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const goals = require('../controllers/break-even-goals.controller');

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

describe('break-even-goals.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Validator.prototype._valid = true;
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('getById', () => {
    it('should return the goal with progress and context indicators', async () => {
      Common.get_info
        .mockResolvedValueOnce([{ goal_id: 1, goal_name: 'BE01' }])
        .mockResolvedValueOnce([{ progress_indicator_id: 1 }])
        .mockResolvedValueOnce([{ context_indicator_id: 1 }]);
      const res = mockRes();
      await goals.getById({ params: { goal_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [expect.objectContaining({ ProgressIndicators: [{ progress_indicator_id: 1 }] })],
        })
      );
    });

    it('should return 400 when no goal is found', async () => {
      Common.get_info.mockResolvedValue([]);
      const res = mockRes();
      await goals.getById({ params: { goal_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('get', () => {
    it('should return the goal dropdown', async () => {
      Common.get_info.mockResolvedValue([{ id: 1, name: 'BE01' }]);
      const res = mockRes();
      await goals.get({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'BEform Found' })
      );
    });
  });

  describe('add', () => {
    const body = {
      GoalName: 'BE02',
      GoalCode: 'BE02',
      GoalShortName: 'B2',
      ProgressIndicators: [{ progress_indicator: 'P', data_completeness: 'F' }],
      ContextIndicators: [{ context_indicator: 'C', unit: 'u' }],
    };

    it('should reject a duplicate goal name', async () => {
      Common.selectWhere.mockResolvedValue([{ goal_id: 1 }]);
      const res = mockRes();
      await goals.add({ body, userData: { UserID: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Goal Name already exists' })
      );
    });

    it('should insert the goal and its indicators on success', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await goals.add({ body, userData: { UserID: 1 } }, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_break_even_goals',
        expect.objectContaining({ goal_code: 'BE02', goal_name: 'BE02' })
      );
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_be_progress_indicator',
        expect.objectContaining({ goal_id: 1, progress_indicator: 'P' })
      );
      expect(Common.insert).toHaveBeenCalledWith(
        'tbl_be_context_indicator',
        expect.objectContaining({ goal_id: 1, context_indicator: 'C' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('should soft-delete the goal and its indicators', async () => {
      Common.selectWhere.mockResolvedValue([{ goal_id: 1 }]);
      const res = mockRes();
      await goals.delete({ params: { goal_id: 1 } }, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_break_even_goals',
        'goal_id = 1',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be_progress_indicator',
        'goal_id = 1',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when the goal is already deleted', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await goals.delete({ params: { goal_id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('edit', () => {
    it('should update indicators, deleting removed ones', async () => {
      Common.selectWhere
        .mockResolvedValueOnce([]) // goal name check
        .mockResolvedValueOnce([]) // goal code check
        .mockResolvedValueOnce([]) // goal short name check
        .mockResolvedValueOnce([{ progress_indicator_id: 10 }]) // existing progress
        .mockResolvedValueOnce([{ context_indicator_id: 20 }]); // existing context
      const res = mockRes();
      await goals.edit(
        {
          params: { goal_id: 1 },
          userData: { UserID: 1 },
          body: {
            GoalName: 'BE02',
            GoalCode: 'BE02',
            GoalShortName: 'B2',
            ProgressIndicators: [{ progress_indicator: 'P' }],
            ContextIndicators: [{ context_indicator: 'C' }],
          },
        },
        res
      );
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be_progress_indicator',
        'progress_indicator_id = 10',
        expect.objectContaining({ flag_deleted: 1, deleted_on: expect.any(Date) })
      );
      expect(Common.update).toHaveBeenCalledWith(
        'tbl_be_context_indicator',
        'context_indicator_id = 20',
        expect.objectContaining({ flag_deleted: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Datatable', () => {
    it('should return paginated goals', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalBEs: 3 }])
        .mockResolvedValueOnce([{ goal_id: 1 }]);
      const res = mockRes();
      await goals.Datatable({ query: { page: 1, per_page: 5, filter: '' } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ total: 3 })
      );
    });
  });
});