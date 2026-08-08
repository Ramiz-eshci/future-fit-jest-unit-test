const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let role = require('../controllers/role.controller')

router.get("/getDatatable", checkAuth, function (req, res) {
    role.Datatable(req, res);
});

router.get("/getById/:role_id", checkAuth, function (req, res) {
    role.getById(req, res);
});

router.get("/getMenuTree", checkAuth, function (req, res) {
    role.getMenuTree(req, res);
});   

router.post("/add", checkAuth, function (req, res) {
    role.add(req, res);
});

router.post("/edit/:role_id", checkAuth, function (req, res) {
    role.edit(req, res);
});

router.post("/delete/:role_id", checkAuth, function (req, res) {
    role.delete(req, res);
});
module.exports = router