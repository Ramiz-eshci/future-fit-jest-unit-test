const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

  add: async function (req, res) {
    try {

      const ValidationCheck = new Validator(req.body, {
        ProductType: 'required',
        UserGroup: 'required',
        UserGroupID: 'required',
        // SiteID: 'required|integer',
        ProductName: 'required',
        ProductIDManual: 'required'
      });

      const FormaValidationError = await ValidationCheck.check();
      if (!FormaValidationError) {
        const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
          acc[key] = ValidationCheck.errors[key].message;
          return acc;
        }, {});
        return res.status(400).json({ status: false, message: 'Validation Error', errors });
      }


      const companyId = req.userData.RoleID == 1 ? req.body.CompanyID : req.userData.CompanyID;


      const productType = req.body.ProductType;
      const productName = req.body.ProductName;
      const productIdManual = req.body.ProductIDManual;
      const userGroup = req.body.UserGroup;
      const userGroupID = req.body.UserGroupID;
      const siteID = req.body.SiteID || null;
      const years = req.body.Year;
      const revenueCosts = req.body.RevenueCost;


      //   const existingProductCheck = `
      //   company_id=${companyId}
      //   AND product_name='${productName}'
      //   AND product_id_manual='${productIdManual}'
      //   AND site_id=${siteID}
      //   AND flag_deleted=0
      // `;
      let existingProductCheck = `
  company_id=${companyId}
  AND product_name='${productName}'
  AND product_id_manual='${productIdManual}'
  AND flag_deleted=0
`;

      if (siteID) {
        existingProductCheck += ` AND site_id=${siteID}`;
      } else {
        existingProductCheck += ` AND site_id IS NULL`;
      }
      const existingProduct = await Common.selectWhere(tableName.TBL_PRODUCT, existingProductCheck);



      if (existingProduct.length > 0) {
        return res.status(400).json({
          status: false,
          message: "This product already exists for the selected company and user group with the same manual ID.",
          data: []
        });
      }


      const data = {
        company_id: companyId,
        product_type: productType,
        product_name: productName,
        product_id_manual: productIdManual,
        user_group: userGroup,
        user_group_id: userGroupID,
        site_id: siteID,
        year: years,
        revenue_cost: revenueCosts,
        is_active: 1,
        created_on: new Date()
      };

      await Common.insert(tableName.TBL_PRODUCT, data);
      return res.status(200).json({
        status: true,
        message: "Product added successfully",
        data: []
      });

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  getById: async function (req, res) {
    try {
      var product_id = req.params.product_id;
      var join = [
        {
          'type': 'LEFT',
          'table': tableName.TBL_COMPANY + ' as c',
          'on': 'c.company_id = p.company_id'
        },
      ];
      var product_data = await Common.get_info(0, tableName.TBL_PRODUCT + ' as p', 'p.flag_deleted', 'p.product_id=' + product_id,
        'p.product_id,p.year, p.product_name, p.product_type,p.site_id, p.revenue_cost, p.user_group, p.user_group_id,p.company_id,p.product_id_manual, c.company_name, c.contact_number',
        false,
        join
      );
      // console.log(product_data, '--product data');
      if (product_data.length) {
        return res.status(200).json({
          status: true,
          message: 'Product Data Found',
          data: product_data
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Product Data Not Found',
          data: []
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  edit: async function (req, res) {
    try {
      const productId = req.params.product_id;


      const ValidationCheck = new Validator(req.body, {
        ProductType: 'required',
        Year: 'required|string',
        RevenueCost: 'required|string',
        UserGroup: 'required',
        UserGroupID: 'required'
        // SiteID: 'required|integer'
      });


      const companyId =
        req.userData.RoleID == 1 ? req.body.CompanyID : req.userData.CompanyID;
      const siteID = req.body.SiteID || null;

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


      const existingProduct = await Common.selectWhere(
        tableName.TBL_PRODUCT,
        `product_id = ${productId} AND flag_deleted = 0`
      );

      if (existingProduct.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'Product not found or deleted',
          errors: { product_id: 'Product not found or deleted' }
        });
      }


      //   const duplicateCheck = `
      //   company_id=${companyId} AND product_id_manual='${req.body.ProductIDManual}' AND user_group='${req.body.UserGroup}' AND user_group_id='${req.body.UserGroupID}'
      //   AND site_id=${req.body.SiteID}
      //   AND product_id != ${productId}
      //   AND flag_deleted=0
      // `;
      let duplicateCheck = `
  company_id=${companyId}
  AND product_id_manual='${req.body.ProductIDManual}'
  AND user_group='${req.body.UserGroup}'
  AND user_group_id='${req.body.UserGroupID}'
  AND product_id != ${productId}
  AND flag_deleted=0
`;

      if (siteID) {
        duplicateCheck += ` AND site_id=${siteID}`;
      } else {
        duplicateCheck += ` AND site_id IS NULL`;
      }

      const isDuplicate = await Common.selectWhere(
        tableName.TBL_PRODUCT,
        duplicateCheck
      );

      if (isDuplicate.length > 0) {
        return res.status(400).json({
          status: false,
          message:
            'Duplicate Product for the selected company, site, and group.',
          data: []
        });
      }


      const updatedYears = req.body.Year.trim();
      const updatedRevenues = req.body.RevenueCost.trim();


      const data = {
        company_id: companyId,
        product_type: req.body.ProductType,
        product_name: req.body.ProductName,
        product_id_manual: req.body.ProductIDManual || null,
        user_group: req.body.UserGroup,
        user_group_id: req.body.UserGroupID,
        site_id: req.body.SiteID || null,
        year: updatedYears,
        revenue_cost: updatedRevenues,
        is_active: req.body.is_active || 1,
        modified_on: new Date(),
        modified_by: req.userData.UserID || null
      };


      await Common.update(
        tableName.TBL_PRODUCT,
        `product_id = ${productId}`,
        data
      );


      return res.status(200).json({
        status: true,
        message: 'Product Information updated successfully',
        data: []
      });
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },


  delete: async function (req, res) {
    try {

      const product_id = req.params.product_id;
      const relatedTables = [
        tableName.TBL_BE15,
        tableName.TBL_BE16,
        tableName.TBL_BE17,
        tableName.TBL_BE18,
        tableName.TBL_BE19
      ];
      for (const tbl of relatedTables) {
        const used = await Common.selectWhere(tbl, `product_id = ${product_id} AND flag_deleted = 0`);
        if (used.length > 0) {
          return res.status(409).json({
            status: false,
            message: 'Cannot delete Product. It is already used',
            data: []
          });
        }
      }
      const existingProduct = await Common.selectWhere(tableName.TBL_PRODUCT, `product_id = ${product_id} AND flag_deleted = 0`
      );
      if (!existingProduct.length) {
        return res.status(404).json({
          status: false,
          message: 'Product not found or already deleted',
          data: []
        });
      }
      const data = {
        flag_deleted: 1,
        modified_on: new Date(),
        deleted_on: new Date()
      };
      await Common.update(tableName.TBL_PRODUCT, `product_id = ${product_id}`, data);
      return res.status(200).json({
        status: true,
        message: 'Product soft deleted successfully',
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
        filterWhere += ` AND ( p.product_name LIKE '%${filter}%'   OR pt.product_typename LIKE '%${filter}%'  OR p.user_group LIKE '%${filter}%'   OR p.user_group_id LIKE '%${filter}%'  OR c.company_name LIKE '%${filter}%'  OR st.site_name LIKE '%${filter}%'  OR p.product_id_manual LIKE '%${filter}%'  OR p.revenue_cost LIKE '%${filter}%' )`;
      }

      if (req.userData.RoleID == 2) {
        filterWhere += ' AND p.company_id = ' + req.userData.CompanyID;
      }
      var join = [
        {
          type: 'LEFT',
          table: tableName.TBL_COMPANY + ' as c',
          on: 'c.company_id = p.company_id'
        },
        {
          type: 'LEFT',
          table: tableName.TBL_PRODUCTTYPE + ' as pt',
          on: 'pt.product_type_id = p.product_type'
        },
        {
          type: 'LEFT',
          table: tableName.TBL_SITE_INFORMATION + ' as st',
          on: 'p.site_id = st.site_id'
        }
      ];
      var totalProductData = await Common.get_info(0, tableName.TBL_PRODUCT + ' as p', 'p.flag_deleted', filterWhere, 'COUNT(p.product_id) AS TotalProducts', false, join
      );
      var totalProducts = totalProductData.length > 0 ? totalProductData[0].TotalProducts : 0;
      var totalPages = Math.ceil(totalProducts / per_page);
      var productData = await Common.get_info(0, tableName.TBL_PRODUCT + ' as p', 'p.flag_deleted', filterWhere,
        'p.product_id,p.year, p.product_name,pt.product_typename as product_type, p.product_id_manual as Product_ID,st.site_name, p.revenue_cost,p.user_group,p.user_group_id as user_group_ID , c.company_name',
        false, join, false, { field: 'p.product_name', order: 'ASC' }, per_page, offset
      );
      if (productData.length > 0) {
        productData = productData.map(item => {
          if (item.revenue_cost) {
            item.revenue_cost = item.revenue_cost.toString().split('.')[0];
          }
          return item;
        });
      }

      if (productData.length > 0) {
        return res.status(200).json({
          status: true,
          message: 'Product List Found',
          data: productData,
          page: page,
          per_page: per_page,
          total: totalProducts,
          total_pages: totalPages
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Product List Empty',
          data: [],
          page: page,
          per_page: per_page,
          total: totalProducts,
          total_pages: totalPages
        });
      }
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },


}