const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const bcrypt = require('bcryptjs');

module.exports = {

    get: async function (req, res) {
        try {
            const selectedFields = 'user_id ,first_name,last_name,phone_number,email';
            const categories = await Common.get_info(0, tableName.TBL_USERS, 'is_deleted', '', selectedFields);
            if (categories.length) {
                return res.status(200).json({
                    status: true,
                    message: 'User List Found',
                    data: categories
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'User List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getById: async function (req, res) {
        try {
            const userId = req.params.user_id;
            const selectedFields = 'user_id, first_name, role_id, last_name, phone_number, email, company_id, username';
            const whereCondition = "is_deleted = 0";
            const site = await Common.get_info(userId, tableName.TBL_USERS, 'user_id', whereCondition, selectedFields);
            if (site.length) {
                const userGoals = await Common.selectWhere(tableName.TBL_USERBEDETAILS, `user_id = ${userId} AND is_deleted = 0 `);
                const goal_ids = userGoals.map(g => g.goal_id);
                site[0].goal_ids = goal_ids;
                return res.status(200).json({
                    status: true,
                    message: 'User Information Found',
                    data: site
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'User Information Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },


    Datatable: async function (req, res) {
        try {
            var page = req.query.page ? parseInt(req.query.page) : 1;
            var per_page = req.query.per_page ? parseInt(req.query.per_page) : 5;
            var filter = req.query.filter ? req.query.filter.trim() : '';
            var offset = (page - 1) * per_page;
            let filterWhere = '1=1';
            if (filter !== '') {
                filterWhere = ` ( first_name LIKE '%${filter}%' OR  last_name LIKE '%${filter}%' OR  tbg.goal_code LIKE '%${filter}%' OR  phone_number LIKE '%${filter}%' OR  email LIKE '%${filter}%' OR   c.company_name LIKE '%${filter}%') `;
            }
            if (req.userData.RoleID != 1) {
                filterWhere += ' AND us.company_id = ' + req.userData.CompanyID;

            }
            var company_join = [
                {
                    'type': 'LEFT',
                    'table': tableName.TBL_COMPANY + ' as c',
                    'on': 'us.company_id = c.company_id'
                },
                {
                    type: 'LEFT',
                    table: tableName.TBL_USERBEDETAILS + ' as ubd',
                    on: 'us.user_id = ubd.user_id AND ubd.is_deleted = 0'
                },
                {
                    type: 'LEFT',
                    table: tableName.TBL_BREAK_EVEN_GOALS + ' as tbg',
                    on: 'ubd.goal_id = tbg.goal_id AND tbg.flag_deleted = 0'
                }
            ]
            var totalUserData = await Common.get_info(0, tableName.TBL_USERS + ' us', 'us.is_deleted', filterWhere, 'COUNT(us.user_id) AS totalUsers', false, company_join);
            var totalUsers = totalUserData.length > 0 ? totalUserData[0].totalUsers : 0;
            var totalPages = Math.ceil(totalUsers / per_page);
            var usersData = await Common.get_info(0, tableName.TBL_USERS + ' us', 'us.is_deleted', filterWhere, `us.user_id, us.first_name, us.last_name, us.company_id, c.company_name, us.phone_number, us.email, STRING_AGG(tbg.goal_code, ', ') WITHIN GROUP (ORDER BY tbg.goal_code) AS goal_codes`, false, company_join,  `us.user_id, us.first_name, us.last_name, us.company_id, c.company_name, us.phone_number, us.email`, { field: 'us.first_name', order: 'ASC' }, per_page, offset);
            if (usersData.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Users List Found',
                    data: usersData,
                    page: page,
                    per_page: per_page,
                    total: totalUsers,
                    total_pages: totalPages
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Users List Empty',
                    data: [],
                    page: page,
                    per_page: per_page,
                    total: totalUsers,
                    total_pages: totalPages
                });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    
    add: async function (req, res) { 
        try {
            const ValidationCheck = new Validator(req.body, {   
                FirstName: 'required',
                LastName: 'required',
                Email: 'required',
                phone_number: 'required',
                password: 'required',
                    RoleId: 'required',
            });
            const CompanyID = req.body.CompanyID && req.body.CompanyID !== ''
                ? req.body.CompanyID
                : req.userData.CompanyID;

            if (req.userData.RoleID == 1) {
                ValidationCheck.CompanyID = 'required';
            }
            const FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            const email = req.body.Email.toLowerCase().trim();
            const phone = req.body.phone_number;
            const [dataEmail, dataPhone] = await Promise.all([
                Common.selectWhere(tableName.TBL_USERS, `lower(email) = '${email}' AND is_deleted != 1`),
                Common.selectWhere(tableName.TBL_USERS, `phone_number = '${phone}' AND is_deleted != 1`)
            ]);

            if (dataEmail.length > 0) {
                return res.status(400).json({ status: false, message: "Email address already register", data: [] });
            }
            if (dataPhone.length > 0) {
                return res.status(400).json({ status: false, message: "Phone Number Already exists", data: [] });
            }
            const password = req.body.password?.trim();
            const hashedPassword = await bcrypt.hash(password, 10);
            const role = 3;
            const userData = {
                role_id: req.body.RoleId,
                first_name: req.body.FirstName,
                last_name: req.body.LastName,
                username: email,
                phone_number: phone,
                email: email,    
                password: hashedPassword,
                company_id: CompanyID,
                logo:'user-1.jpg',
                is_active: 1,
                is_deleted: 0,
                created_on: new Date(),
            };
            const insertedUser = await Common.insert(tableName.TBL_USERS, userData);
            const userId = insertedUser.insertId;
            const assignedGoals = req.body.be_forms || [];
            if (assignedGoals.length > 0) {
                for (let goalId of assignedGoals) {
                    const userBEDetail = {
                        user_id: userId,
                        goal_id: goalId,
                        created_on: new Date(),
                        is_deleted: 0,
                    };
                    await Common.insert(tableName.TBL_USERBEDETAILS, userBEDetail);  
                }
            }
            return res.status(200).json({ status: true, message: "User added successfully", data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    edit: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                FirstName: 'required',
                LastName: 'required',
                Email: 'required',
                phone_number: 'required',
                    RoleId: 'required',
            });
            const user_id = req.params.user_id;
            const FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            let exists_user = 0;
            const email = req.body.Email.toLowerCase().trim();
            const phone = req.body.phone_number;
            const dataEmail = await Common.selectWhere(
                tableName.TBL_USERS,
                `lower(email) = '${email}' AND is_deleted !=1 AND user_id != ${user_id}`
            );
            const dataPhone = await Common.selectWhere(
                tableName.TBL_USERS,
                `phone_number = '${phone}' AND is_deleted != 1 AND user_id != ${user_id}`
            );

            if (dataEmail.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Email address already registered", data: [] });
            }

            if (dataPhone.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Phone number already exists", data: [] });
            }

            let existingUser = await Common.selectWhere(tableName.TBL_USERS, `user_id = ${user_id}`);
            let oldLogo = existingUser.length > 0 ? existingUser[0].logo : '';
            if (exists_user == 0) {
                const DataObject = {
                    first_name: req.body.FirstName,
                    last_name: req.body.LastName,
                    role_id: req.body.RoleId,
                    username: req.body.Email,
                    phone_number: req.body.phone_number,
                    email: req.body.Email,
                    modified_by: req.userData.UserID,
                    modified_on: new Date()
                };

                await Common.update(tableName.TBL_USERS, `user_id = ${user_id}`, DataObject);
                await Common.update(tableName.TBL_USERBEDETAILS,  `user_id = ${user_id}`, { is_deleted: 1 } );
                const assignedForms = req.body.be_forms || [];
                for (let goalId of assignedForms) {
                    const existing = await Common.selectWhere( tableName.TBL_USERBEDETAILS, `user_id = ${user_id} AND goal_id = ${goalId}`
                    );
                    if (existing.length > 0) {
                        await Common.update(  tableName.TBL_USERBEDETAILS,  `user_id = ${user_id} AND goal_id = ${goalId}`, { is_deleted: 0 }
                        );
                    } else {
                        const insertObj = {
                            user_id: user_id,
                            goal_id: goalId,
                            is_deleted: 0,
                            created_on: new Date()
                        };
                        await Common.insert(tableName.TBL_USERBEDETAILS, insertObj);
                    }
                }
                return res.status(200).json({ status: true, message: "Successfully Updated User Data", data: [] });
            }
        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    delete: async function (req, res) {
        try {
            const userId = req.params.user_id;

            const existingUser = await Common.selectWhere(tableName.TBL_USERS, `user_id = ${userId} AND is_deleted = 0`);
            if (!existingUser.length) {
                return res.status(404).json({
                    status: false,
                    message: 'User not found or already deleted',
                    data: []
                });
            }
            const updateData = {
                is_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };
            await Common.update(tableName.TBL_USERS, `user_id = ${userId}`, updateData
            );
            return res.status(200).json({
                status: true,
                message: 'user soft deleted successfully',
                data: []
            });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getRoleList: async function (req, res) {

    try {

        const selectedFields = 'role_id , role_name , description, access_level, status';

        const where = `
            flag_deleted = 0
            AND is_active = 1
            AND LOWER(role_name) NOT IN ('admin')
        `;

        const roles = await Common.get_info(
            0,
            tableName.TBL_ROLE,
            'flag_deleted',
            where,
            selectedFields
        );

        if (roles.length) {

            return res.status(200).json({
                status: true,
                message: 'Role List Found',
                data: roles
            });

        } else {

            return res.status(400).json({
                status: false,
                message: 'Role List Empty',
                data: []
            });

        }

    } catch (ex) {

        Logs.ErrorHandler(ex, res);

    }

    },

}