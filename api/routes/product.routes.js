const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let product = require('../controllers/product.controller')

router.post("/add",checkAuth, function (req, res) {
    product.add(req, res); 
});
router.get("/getById/:product_id", checkAuth, function (req, res) {
    product.getById(req, res);
});
router.post("/edit/:product_id", checkAuth, function (req, res) {
    product.edit(req, res);
});
// router.delete("/delete/:product_id",checkAuth, function (req, res) {
//     product.delete(req, res); 
// });
router.post("/delete/:product_id",checkAuth, function (req, res) {
    product.delete(req, res); 
});
router.get("/getDatatable",checkAuth, function (req, res) {
    product.Datatable(req, res); 
}); 
 

module.exports = router