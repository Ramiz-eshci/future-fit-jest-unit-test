const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

    get: async function (req, res) {
        try {
            var company_id = req.params.company_id;

            const selectedFields = 'site_id as id, site_name as name ,location, site_id_manual as siteIdManual';
            let categories = '';
            if (company_id == 0) {
                categories = await Common.get_info(0, tableName.TBL_SITE_INFORMATION, 'flag_deleted', '', selectedFields);
            }
            else {
                categories = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted=0', selectedFields);

            }

            if (categories.length) {
                return res.status(200).json({
                    status: true,
                    message: 'site List Found',
                    data: categories
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'site List Empty',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    getById: async function (req, res) {
        try {
            const siteId = req.params.site_id;
            const selectedFields = 'site_id, site_name, company_id,site_id_manual,location,be05gaseous_ref_year,be05gaseous_ref_year_value,be05liquid_ref_year,be05liquid_ref_year_value,be05solid_reference_year,be05solid_ref_year_value,be06ghgemmison_ref_year,be06ghgemmison_ref_year_value,be07waste_ref_year,be07waste_ref_year_value';
            const whereCondition = "flag_deleted = 0";
            let site = await Common.get_info(siteId, tableName.TBL_SITE_INFORMATION, 'site_id', whereCondition, selectedFields);

            if (site.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Site Information Found',
                    data: site
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Site Information Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },


    add: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                SiteName: 'required',
                // CompanyID: 'required|integer'
            });
            // console.log(req.userData, '----userdata')
            if (req.userData.RoleID == 1) {
                var companyId = req.body.CompanyID;
            } else {
                var companyId = req.userData.CompanyID;
            }

            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            const existingSite = await Common.selectWhere(tableName.TBL_SITE_INFORMATION, "LOWER(site_name) = '" + req.body.SiteName.toLowerCase().trim() + "' AND company_id = " + companyId + " AND flag_deleted != 1");
            if (existingSite.length > 0) {
                return res.status(400).json({
                    status: false,
                    // message: 'Site Name already exists under this company',
                    message: 'A site with this name already exists under the selected company.',
                    // errors: { SiteName: 'A site with this name already exists under the selected company' }
                });
            }

            const data = {
                site_name: req.body.SiteName,
                site_id_manual: req.body.SiteID || null,
                // company_id: req.body.CompanyID,
                company_id: companyId,
                location: req.body.Location,
                // year: req.body.year,
                // site_id_manual: req.body.SiteIdManual || null,
                be05gaseous_ref_year: req.body.GaseousReferenceyear,
                be05gaseous_ref_year_value: req.body.GaseousRefYearValue,
                be05liquid_ref_year: req.body.LiquidReferenceyear,
                be05liquid_ref_year_value: req.body.LiquidRefYearValue,
                be05solid_reference_year: req.body.SolidReferenceyear,
                be05solid_ref_year_value: req.body.SolidRefYearValue,
                be06ghgemmison_ref_year: req.body.GHGemissionsReferenceYear,
                be06ghgemmison_ref_year_value: req.body.GHGEmissionsRefYearValue,
                be07waste_ref_year: req.body.WasteGeneratedReferenceYear,
                be07waste_ref_year_value: req.body.WasteGeneratedRefYearValue,
                is_active: 1,
                created_on: new Date(),
            };
            await Common.insert(tableName.TBL_SITE_INFORMATION, data);
            return res.status(200).json({ status: true, message: "The site has been added successfully", data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },


    edit: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                SiteName: 'required',
            });
            if (req.userData.RoleID == 1) {
                var companyId = req.body.CompanyID;
            } else {
                var companyId = req.userData.CompanyID;
            }
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({
                    status: false,
                    message: 'Validation Error',
                    data: ValidationCheck.errors,
                    errors: errors
                });
            }
            const existingSite = await Common.selectWhere(tableName.TBL_SITE_INFORMATION, 'site_id = ' + req.params.site_id + ' AND flag_deleted != 1'
            );
            if (existingSite.length == 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Site not found or already deleted',
                    errors: { site_id: 'Site not found or already deleted' }
                });
            }
            const duplicateSite = await Common.selectWhere(
                tableName.TBL_SITE_INFORMATION,
                "LOWER(site_name) = '" + req.body.SiteName.toLowerCase().trim() + "' " +
                "AND company_id = " + companyId + " " +
                "AND site_id != " + req.params.site_id + " " +
                "AND flag_deleted = 0"
            );

            if (duplicateSite.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'A site with this name already exists under the selected company.',
                    errors: { SiteName: 'Site Name already exists under this company' }
                });
            }
            const data = {
                site_name: req.body.SiteName,
                // company_id: req.body.CompanyID,
                company_id: companyId,
                site_id_manual: req.body.SiteID || null,
                location: req.body.Location,

                be05gaseous_ref_year: req.body.GaseousReferenceyear,
                be05gaseous_ref_year_value: req.body.GaseousRefYearValue,
                be05liquid_ref_year: req.body.LiquidReferenceyear,
                be05liquid_ref_year_value: req.body.LiquidRefYearValue,
                be05solid_reference_year: req.body.SolidReferenceyear,
                be05solid_ref_year_value: req.body.SolidRefYearValue,
                be06ghgemmison_ref_year: req.body.GHGemissionsReferenceYear,
                be06ghgemmison_ref_year_value: req.body.GHGEmissionsRefYearValue,
                be07waste_ref_year: req.body.WasteGeneratedReferenceYear,
                be07waste_ref_year_value: req.body.WasteGeneratedRefYearValue,
                is_active: req.body.is_active || 1,
                modified_on: new Date()
            };
            await Common.update(tableName.TBL_SITE_INFORMATION, 'site_id = ' + req.params.site_id, data);
            return res.status(200).json({ status: true, message: "Site updated successfully", data: [] });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    delete: async function (req, res) {
        try {
            const siteId = req.params.site_id;
            const checkTables = [
                tableName.TBL_BE01, tableName.TBL_BE02, tableName.TBL_BE03,
                tableName.TBL_BE05, tableName.TBL_BE06,
                tableName.TBL_BE07, tableName.TBL_BE08, tableName.TBL_BE09
            ];

            let siteUsed = false;

            for (const table of checkTables) {
                const result = await Common.selectWhere(table, `site_id = ${siteId} AND flag_deleted = 0`);
                if (result.length > 0) {
                    siteUsed = true;
                    break;
                }
            }

            if (siteUsed) {
                return res.status(400).json({
                    status: false,
                    message: 'Cannot delete site. It is already used',
                    data: []
                });
            }

            const existingSite = await Common.selectWhere(tableName.TBL_SITE_INFORMATION, `site_id = ${siteId} AND flag_deleted = 0`);
            if (!existingSite.length) {
                return res.status(404).json({
                    status: false,
                    message: 'Site not found or already deleted',
                    data: []
                });
            }

            const updateData = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };

            await Common.update(tableName.TBL_SITE_INFORMATION, `site_id = ${siteId}`, updateData);

            return res.status(200).json({
                status: true,
                message: 'Site soft deleted successfully',
                data: []
            });

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
                filterWhere = ` (site_name LIKE '%${filter}%' OR site_id_manual LIKE '%${filter}%' OR location LIKE '%${filter}%')`;
            }
            if (req.userData.RoleID == 2) {
                filterWhere += ' AND s.company_id = ' + req.userData.CompanyID;
                // filterWhere = 'company_id = ' + req.userData.CompanyID;
            }
            var company_join = [
                {
                    'type': 'LEFT',
                    'table': tableName.TBL_COMPANY + ' as c',
                    'on': 's.company_id = c.company_id'
                },
            ]
            var totalSiteData = await Common.get_info(0, tableName.TBL_SITE_INFORMATION + ' s', 's.flag_deleted', filterWhere, 'COUNT(site_id) AS TotalSites', false, company_join);
            var totalSites = totalSiteData.length > 0 ? totalSiteData[0].TotalSites : 0;
            var totalPages = Math.ceil(totalSites / per_page);
            var siteData = await Common.get_info(0, tableName.TBL_SITE_INFORMATION + ' s', 's.flag_deleted', filterWhere, 'site_id, location, site_name, s.company_id,c.company_name, site_id_manual AS site_ID', false, company_join, false, { field: 'site_name', order: 'ASC' }, per_page, offset);

            if (siteData.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Site List Found',
                    data: siteData,
                    page: page,
                    per_page: per_page,
                    total: totalSites,
                    total_pages: totalPages
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Site List Empty',
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
    }

}