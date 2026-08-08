const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

    Datatable: async function (req, res) {
        try {
            var page = req.query.page ? parseInt(req.query.page) : 1;
            var per_page = req.query.per_page ? parseInt(req.query.per_page) : 5;
            var filter = req.query.filter ? req.query.filter.trim() : '';
            var offset = (page - 1) * per_page;
          let filterWhere = 'flag_deleted = 0';
            if (filter !== '') {
                filterWhere = ` (role_name LIKE '%${filter}%' OR description LIKE '%${filter}%')`;
            }

            var totalSiteData = await Common.get_info(0, tableName.TBL_ROLE , 'flag_deleted', filterWhere, 'COUNT(role_id) AS TotalRoles', false, false, false, false, false, false);
            // console.log('totalSiteData', totalSiteData);
            var totalSites = totalSiteData.length > 0 ? totalSiteData[0].TotalRoles : 0;
            var totalPages = Math.ceil(totalSites / per_page);
            var siteData = await Common.get_info(0, tableName.TBL_ROLE , 'flag_deleted', filterWhere, 'role_id, role_name,access_level, description,status,is_active', false, false, false, { field: 'role_name', order: 'ASC' }, per_page, offset);

            if (siteData.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Role List Found',
                    data: siteData,
                    page: page,
                    per_page: per_page,
                    total: totalSites,
                    total_pages: totalPages
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Role List Empty',
                    data: [],
                    page: page,
                    per_page: per_page,
                    total: totalSites,
                    total_pages: totalPages
                });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },



    getMenuTree: async function (req, res) {

        try {

            const parentMenus = await Common.selectWhere(
                tableName.TBL_MENUMASTER,
                `ParentId = 0 
            AND FlagDeleted = 0 
            AND IsActive = 1`
            );

            let finalData = [];

            for (let parent of parentMenus) {

                const childMenus = await Common.selectWhere(
                    tableName.TBL_MENUMASTER,
                    `ParentId = ${parent.MenuId}
                AND FlagDeleted = 0
                AND IsActive = 1`
                );

                let childData = [];

                for (let child of childMenus) {

                    const actionMenus = await Common.selectWhere(
                        tableName.TBL_MENUMASTER,
                        `ParentId = ${child.MenuId}
                    AND FlagDeleted = 0
                    AND IsActive = 1`
                    );

                    childData.push({

                        MenuId: child.MenuId,
                        MenuName: child.MenuName,
                        PagePath: child.PagePath,
                        actions: actionMenus.map(action => ({

                            MenuId: action.MenuId,
                            MenuName: action.MenuName,
                            PagePath: action.PagePath

                        }))

                    });

                }

                finalData.push({

                    MenuId: parent.MenuId,
                    MenuName: parent.MenuName,
                    PagePath: parent.PagePath,
                    children: childData

                });

            }

            return res.status(200).json({

                status: true,
                message: 'Menu Tree Found',
                data: finalData

            });

        } catch (ex) {

            Logs.ErrorHandler(ex, res);

        }

    },

    getById: async function (req, res) {

        try {

            const roleId = req.params.role_id;
            const roleData = await Common.selectWhere(
                tableName.TBL_ROLE,

                `role_id = '${roleId}'
            AND flag_deleted = 0`

            );

            if (roleData.length == 0) {

                return res.status(200).send({

                    status: false,
                    message: 'Role not found'

                });

            }
            const permissionData = await Common.selectWhere(

                tableName.TBL_ROLEMASTER,

                `RoleId = '${roleId}'
            AND FlagDeleted = 0`

            );
            const permissions = permissionData.map(
                (x) => x.MenuId
            );
            const finalData = {

                role_id: roleData[0].role_id,

                role_name: roleData[0].role_name,

                description: roleData[0].description,

                access_level: roleData[0].access_level,

                status: roleData[0].status,

                permissions: permissions

            };

            return res.status(200).send({

                status: true,
                data: finalData

            });

        } catch (ex) {

            Logs.ErrorHandler(ex, res);

        }

    },




    // add: async function (req, res) {

    //     try {

    //         const validator = new Validator(req.body, {

    //             RoleName: 'required',
    //             AccessLevel: 'required',
    //             Status: 'required',
    //             permissions: 'required|array'

    //         });

    //         const matched = await validator.check();

    //         if (!matched) {

    //             return res.status(200).send({

    //                 status: false,
    //                 message: validator.errors

    //             });

    //         }
    //         const checkRole = await Common.selectWhere(

    //             tableName.TBL_ROLE,

    //             `role_name = '${req.body.RoleName}'
    //         AND flag_deleted = 0`

    //         );

    //         if (checkRole.length > 0) {

    //             return res.status(200).send({

    //                 status: false,
    //                 message: 'Role already exists'

    //             });

    //         }
    //         const insertData = {

    //             role_name: req.body.RoleName,

    //             description: req.body.Description || '',

    //             access_level: req.body.AccessLevel,

    //             status: req.body.Status,

    //             // company_id: req.user.company_id || 0,

    //             is_active: 1,

    //             flag_deleted: 0,

    //             created_on: new Date()

    //         };

    //         const saveRole = await Common.insert(

    //             tableName.TBL_ROLE,
    //             insertData

    //         );

    //         if (!saveRole) {

    //             return res.status(200).send({

    //                 status: false,
    //                 message: 'Role not added'

    //             });

    //         }
    //         const roleId = saveRole.insertId;
    //         if (req.body.permissions.length > 0) {

    //             for (let permission of req.body.permissions) {

    //                 const permissionData = {
    //                     RoleId: roleId,
    //                     MenuId: permission,
    //                     IsActive: 1,
    //                     FlagDeleted: 0,
    //                     CreatedBy: 1,
    //                     CreatedOn: new Date()

    //                 };

    //                 await Common.insert(

    //                     tableName.TBL_ROLEMASTER,
    //                     permissionData

    //                 );

    //             }

    //         }

    //         return res.status(200).send({

    //             status: true,
    //             message: 'Role added successfully'

    //         });

    //     } catch (ex) {

    //         Logs.ErrorHandler(ex, res);

    //     }

    // },

    add: async function (req, res) {

        try {

            const validator = new Validator(req.body, {
                RoleName: 'required',
                AccessLevel: 'required',
                Status: 'required',
                permissions: 'required|array'
            });
            const matched = await validator.check();
            if (!matched) {
                return res.status(200).send({
                    status: false,
                    message: validator.errors
                });
            }
            const checkRole = await Common.selectWhere(
                tableName.TBL_ROLE,
                `role_name = '${req.body.RoleName}'
             AND flag_deleted = 0`
            );

            if (checkRole.length > 0) {
                return res.status(200).send({
                    status: false,
                    message: 'Role already exists'
                });
            }
            const insertData = {
                role_name: req.body.RoleName,
                description: req.body.Description || '',
                access_level: req.body.AccessLevel,
                status: req.body.Status,
                is_active: 1,
                flag_deleted: 0,
                created_on: new Date()

            };

            const saveRole = await Common.insert(
                tableName.TBL_ROLE,
                insertData
            );

            if (!saveRole) {
                return res.status(200).send({
                    status: false,
                    message: 'Role not added'
                });

            }

            const roleId = saveRole.insertId;
            let allPermissions = [...req.body.permissions];
            const mandatoryPermissions = [32, 5, 1015];
            for (const menuId of mandatoryPermissions) {
                if (!allPermissions.includes(menuId)) {
                    allPermissions.push(menuId);
                }
            }
            for (let permission of req.body.permissions) {
                const menu = await Common.selectWhere(
                    tableName.TBL_MENUMASTER,
                    `MenuId = ${permission}`
                );

                if (
                    menu.length > 0 &&
                    menu[0].ParentId > 0 &&
                    !allPermissions.includes(menu[0].ParentId)
                ) {
                    allPermissions.push(
                        menu[0].ParentId
                    );
                }

            }

            if (allPermissions.length > 0) {
                for (let permission of allPermissions) {
                    const permissionData = {
                        RoleId: roleId,
                        MenuId: permission,
                        IsActive: 1,
                        FlagDeleted: 0,
                        CreatedBy: 1,
                        CreatedOn: new Date()
                    };

                    await Common.insert(
                        tableName.TBL_ROLEMASTER,
                        permissionData
                    );

                }

            }
            return res.status(200).send({
                status: true,
                message: 'Role added successfully'
            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }

    },

    edit: async function (req, res) {

        try {

            const roleId =
                req.params.role_id;
            const validator = new Validator(req.body, {
                RoleName: 'required',
                AccessLevel: 'required',
                Status: 'required',
                permissions: 'required|array'
            });
            const matched = await validator.check();
            if (!matched) {
                return res.status(200).send({
                    status: false,
                    message: validator.errors
                });
            }
            const checkRole =
                await Common.selectWhere(
                    tableName.TBL_ROLE,

                    `role_id = '${roleId}'
                AND flag_deleted = 0`

                );

            if (checkRole.length == 0) {
                return res.status(200).send({
                    status: false,
                    message: 'Role not found'
                });

            }
            const duplicateRole =
                await Common.selectWhere(
                    tableName.TBL_ROLE,
                    `role_name = '${req.body.RoleName}'
                AND role_id != '${roleId}'
                AND flag_deleted = 0`

                );

            if (duplicateRole.length > 0) {
                return res.status(200).send({
                    status: false,
                    message: 'Role already exists'
                });

            }
            const updateData = {
                role_name:
                    req.body.RoleName,
                description:
                    req.body.Description || '',
                access_level:
                    req.body.AccessLevel,
                status:
                    req.body.Status,
                modified_on:
                    new Date()

            };

            await Common.update(
                tableName.TBL_ROLE,
                `role_id = ${roleId}`,
                updateData
            );
            await Common.update(
                tableName.TBL_ROLEMASTER,
                `RoleId = ${roleId}`,
                {
                    FlagDeleted: 1,
                    DeletedOn: new Date(),
                    DeletedBy: 1
                }

            );

            let allPermissions = [...req.body.permissions];
            for (let permission of req.body.permissions) {
                const menu = await Common.selectWhere(
                    tableName.TBL_MENUMASTER,
                    `MenuId = ${permission}`
                );
                if (
                    menu.length > 0 &&
                    menu[0].ParentId > 0 &&
                    !allPermissions.includes(menu[0].ParentId)
                ) {
                    allPermissions.push(
                        menu[0].ParentId
                    );
                }
            }

            if (allPermissions.length > 0) {
                for (let permission of allPermissions) {
                    const permissionData = {
                        RoleId: roleId,
                        MenuId: permission,
                        IsActive: 1,
                        FlagDeleted: 0,
                        CreatedBy: 1,
                        CreatedOn: new Date()
                    };

                    await Common.insert(
                        tableName.TBL_ROLEMASTER,
                        permissionData
                    );
                }
            }
            return res.status(200).send({
                status: true,
                message:
                    'Role updated successfully'
            });

        } catch (ex) {

            Logs.ErrorHandler(ex, res);

        }

    },



    delete: async function (req, res) {

        try {

            const roleId =
                req.params.role_id;
            const checkRole =
                await Common.selectWhere(

                    tableName.TBL_ROLE,

                    `role_id = ${roleId}
                AND flag_deleted = 0`

                );

            if (checkRole.length == 0) {

                return res.status(200).json({

                    status: false,

                    message: 'Role not found'

                });

            }
            await Common.update(
                tableName.TBL_ROLE,
                `role_id = ${roleId}`,
                {

                    flag_deleted: 1,
                    modified_on:
                        new Date()

                }

            );
            await Common.update(
                tableName.TBL_ROLEMASTER,
                `RoleId = ${roleId}`,
                {

                    FlagDeleted: 1,
                    DeletedOn:
                        new Date(),
                    DeletedBy: 1

                }

            );

            return res.status(200).json({
                status: true,
                message:
                    'Role deleted successfully'

            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);

        }

    }

}