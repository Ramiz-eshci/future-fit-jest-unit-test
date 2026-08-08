const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let company = require('../controllers/company.controller')

router.get('/',checkAuth, function (req, res, next) {
    company.index(req, res, next);
});
router.post('/add',checkAuth, function (req, res, next) {
    company.add(req, res, next);
});
router.post('/edit/:company_id',checkAuth, function (req, res, next) {
    company.edit(req, res, next);
});
router.get('/get/:company_id',checkAuth, function (req, res, next) {
    company.getById(req, res, next);
});
router.get('/getDatatable',checkAuth, function (req, res, next) {
    company.datatable(req, res, next);
});
router.delete('/delete/:company_id',checkAuth, function (req, res, next) {
    company.delete(req, res, next);
});

module.exports = router