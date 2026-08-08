const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let ref = require('../controllers/reference-year.controller')

router.post("/edit",checkAuth, function (req, res) {
    ref.edit(req, res); 
});
router.get("/getById/:site_id", checkAuth, function (req, res) {
    ref.getById(req, res);
});
 

module.exports = router