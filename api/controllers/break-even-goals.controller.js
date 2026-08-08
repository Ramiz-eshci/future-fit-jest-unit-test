const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');

module.exports = {

    getById: async function (req, res) {
        try {
            const goalId = req.params.goal_id; 
            const selectedFields = 'goal_id, goal_name,goal_short_name, goal_code, fitness_criteria, notes';
            const BEGoal = await Common.get_info(goalId, tableName.TBL_BREAK_EVEN_GOALS, 'goal_id', '', selectedFields);
            if (BEGoal.length) {
                const ProgressselectedFields = 'progress_indicator_id,progress_indicator,data_completeness';
                BEGoal[0].ProgressIndicators = await Common.get_info(goalId, tableName.TBL_BE_PROGRESS_INDICATOR, 'goal_id', 'flag_deleted=0', ProgressselectedFields);
                const ContextIndicators = '	context_indicator_id,context_indicator,unit';
                BEGoal[0].ContextIndicators = await Common.get_info(goalId, tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', ContextIndicators);
                return res.status(200).json({
                    status: true,
                    message: 'Break Even Goals Found',
                    data: BEGoal
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Break Even Goals Not Found',
                    data: []
                });
            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
   get: async function (req, res) {
        try {
            const fields = `goal_id as id, goal_code as name`;
            const where = 'flag_deleted=0 AND is_active=1';
            const relevanace = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, where,fields , false,false, false, { field: 'goal_code', order: 'ASC' });
            if (relevanace.length) {
                return res.status(200).json({ status: true, message: 'BEform Found', data: relevanace}); 
                
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'BEform Not Found',
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
                GoalName: 'required',
                GoalCode: 'required',
                GoalShortName: 'required',
                'ProgressIndicators.*.progress_indicator': 'required|string',
                'ContextIndicators.*.context_indicator': 'required|string',
                'ContextIndicators.*.unit': 'required|string'
                //  'ProgressIndicators.*.data_completeness': 'required|string',
            });
            var FormaValidationError = await ValidationCheck.check();
            if (!FormaValidationError) {
                const errors = Object.keys(ValidationCheck.errors).reduce((acc, key) => {
                    acc[key] = ValidationCheck.errors[key].message;
                    return acc;
                }, {});
                return res.status(400).json({ status: false, message: 'Validation Error', data: ValidationCheck.errors, errors: errors });
            }
            const existingGoalName = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_name) = "' + req.body.GoalName.toLowerCase().trim() + '" AND flag_deleted != 1' );
            if (existingGoalName.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Name already exists',
                    errors: { GoalName: 'Goal Name already exists' }
                });
            }
            const existingGoalCode = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_code) = "' + req.body.GoalCode.toLowerCase().trim() + '" AND flag_deleted != 1' );
            if (existingGoalCode.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Code already exists',
                    errors: { GoalCode: 'Goal Code already exists' }
                });
            }
            const existingGoalShortName = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_short_name) = "' + req.body.GoalShortName.toLowerCase().trim() + '" AND flag_deleted != 1');
            if (existingGoalShortName.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Short Name already exists',
                    errors: { GoalShortName: 'Goal Shoer Name already exists' }
                });
            }
            const data = {
                goal_name: req.body.GoalName,
                goal_code: req.body.GoalCode,
                goal_short_name: req.body.GoalShortName,
                fitness_criteria: req.body.FitnessCriteria,
                notes: req.body.Notes,
                is_active:1,
                created_on: new Date(),
                created_by: req.userData.UserID,
            };
            var GoalID = await Common.insert(tableName.TBL_BREAK_EVEN_GOALS, data);
            var ProgressIndicators = req.body.ProgressIndicators;
            var ContextIndicators = req.body.ContextIndicators;
            for (let index = 0; index < ProgressIndicators.length; index++) {
                const element = ProgressIndicators[index];
                const progressIndicatorData = {
                    goal_id: GoalID.insertId,
                    progress_indicator: element.progress_indicator,
                    data_completeness: element.data_completeness,
                    created_on: new Date(),
                    created_by: req.userData.UserID,
                };
                await Common.insert(tableName.TBL_BE_PROGRESS_INDICATOR, progressIndicatorData);
            }
            for (let context_index = 0; context_index < ContextIndicators.length; context_index++) {
                const element = ContextIndicators[context_index];
                const contextIndicatorData = {
                    goal_id: GoalID.insertId,
                    context_indicator: element.context_indicator,
                    unit: element.unit,
                    created_on: new Date(),
                    created_by: req.userData.UserID,
                };
                await Common.insert(tableName.TBL_BE_CONTEXT_INDICATOR, contextIndicatorData);
            }
            return res.status(200).json({ status: true, message: "Break Even Goal added successfully", data: [] });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    delete: async function (req, res) {
        try {
            const goalId = req.params.goal_id;
            // console.log(goalId)
            const existingSite = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_id = ${goalId} AND flag_deleted = 0`);
            if (!existingSite.length) {
                return res.status(404).json({
                    status: false,
                    message: 'Break Even not found or already deleted',
                    data: []
                });
            }
            const updateData = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };
            await Common.update( tableName.TBL_BREAK_EVEN_GOALS, `goal_id = ${goalId}`, updateData
            );
            await Common.update( tableName.TBL_BE_PROGRESS_INDICATOR, `goal_id = ${goalId}`, updateData
            );
            await Common.update( tableName.TBL_BE_CONTEXT_INDICATOR, `goal_id = ${goalId}`, updateData
            );
            return res.status(200).json({
                status: true,
                message: 'Break Even Goal deleted successfully',
                data: []
            });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    edit: async function (req, res) {
        try {
            const ValidationCheck = new Validator(req.body, {
                GoalName: 'required',
                GoalCode: 'required',
                GoalShortName: 'required',
                'ProgressIndicators.*.progress_indicator': 'required|string',
                'ContextIndicators.*.context_indicator': 'required|string',
                'ContextIndicators.*.unit': 'required|string'
                //  'ProgressIndicators.*.data_completeness': 'required|string',
            });
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
            const goalId = req.params.goal_id;
            const existingGoalName = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_name) = "' + req.body.GoalName.toLowerCase().trim() + '" AND flag_deleted != 1 AND goal_id !='+goalId);
            if (existingGoalName.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Name already exists',
                    errors: { GoalName: 'Goal Name already exists' }
                });
            }
            const existingGoalCode = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_code) = "' + req.body.GoalCode.toLowerCase().trim() + '" AND flag_deleted != 1 AND goal_id !='+goalId);
            if (existingGoalCode.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Code already exists',
                    errors: { GoalCode: 'Goal Code already exists' }
                });
            }
            const existingGoalShortName = await Common.selectWhere(  tableName.TBL_BREAK_EVEN_GOALS,'LOWER(goal_short_name) = "' + req.body.GoalShortName.toLowerCase().trim() + '" AND flag_deleted != 1 AND goal_id !='+goalId);
            if (existingGoalShortName.length > 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Goal Short Name already exists',
                    errors: { GoalShortName: 'Goal Shoer Name already exists' }
                });
            }
            const data = {
                goal_name: req.body.GoalName,
                // goal_code: req.body.GoalCode,
                goal_short_name: req.body.GoalShortName,
                fitness_criteria: req.body.FitnessCriteria,
                notes: req.body.Notes,
                is_active:1,
                created_on: new Date(),
                created_by: req.userData.UserID,
            };
            await Common.update(tableName.TBL_BREAK_EVEN_GOALS, 'goal_id = ' + req.params.goal_id, data);
            var ProgressIndicators = req.body.ProgressIndicators;
            var ContextIndicators = req.body.ContextIndicators;
            // Get existing ProgressIndicator IDs for this goal
            const existingProgress = await Common.selectWhere(tableName.TBL_BE_PROGRESS_INDICATOR, 'goal_id = ' + req.params.goal_id + ' AND flag_deleted != 1');
            const existingProgressIds = existingProgress.map(p => p.progress_indicator_id);

            // Get incoming IDs
            const incomingProgressIds = ProgressIndicators.filter(p => p.progress_indicator_id).map(p => p.progress_indicator_id);

            // Find deleted ones
            const toDeleteProgress = existingProgressIds.filter(id => !incomingProgressIds.includes(id));

            // Delete removed indicators
            for (let id of toDeleteProgress) {
                var delete_data = {
                    'flag_deleted':1,
                    'deleted_on':new Date()
                }
                await Common.update(tableName.TBL_BE_PROGRESS_INDICATOR, 'progress_indicator_id = ' + id, delete_data);
            }
            for (let index = 0; index < ProgressIndicators.length; index++) {
                const element = ProgressIndicators[index];
                const progressIndicatorData = {
                    goal_id: req.params.goal_id,
                    progress_indicator: element.progress_indicator,
                    data_completeness: element.data_completeness,
                    created_on: new Date(),
                    created_by: req.userData.UserID,
                };
                if(element.progress_indicator_id){
                    await Common.update(tableName.TBL_BE_PROGRESS_INDICATOR, 'progress_indicator_id = ' + element.progress_indicator_id, progressIndicatorData);
                }else{
                    await Common.insert(tableName.TBL_BE_PROGRESS_INDICATOR, progressIndicatorData);
                }
            }

            const existingContext = await Common.selectWhere(tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id = ' + req.params.goal_id + ' AND flag_deleted != 1');
            const existingContextIds = existingContext.map(c => c.context_indicator_id);

            const incomingContextIds = ContextIndicators.filter(c => c.context_indicator_id).map(c => c.context_indicator_id);
            const toDeleteContext = existingContextIds.filter(id => !incomingContextIds.includes(id));

            for (let id of toDeleteContext) {
                var delete_data = {
                    'flag_deleted':1,
                    'deleted_on':new Date()
                }
                await Common.update(tableName.TBL_BE_CONTEXT_INDICATOR, 'context_indicator_id = ' + id, delete_data);
            }
            for (let context_index = 0; context_index < ContextIndicators.length; context_index++) {
                const element = ContextIndicators[context_index];
                const contextIndicatorData = {
                    goal_id: req.params.goal_id,
                    context_indicator: element.context_indicator,
                    unit: element.unit,
                    created_on: new Date(),
                    created_by: req.userData.UserID,
                };
                if(element.context_indicator_id){
                    await Common.update(tableName.TBL_BE_CONTEXT_INDICATOR, 'context_indicator_id = ' + element.context_indicator_id, contextIndicatorData);
                }else{
                    await Common.insert(tableName.TBL_BE_CONTEXT_INDICATOR, contextIndicatorData);
                }
            }
            return res.status(200).json({ status: true, message: "Break Even Goal updated successfully", data: [] });
    
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
            let filterWhere = '';
            if (filter !== '') {
                filterWhere = `(goal_name LIKE "%${filter}%" OR goal_code LIKE "%${filter}%")`;
            }
            var totalBEData = await Common.get_info( 0, tableName.TBL_BREAK_EVEN_GOALS + ' s','flag_deleted', filterWhere,'COUNT(goal_id) AS TotalBEs');
            var totalBEs = totalBEData.length > 0 ? totalBEData[0].TotalBEs : 0;
            var totalPages = Math.ceil(totalBEs / per_page);
            var beData = await Common.get_info(  0, tableName.TBL_BREAK_EVEN_GOALS + ' s', 's.flag_deleted',  filterWhere, 'goal_id, goal_short_name, goal_name, goal_code', false,false, false, { field: 'goal_code', order: 'ASC' }, per_page, offset);
    
            if (beData.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: 'Break Even Goals List Found', 
                    data: beData,
                    page: page,
                    per_page: per_page,
                    total: totalBEs,
                    total_pages: totalPages
                });
            } else {
                return res.status(400).json({
                    status: false,
                    message: 'Break Even Goals List Empty',
                    data: [],
                    page: page,
                    per_page: per_page,
                    total: totalBEs,
                    total_pages: totalPages
                });
            }
    
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    }
    
}