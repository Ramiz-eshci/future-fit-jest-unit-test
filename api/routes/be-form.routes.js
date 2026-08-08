const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let BEForm = require('../controllers/be-form.controller')

router.get("/getAllBE", checkAuth, function (req, res) {
    BEForm.getAllBE(req, res);    
});
// router.delete("/delete/:id",checkAuth, function (req, res) {
//     BEForm.delete_Be03(req, res); 
// });
router.post("/delete/:id",checkAuth, function (req, res) {
    BEForm.delete_Be03(req, res); 
});
 
router.post("/soft-delete", checkAuth, function (req, res) {
    BEForm.softDelete(req, res); 
});

router.get("/getAllBE2", checkAuth, function (req, res) {
    BEForm.getAllBE2(req, res);    
});
router.post("/submit/submit_basic_future_fit", checkAuth, function (req, res) {
    BEForm.submit_basic_fiture_fit(req, res);    
});
router.post("/submit/be01", checkAuth, function (req, res) {
    BEForm.submit_be01(req, res);    
});
router.post("/submit/be02", checkAuth, function (req, res) {
    BEForm.submit_be02(req, res);    
});
router.post("/submit/be03", checkAuth, function (req, res) {
    BEForm.submit_be03(req, res);    
});
router.post("/submit/be04", checkAuth, function (req, res) {
    BEForm.submit_be04(req, res);    
});

router.post("/submit/be05", checkAuth, function (req, res) {
    BEForm.submit_be05(req, res);    
});
router.post("/submit/be06", checkAuth, function (req, res) {
    BEForm.submit_be06(req, res);    
});
router.post("/submit/be07", checkAuth, function (req, res) {
    BEForm.submit_be07(req, res);    
});
router.post("/submit/be08", checkAuth, function (req, res) {
    BEForm.submit_be08(req, res);    
});
router.post("/submit/be09", checkAuth, function (req, res) {
    BEForm.submit_be09(req, res);    
});
router.post("/submit/be10", checkAuth, function (req, res) {
    BEForm.submit_be10(req, res);    
});
router.post("/submit/be11", checkAuth, function (req, res) {
    BEForm.submit_be11(req, res); 
});
router.post("/submit/be12", checkAuth, function (req, res) {
    BEForm.submit_be12(req, res); 
});
router.post("/submit/be13", checkAuth, function (req, res) {
    BEForm.submit_be13(req, res); 
});
router.post("/submit/be14", checkAuth, function (req, res) {
    BEForm.submit_be14(req, res); 
});
router.post("/submit/be15", checkAuth, function (req, res) {
    BEForm.submit_be15(req, res);  
});
router.post("/submit/be16", checkAuth, function (req, res) {
    BEForm.submit_be16(req, res);  
});
router.post("/submit/be17", checkAuth, function (req, res) {
    BEForm.submit_be17(req, res);  
});
router.post("/submit/be18", checkAuth, function (req, res) {
    BEForm.submit_be18(req, res);  
});
router.post("/submit/be19", checkAuth, function (req, res) {
    BEForm.submit_be19(req, res);  
});
router.post("/submit/be20", checkAuth, function (req, res) {
    BEForm.submit_be20(req, res);  
});
router.post("/submit/be21", checkAuth, function (req, res) {
    BEForm.submit_be21(req, res);  
});
router.post("/submit/be22", checkAuth, function (req, res) {
    BEForm.submit_be22(req, res);  
});
router.post("/submit/be23", checkAuth, function (req, res) {
    BEForm.submit_be23(req, res);    
});
module.exports = router