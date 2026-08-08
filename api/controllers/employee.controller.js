const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

 
  add: async function (req, res) {
    try {

      const ValidationCheck = new Validator(req.body, {
        EmployeeGroup: 'required',
        GroupID: 'required'
       
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

      const employeeGroup = req.body.EmployeeGroup;
      const groupID = req.body.GroupID;
      const siteID = req.body.SiteID || null;
      const years = req.body.Year;
      const employees = req.body.NumberOfEmployees;     

     // const existingGroupCheck = `company_id=${companyId} AND employee_group='${employeeGroup}' AND group_id='${groupID}' AND site_id=${siteID} AND flag_deleted=0`;
     let existingGroupCheck = `
company_id=${companyId}
AND employee_group='${employeeGroup}'
AND group_id='${groupID}'
AND flag_deleted=0
`;

if (siteID) {
  existingGroupCheck += ` AND site_id=${siteID}`;
} else {
  existingGroupCheck += ` AND site_id IS NULL`;
}
     const existingGroup = await Common.selectWhere(tableName.TBL_EMPLOYEE, existingGroupCheck);

      
      if (existingGroup.length > 0) {
        return res.status(400).json({
          status: false,
          message: "Duplicate Group ID for the selected company.",
          data: []
        });
      }
      else {

        const data = {
          company_id: companyId,
          employee_group: employeeGroup,
          group_id: groupID,
          site_id: siteID,
          year: years, 
          number_of_employees: employees,
          site: req.body.site || null,
          location: req.body.location || null,
          is_active: 1,
          created_on: new Date()
        };

        await Common.insert(tableName.TBL_EMPLOYEE, data);
        return res.status(200).json({
          status: true,
          message: "Employee added successfully",
          data: []
        });
      }

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  getById: async function (req, res) {
    try {
      const employeeId = req.params.employee_id;

      const fields = `
                e.employee_id,
                e.company_id,
                e.employee_group,
                e.group_id,
                e.year,  
                e.number_of_employees,
                e.site,
                e.location,
                e.site_id,
                c.company_name
            `;

      const join = [
        {
          type: 'LEFT',
          table: tableName.TBL_COMPANY + ' as c',
          on: 'e.company_id = c.company_id'
        }
      ];

      const where = 'e.flag_deleted=0';

      const employee = await Common.get_info(
        employeeId,
        tableName.TBL_EMPLOYEE + ' as e',
        'e.employee_id',
        where,
        fields,
        false,
        join
      );

      if (employee.length) {
        return res.status(200).json({
          status: true,
          message: 'Employee Found',
          data: employee
        });
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

  edit: async function (req, res) {
    try {
      const ValidationCheck = new Validator(req.body, {
        EmployeeGroup: 'required',
        GroupID: 'required',
        NumberOfEmployees: 'required|string',
        Year: 'required|string'
      });

      const companyId =
        req.userData.RoleID == 1
          ? req.body.CompanyID
          : req.userData.CompanyID;

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

      const employeeId = req.params.employee_id;
      const existing = await Common.selectWhere(
        tableName.TBL_EMPLOYEE,
        `employee_id = ${employeeId} AND flag_deleted = 0`
      );

      if (existing.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'Employee not found',
          errors: { employee_id: 'Employee not found or deleted' }
        });
      }


      const groupDuplicateCheck = `
      company_id=${companyId}
      AND employee_group='${req.body.EmployeeGroup}'
      AND employee_id != ${employeeId}
      AND flag_deleted=0
    `;
      const isGroupDuplicate = await Common.selectWhere(
        tableName.TBL_EMPLOYEE,
        groupDuplicateCheck
      );
      if (isGroupDuplicate.length > 0) {           
        return res.status(400).json({
          status: false,
          message: 'Duplicate Employee Group for the selected company.',
          data: []
        });
      }


      const groupIDDuplicateCheck = `
      company_id=${companyId}
      AND group_id="${req.body.GroupID}"
      AND employee_id != ${employeeId}
      AND flag_deleted=0
    `;
      const isGroupIDDuplicate = await Common.selectWhere(
        tableName.TBL_EMPLOYEE,
        groupIDDuplicateCheck
      );
      if (isGroupIDDuplicate.length > 0) {
        return res.status(400).json({
          status: false,
          message: 'Duplicate Group ID for the selected company.',
          data: []
        });
      }


      const data = {
        company_id: companyId,
        employee_group: req.body.EmployeeGroup,
        group_id: req.body.GroupID,
        number_of_employees: req.body.NumberOfEmployees,
        year: req.body.Year,
        site: req.body.site || null,
        site_id: req.body.SiteID || null,
        location: req.body.location || null,
        is_active: req.body.is_active || 1,
        modified_on: new Date()
      };

      await Common.update(
        tableName.TBL_EMPLOYEE,
        `employee_id = ${employeeId}`,
        data
      );

      return res.status(200).json({
        status: true,
        message: 'Employee updated successfully',
        data: []
      });
    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },
  delete: async function (req, res) {
    try {
      const employeeId = req.params.employee_id;

      const relatedTables = [
        tableName.TBL_BE10,
        tableName.TBL_BE11,
        tableName.TBL_BE12,
        tableName.TBL_BE13,
        tableName.TBL_BE14,
        tableName.TBL_BE20
      ];
      for (const tbl of relatedTables) {
        const used = await Common.selectWhere(tbl, `employee_id = ${employeeId} AND flag_deleted = 0`);
        if (used.length > 0) {
          return res.status(409).json({
            status: false,
            message: 'Cannot delete Employee. It is already used.',
            data: []
          });
        }
      }
      if (!employeeId || isNaN(employeeId) || Number(employeeId) <= 0) {
        return res.status(400).json({
          status: false,
          message: 'Invalid or missing employee_id',
          errors: { employee_id: 'Valid employee_id is required and must be a positive number' }
        });
      }
      const existing = await Common.selectWhere(tableName.TBL_EMPLOYEE, `employee_id = ${employeeId} AND flag_deleted = 0`);
      if (!existing.length) {
        return res.status(404).json({ status: false, message: 'Employee not found or already deleted', data: [] });
      }
      const updateData = {
        flag_deleted: 1, deleted_on: new Date(), modified_on: new Date()
      };
      await Common.update(tableName.TBL_EMPLOYEE, `employee_id = ${employeeId}`, updateData);
      return res.status(200).json({ status: true, message: 'Employee soft deleted successfully', data: [] });

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
        filterWhere += ` AND (e.employee_group LIKE '%${filter}%' OR e.site LIKE '%${filter}%' OR e.group_id LIKE '%${filter}%' OR e.number_of_employees LIKE '%${filter}%' OR e.year LIKE '%${filter}%' OR st.site_name LIKE '%${filter}%' OR st.location LIKE '%${filter}%' OR st.site_id_manual LIKE '%${filter}%' OR e.location LIKE '%${filter}%')`;
      }

      if (req.userData.RoleID == 2) {
        filterWhere += ' AND e.company_id = ' + req.userData.CompanyID;
      }

      var join = [
        {
          type: 'LEFT',
          table: tableName.TBL_COMPANY + ' as c',
          on: 'c.company_id = e.company_id'
        },

        {
          type: 'LEFT',
          table: tableName.TBL_SITE_INFORMATION + ' as st',
          on: 'e.site_id = st.site_id'
        }
      ];
      var totalEmployeeData = await Common.get_info(
        0,
        tableName.TBL_EMPLOYEE + ' as e',
        'e.flag_deleted',
        filterWhere,
        'COUNT(e.employee_id) AS TotalEmployees',
        false,
        join
      );

      var totalEmployees = totalEmployeeData.length > 0 ? totalEmployeeData[0].TotalEmployees : 0;
      var totalPages = Math.ceil(totalEmployees / per_page);
      var employeeData = await Common.get_info(0, tableName.TBL_EMPLOYEE + ' as e', 'e.flag_deleted', filterWhere, 'e.employee_id,e.year, e.company_id, c.company_name,st.site_name,st.site_id_manual AS site_ID,st.location as Site_location, e.employee_group, e.group_id as group_ID , e.number_of_employees, e.site, e.location', false, join, false, { field: 'e.employee_group', order: 'ASC' }, per_page, offset);

      if (employeeData.length > 0) {
        return res.status(200).json({
          status: true,
          message: 'Employee List Found',
          data: employeeData,
          page: page,
          per_page: per_page,
          total: totalEmployees,
          total_pages: totalPages
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Employee List Empty',
          data: [],
          page: page,
          per_page: per_page,
          total: totalEmployees,
          total_pages: totalPages
        });
      }

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },




}