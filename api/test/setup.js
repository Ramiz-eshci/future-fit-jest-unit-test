require('dotenv').config();

global.baseURL = 'http://localhost:3600/';
global.basePath = __dirname + '/../';
global.userProfileDir = 'profile_pic/';
global.uploadPath = __dirname + '/../uploads/';
global.uploadURL = global.baseURL + 'uploads/';
global.uploadDir = 'uploads/';
global.videoDir = 'videos/';
global.videoThumbDir = 'videos/thumbnails/';

process.env.NODE_ENV = 'test';