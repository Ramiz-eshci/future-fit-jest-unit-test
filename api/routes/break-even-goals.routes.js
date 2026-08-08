const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let breakEvenGoals = require('../controllers/break-even-goals.controller')

router.get("/getById/:goal_id", checkAuth, function (req, res) {
    breakEvenGoals.getById(req, res);    
});
router.get("/get", checkAuth, function (req, res) {
    breakEvenGoals.get(req, res);    
});
router.post("/add",checkAuth, function (req, res) {
    breakEvenGoals.add(req, res); 
});
// router.delete("/delete/:goal_id",checkAuth, function (req, res) {
//     breakEvenGoals.delete(req, res); 
// });
router.post("/delete/:goal_id",checkAuth, function (req, res) {
    breakEvenGoals.delete(req, res); 
});
router.post("/edit/:goal_id",checkAuth, function (req, res) {
    breakEvenGoals.edit(req, res); 
}); 
router.get("/getDatatable",checkAuth, function (req, res) {
    breakEvenGoals.Datatable(req, res); 
}); 


module.exports = router