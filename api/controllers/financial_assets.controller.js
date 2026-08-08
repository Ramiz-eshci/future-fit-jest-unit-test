const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {
    add: async function (req, res) {
        try {

            const ValidationCheck = new Validator(req.body, {
                financial_asset: 'required|string',
                year: 'required|string',
                monetary_value: 'required|string',
                purchase_date: 'required|string',
            });

            const isValid = await ValidationCheck.check();
            if (!isValid) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({
                    status: false,
                    message: 'Validation Error',
                    errors
                });
            }

            const companyId =
                req.userData.RoleID == 1 ? req.body.company_id : req.userData.CompanyID;

            const assetName = req.body.financial_asset.trim().toLowerCase();
            const years = req.body.year;
            const values = req.body.monetary_value;

            const existingAsset = await Common.selectWhere(
                tableName.TBL_FINANCIAL_ASSET,
                `LOWER(financial_asset) = '${assetName}' AND company_id = ${companyId} AND flag_deleted != 1`
            );
            if (existingAsset.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'This financial asset already exists for the company.'
                });
            }
            const data = {
                company_id: companyId,
                financial_asset: req.body.financial_asset,
                financial_asset_id: req.body.financial_asset_id || null,
                year: years,
                monetary_value: values,
                purchase_date: req.body.purchase_date,
                sale_date: req.body.sale_date || null,
                is_active: 1,
                created_on: new Date(),
                created_by: req.userData.UserID
            };

            await Common.insert(tableName.TBL_FINANCIAL_ASSET, data);

            return res.status(200).json({
                status: true,
                message: 'Financial Asset has been added successfully',
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
                filterWhere = `(
                f.financial_asset LIKE '%${filter}%'
                OR f.monetary_value LIKE '%${filter}%'
                OR f.reporting_period LIKE '%${filter}%'
                OR f.financial_asset_id LIKE '%${filter}%'
                OR f.purchase_date LIKE '%${filter}%'
                OR f.sale_date LIKE '%${filter}%'
                OR f.year LIKE '%${filter}%'
            )`;
            }

            if (req.userData.RoleID == 2) {
                filterWhere += ' AND f.company_id = ' + req.userData.CompanyID;
            }

            var company_join = [
                {
                    'type': 'LEFT',
                    'table': tableName.TBL_COMPANY + ' as c',
                    'on': 'f.company_id = c.company_id'
                },
            ];

            var totalAssetData = await Common.get_info(
                0,
                tableName.TBL_FINANCIAL_ASSET + ' f',
                'f.flag_deleted',
                filterWhere,
                'COUNT(finanical_id) AS TotalAssets',
                false,
                company_join
            );

            var totalAssets = totalAssetData.length > 0 ? totalAssetData[0].TotalAssets : 0;
            var totalPages = Math.ceil(totalAssets / per_page);

            var assetData = await Common.get_info(
                0,
                tableName.TBL_FINANCIAL_ASSET + ' f',
                'f.flag_deleted',
                filterWhere,
                'f.finanical_id, f.financial_asset, f.financial_asset_id, f.monetary_value,f.year,f.sale_date,f.purchase_date, f.reporting_period, f.company_id, c.company_name',
                false,
                company_join,
                false,
                { field: 'f.financial_asset', order: 'ASC' },
                per_page,
                offset
            );

            if (assetData.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Financial Asset List Found',
                    data: assetData,
                    page: page,
                    per_page: per_page,
                    total: totalAssets,
                    total_pages: totalPages
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Financial Asset List Empty',
                    data: [],
                    page: page,
                    per_page: per_page,
                    total: totalAssets,
                    total_pages: totalPages
                });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    getById: async function (req, res) {
        try {
            const financialId = req.params.financial_id;

            const selectedFields = `
            f.finanical_id,
            f.financial_asset,
            f.financial_asset_id,
            f.monetary_value,
            f.year,
            f.purchase_date,
            f.sale_date,
            f.reporting_period,
            f.company_id,
            c.company_name
            
        `;

            const whereCondition = "f.flag_deleted = 0";

            const company_join = [
                {
                    'type': 'LEFT',
                    'table': tableName.TBL_COMPANY + ' as c',
                    'on': 'f.company_id = c.company_id'
                },
            ];

            let financialAsset = await Common.get_info(
                financialId,
                tableName.TBL_FINANCIAL_ASSET + ' f',
                'f.finanical_id',
                whereCondition,
                selectedFields,
                false,
                company_join
            );

            if (financialAsset.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Financial Asset Found',
                    data: financialAsset
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Financial Asset Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
 
    delete: async function (req, res) {
    try {
        const financialId = req.params.financial_id;

         
        const relatedTables = [
            tableName.TBL_BE23,
            
        ];

        for (const tbl of relatedTables) {
            const used = await Common.selectWhere(
                tbl,
                `finanical_id = ${financialId} AND flag_deleted = 0`
            );
            if (used.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: 'Cannot delete. Financial Asset is already used in BE23 data.',
                    data: []
                });
            }
        }

        
        const existing = await Common.selectWhere(
            tableName.TBL_FINANCIAL_ASSET,
            `finanical_id = ${financialId} AND flag_deleted = 0`
        );

        if (!existing.length) {
            return res.status(404).json({
                status: false,
                message: 'Financial Asset not found or already deleted',
                data: []
            });
        }

         
        const updateData = {
            flag_deleted: 1,
            deleted_on: new Date(),
            modified_by: req.userData?.UserID || null
        };

        await Common.update(
            tableName.TBL_FINANCIAL_ASSET,
            `finanical_id = ${financialId}`,
            updateData
        );

        return res.status(200).json({
            status: true,
            message: 'Financial Asset deleted successfully (soft delete)',
            data: []
        });

    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
},

     
    edit: async function (req, res) {
        try {
            const financialId = req.params.financial_id;

            const ValidationCheck = new Validator(req.body, {
                financial_asset: 'required|string',
                financial_asset_id: 'required|string',
                year: 'required|string',
                monetary_value: 'required|string'
            });

            const companyId =
                req.userData.RoleID == 1 ? req.body.company_id : req.userData.CompanyID;

            const isValid = await ValidationCheck.check();
            if (!isValid) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({
                    status: false,
                    message: 'Validation Error',
                    errors
                });
            }

            const existingAsset = await Common.selectWhere(
                tableName.TBL_FINANCIAL_ASSET,
                `finanical_id = ${financialId} AND flag_deleted != 1`
            );

            if (existingAsset.length == 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Financial Asset not found or already deleted',
                    errors: { financial_id: 'Record not found or deleted' }
                });
            }

            const duplicateCheck = `
      company_id = '${companyId}'
      AND LOWER(financial_asset) = '${req.body.financial_asset.toLowerCase().trim()}'
      AND finanical_id != '${financialId}'
      AND flag_deleted = 0
    `;

            const isDuplicate = await Common.selectWhere(
                tableName.TBL_FINANCIAL_ASSET,
                duplicateCheck
            );

            if (isDuplicate.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'This financial asset already exists under the selected company.',
                    data: []
                });
            }

            const data = {
                company_id: companyId,
                financial_asset: req.body.financial_asset,
                financial_asset_id: req.body.financial_asset_id,
                year: req.body.year.trim(),
                monetary_value: req.body.monetary_value.trim(),
                purchase_date: req.body.purchase_date || null,
                sale_date: req.body.sale_date || null,
                is_active: req.body.is_active || 1,
                modified_on: new Date(),
                modified_by: req.userData.UserID || null
            };

            await Common.update(
                tableName.TBL_FINANCIAL_ASSET,
                `finanical_id = ${financialId}`,
                data
            );

            return res.status(200).json({
                status: true,
                message: 'Financial Asset updated successfully',
                data: []
            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },






}