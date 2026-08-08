const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let be04Category = require('../controllers/be04_category.controller')

router.post("/add", checkAuth, function (req, res) {
    be04Category.add(req, res); 
});

// router.delete("/delete/:category_id", checkAuth, function (req, res) {
//     be04Category.delete(req, res); 
// });
router.post("/delete/:category_id", checkAuth, function (req, res) {
    be04Category.delete(req, res); 
});
router.get("/getById/:category_id", checkAuth, function (req, res) {
    be04Category.getById(req, res);    
});
router.get("/getDatatable", checkAuth, function (req, res) {
    be04Category.Datatable(req, res); 
});

router.post("/edit/:category_id", checkAuth, function (req, res) {
    be04Category.edit(req, res); 
});

module.exports = router