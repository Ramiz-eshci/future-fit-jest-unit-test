const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let relevance = require('../controllers/relevance.controller')
router.post("/add",checkAuth, function (req, res) {
    relevance.add(req, res); 
});
router.get("/getById/:relevance_id", checkAuth, function (req, res) {
    relevance.getById(req, res);
});
router.post("/edit/:relevance_id", checkAuth, function (req, res) {
    relevance.edit(req, res);
});
// router.delete("/delete/:relevance_id",checkAuth, function (req, res) {
//     relevance.delete(req, res);
// });
router.post("/delete/:relevance_id",checkAuth, function (req, res) {
    relevance.delete(req, res); 
});
router.get("/get",checkAuth, function (req, res) {
    relevance.get(req, res); 
}); 
router.get("/datatable",checkAuth, function (req, res) {
    relevance.Datatable(req, res);     
}); 




module.exports = router