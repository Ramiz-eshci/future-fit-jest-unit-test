const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let list = require('../controllers/list.controller')
router.get("/company", function (req, res) {
    list.company_list(req, res);    
});
router.get("/common_fitness_criteria", checkAuth, function (req, res) {
    list.Common_fitness_criteria(req, res);    
});
router.get("/Resourcetypes",checkAuth, function (req, res) {
    list.Resourcetypes(req, res);    
});

router.get("/Siteassessed", checkAuth, function (req, res) {
    list.Siteassessed(req, res);    
});

router.get("/siteassessedwaste", checkAuth, function (req, res) {
    list.Siteassessedwaste(req, res);    
});
router.get("/producttype", checkAuth, function (req, res) {
    list.ProductType(req, res);    
});
router.get("/sites/:company_id", checkAuth, function (req, res) {
    list.getCompanySites(req, res);    
});

router.get("/product/:company_id", checkAuth, function (req, res) {
    list.product_list(req, res);   
});

router.get("/employee/:company_id", checkAuth, function (req, res) {
    list.getEmployeeList(req, res); 
});
router.get("/relevanace", checkAuth, function (req, res) {
    list.getRelevanaceList(req, res); 
});
router.get("/relevanace4data", checkAuth, function (req, res) {
    list.getRelevanaceListBE03(req, res); 
});
router.get("/relevanaceBE05", checkAuth, function (req, res) {
    list.getRelevanaceListBE05(req, res); 
});
router.get("/noGhgEmissionsBE06", checkAuth, function (req, res) {
    list.getNoGhgEmissionsListBE06(req, res); 
});
router.get("/be04_category", checkAuth, function (req, res) {
    list.be04_category_list(req, res); 
});
router.get("/getPurchase/:company_id", checkAuth, function (req, res) {
    // console.log('hellllloe');
    list.getCompanyPurchase(req, res); 
});
router.get("/getFinanicialAsset/:company_id", checkAuth, function (req, res) {
    // console.log('hellllloe');
    list.getCompanyFinanicialAsset(req, res); 
});
router.get("/getMenuList", checkAuth, function (req, res) {
    // console.log('hellllloe');
    list.getMenuList(req, res); 
});
 
router.get("/getrolepermissions/:role_id", checkAuth, function (req, res) {
    list.getRolePermissions(req, res); 
});



module.exports = router