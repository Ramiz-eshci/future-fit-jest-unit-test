const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {
    add: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                relevance_name: 'required|string'
            });
    
            const FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', errors });
            }
            const data = {
                relevance_name: req.body.relevance_name,
                is_active: req.body.is_active || 1,
                created_on: new Date()
            };
            await Common.insert(tableName.TBL_RELEVANCE, data);
            return res.status(200).json({ status: true, message: "Relevance added successfully", data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    edit: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, { 
                relevance_name: 'required|string'
            });
            const FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', errors });
            }
            const existingRecord = await Common.selectWhere(
                tableName.TBL_RELEVANCE,
                `relevance_id = ${req.params.relevance_id} AND flag_deleted != 1`
            );
            if (!existingRecord.length) {
                return res.status(404).json({status: false,  message: 'Relevance not found or already deleted',data: []
                });
            }
            const duplicateCheck = `
                relevance_name = "${req.body.relevance_name.trim()}" AND relevance_id != ${req.params.relevance_id} AND flag_deleted = 0
            `;
            const isDuplicate = await Common.selectWhere('tbl_relevance', duplicateCheck);
            if (isDuplicate.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Relevance name already exists',
                    errors: { relevance_name: 'Duplicate relevance name found' },
                    data: []
                });
            }
            const data = {
                relevance_name: req.body.relevance_name,
                is_active: req.body.is_active || 1,
                modified_on: new Date()
            };
            await Common.update(tableName.TBL_RELEVANCE, `relevance_id = ${req.params.relevance_id}`, data);
            return res.status(200).json({
                status: true,
                message: 'Relevance updated successfully',
                data: []
            });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    
    delete: async function (req, res) {
        try {
            const relevance_id = req.params.relevance_id;
            const existingRecord = await Common.selectWhere(  tableName.TBL_RELEVANCE,`relevance_id = ${relevance_id} AND flag_deleted = 0`
            );
            if (!existingRecord.length) {
                return res.status(404).json({
                    status: false,
                    message: 'Relevance not found or already deleted',
                    data: []
                });
            }
            const data = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };
            await Common.update(tableName.TBL_RELEVANCE, `relevance_id = ${relevance_id}`, data);
            return res.status(200).json({
                status: true,
                message: 'Relevance soft deleted successfully',
                data: []
            });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    get: async function (req, res) {
        try {
            const selectedFields = 'relevance_id, relevance_name';  
            const relevanceData = await Common.get_info('', tableName.TBL_RELEVANCE, 'flag_deleted', 'flag_deleted = 0', selectedFields     
            );
    
            if (relevanceData.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Relevance list found',
                    data: relevanceData
                });
            } else {
                return res.status(404).json({
                    status: false,
                    message: 'No records found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    
    getById: async function (req, res) {
        try {
            const relevanceId = req.params.relevance_id; 
            const selectedFields = 'relevance_id, relevance_name';  
            const relevance = await Common.get_info( relevanceId,  tableName.TBL_RELEVANCE,  'relevance_id','flag_deleted = 0',  selectedFields  
               
            );
            if (relevance.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Relevance Found',
                    data: relevance
                });
            } else {
                return res.status(404).json({
                    status: false,
                    message: 'Relevance Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
   
    Datatable: async function (req, res) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const per_page = req.query.per_page ? parseInt(req.query.per_page) : 10;
            const filter = req.query.filter ? req.query.filter.trim() : '';
            const offset = (page - 1) * per_page;
            let filterWhere = 'flag_deleted = 0';
            if (filter !== '') {
                filterWhere += ` AND (relevance_name LIKE '%${filter}%')`;
            }
            const totalData = await Common.get_info(0, tableName.TBL_RELEVANCE,
                
               
                'flag_deleted',
                filterWhere,
                'COUNT(relevance_id) AS Total'
            );
            const total = totalData.length > 0 ? totalData[0].Total : 0;
            const total_pages = Math.ceil(total / per_page);
            const relevanceData = await Common.get_info(
                0,
                tableName.TBL_RELEVANCE,
                'flag_deleted',
                filterWhere,
                'relevance_id, relevance_name',
                false,
                false,  
                false,
                { field: 'relevance_name', order: 'ASC' },
                per_page,
                offset
            );
    
            return res.status(200).json({
                status: true,
                message: relevanceData.length ? 'Relevance list found' : 'No records found',
                data: relevanceData,
                page: page,
                per_page: per_page,
                total: total,
                total_pages: total_pages
            });
    
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    }
    
    
    
    
    
    
    
    
    
    

}