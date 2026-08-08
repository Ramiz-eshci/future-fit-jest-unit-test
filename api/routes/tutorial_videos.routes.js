const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let tutorial_videos = require('../controllers/tutorial_videos.controller')

router.post("/add",checkAuth, function (req, res) {
    tutorial_videos.add(req, res); 
});
router.get("/getById/:video_id", checkAuth, function (req, res) {
    tutorial_videos.getById(req, res);
});
router.post("/edit/:video_id", checkAuth, function (req, res) {
    tutorial_videos.edit(req, res);
});
// router.delete("/delete/:video_id",checkAuth, function (req, res) {
//     tutorial_videos.delete(req, res); 
// });
router.post("/delete/:video_id",checkAuth, function (req, res) {
    tutorial_videos.delete(req, res); 
});
router.get("/getDatatable",checkAuth, function (req, res) {
    tutorial_videos.Datatable(req, res); 
}); 
router.get("/getAllvideos",checkAuth, function (req, res) {
    tutorial_videos.getAllvideos(req, res); 
}); 
router.get("/stream/:filename",checkAuth, function (req, res) {
    tutorial_videos.stream(req, res); 
}); 
 

module.exports = router