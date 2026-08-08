const express = require('express')
const router = express.Router()
const checkAuth = require('../config/auth')

let auth = require('../controllers/auth.controller')

router.post('/login', function (req, res, next) {
    auth.login(req, res, next);
});
router.post('/register', function (req, res, next) {
    auth.register(req, res, next);
});
router.post('/change-password', checkAuth, function (req, res, next) {
    auth.ChangePassword(req, res, next);
});
router.get('/profile', checkAuth, function (req, res, next) {
    auth.profile(req, res, next);
});
router.post('/update-profile', checkAuth, function (req, res, next) {
    auth.update_profile(req, res, next);
});
router.post('/forgot-password', function (req, res, next) {
    auth.forgotPassword(req, res, next);
});
router.get('/logout', function (req, res, next) {
    auth.logout(req, res, next);
});
router.get('/role', function (req, res, next) {
    auth.role(req, res, next);
});



module.exports = router