jest.mock('fs');

const fs = require('fs');
const path = require('path');
const logs = require('../controllers/common/logs.controller');

describe('logs.controller', () => {
  describe('ErrorHandler', () => {
    let res;

    beforeEach(() => {
      jest.clearAllMocks();
      res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      fs.existsSync.mockReturnValue(false);
      fs.writeFile.mockImplementation((file, json, enc, cb) => cb(null));
    });

    it('should write a new log file and return 500', async () => {
      const err = Object.assign(new Error('boom'), { name: 'Error', stack: 'stack' });
      await logs.ErrorHandler(err, res);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: false,
        message: 'Internal server error.',
        data: [],
      });
    });

    it('should append to an existing log file', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFile.mockImplementation((file, enc, cb) => cb(null, JSON.stringify([{ old: true }])));
      fs.writeFile.mockImplementation((file, json, enc, cb) => cb(null));
      const err = Object.assign(new Error('boom'), { name: 'Error', stack: 'stack' });
      await logs.ErrorHandler(err, res);
      const written = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(written).toHaveLength(2);
      expect(written[1].message).toBe('boom');
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('fileList', () => {
    it('should return the logs for a given date', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([{ message: 'boom' }]));
      const req = { body: { date: '2024-01-01' } };
      const res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      await logs.fileList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: true, data: [{ message: 'boom' }] })
      );
    });

    it('should return 404 when no log file exists for the date', async () => {
      fs.existsSync.mockReturnValue(false);
      const req = { body: { date: '2024-01-01' } };
      const res = { status: jest.fn(), json: jest.fn() };
      res.status.mockReturnValue(res);
      await logs.fileList(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});