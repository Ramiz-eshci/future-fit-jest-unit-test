const Logs = require('../controllers/common/logs.controller');
const tableName = require('../controllers/common/table.controller');
const Common = require('../models/common');
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { Validator } = require('node-input-validator');
const randomstring = require("randomstring");
var fileExtension = require('file-extension');
const axios = require('axios');
const requestIp = require('request-ip');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();
let logoFileName = null;

const crypto = require('crypto');
const ENC_KEY = crypto.createHash('sha256').update(String(process.env.ENC_KEY)).digest(); // 32 bytes key
const IV = crypto.randomBytes(16); // Initialization vector
const { ConfidentialClientApplication } = require("@azure/msal-node");

const FileType = require('file-type');


var auth = {
    login: async function (req, res) {
        try {

            const ValidationCheck = new Validator(req.body, {
                Email: 'required|email',
                Password: 'required'
            });
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                return res.status(400).json({ status: false, message: ValidationCheck.errors.Email.message, data: ValidationCheck.errors });
            }
            data = await Common.selectWhere(tableName.TBL_USERS, 'email = "' + req.body.Email.trim() + '" AND is_deleted = 0');
            if (!data.length) {
                return res.status(400).json({ status: false, message: 'Invalid email address', data: [] });
            }
            if (!data[0].is_active) {
                return res.status(400).json({ status: false, message: 'Your account is not active', data: [] });
            }

            let user = data[0];
            var checkPassword = await bcrypt.compare(req.body.Password.trim(), data[0].password)
            if (checkPassword) {
                //  console.log("login");

                const payload = {
                    UserID: user.user_id,
                    RoleID: user.role_id,
                    UserName: user.username,
                    Email: user.email,
                    CompanyID: user.company_id
                }
                const encryptedPayload = encryptPayload(payload);
                const token = jwt.sign(encryptedPayload,
                    process.env.JWT_KEY, {
                    expiresIn: "1d"
                });
                req.session.login = true;
                user.profile_pic = user.logo
                    ? baseURL + uploadDir + userProfileDir + user.logo
                    : null;
                const filteredData = {
                    user_id: data[0].user_id,
                    role_id: data[0].role_id,
                    first_name: data[0].first_name,
                    last_name: data[0].last_name,
                    email: data[0].email,
                    username: data[0].username,
                    phone_number: data[0].phone_number,
                    company_id: data[0].company_id,
                    profile_pic: data[0].logo
                        ? baseURL + uploadDir + userProfileDir + data[0].logo
                        : null
                };
                delete user.password;
                delete user.is_active;
                const encryptedUser = encryptPayload(user);

                return res.status(200).json({ status: true, message: 'You have logged in successfully', data: encryptedUser, token: token });
            } else {
                return res.status(400).json({ status: false, message: 'Incorrect Password', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },
    register: async function (req, res) {
        try {
            var dataEmail = await Common.selectWhere(tableName.TBL_USERS, 'Email = "' + req.body.Email.trim() + '"');
            var dataUser = await Common.selectWhere(tableName.TBL_USERS, 'UserName = "' + req.body.UserName.trim() + '"');
            const dataPhone = await Common.selectWhere(tableName.TBL_USERS, `phone_number = '${req.body.PhoneNumber}'`);
            if (dataEmail.length > 0) {
                return res.status(400).json({ status: false, message: "Email address already register", data: [] });
            }
            if (dataUser.length > 0) {
                return res.status(400).json({ status: false, message: "Username Already Taken", data: [] });
            }
            if (dataPhone.length > 0) {
                return res.status(400).json({ status: false, message: "Phone number already registered", data: [] });
            }
            const clientIp = requestIp.getClientIp(req);

            const password = req.body.Password?.trim();
            if (!password) {
                return res.status(400).json({ status: false, message: "Password is required", data: [] });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            var DataObject = {
                role_id: 2,
                first_name: req.body.FirstName,
                last_name: req.body.LastName,
                username: req.body.UserName,
                email: req.body.Email,
                password: hashedPassword,
                is_active: true,
                logo: 'user-1.jpg',
                is_deleted: false,
                phone_number: req.body.PhoneNumber || null,
                created_by: 1,
                created_on: new Date()
            };
            await Common.insert(tableName.TBL_USERS, DataObject)
            res.status(200).json({ status: true, message: "Successfull Add User", data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    ChangePassword: async function (req, res) {
        try {
            const data = await Common.selectWhere(tableName.TBL_USERS, 'user_id = ' + req.userData.UserID);
            if (!data.length) {
                return res.status(400).json({ status: false, message: 'User Not Found', data: [] });
            }
            const oldPassword = req.body.OldPassword;
            const newPassword = req.body.NewPassword;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ status: false, message: 'Old or new password missing', data: [] });
            }
            const checkPassword = await bcrypt.compare(oldPassword.trim(), data[0].password);
            if (checkPassword) {
                const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
                const UpdateData = { password: hashedPassword };
                await Common.update(tableName.TBL_USERS, `user_id = ${req.userData.UserID}`, UpdateData);
                return res.status(200).json({ status: true, message: 'Password changed successfully', data: [] });
            } else {
                return res.status(400).json({ status: false, message: 'Old Password is incorrect', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    profile: async function (req, res) {
        try {
            var user_id = req.userData.UserID;
            var userData = await Common.get_info(0, tableName.TBL_USERS, 'is_deleted', 'user_id=' + user_id, 'user_id,first_name,last_name,email,phone_number');

            if (userData.length) {

                return res.status(200).json({ status: true, message: 'User Profile Found', data: userData });

            } else {
                return res.status(400).json({ status: false, message: 'User Not Found', data: [] });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    update_profile: async function (req, res) {
        try {
            var user_id = req.userData.UserID;
            // console.log("userid" + user_id);
            const ValidationCheck = new Validator(req.body, {
                email: 'required',
                firstName: 'required',
                lastName: 'required',
                phoneNumber: 'required',
            });
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, error: 'validation_error', message: '', data: errors });
            }
            exists_user = 0
            var dataEmail = await Common.selectWhere(tableName.TBL_USERS, 'email = "' + req.body.email.trim() + '" AND user_id !=' + user_id);
            var dataphone = await Common.selectWhere(tableName.TBL_USERS, 'phone_number = "' + req.body.phoneNumber.trim() + '" AND user_id !=' + user_id);
            if (dataEmail.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Email address already register", data: [] });
            } else if (dataphone.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Phone number address already register", data: [] });
            }
            if (req.files && req.files.Logo) {
                const LogoFile = req.files.Logo;
                const ext = LogoFile.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpg', 'jpeg', 'png'];

                if (!allowedExtensions.includes(ext)) {
                    return res.status(400).json({ status: false, message: "Invalid file format. Only JPG, JPEG, and PNG allowed." });
                }
                const type = await FileType.fromBuffer(LogoFile.data);


                if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
                    return res.status(400).json({
                        status: false,
                        message: 'Invalid image.'
                    });
                }
                logoFileName = `user_logo_${Date.now()}.${ext}`;
                const uploadProfile = uploadPath + userProfileDir + logoFileName;

                // Ensure directory exists
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                if (!fs.existsSync(uploadPath + userProfileDir)) fs.mkdirSync(uploadPath + userProfileDir, { recursive: true });

                await LogoFile.mv(uploadProfile);

                // Optional: Delete old image
                let oldData = await Common.selectWhere(tableName.TBL_USERS, `user_id = ${user_id}`);
                if (oldData.length > 0 && oldData[0].logo) {
                    const oldFilePath = uploadPath + userProfileDir + oldData[0].logo;
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }
            if (exists_user == 0) {
                var UpdateData = {
                    'first_name': req.body.firstName,
                    'last_name': req.body.lastName,
                    'phone_number': req.body.phoneNumber,
                    'email': req.body.email
                }
                if (logoFileName) {
                    UpdateData.logo = logoFileName;
                }
                await Common.update(tableName.TBL_USERS, `user_id =  ${req.userData.UserID}`, UpdateData);
                // rows = await Common.get_info(req.userData.UserID, tableName.TBL_USERS, 'user_id', '', 'user_id,role_id,username,first_name,last_name,phone_number,email,CASE WHEN logo is NULL OR logo ="" THEN NULL ELSE CONCAT("' + baseURL + uploadDir + userProfileDir + '",logo) END as profile_pic');
                //                 rows = await Common.get_info(
                //   req.userData.UserID,
                //   tableName.TBL_USERS,
                //   'user_id',
                //   '',
                //   `user_id,role_id,username,first_name,last_name,phone_number,email,
                //    CASE
                //       WHEN logo IS NULL OR logo = '' THEN NULL
                //       ELSE CONCAT('${baseURL}${uploadDir}${userProfileDir}', logo)
                //    END AS profile_pic`
                // );
                const filePath = `${baseURL}uploads/profile_pic/`;

                rows = await Common.get_info(
                    req.userData.UserID,
                    tableName.TBL_USERS,
                    'user_id',
                    '',
                    `user_id,role_id,username,first_name,last_name,phone_number,email,
   CASE 
      WHEN logo IS NULL OR logo = '' THEN NULL 
      ELSE CONCAT('${filePath}', logo)
   END AS profile_pic`
                );
                return res.status(200).json({ status: true, message: 'Profile Changed successfully', data: rows });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    forgotPassword: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                Email: 'required|email',
            });
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, error: 'validation_error', message: errors.Email, data: errors });
            }
            data = await Common.selectWhere(tableName.TBL_USERS, 'email = "' + req.body.Email + '"');
            if (!data.length) {
                return res.status(400).json({ status: false, message: 'User not found', data: [] });
            }
            // var transporter = nodemailer.createTransport(smtpTransport({
            //     host: "smtp.gmail.com",
            //     port: 465,
            //     secure: true,
            //     auth: {
            //          user: 'uzair@eshci.com',
            //         pass: 'tdiyvekrsyoyebkx'

            //     },
            //     tls: {
            //         rejectUnauthorized: true
            //     },
            //     debug: true
            // }));
            const msalConfig = {
                auth: {
                    clientId: process.env.EMAIL_CLIENTID,
                    authority: `https://login.microsoftonline.com/${process.env.EMAIL_TENANTID}`,
                    clientSecret: process.env.EMAIL_CLIENTSECRET,
                }
            };
            const cca = new ConfidentialClientApplication(msalConfig);

            const tokenResponse = await cca.acquireTokenByClientCredential({
                scopes: ["https://graph.microsoft.com/.default"],
            });

            const accessToken = tokenResponse.accessToken;

            const newPassword = generateStrongPassword();
            //const newPassword = 'Test@1234';
            var user_data = await Common.get_info(`'${req.body.Email.trim()}'`, tableName.TBL_USERS, 'email', '', 'first_name,last_name')
            user_data = user_data[0]
            var name = user_data.first_name + ' ' + user_data.last_name
            const templatePath = path.join(__dirname, "../templates", "forgot_password_2.ejs");
            const html = await ejs.renderFile(templatePath, { name, newPassword });
            // let mailOptions = {
            //     from: '"Future Fit" <ramizg.aipl@gmail.com>',
            //     to: req.body.Email,
            //     subject: "New password request",
            //     html: html
            // };
            // transporter.sendMail(mailOptions, async (error, info) => {
            //     if (error) {
            //         res.json({ status: false, message: 'Sorry!!! Mail not sent', data: error });
            //     } else {
            //         var password = await bcrypt.hash(newPassword, 10)
            //         var UpdateData = {
            //             password: password,
            //             'modified_on': new Date()
            //         }
            //         await Common.update(tableName.TBL_USERS, `email = '${req.body.Email}'`, UpdateData)
            //         return res.status(200).json({ status: true, message: 'Request sent', data: [] });
            //     }
            // });
            try {

                // Send Mail using Microsoft Graph
                const response = await axios.post(
                    `https://graph.microsoft.com/v1.0/users/${process.env.EMAIL_USER}/sendMail`,
                    {
                        message: {
                            subject: "New Password Request",
                            body: {
                                contentType: "HTML",
                                content: html
                            },
                            toRecipients: [
                                {
                                    emailAddress: {
                                        address: req.body.Email
                                    }
                                }
                            ]
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                // If mail sent successfully
                if (response.status === 202) {

                    // Hash Password
                    const password = await bcrypt.hash(newPassword, 10);

                    // Update Password
                    const UpdateData = {
                        password: password,
                        modified_on: new Date()
                    };

                    await Common.update(
                        tableName.TBL_USERS,
                        `email='${req.body.Email}'`,
                        UpdateData
                    );

                    return res.status(200).json({
                        status: true,
                        message: 'Request sent',
                        data: []
                    });
                }

                // Mail failed
                return res.status(200).json({
                    status: false,
                    message: 'Sorry!!! Mail not sent',
                    data: []
                });

            } catch (error) {

                console.log("Graph Mail Error:", error.response?.data || error.message);

                return res.status(500).json({
                    status: false,
                    message: 'Sorry!!! Mail not sent',
                    data: error.response?.data || error.message
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    role: async function (req, res) {
        try {
            var data = await Common.query('select * from tbl_role')
            res.status(200).json({ status: true, message: 'Role List', data: data });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    logout: async function (req, res) {
        try {
            req.session.login = false;
            res.status(200).json({ status: true, message: 'You have logged out successfully', data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
}
module.exports = auth;


function encryptPayload(payload) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
        iv: IV.toString('base64'),
        data: encrypted
    };
}
function generateStrongPassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const password = Array.from(crypto.randomFillSync(new Uint8Array(length)))
        .map((x) => charset[x % charset.length])
        .join('');
    return password;
}