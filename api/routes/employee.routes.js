const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let employee = require('../controllers/employee.controller')


router.get("/getById/:employee_id",checkAuth, function (req, res) {
    employee.getById(req, res);    
});      
router.post("/add",checkAuth, function (req, res) {
    employee.add(req, res); 
});
// router.delete("/delete/:employee_id",checkAuth, function (req, res) {
//     employee.delete(req, res); 
// });
router.post("/delete/:employee_id",checkAuth, function (req, res) {
    employee.delete(req, res); 
});
router.post("/edit/:employee_id",checkAuth, function (req, res) {
    employee.edit(req, res); 
}); 
router.get("/getdatatable",checkAuth, function (req, res) {
    employee.Datatable(req, res);    
}); 
module.exports = router