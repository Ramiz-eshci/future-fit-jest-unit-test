const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {
   
  add: async function (req, res) {
  try {
     
    const ValidationCheck = new Validator(req.body, {
      purchase: 'required|string',
      purchase_type: 'required|string',
      year: 'required|string',
      cost: 'required|string'
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

    
    const companyId =
      req.userData.RoleID == 1 ? req.body.company_id : req.userData.CompanyID;

    const purchaseName = req.body.purchase.trim().toLowerCase();
    const years = req.body.year;  
    const costs = req.body.cost; 

     
    const existingPurchase = await Common.selectWhere(
      tableName.TBL_PURCHASE_INFORMATION,
      `LOWER(purchase) = "${purchaseName}" AND company_id = ${companyId} AND flag_deleted != 1`
    );

    
    
     if (existingPurchase.length > 0) {
        return res.status(400).json({
          status: false,
          message: 'This purchase already exists under the selected company.'
        });
      }

     
    const data = {
      company_id: companyId,
      purchase: req.body.purchase,
      purchase_id: req.body.purchase_id || null,
      year: years,
      cost: costs,
      purchase_type: req.body.purchase_type,
      product_input: req.body.product_input,
      is_active: 1,
      created_on: new Date(),
      created_by: req.userData.UserID
    };

    await Common.insert(tableName.TBL_PURCHASE_INFORMATION, data);

    return res.status(200).json({
      status: true,
      message: 'Purchase Information has been added successfully',
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
          p.purchase LIKE '%${filter}%'
          OR p.purchase_type LIKE '%${filter}%'
          OR p.cost LIKE '%${filter}%'
           OR p.year LIKE '%${filter}%'
          OR p.purchase_id LIKE '%${filter}%'
          OR p.product_input LIKE '%${filter}%'
      )`;
      }

      if (req.userData.RoleID == 2) {
        filterWhere += ' AND p.company_id = ' + req.userData.CompanyID;
      }

      var company_join = [
        {
          type: 'LEFT',
          table: tableName.TBL_COMPANY + ' as c',
          on: 'p.company_id = c.company_id'
        }
      ];

      var totalPurchaseData = await Common.get_info(
        0,
        tableName.TBL_PURCHASE_INFORMATION + ' p',
        'p.flag_deleted',
        filterWhere,
        'COUNT(p.purchase_information_id) AS TotalPurchases',
        false,
        company_join
      );

      var totalPurchases =
        totalPurchaseData.length > 0 ? totalPurchaseData[0].TotalPurchases : 0;
      var totalPages = Math.ceil(totalPurchases / per_page);

      var purchaseData = await Common.get_info(
        0,
        tableName.TBL_PURCHASE_INFORMATION + ' p',
        'p.flag_deleted',
        filterWhere,
        'p.purchase_information_id, p.purchase, p.purchase_id, p.cost,p.year, p.purchase_type, p.product_input, p.company_id, c.company_name',
        false,
        company_join,
        false,
        { field: 'p.purchase_information_id', order: 'DESC' },
        per_page,
        offset
      );

      if (purchaseData.length > 0) {
        return res.status(200).json({
          status: true,
          message: 'Purchase Information List Found',
          data: purchaseData,
          page: page,
          per_page: per_page,
          total: totalPurchases,
          total_pages: totalPages
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Purchase Information List Empty',
          data: [],
          page: page,
          per_page: per_page,
          total: totalPurchases,
          total_pages: totalPages
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },
  getById: async function (req, res) {
    try {
      const purchaseId = req.params.purchase_information_id;

      const selectedFields = `
      p.purchase_information_id,
      p.purchase,
      p.purchase_id,
      p.cost,
      p.year,
      p.purchase_type,
      p.product_input,
      p.company_id,
      c.company_name
    `;

      const whereCondition = "p.flag_deleted = 0";

      const company_join = [
        {
          type: 'LEFT',
          table: tableName.TBL_COMPANY + ' as c',
          on: 'p.company_id = c.company_id'
        }
      ];

      let purchaseInfo = await Common.get_info(
        purchaseId,
        tableName.TBL_PURCHASE_INFORMATION + ' p',
        'p.purchase_information_id',
        whereCondition,
        selectedFields,
        false,
        company_join
      );

      if (purchaseInfo.length) {
        return res.status(200).json({
          status: true,
          message: 'Purchase Information Found',
          data: purchaseInfo
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Purchase Information Not Found',
          data: []
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  
  delete: async function (req, res) {
    try {
        const purchaseId = req.params.purchase_information_id;
        const relatedTables = [
            tableName.TBL_BE04
        ];
        for (const tbl of relatedTables) {
            const used = await Common.selectWhere(
                tbl,
                `purchase_information_id = ${purchaseId} AND flag_deleted = 0`
            );

            if (used.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: 'Cannot delete. Purchase Information is already used in BE04 data.',
                    data: []
                });
            }
        }

          
        const existing = await Common.selectWhere(
            tableName.TBL_PURCHASE_INFORMATION,
            `purchase_information_id = ${purchaseId} AND flag_deleted = 0`
        );

        if (!existing.length) {
            return res.status(404).json({
                status: false,
                message: 'Purchase Information not found or already deleted',
                data: []
            });
        }

        
        const updateData = {
            flag_deleted: 1,
            deleted_on: new Date(),
            modified_by: req.userData?.UserID || null
        };

        await Common.update(
            tableName.TBL_PURCHASE_INFORMATION,
            `purchase_information_id = ${purchaseId}`,
            updateData
        );

        return res.status(200).json({
            status: true,
            message: 'Purchase Information deleted successfully (soft delete)',
            data: []
        });

    } catch (ex) {
        Logs.ErrorHandler(ex, res);
    }
},


 edit: async function (req, res) {
  try {
    const purchaseId = req.params.purchase_information_id;

     
    const ValidationCheck = new Validator(req.body, {
      purchase: 'required|string',
      year: 'required|string',    
      cost: 'required|string',    
      purchase_type: 'required|string'
    });

     
    const companyId =
      req.userData.RoleID == 1 ? req.body.company_id : req.userData.CompanyID;

     
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

     
    const existingPurchase = await Common.selectWhere(
      tableName.TBL_PURCHASE_INFORMATION,
      `purchase_information_id = ${purchaseId} AND flag_deleted != 1`
    );

    if (existingPurchase.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Purchase Information not found or already deleted',
        errors: { purchase_information_id: 'Record not found or deleted' }
      });
    }

     
    const duplicateCheck = `
      company_id = '${companyId}'
      AND LOWER(purchase) = '${req.body.purchase.toLowerCase().trim()}'
      AND flag_deleted = 0
      AND purchase_information_id != ${purchaseId}
    `;

    const isDuplicate = await Common.selectWhere(
      tableName.TBL_PURCHASE_INFORMATION,
      duplicateCheck
    );

    if (isDuplicate.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'This Purchase already exists under the selected company.',
        data: []
      });
    }

    //  Directly take year & cost from frontend (no merge or filtering)
    const updatedYears = req.body.year.trim();
    const updatedCosts = req.body.cost.trim();

    //  Prepare Update Data
    const data = {
      company_id: companyId,
      purchase: req.body.purchase,
      purchase_id: req.body.purchase_id || null,
      year: updatedYears,
      cost: updatedCosts,
      purchase_type: req.body.purchase_type,
      product_input: req.body.product_input,
      is_active: req.body.is_active || 1,
      modified_on: new Date(),
      modified_by: req.userData.UserID || null
    };

     
    await Common.update(
      tableName.TBL_PURCHASE_INFORMATION,
      `purchase_information_id = ${purchaseId}`,
      data
    );

     
    return res.status(200).json({
      status: true,
      message: 'Purchase Information updated successfully',
      data: []
    });

  } catch (ex) {
    Logs.ErrorHandler(ex, res);
  }
},







}