const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const { index } = require('./company.controller');

module.exports = {

  // chekc

  getCompanyReport: async function (req, res) {
    try {
      // const companyId = req.params.company_id;
      const requestedCompanyId = Number(req.params.company_id);

      let companyId;

      if (req.userData.RoleID == 1) {

        companyId = requestedCompanyId;

      } else {

        if (requestedCompanyId !== Number(req.userData.CompanyID)) {

          return res.status(403).json({
            status: false,
            message: "You are not authorized to access another company's data."
          });

        }

        companyId = req.userData.CompanyID;
      }

      const selectedFields = 'goal_id, goal_name,goal_short_name, goal_code';
      // if (req.userData.RoleID == 3) {
      if (req.userData.RoleID != 1 && req.userData.RoleID != 2) {
        var user_goals = await Common.selectWhere(tableName.TBL_USERBEDETAILS, `user_id = ${req.userData.UserID} AND is_deleted = 0`, 'goal_id');
        if (user_goals.length > 0) {
          user_goals = user_goals.map(item => item.goal_id).join(',');
          var user_where = ` AND goal_id IN (${user_goals})`;
        }
      } else {
        var user_where = ` AND 1=1`;
      }
      const goals = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0' + user_where, selectedFields, false, false, false, { field: 'goal_code', order: 'ASC' });
      const reportData = [];

      if (companyId > 0) {
        const beObject = {};
        const sites = [], employees = [], products = [], supplyChain = [], Governance = [];
        for (let index = 0; index < goals.length; index++) {
          const element = goals[index];
          const code = element.goal_code;
          const goalCode = element.goal_code;
          const progressJoin = [
            {
              type: 'LEFT',
              table: `${tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS} AS cbpi`,
              on: 'cbpi.progress_indicator_id = pi.progress_indicator_id AND cbpi.company_id = ' + companyId
            }
          ];
          const progressIndicators = await Common.get_info(
            element.goal_id,
            `${tableName.TBL_BE_PROGRESS_INDICATOR} AS pi`,
            'pi.goal_id',
            `pi.flag_deleted = 0 AND cbpi.flag_deleted = 0`,
            "CASE  WHEN cbpi.score IS NULL THEN 0 ELSE TRY_CAST(REPLACE(cbpi.score,'%','') AS FLOAT) END as score",
            false,
            progressJoin
          );

          if (goalCode !== 'BE04' && goalCode !== 'BE23') {
            progressIndicators.forEach(item => {
              item.score = 0;
            });
          }
          const contextJoin = [
            {
              type: 'LEFT',
              table: `${tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS} AS cbci`,
              on: 'cbci.context_indicator_id = ci.context_indicator_id AND cbci.company_id = ' + companyId
            }
          ];

          const contextIndicators = await Common.get_info(
            element.goal_id,
            `${tableName.TBL_BE_CONTEXT_INDICATOR} AS ci`,
            'ci.goal_id',
            `ci.flag_deleted = 0 AND cbci.flag_deleted = 0`,
            "CASE  WHEN cbci.score IS NULL THEN 0  ELSE TRY_CAST(REPLACE(cbci.score,'%','') AS FLOAT) END as score,cbci.year, ci.context_indicator, ci.unit",
            false,
            contextJoin
          );


          let be04Progress = [];

          if (goalCode == 'BE04') {
            const be04Join = [
              {
                type: 'LEFT',
                table: `${tableName.TBL_BE04_CATEGORY} AS bcm`,
                on: 'bcm.category_id = cbpi.category_id'
              }
            ];


            be04Progress = await Common.get_info(
              element.goal_id,
              `${tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS} AS cbpi`,
              'cbpi.be_goal_id',
              `cbpi.flag_deleted = 0 
         AND cbpi.company_id = ${companyId} 
         AND cbpi.be_goal_id = ${element.goal_id}`,
              `cbpi.category_id, bcm.category_name, cbpi.year, cbpi.score, cbpi.data_completeness`,
              false,
              be04Join
            );

            if (be04Progress && be04Progress.length > 0) {
              element.progress_indicators = be04Progress.map(row => ({
                category_id: row.category_id,
                category_name: row.category_name,
                year: row.year,
                score: row.score,
                data_completeness: row.data_completeness
              }));

              element.context_indicators = [];
            }
          }

          let be23Progress = [];

          if (goalCode == 'BE23') {
            const be23Join = [
              {
                type: 'LEFT',
                table: `${tableName.TBL_BE04_CATEGORY} AS bcm`,
                on: 'bcm.category_id = cbpi.category_id'
              }
            ];

            be23Progress = await Common.get_info(
              element.goal_id,
              `${tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS} AS cbpi`,
              'cbpi.be_goal_id',
              `cbpi.flag_deleted = 0 
         AND cbpi.company_id = ${companyId} 
         AND cbpi.be_goal_id = ${element.goal_id}`,
              `cbpi.category_id, bcm.category_name, cbpi.year, cbpi.score, cbpi.data_completeness`,
              false,
              be23Join
            );

            if (be23Progress && be23Progress.length > 0) {
              element.progress_indicators = be23Progress.map(row => ({
                category_id: row.category_id,
                category_name: row.category_name,
                year: row.year,
                score: row.score,
                data_completeness: row.data_completeness
              }));

              element.context_indicators = [];
            }
          }

          if (progressIndicators.length || contextIndicators.length || be04Progress.length || be23Progress.length) {
            beObject[goalCode] = {
              goal_name: element.goal_name,
              goal_code: goalCode,
              progress_indicators: goalCode == 'BE04' ? be04Progress : goalCode == 'BE23' ? be23Progress : progressIndicators, context_indicators:
                goalCode == 'BE04' || goalCode == 'BE23'
                  ? []
                  : contextIndicators
            };
          }

          if (element) {

            if (goalCode == 'BE04') {
              element.progress_indicators = be04Progress;
              element.context_indicators = [];
            }

            else if (goalCode == 'BE23') {
              element.progress_indicators = be23Progress;
              element.context_indicators = [];
            }

            else {
              element.progress_indicators = progressIndicators;
              element.context_indicators = contextIndicators;
            }

          }



          const numCode = parseInt(code.replace('BE', ''));
          // console.log(numCode,'numCode')
          if (numCode >= 1 && numCode <= 9) {
            sites.push(element);
          } else if (numCode >= 10 && numCode <= 14) {
            employees.push(element);
          } else if (numCode >= 15 && numCode <= 19) {
            products.push(element);
          } else if (numCode >= 20 && numCode <= 23) {
            Governance.push(element);
          }
        }

        reportData.push({
          sites,
          supplyChain,
          employees,
          products,
          Governance,
          company_id: companyId,
        });
      }


      return res.status(200).json({
        status: true,
        message: 'Fitness Summary Report Generated Successfully',
        data: reportData[0]
      });
    } catch (err) {
      console.log(err, 'err')
      Logs.ErrorHandler(err, res);
    }
  },

  getsepData: async function (req, res) {
    try {
      const indexID = req.params.index;
      let filledCount = 0;
      let notFilledCount = 0;
      const finalReport = [];

      if (indexID != 0) {

        const selectedFields = 'goal_id, goal_name, goal_code';
        // if (req.userData.RoleID == 3) {
        if (req.userData.RoleID != 1 && req.userData.RoleID != 2) {
          var user_goals = await Common.selectWhere(tableName.TBL_USERBEDETAILS, `user_id = ${req.userData.UserID} AND is_deleted = 0`, 'goal_id');
          if (user_goals.length > 0) {
            user_goals = user_goals.map(item => item.goal_id).join(',');
            var user_where = ` AND goal_id IN (${user_goals})`;
          }
        } else {
          var user_where = ` AND "1=1"`;
        }
        const BEGoal = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0 ' + user_where, selectedFields, false, false, false, { field: 'goal_code', order: 'ASC' });

        const golaCode = [];

        let goal_found = 0;
        for (let index = 0; index < BEGoal.length; index++) {
          const element = BEGoal[index];
          const code = element.goal_code;
          const tableCode = code.toLowerCase(); // e.g., 'be01'
          const tableNameGoal = `tbl_${tableCode}`;       // e.g., 'tbl_be01'
          goal_found = 0;
          if (code !== '0000') {

            // Categorize based on goal_code
            const numCode = parseInt(code.replace('BE', ''));
            if (numCode >= 1 && numCode <= 9 && indexID == 1) {
              goal_found = 1;

            } else if (numCode >= 10 && numCode <= 14 && indexID == 2) {
              // golaCode.push(element);
              goal_found = 1;

            } else if (numCode >= 15 && numCode <= 23 && indexID == 3) {
              goal_found = 1;
              // golaCode.push(element);
            }
            if (goal_found == 1) {
              golaCode.push(element);
              // dynamically check if data exists
              const result = await Common.selectWhere(tableNameGoal, `company_id = ${req.userData.CompanyID} AND flag_deleted=0`);

              if (result.length > 0) {
                goal_found = 1;
                filledCount++;
              } else {
                goal_found = 1;
                notFilledCount++;
              }
            }
          }
        }
      } else {
        // console.log('indexID is 0, processing all goals');
        const selectedFields = 'goal_id, goal_name, goal_code';


        let user_where = "";
        // if (req.userData.RoleID == 3) {
        if (req.userData.RoleID != 1 && req.userData.RoleID != 2) {
          let user_goals = await Common.selectWhere(
            tableName.TBL_USERBEDETAILS,
            `user_id = ${req.userData.UserID} AND is_deleted = 0`,
            'goal_id'
          );

          if (user_goals.length > 0) {
            user_goals = user_goals.map(item => item.goal_id).join(',');
            user_where = ` AND goal_id IN (${user_goals})`;
          }
        }

        const BEGoal = await Common.get_info(
          1,
          tableName.TBL_BREAK_EVEN_GOALS,
          1,
          `flag_deleted=0` + user_where,
          selectedFields,
          false, false, false,
          { field: 'goal_code', order: 'ASC' }
        );




        for (let index = 0; index < BEGoal.length; index++) {

          const element = BEGoal[index];
          const code = element.goal_code;
          const tableNameGoal = `tbl_${code.toLowerCase()}`;


          const result = await Common.selectWhere(
            tableNameGoal,
            `company_id = ${req.userData.CompanyID} AND flag_deleted=0`,

          );

          if (result.length > 0) {
            filledCount++;
            finalReport.push({ goal_code: code, filled: true });
          } else {
            notFilledCount++;
            finalReport.push({ goal_code: code, filled: false });
          }
        }
      }

      return res.status(200).json({
        status: true,
        message: "Report Generated",
        data: {
          filled: filledCount,
          notFilled: notFilledCount,
          report: finalReport
        }
      });

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },

  //check 
  getUserData: async function (req, res) {
    const CREATED_BY_FIELDS = ['created_by', 'modified_by'];
    try {

      const selectedFields = 'goal_id, goal_name, goal_code';
      let user_where = '';

      if (req.userData.RoleID === 3) {
        let user_goals = await Common.selectWhere(
          tableName.TBL_USERBEDETAILS,
          `user_id = ${req.userData.UserID} AND is_deleted = 0`,
          'goal_id'
        );

        if (user_goals.length) {
          user_goals = user_goals.map(r => r.goal_id).join(',');
          user_where = ` AND goal_id IN (${user_goals})`;
        }
      } else {
        user_where = ' AND 1=1';
      }
      const BEGoal = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, `flag_deleted = 0 ${user_where}`, selectedFields, false, false, false, { field: 'goal_code', order: 'ASC' });
      let companyUsers = await Common.selectWhere(tableName.TBL_USERS, `company_id = ${req.userData.CompanyID} AND is_deleted = 0`, 'user_id, first_name, last_name');
      const countFormsForUser = async (userId) => {
        let filled = 0;

        for (const { goal_code } of BEGoal) {
          const tbl = `tbl_${goal_code.toLowerCase()}`;

          const rows = await Common.selectWhere(
            tbl,
            `company_id = ${req.userData.CompanyID} AND flag_deleted = 0 ORDER BY id DESC OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`
          );

          if (rows.length) {
            const lastUser = rows[0].modified_by ? rows[0].modified_by : rows[0].created_by;
            if (lastUser == userId) filled += 1;
          }

        }

        return filled;
      };


      const userReport = await Promise.all(
        companyUsers.map(async (u) => {
          const formsFilled = await countFormsForUser(u.user_id);
          return {
            userId: u.user_id,
            name: `${u.first_name} ${u.last_name}`,
            formsFilled,

          };
        })
      );

      return res.status(200).json({
        status: true,
        message: 'User report generated',
        data: userReport,

      });

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }
  },


  admindashboardData: async function (req, res) {
    try {
      var totalSites = await Common.get_info(1, tableName.TBL_SITE_INFORMATION, 1, 'flag_deleted = 0', 'COUNT(site_id) as site_id')

      if (totalSites.length) {
        totalSites = totalSites[0].site_id;
      }

      var totalCompanies = await Common.get_info(1, tableName.TBL_COMPANY, 1, 'is_deleted = 0', 'COUNT(company_id) as company_id')
      if (totalCompanies.length) {
        totalCompanies = totalCompanies[0].company_id;
      }

      var totalEmployee = await Common.get_info(1, tableName.TBL_EMPLOYEE, 1, 'flag_deleted = 0', 'COUNT(employee_id) as employee_id')
      if (totalEmployee.length) {
        totalEmployee = totalEmployee[0].employee_id;
      }

      var totalProduct = await Common.get_info(1, tableName.TBL_PRODUCT, 1, 'flag_deleted = 0', 'COUNT(product_id) as product_id')
      if (totalProduct.length) {
        totalProduct = totalProduct[0].product_id;
      }

      return res.status(200).json({
        status: true,
        message: 'Admin Dashboard statistics fetched successfully',
        data: {
          totalCompanies: totalCompanies ? totalCompanies : 0,
          totalSites: totalSites ? totalSites : 0,
          totalEmployee: totalEmployee ? totalEmployee : 0,
          totalProduct: totalProduct ? totalProduct : 0
        }

      });

    } catch (ex) {
      Logs.ErrorHandler(ex, res);
    }

  }


}


