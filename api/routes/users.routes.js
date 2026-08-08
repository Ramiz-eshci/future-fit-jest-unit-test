const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let users = require('../controllers/users.controller')

router.get("/get", checkAuth, function (req, res) {
    users.get(req, res);    
});
router.get("/getDatatable",checkAuth, function (req, res) {
    users.Datatable(req, res); 
});
router.post("/add",checkAuth, function (req, res) {
    users.add(req, res); 
});
router.get("/getbyId/:user_id", checkAuth, function (req, res) {
    users.getById(req, res);    
});
router.post("/edit/:user_id",checkAuth, function (req, res) {
    users.edit(req, res); 
}); 
// router.delete("/delete/:user_id",checkAuth, function (req, res) {
//     users.delete(req, res); 
// });
router.post("/delete/:user_id",checkAuth, function (req, res) {
    users.delete(req, res); 
});
router.get("/getrolelist", checkAuth, function (req, res) {
    users.getRoleList(req, res);    
});
  


module.exports = router