const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let siteInformation = require('../controllers/siteinformation.controller')

router.get("/getById/:site_id", checkAuth, function (req, res) {
    siteInformation.getById(req, res);    
});
router.post("/add",checkAuth, function (req, res) {
    siteInformation.add(req, res); 
});
// router.delete("/delete/:site_id",checkAuth, function (req, res) {
//     siteInformation.delete(req, res);
// });
router.post("/delete/:site_id",checkAuth, function (req, res) {
    siteInformation.delete(req, res); 
});
router.post("/edit/:site_id",checkAuth, function (req, res) {
    siteInformation.edit(req, res); 
}); 
router.get("/getDatatable",checkAuth, function (req, res) {
    siteInformation.Datatable(req, res); 
}); 
router.get("/sites/:company_id",checkAuth, function (req, res) {
    siteInformation.get(req, res); 
}); 


module.exports = router