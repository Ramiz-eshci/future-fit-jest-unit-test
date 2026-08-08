const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let BEList = require('../controllers/be_listing.controller')

router.get("/getAllBE", checkAuth, function (req, res) {
    BEForm.getAllBE(req, res);
});
router.get("/getSiteDetails", checkAuth, function (req, res) {
    BEList.getSiteDetailsNew(req, res);
});
router.get("/getPurchaseDetails", checkAuth, function (req, res) {
    BEList.getPurchaseDetails(req, res);
});
router.get("/getFinancialDetails", checkAuth, function (req, res) {
    BEList.getFinancialDetails(req, res);
});
router.get("/getSiteDetailsCompany/:year", checkAuth, function (req, res) {
    BEList.getSiteDetailsCompanyWise(req, res);
});
router.get("/getEmployeeDetailsCom/:year", checkAuth, function (req, res) {
    BEList.getEmployeeDetailsCompanyWise(req, res);
});
router.get("/getProductDetailsCom/:year", checkAuth, function (req, res) {
    BEList.getProductDetailsCompanyWise(req, res);
});
router.get("/getBasicDetails/:fit_id", checkAuth, function (req, res) {
    BEList.getBasicDetails(req, res);
});

router.get("/getSiteDetails/:company_id/:fit_id", checkAuth, function (req, res) {
    BEList.getSiteDetails(req, res);
});
router.get("/getSiteDetailsCompanyAllYears/:beCode", checkAuth, function (req, res) {
    BEList.getSiteDetailsCompanyAllYears(req, res);
});
router.get("/getEmployeeDetailsCompanyAllYears/:beCode", checkAuth, function (req, res) {
    BEList.getEmployeeDetailsCompanyAllYears(req, res);
});

router.get("/getEmployeeDetails/:company_id/:fit_id", checkAuth, function (req, res) {
    BEList.getEmployeeDetails(req, res);
});
router.get("/getProductDetailsCompanyAllYears/:beCode", checkAuth, function (req, res) {
    BEList.getProductDetailsCompanyAllYears(req, res);
}
);
router.get("/getProductDetails/:company_id/:fit_id", checkAuth, function (req, res) {
    BEList.getProductDetails(req, res);
});
router.post("/getbe02Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE02Details(req, res);
});
router.post("/getbe03Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE03Details(req, res);
});
router.post("/getbe05Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE05Details(req, res);
});
router.post("/getbe06Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE06Details(req, res);
});

router.post("/getbe07Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE07Details(req, res);
});
router.post("/getbe08Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE08Details(req, res);
});
router.post("/getbe09Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE09Details(req, res);
});
router.post("/getbe11Details/:fit_id", checkAuth, function (req, res) {
    BEList.getBE11Details(req, res);
});
router.post("/getbe12Details/:fit_id", checkAuth, function (req, res) {
    BEList.getBE12Details(req, res);
});
router.post("/getbe13Details/:fit_id", checkAuth, function (req, res) {
    BEList.getBE13Details(req, res);
});
router.get("/getbe14Details/:fit_id", checkAuth, function (req, res) {
    BEList.getBE14Details(req, res);
});
router.post("/getbe16Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE16Details(req, res);
});
router.post("/getbe17Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE17Details(req, res);
});
router.post("/getbe18Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE18Details(req, res);
});
router.post("/getbe19Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE19Details(req, res);
});
router.post("/getbe20Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE20Details(req, res);
});
router.post("/getbe21Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE21Details(req, res);
});
router.post("/getbe22Details/:company_id", checkAuth, function (req, res) {
    BEList.getBE22Details(req, res);
});

router.get("/GetBEListDatatable", checkAuth, function (req, res) {
    // console.log("GetBEListDatatable");
    BEList.datatable(req, res);
});

// show main list 
router.get("/GetBEListDatatableNew", checkAuth, function (req, res) {
    BEList.datatable_new(req, res);
});
// router.delete("/delete/:fit_entry_id",checkAuth, function (req, res) {
//     BEList.delete(req, res); 
// });
router.post("/delete/:fit_entry_id", checkAuth, function (req, res) {
    BEList.delete(req, res);
});
module.exports = router