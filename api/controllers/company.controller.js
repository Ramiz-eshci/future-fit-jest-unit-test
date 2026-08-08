const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const bcrypt = require('bcryptjs');

var auth = {
    index: async function (req, res) {
        try {
            var Where = '1=1';
            var companyData = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', Where);
            if (companyData.length) {
                return res.status(200).json({ status: true, message: 'Company List Found', data: companyData });
            } else {
                return res.status(400).json({ status: false, message: 'Company List Empty', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },

    add: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                CompanyName: 'required',
                CompanyNumber: 'required',
                CompanyAddress: 'required',
                FirstName: 'required',
                LastName: 'required',
                password: 'required',

            });
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            var exists_user = 0;
            var message = '';
            var dataclient = await Common.selectWhere(tableName.TBL_COMPANY, 'lower(company_name) = "' + req.body.CompanyName.toLowerCase().trim() + '" AND is_deleted != 1');
            if (dataclient.length > 0) {
                exists_user = 1;
                message = "Company Name already exits"
                return res.status(400).json({ status: false, message: "Client Name already exits", errors: { ClientName: 'Client Name Already Exists' } });
            }
        
            var dataclientEmail = await Common.selectWhere(tableName.TBL_USERS, 'lower(email) = "' + req.body.CompanyEmail.toLowerCase() + '" AND is_deleted != 1');
            if (dataclientEmail.length > 0) {
                exists_user = 1;
                message = "Email already exits"
                return res.status(400).json({ status: false, message: "Email already exits", errors: { CompanyEmail: 'Email Already Exists' } });
            }

            if (exists_user == 0) {

                var DataObject = {
                    'company_name': req.body.CompanyName,
                    'contact_number': req.body.CompanyNumber,
                    'company_email': req.body.CompanyEmail,
                    'company_address': req.body.CompanyAddress,
                    'created_by': 1,
                    'created_on': new Date(),

                }
                DataObject.is_deleted = 0;
                var company_id = await Common.insert(tableName.TBL_COMPANY, DataObject);
                
                var userDataObject = {
                    'role_id': 2,
                    'company_id': company_id.insertId,
                    'first_name': req.body.FirstName,
                    'last_name': req.body.LastName,
                    'username': req.body.CompanyEmail,
                    'email': req.body.CompanyEmail,
                    'password': await bcrypt.hash(req.body.password, 10),
                    'is_active': 1, 
                    'phone_number': req.body.CompanyNumber,
                    'created_by': 1,
                    'created_on': new Date(),
                    'is_deleted': 0
                }
                var user_data = await Common.insert(tableName.TBL_USERS, userDataObject);

                var ref_year_data = await Common.get_info(0,tableName.TBL_BE_REFERENCE_YEAR,'company_id','1=1','ref_year,ref_year_value');
                if(ref_year_data.length > 0){
                    ref_data = {
                        'ref_year' : ref_year_data[0].ref_year,
                        'ref_year_value' : ref_year_data[0].ref_year_value,
                        'company_id' : company_id.insertId
                    }
                    var refDataInsert = await Common.insert(tableName.TBL_BE_REFERENCE_YEAR, ref_data);

                }
                
                return res.status(200).json({ status: true, message: "Comapny Added Successfully", data: [] });

            }
        } catch (ex) {
            console.log(ex, ' ==== ex')
            Logs.ErrorHandler(ex, res);
        }
    },

    edit: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                CompanyName: 'required',
                CompanyNumber: 'required',
                CompanyAddress: 'required',
                FirstName: 'required',
                LastName: 'required',
                 
            });
            var company_id = req.params.company_id
            if (isNaN(company_id) || company_id <= 0) {
                return res.status(400).json({ status: false, message: "Invalid company_id" });
            }
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            var exists_user = 0;
            var dataclientname = await Common.selectWhere(tableName.TBL_COMPANY, 'lower(company_name) = "' + req.body.CompanyName.toLowerCase().trim() + '" AND company_id !=' + req.params.company_id);
            if (dataclientname.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Company Name already exits", errors: { CompanyTypeName: 'Company Name Already Exists' } });
            }
            var datacompanyemail = await Common.selectWhere(tableName.TBL_USERS, 'lower(email) = "' + req.body.CompanyEmail.toLowerCase().trim() + '" AND company_id !=' + req.params.company_id);
            if (datacompanyemail.length > 0) {
                exists_user = 1;
                return res.status(400).json({ status: false, message: "Email already exits", errors: { CompanyTypeCode: 'Email Already Exists' } });
            }

            if (exists_user == 0) {
                var DataObject = {
                    'company_name': req.body.CompanyName,
                    'contact_number': req.body.CompanyNumber,
                    'company_email': req.body.CompanyEmail,
                    'company_address': req.body.CompanyAddress,
                    'modified_by': 1,
                    'modified_on': new Date(),

                }

                await Common.update(tableName.TBL_COMPANY, 'company_id = ' + req.params.company_id, DataObject)

                var companyAdminDataObject = {
                    'first_name': req.body.FirstName,
                    'last_name': req.body.LastName,
                    'username': req.body.CompanyEmail,
                    'email': req.body.CompanyEmail, 
                    'is_deleted': 0,
                    'phone_number': req.body.CompanyNumber,    
                    'modified_by': 1,
                    'modified_on': new Date(),
                }
                    
                    await Common.update(tableName.TBL_USERS, 'role_id = 2 AND company_id = ' + req.params.company_id, companyAdminDataObject);

                    return res.status(200).json({ status: true, message: "Successfull Update Company", data: [] });
                
            }

        } catch (ex) {
            console.log(ex, ' ==== ex')
            Logs.ErrorHandler(ex, res);
        }
    },

    getById: async function (req, res) {
        try {
            var company_id = req.params.company_id;

            var join = [
                {
                    'type': 'LEFT',
                    'table': tableName.TBL_USERS + ' as u',
                    'on': 'u.company_id =c.company_id AND u.role_id=2 AND u.is_deleted=0'
                },
            ]
            var company_data = await Common.get_info(0, tableName.TBL_COMPANY + ' c', 'c.is_deleted', 'c.company_id=' + company_id, 'c.company_name,c.contact_number,c.company_email,c.company_address,u.first_name,u.email,u.last_name,u.phone_number', false, join);
             
            if (company_data.length) {
                return res.status(200).json({ status: true, message: 'Company Data Found', data: company_data });
            } else {
                return res.status(400).json({ status: false, message: 'Company Data Not Found', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },

    delete: async function (req, res) {
        try {
            var company_id = req.params.company_id;
            var company_data = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', 'company_id=' + company_id, 'company_id');
            if (company_data.length) {
                var DataObject = {
                    'is_deleted': 1,
                    'deleted_on': new Date(),
                }

                 
                await Common.update(tableName.TBL_COMPANY, 'company_id = ' + company_id, DataObject)
                await Common.update(tableName.TBL_USERS, 'company_id = ' + company_id, DataObject)
                return res.status(200).json({ status: true, message: "Successfull Delete Company", data: [] });
            } else {
                return res.status(400).json({ status: false, message: 'Company Not Found', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },
    list: async function (req, res) {
        try {
            var Where = '1=1'
          
            var company_data = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', Where, 'company_id as id,company_name as name', false, false, false, { 'field': 'company_name', 'order': 'ASC' });
            if (company_data.length) {
                return res.status(200).json({ status: true, message: 'Company Data Found', data: company_data });
            } else {
                return res.status(400).json({ status: false, message: 'Company Data Not Found', data: [] });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },

    datatable: async function (req, res) {
        try {
            // console.log('in here');
            var page = req.query.page ? req.query.page : 1;
            var offset = req.query.page ? req.query.page : 1;
            var filter = req.query.filter ? req.query.filter : '';
            var per_page = req.query.per_page ? req.query.per_page : 5;
            

            var filterWhere = '1=1';
            if (filter != '') {
                filterWhere += ' AND (company_name LIKE "%' + filter + '%" OR contact_number LIKE "%' + filter + '%" OR company_email LIKE "%' + filter + '%" OR company_address LIKE "%' + filter + '%")'
            }
           

            var totalcompanyData = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', '' + filterWhere, 'count(company_id) as Totalcompanys', false);
            var totalcompanys = 0;
            var totalPages = 0;

            $page = 1;
            if (page != 0) {
                offset = (req.query.page - 1) * per_page;
            }
            if (totalcompanyData.length > 0) {
                totalcompanys = totalcompanyData[0].Totalcompanys
                totalPages = totalcompanys / per_page;
                totalPages = totalPages < 1 ? 1 : totalPages;

            }
          
            var companyData = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', '' + filterWhere, 'company_id,company_name,contact_number,company_email,company_address', false, false, false, { 'field': 'company_name', 'order': 'ASC' }, per_page, offset);
            if (companyData.length) {
                return res.status(200).json({ status: true, message: 'Company List Found', data: companyData, page: page, per_page: per_page, total: totalcompanys, total_pages: totalPages });
            } else {
                return res.status(400).json({ status: false, message: 'Company List Empty', data: [], page: page, per_page: per_page, total: totalcompanys, total_pages: totalPages });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },
}
module.exports = auth;