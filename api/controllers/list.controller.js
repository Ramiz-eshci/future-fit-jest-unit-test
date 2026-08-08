const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

    company_list: async function (req, res) {
        try {
            const selectedFields = 'company_id as id, company_name as name';
            const categories = await Common.get_info(0, tableName.TBL_COMPANY, 'is_deleted', '', selectedFields);
            if (categories.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Company List Found',
                    data: categories
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Company List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    Common_fitness_criteria: async function (req, res) {
        try {
            const selectedFields = 'id as id, name as name';
            const resp = await Common.get_info(1, tableName.TBL_COMMON_FITNESS_CRITERIA, '1', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Common fitness criteria List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Common fitness criteria List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    Resourcetypes: async function (req, res) {
        try {
            const selectedFields = 'id as id, name as name';
            const resp = await Common.get_info(1, tableName.TBL_RESOURCETYPE, '1', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Resourcetypes List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Resourcetypes List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    Siteassessed: async function (req, res) {
        try {
            const selectedFields = 'id as id, name as name';
            const resp = await Common.get_info(1, tableName.TBL_SITEASSESSED, '1', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Siteassessed List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Siteassessed List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    Siteassessedwaste: async function (req, res) {
        try {
            const selectedFields = 'id as id, name as name';
            const resp = await Common.get_info(1, tableName.TBL_SITEASSESSEDWASTE, '1', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Siteassessedwaste List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Siteassessedwaste List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    ProductType: async function (req, res) {
        try {
            const selectedFields = 'product_type_id as id, product_typename as name';
            const resp = await Common.get_info(1, tableName.TBL_PRODUCTTYPE, '1', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'ProductType List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'ProductType List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getCompanySites: async function (req, res) {
        try {
            // var company_id = req.params.company_id;
            const requestedCompanyId = Number(req.params.company_id);

            let company_id;

            if (req.userData.RoleID == 1) {

                company_id = requestedCompanyId;

            } else {

                if (requestedCompanyId !== Number(req.userData.CompanyID)) {

                    return res.status(403).json({
                        status: false,
                        message: "You are not authorized to access another company's data."
                    });

                }

                company_id = req.userData.CompanyID;
            }
            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const resp = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields, false,
                false,
                false,
                { field: 'site_name', order: 'ASC' });
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Site List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Site List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    product_list: async function (req, res) {
        try {
            var join = [
                {
                    type: 'LEFT',
                    table: tableName.TBL_PRODUCTTYPE + ' as type',
                    on: 'type.product_type_id = p.product_type'
                }
            ];
            var company_id = req.params.company_id;
            const selectedFields = 'p.product_id,p.year,type.product_typename,p.product_name,p.product_id_manual,p.revenue_cost,p.user_group,p.user_group_id';
            const resp = await Common.get_info(company_id, tableName.TBL_PRODUCT + ' p', 'p.company_id', 'p.flag_deleted = 0 AND p.is_active = 1', selectedFields, false, join, false,
                { field: 'p.product_name', order: 'ASC' });
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Product List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Product List Empty',
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    getEmployeeList: async function (req, res) {
        try {
            const company_id = req.params.company_id;

            const fields = `e.employee_id,e.company_id,e.year, e.employee_group, e.group_id,e.number_of_employees,e.site,e.location, c.company_name , st.site_name,st.site_id_manual ,st.location as site_location `;
            const join = [
                {
                    type: 'LEFT',
                    table: tableName.TBL_COMPANY + ' as c',
                    on: 'e.company_id = c.company_id'
                },
                {
                    type: 'LEFT',
                    table: tableName.TBL_SITE_INFORMATION + ' as st',
                    on: 'e.site_id = st.site_id'
                }
            ];

            const where = 'e.flag_deleted=0';
            const employee = await Common.get_info(company_id, tableName.TBL_EMPLOYEE + ' as e', 'e.company_id', where, fields, false, join, false,
                { field: 'employee_group', order: 'ASC' });

            if (employee.length) {
                return res.status(200).json({ status: true, message: 'Employee Found', data: employee });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Employee Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getRelevanaceList: async function (req, res) {
        try {

            const fields = `relevance_id as id,relevance_name as name`;
            const where = 'flag_deleted=0 AND is_active=1';
            const relevanace = await Common.get_info(1, tableName.TBL_RELEVANCE, 1, where, fields);

            if (relevanace.length) {
                return res.status(200).json({ status: true, message: 'Relevanace Found', data: relevanace });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Relevanace Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getRelevanaceListBE03: async function (req, res) {
        try {

            const fields = `relevance_id as id,relevance_name as name`;
            const where = 'flag_deleted=0 AND is_active=1';
            const relevanace = await Common.get_info(1, tableName.TBL_RELEVANCE4DATA, 1, where, fields);

            if (relevanace.length) {
                return res.status(200).json({ status: true, message: 'Relevanace Found', data: relevanace });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Relevanace Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getRelevanaceListBE05: async function (req, res) {
        try {

            const fields = `relevance_id as id,relevance_name as name`;
            const where = 'flag_deleted=0 AND is_active=1';
            const relevanace = await Common.get_info(1, tableName.TBL_RELEVANCEBE05, 1, where, fields);

            if (relevanace.length) {
                return res.status(200).json({ status: true, message: 'Relevanace Found', data: relevanace });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Relevanace Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getNoGhgEmissionsListBE06: async function (req, res) {
        try {
            const fields = `relevance_id as id,relevance_name as name`;
            const where = 'flag_deleted=0 AND is_active=1';
            const relevanace = await Common.get_info(1, tableName.TBL_NO_GHG_EMISSION_BE06, 1, where, fields);

            if (relevanace.length) {
                return res.status(200).json({ status: true, message: 'Relevanace Found', data: relevanace });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Relevanace Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    be04_category_list: async function (req, res) {
        try {
            const selectedFields = 'category_id as id, category_name as name';
            const categories = await Common.get_info(1, tableName.TBL_BE04_CATEGORY, 1, 'flag_deleted=0', selectedFields);
            if (categories.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Category List Found',
                    data: categories
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Category List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    getCompanyPurchase: async function (req, res) {
        try {
            // var company_id = req.params.company_id;
            const requestedCompanyId = Number(req.params.company_id);

            let company_id;

            if (req.userData.RoleID == 1) {

                company_id = requestedCompanyId;

            } else {

                if (requestedCompanyId !== Number(req.userData.CompanyID)) {

                    return res.status(403).json({
                        status: false,
                        message: "You are not authorized to access another company's data."
                    });

                }

                company_id = req.userData.CompanyID;
            }
            const selectedFields = 'purchase_information_id,purchase,purchase_id,year,cost,purchase_type';
            const resp = await Common.get_info(company_id, tableName.TBL_PURCHASE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields, false,
                false,
                false,
                { field: 'purchase', order: 'ASC' });
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Purchase List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Purchase List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getCompanyFinanicialAsset: async function (req, res) {
        try {
            // var company_id = req.params.company_id;

            const requestedCompanyId = Number(req.params.company_id);

            let company_id;

            if (req.userData.RoleID == 1) {

                company_id = requestedCompanyId;

            } else {

                if (requestedCompanyId !== Number(req.userData.CompanyID)) {

                    return res.status(403).json({
                        status: false,
                        message: "You are not authorized to access another company's data."
                    });

                }

                company_id = req.userData.CompanyID;
            }

            const selectedFields = 'finanical_id,year,purchase_date,sale_date,financial_asset,financial_asset_id,monetary_value,reporting_period';
            const resp = await Common.get_info(company_id, tableName.TBL_FINANCIAL_ASSET, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields, false,
                false,
                false,
                { field: 'financial_asset', order: 'ASC' });
            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'financial Asset List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'financial Asset List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getMenuList: async function (req, res) {
        try {

            const selectedFields = `MenuId,MenuName,ParentId,PagePath, IsMenu,SortOrder,IsOption
        `;

            const resp = await Common.get_info(1, tableName.TBL_MENU_MASTER, 1, 'FlagDeleted = 0 AND IsActive = 1', selectedFields, false, false, false, { field: 'SortOrder', order: 'ASC' }
            );

            if (resp.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Menu List Found',
                    data: resp
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Menu List Empty',
                    data: []
                });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    //  getRolePermissions: async function (req, res) {

    //     try {

    //         const roleId = req.params.role_id;

    //         const fields = `
    //         rd.RoleId,
    //         rd.MenuId,
    //         mm.MenuName,
    //         mm.PagePath,
    //         mm.ParentId,
    //         mm.IsMenu,
    //         mm.SortOrder
    //     `;

    //         const join = [
    //             {
    //                 type: 'LEFT',
    //                 table: tableName.TBL_MENUMASTER + ' as mm',
    //                 on: 'rd.MenuId = mm.MenuId'
    //             }
    //         ];

    //         const where = `
    //         rd.FlagDeleted = 0
    //         AND rd.IsActive = 1
    //         AND mm.FlagDeleted = 0
    //         AND mm.IsActive = 1
    //     `;

    //         const permissions = await Common.get_info(
    //             roleId,
    //             tableName.TBL_ROLEMASTER + ' as rd',
    //             'rd.RoleId',
    //             where,
    //             fields,
    //             false,
    //             join,
    //             false,
    //             {
    //                 field: 'mm.SortOrder',
    //                 order: 'ASC'
    //             }
    //         );

    //         if (permissions.length > 0) {

    //             return res.status(200).json({
    //                 status: true,
    //                 message: 'Permissions Found',
    //                 data: permissions
    //             });

    //         } else {

    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Permissions Not Found',
    //                 data: []
    //             });

    //         }

    //     } catch (ex) {

    //         Logs.ErrorHandler(ex, res);

    //     }

    // },
    getRolePermissions: async function (req, res) {

        try {

            const roleId = req.params.role_id;

            const fields = `
            rd.RoleId,
            rd.MenuId,

            mm.MenuName,
            mm.PagePath,
            mm.ParentId,
            mm.IsMenu,
            mm.SortOrder,
            pm.MenuName as ParentMenuName,
            CONCAT(
                pm.MenuName,
                '_',
                mm.MenuName
            ) as PermissionKey
        `;

            const join = [

                {
                    type: 'LEFT',
                    table: tableName.TBL_MENUMASTER + ' as mm',
                    on: 'rd.MenuId = mm.MenuId'
                },

                {
                    type: 'LEFT',
                    table: tableName.TBL_MENUMASTER + ' as pm',
                    on: 'mm.ParentId = pm.MenuId'
                }

            ];

            const where = `
            rd.FlagDeleted = 0
            AND rd.IsActive = 1
            AND mm.FlagDeleted = 0
            AND mm.IsActive = 1
        `;

            const permissions =
                await Common.get_info(
                    roleId,
                    tableName.TBL_ROLEMASTER + ' as rd',
                    'rd.RoleId',
                    where,
                    fields,
                    false,
                    join,
                    false,
                    {
                        field: 'mm.SortOrder',
                        order: 'ASC'
                    }
                );

            if (permissions.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Permissions Found',
                    data: permissions
                });

            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Permissions Not Found',
                    data: []

                });

            }

        } catch (ex) {

            Logs.ErrorHandler(ex, res);

        }

    },

}