const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let purchase = require('../controllers/purchase_information.controller')
 
router.get("/getById/:purchase_information_id", checkAuth, function (req, res) {
    purchase.getById(req, res);    
});

router.post("/add", checkAuth, function (req, res) {
    purchase.add(req, res); 
});

// router.delete("/delete/:purchase_information_id", checkAuth, function (req, res) {
//     purchase.delete(req, res); 
// });

router.post("/delete/:purchase_information_id", checkAuth, function (req, res) {
    purchase.delete(req, res); 
});

router.get("/getDatatable", checkAuth, function (req, res) {
    purchase.Datatable(req, res); 
});

router.post("/edit/:purchase_information_id", checkAuth, function (req, res) {
    purchase.edit(req, res); 
});

module.exports = router