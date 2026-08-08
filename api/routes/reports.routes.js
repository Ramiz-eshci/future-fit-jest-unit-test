const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let reports = require('../controllers/reports.controller')
 
router.get("/report/:company_id", checkAuth, function (req, res) {
    reports.getCompanyReport(req, res);
});
router.get("/get-sep-data/:index", checkAuth, function (req, res) {
    reports.getsepData(req, res);
});
router.get("/get-user-data/", checkAuth, function (req, res) {
    reports.getUserData(req, res);
});
router.get("/admin-dashboard-data/", checkAuth, function (req, res) {
    reports.admindashboardData(req, res);   
});

module.exports = router