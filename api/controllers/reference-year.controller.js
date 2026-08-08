const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {
    getById: async function (req, res) {
        try {
            const CompanyID = req.userData.CompanyID;
          const site_id = req.params.site_id;
            if (isNaN(site_id)) {
                return res.status(400).json({ status: false, message: 'Invalid site_id' });
            }

            const selectedFields = 'site_id, company_id, be05gaseous_ref_year,be05gaseous_ref_year_value,be05liquid_ref_year,be05liquid_ref_year_value,be05solid_reference_year,be05solid_ref_year_value,be06ghgemmison_ref_year,be06ghgemmison_ref_year_value,be07waste_ref_year,be07waste_ref_year_value';
            const whereCondition = `flag_deleted = 0  AND site_id = ${site_id}`;
            if (req.userData.RoleID != 1) {
                var refData = await Common.get_info(CompanyID, tableName.TBL_SITE_INFORMATION, 'company_id', whereCondition, selectedFields);
               
            } else {
                var refData = await Common.get_info(0, tableName.TBL_SITE_INFORMATION, 'company_id', whereCondition, selectedFields);
            }
            if (refData.length) {
                return res.status(200).json({
                    status: true,
                    message: 'Reference Year Information Found',
                    data: refData
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Reference Year Information Not Found',
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
                RefYear: 'required',
                RefYearValue: 'required'
            });
            if (req.userData.RoleID == 1) {
                var companyId = 0;
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
            const existingSite = await Common.selectWhere(tableName.TBL_BE_REFERENCE_YEAR, 'company_id = ' + companyId + ' AND flag_deleted != 1'
            );
            if (existingSite.length == 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Data not found or already deleted',
                    errors: { companyId: 'Data not found or already deleted' }
                });
            }
            
            const data = {
                ref_year: req.body.RefYear,
                company_id: companyId,
                ref_year_value: req.body.RefYearValue,
                modified_on: new Date(),
                modified_by: req.userData.UserID
            };
            await Common.update(tableName.TBL_BE_REFERENCE_YEAR, 'company_id = ' + companyId, data);
            return res.status(200).json({ status: true, message: "Reference details were updated successfully", data: [] });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

}