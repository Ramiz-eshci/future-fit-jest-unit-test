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
      this.errors = { VideoTitle: { message: 'VideoTitle is required' } };
    }
    async check() {
      return this._valid !== false;
    }
  }
  return { Validator };
});
jest.mock('fs');

const Logs = require('../controllers/common/logs.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const fs = require('fs');
const { PassThrough } = require('stream');

const tutorialVideos = require('../controllers/tutorial_videos.controller');

function mockRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const req = {
  body: {
    VideoTitle: 'How to submit BE01',
    VideoURL: 'https://youtu.be/abc123',
    OrderBy: '1',
    CompanyID: 9,
  },
  userData: { RoleID: 1, UserID: 1, CompanyID: 9 },
  params: { video_id: 5 },
  query: { page: 1, per_page: 5 },
};

describe('tutorial_videos.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Validator.prototype._valid = true;
    Common.selectWhere.mockResolvedValue([]);
    Common.get_info.mockResolvedValue([]);
    Common.update.mockResolvedValue({});
    Common.insert.mockResolvedValue({ insertId: 1 });
  });

  describe('add', () => {
    it('should insert a new video', async () => {
      const res = mockRes();
      await tutorialVideos.add(req, res);
      expect(Common.insert).toHaveBeenCalledWith(
        'tutorial_videos',
        expect.objectContaining({
          title: 'How to submit BE01',
          video_type: 'YOUTUBE',
          video_url: 'https://youtu.be/abc123',
          thumbnail: 'https://youtu.be/abc123',
          is_active: 1,
          order_by: '1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Video added successfully' }));
    });

    it('should reject a duplicate video', async () => {
      Common.selectWhere.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await tutorialVideos.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'This video already exists.' }));
    });

    it('should return 400 on validation failure', async () => {
      Validator.prototype._valid = false;
      const res = mockRes();
      await tutorialVideos.add(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getById', () => {
    it('should return the video', async () => {
      Common.get_info.mockResolvedValue([{ id: 5 }]);
      const res = mockRes();
      await tutorialVideos.getById({ params: { video_id: 5 } }, res);
      expect(Common.get_info).toHaveBeenCalledWith(0, 'tutorial_videos as p', 'p.flag_deleted', 'p.id=5', expect.stringContaining('p.order_by'));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Video Data Found' }));
    });

    it('should return 400 when not found', async () => {
      const res = mockRes();
      await tutorialVideos.getById({ params: { video_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('edit', () => {
    it('should update the video on success', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 5 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await tutorialVideos.edit(req, res);
      expect(Common.update).toHaveBeenCalledWith(
        'tutorial_videos',
        'id = 5',
        expect.objectContaining({ title: 'How to submit BE01', video_type: 'YOUTUBE', video_url: 'https://youtu.be/abc123' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Video Information updated successfully' }));
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValueOnce([]);
      const res = mockRes();
      await tutorialVideos.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should reject a duplicate video on edit', async () => {
      Common.selectWhere.mockResolvedValueOnce([{ id: 5 }])
        .mockResolvedValueOnce([{ id: 6 }]);
      const res = mockRes();
      await tutorialVideos.edit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate Video' }));
    });
  });

  describe('delete', () => {
    it('should soft delete the video', async () => {
      Common.selectWhere.mockResolvedValue([{ id: 5 }]);
      const res = mockRes();
      await tutorialVideos.delete({ params: { video_id: 5 } }, res);
      expect(Common.update).toHaveBeenCalledWith('tutorial_videos', 'id = 5', expect.objectContaining({ flag_deleted: 1 }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when not found', async () => {
      Common.selectWhere.mockResolvedValue([]);
      const res = mockRes();
      await tutorialVideos.delete({ params: { video_id: 5 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Datatable', () => {
    it('should return a paginated video list', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalVideos: 4 }])
        .mockResolvedValueOnce([{ id: 1 }]);
      const res = mockRes();
      await tutorialVideos.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 4, total_pages: 1, message: 'Video List Found' }));
    });

    it('should include filter conditions when a filter is present', async () => {
      Common.get_info.mockResolvedValue([{ TotalVideos: 0 }]);
      const res = mockRes();
      await tutorialVideos.Datatable({ ...req, query: { page: 1, per_page: 5, filter: 'BE01' } }, res);
      expect(Common.get_info.mock.calls[0][3]).toContain("p.title LIKE '%BE01%'");
    });

    it('should return 400 when the list is empty', async () => {
      Common.get_info.mockResolvedValueOnce([{ TotalVideos: 0 }])
        .mockResolvedValueOnce([]);
      const res = mockRes();
      await tutorialVideos.Datatable(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllvideos', () => {
    it('should return all videos', async () => {
      Common.get_info.mockResolvedValue([{ id: 1 }]);
      const res = mockRes();
      await tutorialVideos.getAllvideos({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Video Data Found' }));
    });

    it('should return 400 when empty', async () => {
      const res = mockRes();
      await tutorialVideos.getAllvideos({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('stream', () => {
    it('should return 404 when the file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      const res = { status: jest.fn(), send: jest.fn() };
      res.status.mockReturnValue(res);
      await tutorialVideos.stream({ params: { filename: 'video.mp4' }, headers: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Video not found');
    });

    it('should stream a range request', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 100 });
      fs.createReadStream.mockReturnValue(new PassThrough());
      const res = {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        pipe: jest.fn(),
        end: jest.fn(),
      };
      await tutorialVideos.stream({ params: { filename: 'video.mp4' }, headers: { range: 'bytes=0-49' } }, res);
      expect(res.writeHead).toHaveBeenCalledWith(206, expect.objectContaining({ 'Content-Range': 'bytes 0-49/100' }));
    });

    it('should stream a full file without a range', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 100 });
      fs.createReadStream.mockReturnValue(new PassThrough());
      const res = {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        pipe: jest.fn(),
        end: jest.fn(),
      };
      await tutorialVideos.stream({ params: { filename: 'video.mp4' }, headers: {} }, res);
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ 'Content-Length': 100 }));
    });
  });

  describe('error handling', () => {
    it('should delegate failures to Logs.ErrorHandler', async () => {
      Common.insert.mockRejectedValue(new Error('db down'));
      const res = mockRes();
      await tutorialVideos.add(req, res);
      expect(Logs.ErrorHandler).toHaveBeenCalledWith(expect.any(Error), res);
    });
  });
});