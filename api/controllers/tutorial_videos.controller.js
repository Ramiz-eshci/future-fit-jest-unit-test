const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
var fileExtension = require('file-extension');
const randomstring = require("randomstring");
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
module.exports = {

  add: async function (req, res) {
    try {

      const ValidationCheck = new Validator(req.body, {
        VideoTitle: 'required',
        VideoURL: 'required',
        OrderBy: 'required',
      });

      const FormaValidationError = await ValidationCheck.check();
      if (!FormaValidationError) {
        const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
          acc[key] = ValidationCheck.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({ status: false, message: 'Validation Error', errors });
      }


      const companyId = req.userData.RoleID == 1 ? req.body.CompanyID : req.userData.CompanyID;


      const VideoTitle = req.body.VideoTitle;
      // const VideoType = req.body.VideoType;
      const VideoURL = req.body.VideoURL;
      const OrderBy = req.body.OrderBy;
      let file_name = '';
      let thumbnail_name = '';
      // if (req.files != null && req.files.VideoURL != undefined) {
      //   var VideoFile = req.files.VideoURL;
      //   var ext = fileExtension(VideoFile.name);
      //   var CompanyID = req.body.CompanyID
      //   const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv'];
      //   const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      //   if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(VideoFile.mimetype)) {
      //     file_name = randomstring.generate() + '.' + ext;
      //     thumbnail_name = file_name.replace('.' + ext, '.png');
      //     const tutorialVideoDir = uploadPath + videoDir; // Create 'uploads' at the root level
      //     const thumbnailDir = uploadPath + videoThumbDir;
      //     // Check if the uploads directory exists, if not, create it
      //     if (!fs.existsSync(uploadPath)) {
      //       fs.mkdirSync(uploadPath, { recursive: true });
      //     }
      //     if (!fs.existsSync(tutorialVideoDir)) {
      //       fs.mkdirSync(tutorialVideoDir, { recursive: true });

      //     }
      //     if (!fs.existsSync(thumbnailDir)) {
      //       fs.mkdirSync(thumbnailDir, { recursive: true });
      //     }
      //     const videoFullPath = tutorialVideoDir + file_name;
      //     const tutorialThumbDir = thumbnailDir + thumbnail_name;
      //     await new Promise((resolve, reject) => {

      //       VideoFile.mv(tutorialVideoDir + file_name, async function (err) {
      //         if (err) {
      //           console.error("File move error:", err);
      //           return;
      //         }
      //         resolve();
      //       });
      //     });
      //     // 🎥 Generate Thumbnail (2 sec frame)
      //     await new Promise((resolve, reject) => {
      //       ffmpeg(videoFullPath)
      //         .screenshots({
      //           timestamps: ['2'],
      //           filename: thumbnail_name,
      //           folder: thumbnailDir,
      //           size: '320x240'
      //         })
      //         .on('end', resolve)
      //         .on('error', reject);
      //     });
      //   } else {
      //     return res.status(400).json({ status: false, message: 'Only mp4, mov, avi, mkv videos are allowed!' });
      //   }
      // } else {
      //   return res.status(400).json({ status: false, message: 'Video file is required!' });
      // }


      const existingProductCheck = `
      title='${VideoTitle}'
      AND video_url='${VideoURL}'
      AND flag_deleted=0
    `;
      const existingProduct = await Common.selectWhere(tableName.TBL_TUTORIAL_VIDEOS, existingProductCheck);



      if (existingProduct.length > 0) {
        return res.status(400).json({
          status: false,
          message: "This video already exists.",
          data: []
        });
      }


      const data = {
        title: VideoTitle,
        video_type: 'YOUTUBE',
        video_url: VideoURL,
        thumbnail: VideoURL,
        is_active: 1,
        created_at: new Date(),
        order_by: OrderBy
      };

      await Common.insert(tableName.TBL_TUTORIAL_VIDEOS, data);
      return res.status(200).json({
        status: true,
        message: "Video added successfully",
        data: []
      });

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  getById: async function (req, res) {
    try {
      var video_id = req.params.video_id;
       const thumbnailDir = uploadURL + videoThumbDir;
      const videoFullDir = uploadURL + videoDir;
     
      // var video_data = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', 'p.id=' + video_id,
      //   "p.title,p.video_type, CASE WHEN p.[thumbnail] IS NOT NULL AND p.[thumbnail] <> '' THEN CONCAT('" + thumbnailDir + "',p.[thumbnail]) ELSE NULL END AS thumbnail, CASE WHEN p.[video_url] IS NOT NULL AND p.[video_url] <> '' THEN CONCAT('" + videoFullDir + "',p.[video_url]) ELSE NULL END AS video_url,p.video_url as video_name,p.order_by"
      // );
      var video_data = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', 'p.id=' + video_id,
        "p.title,p.video_type,video_url,p.video_url as video_name,p.order_by"
      );
      // console.log(video_data, '--product data');
      if (video_data.length) {
        return res.status(200).json({
          status: true,
          message: 'Video Data Found',
          data: video_data
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Video Data Not Found',
          data: []
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  edit: async function (req, res) {
    try {
      const videoId = req.params.video_id;


      const ValidationCheck = new Validator(req.body, {
        VideoTitle: 'required',
        // VideoType: 'required',
        VideoURL: 'required',
        OrderBy: 'required',
      });

      const VideoTitle = req.body.VideoTitle;
      // const VideoType = req.body.VideoType;
      const VideoURL = req.body.VideoURL;
      const OrderBy = req.body.OrderBy;
      const companyId =
        req.userData.RoleID == 1 ? req.body.CompanyID : req.userData.CompanyID;


      const FormaValidationError = await ValidationCheck.check();
      if (!FormaValidationError) {
        const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
          acc[key] = ValidationCheck.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({
          status: false,
          message: 'Validation Error',
          errors
        });
      }




      const existingProduct = await Common.selectWhere(
        tableName.TBL_TUTORIAL_VIDEOS,
        `id = ${videoId} AND flag_deleted = 0`
      );

      if (existingProduct.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'Video not found or deleted',
          errors: { video_id: 'Product not found or deleted' }
        });
      }

      let file_name = '';
      let thumbnail_name = '';
      // if (req.files != null && req.files.VideoURL != undefined) {
      //   var VideoFile = req.files.VideoURL;
      //   var ext = fileExtension(VideoFile.name);
      //   var CompanyID = req.body.CompanyID
      //   const allowedExtensions = ['mp4', 'mov', 'avi', 'mkv'];
      //   const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      //   if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(VideoFile.mimetype)) {
      //     file_name = randomstring.generate() + '.' + ext;
      //     thumbnail_name = file_name.replace('.' + ext, '.png');
      //     const tutorialVideoDir = uploadPath + videoDir; // Create 'uploads' at the root level
      //     const thumbnailDir = uploadPath + videoThumbDir;
      //     // Check if the uploads directory exists, if not, create it
      //     if (!fs.existsSync(uploadPath)) {
      //       fs.mkdirSync(uploadPath, { recursive: true });
      //     }
      //     if (!fs.existsSync(tutorialVideoDir)) {
      //       fs.mkdirSync(tutorialVideoDir, { recursive: true });

      //     }
      //     if (!fs.existsSync(thumbnailDir)) {
      //       fs.mkdirSync(thumbnailDir, { recursive: true });
      //     }
      //     const videoFullPath = tutorialVideoDir + file_name;
      //     const tutorialThumbDir = thumbnailDir + thumbnail_name;
      //     await new Promise((resolve, reject) => {

      //       VideoFile.mv(tutorialVideoDir + file_name, async function (err) {
      //         if (err) {
      //           console.error("File move error:", err);
      //           return;
      //         }
      //         resolve();
      //       });
      //     });
      //     // 🎥 Generate Thumbnail (2 sec frame)
      //     await new Promise((resolve, reject) => {
      //       ffmpeg(videoFullPath)
      //         .screenshots({
      //           timestamps: ['2'],
      //           filename: thumbnail_name,
      //           folder: thumbnailDir,
      //           size: '320x240'
      //         })
      //         .on('end', resolve)
      //         .on('error', reject);
      //     });
      //   } else {
      //     return res.status(400).json({ status: false, message: 'Only mp4, mov, avi, mkv videos are allowed!' });
      //   }
      // } else {

      // }



      const duplicateCheck = `
      title='${VideoTitle}' AND video_url='${VideoURL}'
      AND id != ${videoId}
      AND flag_deleted=0
    `;

      const isDuplicate = await Common.selectWhere(
        tableName.TBL_TUTORIAL_VIDEOS,
        duplicateCheck
      );

      if (isDuplicate.length > 0) {
        return res.status(400).json({
          status: false,
          message:
            'Duplicate Video',
          data: []
        });
      }


      const data = {
        title: VideoTitle,
        video_type: 'YOUTUBE',
        is_active: 1,
        created_at: new Date(),
        order_by: OrderBy,
        thumbnail: VideoURL,
        video_url: VideoURL,
      };
      // if (file_name != '') {
      //   data.video_url = file_name;
      // }
      // if (thumbnail_name != '') {
      //   data.thumbnail = thumbnail_name;
      // }



      await Common.update(
        tableName.TBL_TUTORIAL_VIDEOS,
        `id = ${videoId}`,
        data
      );


      return res.status(200).json({
        status: true,
        message: 'Video Information updated successfully',
        data: []
      });
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },


  delete: async function (req, res) {
    try {

      const video_id = req.params.video_id;

      const existingVideo = await Common.selectWhere(tableName.TBL_TUTORIAL_VIDEOS, `id = ${video_id} AND flag_deleted = 0`
      );
      if (!existingVideo.length) {
        return res.status(404).json({
          status: false,
          message: 'Video not found or already deleted',
          data: []
        });
      }
      const data = {
        flag_deleted: 1,
        updated_at: new Date(),
        // deleted_on: new Date()
      };
      await Common.update(tableName.TBL_TUTORIAL_VIDEOS, `id = ${video_id}`, data);
      return res.status(200).json({
        status: true,
        message: 'Video soft deleted successfully',
        data: []
      });
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  Datatable: async function (req, res) {
    try {
      var page = req.query.page ? parseInt(req.query.page) : 1;
      var per_page = req.query.per_page ? parseInt(req.query.per_page) : 5;
      var filter = req.query.filter ? req.query.filter.trim() : '';
      var offset = (page - 1) * per_page;
      let filterWhere = '1=1';

      if (filter !== '') {
        filterWhere += ` AND ( p.title LIKE '%${filter}%'   OR p.video_type LIKE '%${filter}%'  OR p.video_url LIKE '%${filter}%' )`;
      }



      var totalVideoData = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', filterWhere, 'COUNT(p.id) AS TotalVideos');
      var totalProducts = totalVideoData.length > 0 ? totalVideoData[0].TotalVideos : 0;
      var totalPages = Math.ceil(totalProducts / per_page);
      var videoData = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', filterWhere,
        '*',
        false, false, false, { field: 'p.order_by', order: 'ASC' }, per_page, offset
      );

      if (videoData.length > 0) {
        return res.status(200).json({
          status: true,
          message: 'Video List Found',
          data: videoData,
          page: page,
          per_page: per_page,
          total: totalProducts,
          total_pages: totalPages
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Video List Empty',
          data: [],
          page: page,
          per_page: per_page,
          total: totalProducts,
          total_pages: totalPages
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  getAllvideos: async function (req, res) {
    try {

      const thumbnailDir = uploadURL + videoThumbDir;
      const videoFullDir = uploadURL + videoDir;
      // var video_data = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', false, "p.title,p.video_type, CASE WHEN p.[thumbnail] IS NOT NULL AND p.[thumbnail] <> '' THEN CONCAT('" + thumbnailDir + "',p.[thumbnail]) ELSE NULL END AS thumbnail, CASE WHEN p.[video_url] IS NOT NULL AND p.[video_url] <> '' THEN CONCAT('" + videoFullDir + "',p.[video_url]) ELSE NULL END AS video_url,p.video_url as video_name", false, false, false, { field: 'p.order_by', order: 'ASC' });
       var video_data = await Common.get_info(0, tableName.TBL_TUTORIAL_VIDEOS + ' as p', 'p.flag_deleted', false, "p.title,p.video_type,thumbnail,p.video_url as video_name,video_url", false, false, false, { field: 'p.order_by', order: 'ASC' });
      // console.log(video_data, '--product data');
      if (video_data.length) {
        return res.status(200).json({
          status: true,
          message: 'Video Data Found',
          data: video_data,
         
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Video Data Not Found',
          data: []
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },
  stream: async function (req, res) {
    try {
      const filePath = path.join(basePath, uploadDir + videoDir, req.params.filename);
      console.log(filePath, 'stream path')
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("Video not found");
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Expose-Headers", "Content-Range");

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        });

        file.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  }


}