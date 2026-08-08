const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {
    add: async function (req, res) {
    try {
         
        const ValidationCheck = new Validator(req.body, {
            category_name: 'required'
        });

        const FormaValidationError = await ValidationCheck.check();
        if (!FormaValidationError) {
            const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                acc[key] = ValidationCheck.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({
                status: false,
                message: 'Validation Error',
                errors: errors
            });
        }

        
        const existingCategory = await Common.selectWhere(
            'tbl_be04_category',
            'LOWER(category_name) = "' + req.body.category_name.toLowerCase().trim() + '"'
        );

        if (existingCategory.length > 0) {
            return res.status(400).json({
                status: false,
                message: 'This category already exists.'
            });
        }

        
        const data = {
            category_name: req.body.category_name,
            created_by: req.userData.UserID || 'system',
            created_on: new Date(),
            modified_by: req.userData.UserID || 'system',
            modified_on: new Date()
        };

        
        await Common.insert('tbl_be04_category', data);

        return res.status(200).json({
            status: true,
            message: "Category has been added successfully",
            data: []
        });

    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
    },
    getById: async function (req, res) {
    try {
        const categoryId = req.params.category_id;

        const selectedFields = `
            c.category_id,
            c.category_name
           
        `;

        const whereCondition = "1=1";  

        let category = await Common.get_info(
            categoryId,
            'tbl_be04_category c',
            'c.category_id',
            whereCondition,
            selectedFields,
            false,
            []  
        );

        if (category.length) {
            return res.status(200).json({
                status: true,
                message: 'Category Found',
                data: category
            });
        } else {
            return res.status(400).json({
                status: false,
                message: 'Category Not Found',
                data: []
            });
        }
    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
},


 delete: async function (req, res) {
    try {
        const categoryId = req.params.category_id;

        const used = await Common.selectWhere(
            tableName.TBL_BE04_CATEGORY,
            `category_id = ${categoryId} AND flag_deleted = 0`
        );

        if (used.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Category not found or already deleted',
                data: []
            });
        }

        const updateData = {
            flag_deleted: 1,
            deleted_on: new Date(),
            modified_by: req.userData.UserID || null
        };

        await Common.update(
            tableName.TBL_BE04_CATEGORY,
            `category_id = ${categoryId}`,
            updateData
        );

        return res.status(200).json({
            status: true,
            message: 'Category deleted successfully (soft delete)',
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

        let filterWhere = 'c.flag_deleted = 0';
        if (filter !== '') {
            filterWhere += ` AND (
                c.category_name LIKE "%${filter}%"
                OR c.created_by LIKE "%${filter}%"
                OR c.modified_by LIKE "%${filter}%"
            )`;
        }

        
        var totalCategoryData = await Common.get_info(
            0,
            tableName.TBL_BE04_CATEGORY + ' c',
            'c.flag_deleted',
            filterWhere,
            'COUNT(c.category_id) AS TotalCategories',
            false,
            []  
        );

        var totalCategories = totalCategoryData.length > 0 ? totalCategoryData[0].TotalCategories : 0;
        var totalPages = Math.ceil(totalCategories / per_page);

       
        var categoryData = await Common.get_info(
            0,
            tableName.TBL_BE04_CATEGORY + ' c',
            'c.flag_deleted',
            filterWhere,
            'c.category_id, c.category_name, c.created_by, c.created_on, c.modified_by, c.modified_on',
            false,
            [],
            false,
            { field: 'c.category_name', order: 'ASC' },
            per_page,
            offset
        );

        if (categoryData.length > 0) {
            return res.status(200).json({
                status: true,
                message: 'Category List Found',
                data: categoryData,
                page: page,
                per_page: per_page,
                total: totalCategories,
                total_pages: totalPages
            });
        } else {
            return res.status(400).json({
                status: false,
                message: 'Category List Empty',
                data: [],
                page: page,
                per_page: per_page,
                total: totalCategories,
                total_pages: totalPages
            });
        }

    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
    },
 edit: async function (req, res) {
    try {
        const categoryId = req.params.category_id;

       
        const ValidationCheck = new Validator(req.body, {
            category_name: 'required'
        });

        const FormaValidationError = await ValidationCheck.check();
        if (!FormaValidationError) {
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

        
        const existingCategory = await Common.selectWhere(
            tableName.TBL_BE04_CATEGORY,
            `category_id = ${categoryId} AND flag_deleted != 1`
        );
        if (existingCategory.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Category not found or already deleted',
                errors: { category_id: 'Category not found or already deleted' }
            });
        }

         
        const duplicateCheck = `
            category_name = '${req.body.category_name}'
            AND category_id != '${categoryId}'
            AND flag_deleted = 0
        `;
        const isDuplicate = await Common.selectWhere(tableName.TBL_BE04_CATEGORY, duplicateCheck);

        if (isDuplicate.length > 0) {
            return res.status(400).json({
                status: false,
                message: "Duplicate category name already exists.",
                data: []
            });
        }

        
        const data = {
            category_name: req.body.category_name,
            modified_by: req.userData.UserID || 'system',
            modified_on: new Date()
        };

        await Common.update(
            tableName.TBL_BE04_CATEGORY,
            `category_id = ${categoryId}`,
            data
        );

        return res.status(200).json({
            status: true,
            message: "Category updated successfully",
            data: []
        });

    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
}





}