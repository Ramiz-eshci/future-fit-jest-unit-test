const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let financial = require('../controllers/financial_assets.controller')
router.get("/getById/:financial_id", checkAuth, function (req, res) {
    financial.getById(req, res);    
});
router.post("/add", checkAuth, function (req, res) {
    financial.add(req, res); 
});
// router.delete("/delete/:financial_id", checkAuth, function (req, res) {
//     financial.delete(req, res); 
// });
router.post("/delete/:financial_id", checkAuth, function (req, res) {
    financial.delete(req, res); 
});
router.get("/getDatatable", checkAuth, function (req, res) {
    financial.Datatable(req, res); 
});
router.post("/edit/:financial_id",checkAuth, function (req, res) {
    financial.edit(req, res); 
}); 
 

module.exports = router