const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const { validateBE01Array } = require('./validations/be01_validations');
const { validateBE02Array } = require('./validations/be02_validations');
const { validateBE03Array } = require('./validations/be03_validations');
const { validateBE05Array } = require('./validations/be05_validations');
const { validateBE06Array } = require('./validations/be06_validations');
const { validateBE07Array } = require('./validations/be07_validations');
const { validateBE08Array } = require('./validations/be08_validations');
const { validateBE09Array } = require('./validations/be09_validations');
const { validateBE10Array } = require('./validations/be10_validations');
const { validateBE11Array } = require('./validations/be11_validations');
const { validateBE12Array } = require('./validations/be12_validations');
const { validateBE13Array } = require('./validations/be13_validations');
const { validateBE14Array } = require('./validations/be14_validations');
const { validateBE15Array } = require('./validations/be15_validations');
const { validateBE16Array } = require('./validations/be16_validations');
const { validateBE17Array } = require('./validations/be17_validations');
const { validateBE18Array } = require('./validations/be18_validations');
const { validateBE19Array } = require('./validations/be19_validations');
const { validateBE20Array } = require('./validations/be20_validations');
const common = require('../models/common');

module.exports = {
    getAllBE: async function (req, res) {
        try {
            const selectedFields = 'goal_id, goal_name, goal_code, fitness_criteria, notes';
            const BEGoal = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0 AND goal_code!="BE04"', selectedFields, false, false, false, { field: 'goal_code', order: 'ASC' });

            if (BEGoal.length) {
                for (let index = 0; index < BEGoal.length; index++) {
                    const element = BEGoal[index];

                    if (element.goal_code != '0000') {

                        const ProgressselectedFields = 'progress_indicator_id,progress_indicator,data_completeness';
                        BEGoal[index].ProgressIndicators = await Common.get_info(element.goal_id, tableName.TBL_BE_PROGRESS_INDICATOR, 'goal_id', 'flag_deleted=0', ProgressselectedFields);
                        const ContextIndicators = '	context_indicator_id,context_indicator,unit';
                        BEGoal[index].ContextIndicators = await Common.get_info(element.goal_id, tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', ContextIndicators);

                    } else {
                        return res.status(400).json({
                            status: false,
                            message: 'Break Even Goals Not Found',
                            data: []
                        });
                    }
                }
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
    getAllBE2: async function (req, res) {
        try {
            const selectedFields = 'goal_id, goal_name, goal_short_name, goal_code, fitness_criteria, notes';
            // if (req.userData.RoleID == 3) {
            if (req.userData.RoleID != 1 && req.userData.RoleID != 2) {
                var user_goals = await Common.selectWhere(tableName.TBL_USERBEDETAILS, `user_id = ${req.userData.UserID} AND is_deleted = 0`);
                if (user_goals.length > 0) {
                    user_goals = user_goals.map(item => item.goal_id).join(',');
                    var user_where = ` AND goal_id IN (${user_goals})`;
                }
            } else {
                var user_where = " AND 1=1";
            }
            const BEGoal = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0' + user_where, selectedFields, false, false, false, { field: 'goal_code', order: 'ASC' });

            const sites = [], employees = [], products = [];

            for (let index = 0; index < BEGoal.length; index++) {
                const element = BEGoal[index];
                const code = element.goal_code;

                if (code !== '0000') {
                    const ProgressselectedFields = 'progress_indicator_id,progress_indicator,data_completeness';
                    element.ProgressIndicators = await Common.get_info(
                        element.goal_id,
                        tableName.TBL_BE_PROGRESS_INDICATOR,
                        'goal_id',
                        'flag_deleted=0',
                        ProgressselectedFields
                    );

                    const ContextIndicators = 'context_indicator_id,context_indicator,unit';
                    element.ContextIndicators = await Common.get_info(
                        element.goal_id,
                        tableName.TBL_BE_CONTEXT_INDICATOR,
                        'goal_id',
                        'flag_deleted=0',
                        ContextIndicators
                    );

                    // Categorize based on goal_code
                    const numCode = parseInt(code.replace('BE', ''));
                    if (numCode >= 1 && numCode <= 9) {
                        sites.push(element);
                    } else if (numCode >= 10 && numCode <= 14) {
                        employees.push(element);
                    } else if (numCode >= 15 && numCode <= 23) {
                        products.push(element);
                    }
                }
            }

            return res.status(200).json({
                status: true,
                message: 'Break Even Goals Found',
                data: {
                    sites,
                    employees,
                    products
                }
            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_basic_fiture_fit: async function (req, res) {
        try {
            // console.log("Basic Future Fit Req", req.body);

            const { FutureFitName, FitMonthYear } = req.body;
            let fit_id = req.body.fit_entry_id ? req.body.fit_entry_id : 0;

            if (!FutureFitName || !FitMonthYear) {
                return res.status(400).json({
                    status: false,
                    message: "Future Fit Name, Year and Month are required."
                });
            }

            const trimmedName = FutureFitName.trim().toLowerCase();

            let fitYear = '2025';
            let fitMonth = '05';

            if (FitMonthYear.includes('-')) {
                const parts = FitMonthYear.split('-');
                if (parts.length >= 2) {
                    fitYear = parts[0].substring(0, 4);
                    fitMonth = parts[1].substring(0, 2);
                }
            } else if (FitMonthYear.length >= 6) {

                fitYear = FitMonthYear.substring(0, 4);
                fitMonth = FitMonthYear.substring(4, 6);
            } else if (FitMonthYear.length === 4) {

                fitYear = FitMonthYear;
            }

            if (isNaN(fitYear) || fitYear.length !== 4) fitYear = '2025';
            if (isNaN(fitMonth) || fitMonth.length !== 2) fitMonth = '05';

            let where = `
      LOWER(TRIM(future_fit_name)) = '${trimmedName}' 
      AND fit_year = '${fitYear}' 
      AND fit_month = '${fitMonth}' 
      AND flag_deleted = 0 
      AND company_id = ${req.userData.CompanyID}
    `;
            if (fit_id != 0) {
                where += ` AND fit_entry_id != ${fit_id}`;
            }

            const checkDuplicate = await Common.selectWhere(tableName.TBL_COMPANY_FUTURE_FIT, where);
            if (checkDuplicate.length > 0) {
                return res.status(409).json({
                    status: false,
                    message: "Form name Month and year already exists."
                });
            }

            if (fit_id == 0) {
                const FitDataObject = {
                    company_id: req.userData.CompanyID,
                    future_fit_name: FutureFitName,
                    fit_year: fitYear,
                    fit_month: fitMonth,
                    status_id: 1,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };
                const result = await Common.insert(tableName.TBL_COMPANY_FUTURE_FIT, FitDataObject);
                return res.status(200).json({
                    status: true,
                    message: "Basic Form Submitted Successfully",
                    data: { fit_entry: result.insertId }
                });
            }
            else {

                const FitDataObject = {
                    future_fit_name: FutureFitName,
                    fit_year: fitYear,
                    fit_month: fitMonth,
                    status_id: 1,
                    modified_by: req.userData.UserID,
                    modified_on: new Date()
                };
                await Common.update(tableName.TBL_COMPANY_FUTURE_FIT, `fit_entry_id = ${fit_id}`, FitDataObject);
                return res.status(200).json({
                    status: true,
                    message: "Basic Form Updated Successfully",
                    data: []
                });
            }

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be01: async function (req, res) {
        try {

            let isUpdate = false;
            const validationResult = await validateBE01Array(req.body);

            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }
            var exists_user = 0;
            var message = '';

            const { sites, progress_indicators, progress_indicator_ids, context_indicators, context_indicator_ids, goalCode_id } = req.body;
            const goalCodeStr = req.body.goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;
            const goCode = goalCodeStr.toUpperCase();

            var BEinsertedID = 0;
            for (const site of sites) {
                if (site.fitnessInputs && Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        var BE01DataObject = {
                            'relevance_id': input.relevance ? parseInt(input.relevance) : 0,
                            'company_id': req.userData.CompanyID,
                            'site_id': site.site_id,
                            'year': input.year,
                            'amount_of_renewable_energy_used': input.renewableEnergyUsed,
                            'total_amount_of_energy_used': input.totalEnergyUsed,
                            'site_fitness': input.siteFitness ? parseInt(input.siteFitness) : 0,
                            'comments': input.comments,
                            'created_by': req.userData.UserID,
                            'created_on': new Date(),
                        }
                        BE01DataObject.flag_deleted = 0;

                        var existingSiteDetails = await Common.get_info(1, tableName.TBL_BE01, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND site_id=' + site.site_id + ' AND id =' + input.id, 'id');

                        if (existingSiteDetails?.length > 0 && existingSiteDetails[0]?.id > 0) {
                            delete BE01DataObject.created_by;
                            delete BE01DataObject.created_on;
                            BE01DataObject.modified_by = req.userData.UserID;
                            BE01DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE01, `id = ${existingSiteDetails[0].id}`, BE01DataObject);
                            isUpdate = true;
                            BEinsertedID = site.BEID;
                        } else {

                            const formattedYear = input.year
                            var existingyearDetails = await Common.get_info(1, tableName.TBL_BE01, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND site_id=' + site.site_id + ' AND year =' + formattedYear, 'id');
                            if (existingyearDetails?.length > 0 && existingyearDetails[0]?.id > 0) {
                                delete BE01DataObject.created_by;
                                delete BE01DataObject.created_on;
                                BE01DataObject.modified_by = req.userData.UserID;
                                BE01DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE01, `id = ${existingyearDetails[0].id}`, BE01DataObject);
                                isUpdate = true;
                                BEinsertedID = site.BEID;

                            } else {
                                var BEinsertedID = await Common.insert(tableName.TBL_BE01, BE01DataObject);
                                // BEinsertedID = BEinsertedID.recordset?.[0]?.id || 0;
                                BEinsertedID = BEinsertedID.insertId ? BEinsertedID.insertId : 0;
                            }
                        }
                    }
                }
            }
            for (const indicator of progress_indicators) {
                const progress_id = indicator.id;

                await Common.update(
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    `company_id=${req.userData.CompanyID} 
                     AND be_goal_id=${existingGoalCode} 
                     AND progress_indicator_id=${progress_id} 
                     AND flag_deleted=0`,
                    {
                        flag_deleted: 1,
                        modified_by: req.userData.UserID,
                        modified_on: new Date()
                    }
                );
            }

            for (const indicator of progress_indicators) {
                const progress_id = indicator.id;
                const progressIndicatorVal = indicator.score;
                const year = indicator.year;
                const dataCompleteness = indicator.dataCompleteness;

                var ProgressIndicatorDataObject = {
                    be_goal_id: existingGoalCode,
                    company_id: req.userData.CompanyID,
                    progress_indicator_id: progress_id,
                    score: parseInt(progressIndicatorVal) || 0,
                    data_completeness: dataCompleteness,
                    fit_entry_id: 0,
                    year: year,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };

                await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
            }



            for (const indicator of context_indicators) {
                const context_id = indicator.id;

                await Common.update(
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    `company_id=${req.userData.CompanyID} 
                     AND be_goal_id=${existingGoalCode} 
                     AND context_indicator_id=${context_id} 
                     AND flag_deleted=0`,
                    {
                        flag_deleted: 1,
                        modified_by: req.userData.UserID,
                        modified_on: new Date()
                    }
                );
            }

            for (const indicator of context_indicators) {
                const context_id = indicator.id;
                const context_score = indicator.score;
                const context_year = indicator.year;

                const ContextIndicatorDataObject = {
                    be_goal_id: existingGoalCode,
                    company_id: req.userData.CompanyID,
                    context_indicator_id: context_id,
                    score: parseInt(context_score) || 0,
                    year: context_year,
                    fit_entry_id: 0,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };

                await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
            }
            const be01Fields = `  id, relevance_id, fit_entry_id,site_id,amount_of_renewable_energy_used, total_amount_of_energy_used, site_fitness, comments,year`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be01Details = await Common.get_info(siteId, tableName.TBL_BE01, 'site_id', `flag_deleted=0`, be01Fields);
                sites[i].be01_data = be01Details;
            }
            return res.status(200).json({ status: true, message: isUpdate ? "BE01 Form Updated Successfully" : "BE01 Form Submitted Successfully", data: { fit_entry: 0, BEID: BEinsertedID, sites: sites } });

        } catch (ex) {
            console.log(ex, ' ==== ex')
            Logs.ErrorHandler(ex, res);
        }
    },
    submit_be02: async function (req, res) {
        try {

            let isUpdate = false;
            const validationResult = await validateBE02Array(req.body);

            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }
            var exists_user = 0;
            var message = '';

            var fit_id = (req.body.fit_entry_id) ? req.body.fit_entry_id : 0;



            const { sites, progress_indicators, context_indicators, contextIndixator_fit_sources, contextIndixator_Unfit_sources, contextIndixator_Total_discharged, progress_indicator_ids, context_indicator_ids, goalCodeId } = req.body;
            const goalCodeStr = req.body.goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;
            const goCode = goalCodeStr.toUpperCase();
            var BEinsertedID = 0;
            for (const site of sites) {
                if (site.fitnessInputs && Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        var BE02DataObject = {
                            'company_id': req.userData.CompanyID,
                            'relevance_id': input.relevance ? parseInt(input.relevance) : 0,
                            'fit_entry_id': 0,
                            'site_id': site.site_id ? parseInt(site.site_id) : 0,
                            'year': input.year,
                            'water_consumption_fit_sources': input.fitWaterVolume ? parseFloat(input.fitWaterVolume) : 0,
                            'water_consumption_unfit_sources': input.unfitWaterVolume ? parseFloat(input.unfitWaterVolume) : 0,
                            'commercial_water_consumption_offset': input.commercialOffset ? parseFloat(input.commercialOffset) : 0,
                            'water_consumed_by_workers_fit_sources': input.workerFitWater ? parseFloat(input.workerFitWater) : 0,
                            'water_consumed_by_workers_unfit_sources': input.workerUnfitWater ? parseFloat(input.workerUnfitWater) : 0,
                            'commercial_water_consumption_fit_source': input.commercialFit ? parseFloat(input.commercialFit) : 0,
                            'commercial_water_consumption_unfit_source': input.commercialUnfit ? parseFloat(input.commercialUnfit) : 0,
                            'total_commercial_water_consumption': input.commercialTotal ? parseFloat(input.commercialTotal) : 0,
                            'Relevance_id_2': input.relevance1 ? parseInt(input.relevance1) : 0,
                            'fit_discharged_water': input.dischargeRelevance ? parseInt(input.dischargeRelevance) : 0,
                            'total_discharged_water': input.fitDischarged ? parseInt(input.fitDischarged) : 0,
                            'site_fitness': input.siteFitness ? parseInt(input.siteFitness) : 0,
                            'site_fitness1': input.siteFitness1 ? parseInt(input.siteFitness1) : 0,
                            'context_description': input.contextDescription ?? '',
                            'comments': input.comments,
                            'created_by': req.userData.UserID ? parseInt(req.userData.UserID) : 0,
                            'created_on': new Date(),
                        }


                        BE02DataObject.flag_deleted = 0;
                        var existingSiteDetails = await Common.get_info(1, tableName.TBL_BE02, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND site_id=' + site.site_id + ' AND id =' + input.id, 'id');

                        if (existingSiteDetails?.length > 0 && existingSiteDetails[0]?.id > 0) {
                            delete BE02DataObject.created_by;
                            delete BE02DataObject.created_on;
                            BE02DataObject.modified_by = req.userData.UserID;
                            BE02DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE02, `id = ${existingSiteDetails[0].id}`, BE02DataObject);
                            isUpdate = true;
                            BEinsertedID = site.BEID;
                        } else {
                            var existingyearDetails = await Common.get_info(1, tableName.TBL_BE02, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND site_id=' + site.site_id + ' AND year =' + input.year, 'id');
                            if (existingyearDetails?.length > 0 && existingyearDetails[0]?.id > 0) {
                                delete BE02DataObject.created_by;
                                delete BE02DataObject.created_on;
                                BE02DataObject.modified_by = req.userData.UserID;
                                BE02DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE02, `id = ${existingyearDetails[0].id}`, BE02DataObject);
                                isUpdate = true;
                                BEinsertedID = site.BEID;

                            } else {
                                BEinsertedID = await Common.insert(tableName.TBL_BE02, BE02DataObject);
                                BEinsertedID = BEinsertedID.insertId ? BEinsertedID.insertId : 0; // Ensure BE02DataObject has the inserted ID
                            }
                        }
                    }
                }
            }

            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({ status: true, message: isUpdate ? "BE02 Form Updated Successfully" : "BE02 Form Submitted Successfully", data: { fit_entry: 0 } });

        } catch (ex) {
            console.log(ex, ' ==== ex')
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be03: async function (req, res) {
        try {
            const validationResult = await validateBE03Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let isUpdate = false;
            const fit_id = req.body.fit_entry_id ?? 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                progress_indicator_ids,
                context_indicator_ids,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const goalResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const be_goal_id = goalResult?.[0]?.goal_id ?? 0;
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;


            if (Array.isArray(sites)) {
                for (const site of sites) {
                    const BE03DataObject = {
                        company_id: req.userData.CompanyID,
                        fit_entry_id: 0,
                        site_id: parseInt(site.siteId) || 0,
                        year: site.year,
                        relevance_id: parseInt(site.relevance) || 0,
                        resource_id: parseInt(site.resourceType) || 0,
                        natural_resource: site.naturalResource,
                        natural_resource_id: site.resourceID,
                        location: site.locations,
                        value_of_natural_resource: parseFloat(site.valueOfNaturalResource) || 0,
                        common_fitness_criteria_id: site.commonFitnessCriteriaId,
                        renewable_respect_regeneration_rates: (site.renewableRespectRegenerationRates ?? false) ? 1 : 0,
                        renewable_ecosystem_health: (site.renewableEcosystemHealth ?? false) ? 1 : 0,
                        renewable_aquatic_protection: (site.renewableAquaticProtection ?? false) ? 1 : 0,
                        renewable_invasive_species_control: (site.renewableInvasiveSpeciesControl ?? false) ? 1 : 0,
                        renewable_no_destructive_techniques: (site.renewableNoDestructiveTechniques ?? false) ? 1 : 0,
                        renewable_sourcing_industry_standards: (site.renewableSourcingIndustryStandards ?? false) ? 1 : 0,
                        animal_welfare_maintained: (site.animalWelfareMaintained ?? false) ? 1 : 0,
                        animal_no_endangered_hunting: (site.animalNoEndangeredHunting ?? false) ? 1 : 0,
                        animalSourcingstandards: (site.animalSourcingstandards ?? false) ? 1 : 0,
                        nonrenewable_sourcing_industry_standards: (site.nonrenewableSourcingIndustryStandards ?? false) ? 1 : 0,
                        nonrenewable_no_conflict_or_hr_violation: (site.nonrenewableNoConflictOrHrViolation ?? false) ? 1 : 0,
                        nonrenewable_no_destructive_extraction: (site.nonrenewableNoDestructiveExtraction ?? false) ? 1 : 0,
                        nonrenewable_ecosystem_health_maintained: (site.nonrenewableEcosystemHealthMaintained ?? false) ? 1 : 0,
                        nonrenewable_ecosystem_production_impact_control: (site.nonrenewableEcosystemProductionImpactControl ?? false) ? 1 : 0,
                        resource_fitness_percent: parseInt(site.resourceFitnessPercent) || 0,
                        comments: site.comments ?? '',
                        created_by: parseInt(req.userData.UserID) || 0,
                        created_on: new Date(),
                        context_description: site.contextDescription ?? '',
                        flag_deleted: 0
                    };

                    const existingSiteDetails = await Common.get_info(
                        1,
                        tableName.TBL_BE03,
                        1,
                        `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.siteId} AND id=${site.id}`,
                        'id'
                    );

                    if (existingSiteDetails?.length > 0 && existingSiteDetails[0]?.id > 0) {
                        delete BE03DataObject.created_by;
                        delete BE03DataObject.created_on;
                        BE03DataObject.modified_by = req.userData.UserID;
                        BE03DataObject.modified_on = new Date();
                        await Common.update(tableName.TBL_BE03, `id=${existingSiteDetails[0].id}`, BE03DataObject);
                        isUpdate = true;
                    } else {
                        const existingYearDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE03,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.siteId} AND year=${site.year}`,
                            'id'
                        );
                        if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                            delete BE03DataObject.created_by;
                            delete BE03DataObject.created_on;
                            BE03DataObject.modified_by = req.userData.UserID;
                            BE03DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE03, `id=${existingYearDetails[0].id}`, BE03DataObject);
                            isUpdate = true;
                        } else {
                            await Common.insert(tableName.TBL_BE03, BE03DataObject);
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE03 Form Updated Successfully" : "BE03 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex, "==== BE03 Exception");
            Logs.ErrorHandler(ex, res);
        }
    },



    submit_be04: async function (req, res) {
        try {


            const fitEntryId = req.body.fit_entry_id ?? 0;
            let isUpdate = false;

            const goalCodeStr = req.body.goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            const sites = req.body.value;
            const progressIndicators = req.body.progress_indicators ?? [];
            for (const site of sites) {
                if (site.be04_data && Array.isArray(site.be04_data)) {
                    for (const category of site.be04_data) {
                        if (category.fitnessInputs && Array.isArray(category.fitnessInputs)) {
                            for (const input of category.fitnessInputs) {

                                const BE04DataObject = {
                                    company_id: req.userData.CompanyID,


                                    category_id: category.categoryId,
                                    relevance_id: input.relevance,
                                    year: input.year,
                                    cost: parseInt(input.fitnessCost) || 0,
                                    purchase_does_not_use_phase: (input.purchaseDoesNotUsePhase ?? false) ? 1 : 0,
                                    hotspot_conducted: (input.hotspotConducted ?? false) ? 1 : 0,
                                    potential_hotspot: (input.potentialHotspot ?? false) ? 1 : 0,
                                    actual_hotspot: (input.actualHotspots ?? false) ? 1 : 0,
                                    all_high_intensity_hotspot: (input.allHighIntensityHotspots ?? false) ? 1 : 0,
                                    all_hotspot_have_been_avoided: (input.allHotspotsHaveBeenAvoided ?? false) ? 1 : 0,
                                    all_hotspot_from_cradle: (input.allHotspotFromCardle ?? false) ? 1 : 0,
                                    company_continuosly: (input.companyContinuously ?? false) ? 1 : 0,
                                    purchase_fitness: parseInt(input.purchaseFitness) || 0,
                                    comments: input.comments ?? '',
                                    context_description: input.contextDescription ?? '',
                                    purchase_information_id: site.purchase_information_id ?? 0,
                                    created_by: req.userData.UserID,
                                    created_on: new Date(),
                                    modified_on: new Date(),
                                    modified_by: req.userData.UserID,
                                    flag_deleted: 0
                                };

                                var existingSiteDetails = await Common.get_info(
                                    1,
                                    tableName.TBL_BE04,
                                    1,
                                    `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND purchase_information_id=${site.purchase_information_id} AND id=${input.id}`,
                                    'id'
                                );

                                if (existingSiteDetails?.length > 0 && existingSiteDetails[0]?.id > 0) {
                                    delete BE04DataObject.created_by;
                                    delete BE04DataObject.created_on;
                                    BE04DataObject.modified_by = req.userData.UserID;
                                    BE04DataObject.modified_on = new Date();
                                    await Common.update(tableName.TBL_BE04, `id=${existingSiteDetails[0].id}`, BE04DataObject);
                                    isUpdate = true;
                                } else {
                                    var existingYearDetails = await Common.get_info(
                                        1,
                                        tableName.TBL_BE04,
                                        1,
                                        `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND purchase_information_id=${site.purchase_information_id} AND year=${input.year} AND category_id=${category.categoryId}`,
                                        'id'
                                    );
                                    if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                                        delete BE04DataObject.created_by;
                                        delete BE04DataObject.created_on;
                                        BE04DataObject.modified_by = req.userData.UserID;
                                        BE04DataObject.modified_on = new Date();
                                        await Common.update(tableName.TBL_BE04, `id=${existingYearDetails[0].id}`, BE04DataObject);
                                        isUpdate = true;
                                    } else {
                                        await Common.insert(tableName.TBL_BE04, BE04DataObject);
                                    }
                                }

                            }
                        }
                    }
                }
            }


            if (Array.isArray(progressIndicators) && progressIndicators.length > 0) {


                await Common.update(
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    `company_id=${req.userData.CompanyID} 
         AND be_goal_id=${existingGoalCode} 
         AND flag_deleted=0`,
                    {
                        flag_deleted: 1,
                        modified_by: req.userData.UserID,
                        modified_on: new Date()
                    }
                );

                // Step 2: Insert new category-wise records
                for (const pi of progressIndicators) {
                    const progressObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        category_id: pi.categoryId,
                        score: parseInt(pi.score) || 0,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        modified_by: req.userData.UserID,
                        modified_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, progressObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE04 Form Updated Successfully" : "BE04 Form Submitted Successfully",
                data: { fit_entry: fitEntryId }
            });

        } catch (ex) {
            console.error(ex, "=== BE04 API Error");
            Logs.ErrorHandler(ex, res);
        }
    },
    submit_be23: async function (req, res) {
        try {


            const fitEntryId = req.body.fit_entry_id ?? 0;
            let isUpdate = false;
            const progressIndicators = req.body.progress_indicators ?? [];
            const financialAssets = req.body.value;
            const goalCodeStr = req.body.goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            for (const fa of financialAssets) {
                if (fa.be23_data && Array.isArray(fa.be23_data)) {
                    for (const category of fa.be23_data) {
                        if (category.fitnessInputs && Array.isArray(category.fitnessInputs)) {
                            for (const input of category.fitnessInputs) {

                                const BE23DataObject = {
                                    company_id: req.userData.CompanyID,
                                    finanical_id: parseInt(fa.finanicalId) || 0,
                                    category_id: category.categoryId,
                                    relevance_id: parseInt(input.relevance) || 0,
                                    year: input.year,
                                    monetary: parseInt(input.monetaryValue) || 0,
                                    financial_asset_does: (input.financialAssetDoes ?? false) ? 1 : 0,
                                    hotspot_assessmen: (input.hotspotAssessment ?? false) ? 1 : 0,
                                    potential_hotspots_identified: (input.potentialHotspotsIdentified ?? false) ? 1 : 0,
                                    actual_hotspots: (input.actualHotspots ?? false) ? 1 : 0,
                                    all_high_intensity_hotspot: (input.allHighIntensityHotspot ?? false) ? 1 : 0,
                                    all_hotspots_have_been: (input.allHotspotsHaveBeen ?? false) ? 1 : 0,
                                    context_description: input.contextDescription ?? '',

                                    financial_fitness: parseInt(input.financialFitness) || 0,
                                    comments: input.comments ?? '',

                                    created_by: req.userData.UserID,
                                    created_on: new Date(),
                                    modified_on: new Date(),
                                    modified_by: req.userData.UserID,
                                    flag_deleted: 0
                                };
                                // console.log("BE23DataObject:", BE23DataObject);


                                var existingDetails = await Common.get_info(
                                    1,
                                    tableName.TBL_BE23,
                                    1,
                                    `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND finanical_id=${fa.finanicalId} AND id=${input.id}`,
                                    'id'
                                );

                                if (existingDetails?.length > 0 && existingDetails[0]?.id > 0) {
                                    delete BE23DataObject.created_by;
                                    delete BE23DataObject.created_on;
                                    BE23DataObject.modified_by = req.userData.UserID;
                                    BE23DataObject.modified_on = new Date();
                                    await Common.update(tableName.TBL_BE23, `id=${existingDetails[0].id}`, BE23DataObject);
                                    isUpdate = true;
                                } else {

                                    var existingYearDetails = await Common.get_info(
                                        1,
                                        tableName.TBL_BE23,
                                        1,
                                        `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND finanical_id=${fa.finanicalId} AND year=${input.year} AND category_id=${category.categoryId}`,
                                        'id'
                                    );
                                    if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                                        delete BE23DataObject.created_by;
                                        delete BE23DataObject.created_on;
                                        BE23DataObject.modified_by = req.userData.UserID;
                                        BE23DataObject.modified_on = new Date();
                                        await Common.update(tableName.TBL_BE23, `id=${existingYearDetails[0].id}`, BE23DataObject);
                                        isUpdate = true;
                                    } else {
                                        await Common.insert(tableName.TBL_BE23, BE23DataObject);
                                    }
                                }

                            }
                        }
                    }
                }
            }


            if (Array.isArray(progressIndicators) && progressIndicators.length > 0) {
                await Common.update(
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    `company_id=${req.userData.CompanyID} 
                      AND be_goal_id=${existingGoalCode} 
                      AND flag_deleted=0`,
                    {
                        flag_deleted: 1,
                        modified_by: req.userData.UserID,
                        modified_on: new Date()
                    }
                );


                for (const pi of progressIndicators) {
                    const progressObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        category_id: pi.categoryId,
                        score: parseInt(pi.score) || 0,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        modified_by: req.userData.UserID,
                        modified_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, progressObject);
                }
            }

            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE23 Form Updated Successfully" : "BE23 Form Submitted Successfully",
                data: { fit_entry: fitEntryId }
            });

        } catch (ex) {
            console.error(ex, "=== BE23 API Error");
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be05: async function (req, res) {
        try {
            const validationResult = await validateBE05Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }
            let isUpdate = false;
            var fit_id = req.body.fit_entry_id ?? 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                progress_indicator_ids,
                context_indicator_ids,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            for (const site of sites) {
                if (Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        var BE05DataObject = {
                            company_id: req.userData.CompanyID,
                            fit_entry_id: 0,
                            site_id: site.site_id,
                            year: input.year ?? null,
                            relevance_id_gaseous: input.relevanceGaseous,
                            gaseous_reference_year: input.gaseousReferenceYear ?? null,
                            gaseous_reporting_year: input.gaseousReportingYear ?? null,
                            gaseous_site_fitness_percent: parseInt(input.gaseousSiteFitnessPercent) || 0,
                            relevance_id_liquid: input.relevanceLiquid,
                            liquid_reference_year: input.liquidReferenceYear ?? null,
                            liquid_reporting_year: input.liquidReportingYear ?? null,
                            liquid_site_fitness_percent: parseInt(input.liquidSiteFitnessPercent) || 0,
                            relevance_id_solid: input.relevanceSolid,
                            solid_reference_year: input.solidReferenceYear ?? null,
                            solid_reporting_year: input.solidReportingYear ?? null,
                            solid_site_fitness_percent: parseInt(input.solidSiteFitnessPercent) || 0,
                            comments: input.comments ?? '',
                            context_description: input.contextDescription ?? '',
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        var existingSiteDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE05,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingSiteDetails?.length > 0 && existingSiteDetails[0]?.id > 0) {
                            delete BE05DataObject.created_by;
                            delete BE05DataObject.created_on;
                            BE05DataObject.modified_by = req.userData.UserID;
                            BE05DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE05, `id=${existingSiteDetails[0].id}`, BE05DataObject);
                            isUpdate = true;
                        } else {
                            var existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE05,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND year=${input.year}`,
                                'id'
                            );
                            if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                                delete BE05DataObject.created_by;
                                delete BE05DataObject.created_on;
                                BE05DataObject.modified_by = req.userData.UserID;
                                BE05DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE05, `id=${existingYearDetails[0].id}`, BE05DataObject);
                                isUpdate = true;
                            } else {
                                await Common.insert(tableName.TBL_BE05, BE05DataObject);
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE05 Form Updated Successfully" : "BE05 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex, "==== ex");
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be06: async function (req, res) {
        try {
            // console.log("BE06 Req", JSON.stringify(req.body));
            const validationResult = await validateBE06Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let isUpdate = false;
            let fit_id = req.body.fit_entry_id ?? 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0
                ? existingGoalCodeResult[0].goal_id
                : 0;

            // ====== Sites & Fitness Inputs ======
            for (const site of sites) {
                if (Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        const BE06DataObject = {
                            company_id: req.userData.CompanyID,
                            fit_entry_id: 0,
                            site_id: site.site_id,
                            year: input.year ?? null,
                            relevance_id: input.relevance,
                            no_ghg_emission_id: parseInt(input.NOGHGemissionsAreReleased) || 0,
                            ghg_reference_year: parseInt(input.ghgReferenceYear) || 0,
                            ghg_reporting_year: parseInt(input.ghgReportingYear) || 0,
                            ghg_adequately_offset: parseInt(input.ghgAdequatelyOffset) || 0,
                            site_fitness_percent: parseInt(input.siteFitnessPercent) || 0,
                            comments: input.comments ?? '',
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // Check for ID match
                        const existingById = await Common.get_info(
                            1,
                            tableName.TBL_BE06,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingById?.length > 0) {
                            delete BE06DataObject.created_by;
                            delete BE06DataObject.created_on;
                            BE06DataObject.modified_by = req.userData.UserID;
                            BE06DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE06, `id=${existingById[0].id}`, BE06DataObject);
                            isUpdate = true;
                            continue;
                        }


                        const existingByYear = await Common.get_info(
                            1,
                            tableName.TBL_BE06,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND year=${input.year}`,
                            'id'
                        );

                        if (existingByYear?.length > 0) {
                            delete BE06DataObject.created_by;
                            delete BE06DataObject.created_on;
                            BE06DataObject.modified_by = req.userData.UserID;
                            BE06DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE06, `id=${existingByYear[0].id}`, BE06DataObject);
                            isUpdate = true;
                        } else {
                            await Common.insert(tableName.TBL_BE06, BE06DataObject);
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE06 Form Updated Successfully" : "BE06 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be07: async function (req, res) {
        try {

            const validationResult = await validateBE07Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let isUpdate = false;
            let fit_id = req.body.fit_entry_id ?? 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0
                ? existingGoalCodeResult[0].goal_id
                : 0;


            for (const site of sites) {
                if (site.fitnessInputs && Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        const BE07DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            fit_entry_id: 0,
                            year: input.year,
                            site_id: site.site_id,
                            site_assessed_waste_id: parseInt(input.site_assessed_waste_id) || 0,
                            waste_reference_year: parseInt(input.waste_reference_year) || 0,
                            waste_reporting_year: parseInt(input.waste_reporting_year) || 0,
                            site_fitness_percent: parseInt(input.site_fitness_percent) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };


                        const existingSiteDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE07,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingSiteDetails?.length > 0) {
                            delete BE07DataObject.created_by;
                            delete BE07DataObject.created_on;
                            BE07DataObject.modified_by = req.userData.UserID;
                            BE07DataObject.modified_on = new Date();
                            await Common.update(
                                tableName.TBL_BE07,
                                `id=${existingSiteDetails[0].id}`,
                                BE07DataObject
                            );
                            isUpdate = true;
                        } else {

                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE07,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE07DataObject.created_by;
                                delete BE07DataObject.created_on;
                                BE07DataObject.modified_by = req.userData.UserID;
                                BE07DataObject.modified_on = new Date();
                                await Common.update(
                                    tableName.TBL_BE07,
                                    `id=${existingYearDetails[0].id}`,
                                    BE07DataObject
                                );
                                isUpdate = true;
                            } else {
                                await Common.insert(tableName.TBL_BE07, BE07DataObject);
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE07 Form Updated Successfully" : "BE07 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });
        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },
    submit_be08: async function (req, res) {
        try {
            // console.log("BE08 Req", JSON.stringify(req.body));
            const validationResult = await validateBE08Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let isUpdate = false;
            let fit_id = req.body.fit_entry_id ?? 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0
                ? existingGoalCodeResult[0].goal_id
                : 0;


            for (const site of sites) {
                if (site.fitnessInputs && Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        const BE08DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            fit_entry_id: 0,
                            year: input.year,
                            site_id: site.site_id,
                            site_area: parseInt(input.siteArea) || 0,
                            local_impact_identified: (input.localImpactIdentified ?? false) ? 1 : 0,
                            value_area_identified: (input.valueAreaIdentified ?? false) ? 1 : 0,
                            value_area_protected: (input.valueAreaProtected ?? false) ? 1 : 0,
                            no_impact_on_pristine_ecosystems: (input.noImpactOnPristineEcosystems ?? false) ? 1 : 0,
                            land_rights_uncontested: (input.landRightsUncontested ?? false) ? 1 : 0,
                            community_consent_obtained: (input.communityConsentObtained ?? false) ? 1 : 0,
                            past_damage_neutralized: (input.pastDamageNeutralized ?? false) ? 1 : 0,
                            site_fitness_percent: parseInt(input.siteFitness) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingSiteDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE08,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingSiteDetails?.length > 0) {
                            delete BE08DataObject.created_by;
                            delete BE08DataObject.created_on;
                            BE08DataObject.modified_by = req.userData.UserID;
                            BE08DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE08, `id=${existingSiteDetails[0].id}`, BE08DataObject);
                            isUpdate = true;
                        } else {
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE08,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE08DataObject.created_by;
                                delete BE08DataObject.created_on;
                                BE08DataObject.modified_by = req.userData.UserID;
                                BE08DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE08, `id=${existingYearDetails[0].id}`, BE08DataObject);
                                isUpdate = true;
                            } else {
                                await Common.insert(tableName.TBL_BE08, BE08DataObject);
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE08 Form Updated Successfully" : "BE08 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be09: async function (req, res) {
        try {
            const validationResult = await validateBE09Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let isUpdate = false;
            const fit_id = req.body.fit_entry_id || 0;
            const { sites, progress_indicators, context_indicators, goalCode_id } = req.body;


            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;


            for (const site of sites) {
                if (Array.isArray(site.fitnessInputs)) {
                    for (const input of site.fitnessInputs) {
                        const BE09DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            fit_entry_id: 0,
                            year: input.year,
                            site_id: site.site_id,
                            assessment_conducted: (input.assessment_conducted ?? false) ? 1 : 0,
                            affected_communities_identified: (input.affected_communities_identified ?? false) ? 1 : 0,
                            communities_at_risk: (input.communities_at_risk ?? false) ? 1 : 0,
                            mechanism_inclusive: (input.mechanism_inclusive ?? false) ? 1 : 0,
                            stakeholders_involved_in_mechanism_design: (input.stakeholders_involved_in_mechanism_design ?? false) ? 1 : 0,
                            concerns_resolved_timely: (input.concerns_resolved_timely ?? false) ? 1 : 0,
                            info_accessible: (input.info_accessible ?? false) ? 1 : 0,
                            info_communicated: (input.info_communicated ?? false) ? 1 : 0,
                            appropriate_communication_channels: (input.appropriate_communication_channels ?? false) ? 1 : 0,
                            responsible_party_assigned: (input.responsible_party_assigned ?? false) ? 1 : 0,
                            access_to_neutral_advice: (input.access_to_neutral_advice ?? false) ? 1 : 0,
                            users_informed: (input.users_informed ?? false) ? 1 : 0,
                            complaint_publicly_viewable: (input.complaint_publicly_viewable ?? false) ? 1 : 0,
                            user_feedback_collected: (input.user_feedback_collected ?? false) ? 1 : 0,
                            performance_monitored: (input.performance_monitored ?? false) ? 1 : 0,
                            improvements_implemented: (input.improvements_implemented ?? false) ? 1 : 0,
                            community_consultation_prior_activities: (input.community_consultation_prior_activities ?? false) ? 1 : 0,
                            site_fitness_percentage: parseFloat(input.site_fitness_percentage) || 0,
                            comments: input.comments,
                            context_description: input.contextDescription ?? '',

                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingRecord = await Common.get_info(
                            1,
                            tableName.TBL_BE09,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND site_id=${site.site_id} AND year=${input.year}`,
                            'id'
                        );

                        if (existingRecord?.length > 0) {
                            delete BE09DataObject.created_by;
                            delete BE09DataObject.created_on;
                            BE09DataObject.modified_by = req.userData.UserID;
                            BE09DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE09, `id=${existingRecord[0].id}`, BE09DataObject);
                            isUpdate = true;
                        } else {
                            await Common.insert(tableName.TBL_BE09, BE09DataObject);
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE09 Form Updated Successfully" : "BE09 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex);
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be10: async function (req, res) {
        try {
            let isUpdate = false;
            const validationResult = await validateBE10Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;
            const {
                employee,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;
            let BEinsertedID = 0;


            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE10DataObject = {
                            relevance_id: input.relevance,
                            company_id: req.userData.CompanyID,
                            employee_id: emp.employeeId,
                            year: input.year,
                            // number_of_employees:input.fitnessnumber_of_employees, parseInt(input.revenue) || 0
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            hazard_controls_in_place: (input.hazardControlsInPlace ?? false) ? 1 : 0,
                            risk_assessment_done: (input.riskAssessmentDone ?? false) ? 1 : 0,
                            risk_training_provided: (input.riskTrainingProvided ?? false) ? 1 : 0,
                            safety_policies_monitored: (input.safetyPoliciesMonitored ?? false) ? 1 : 0,
                            anti_bullying_policy: (input.antiBullyingPolicy ?? false) ? 1 : 0,
                            flexible_work_conditions: (input.flexibleWorkConditions ?? false) ? 1 : 0,
                            stress_guidance_access: (input.stressGuidanceAccess ?? false) ? 1 : 0,
                            health_issue_support_policy: (input.healthIssueSupportPolicy ?? false) ? 1 : 0,
                            smoke_free_work_environment: (input.smokeFreeWorkEnvironment ?? false) ? 1 : 0,
                            smoke_free_communal_areas: (input.smokeFreeCommunalAreas ?? false) ? 1 : 0,
                            healthy_eating_access: (input.healthyEatingAccess ?? false) ? 1 : 0,
                            work_breaks_allowed: (input.workBreaksAllowed ?? false) ? 1 : 0,
                            flexible_breaks_for_exercise: (input.flexibleBreaksForExercise ?? false) ? 1 : 0,
                            site_fitness_percentage: parseInt(input.siteFitness) || 0,
                            comments: input.comments,
                            context_description: input.contextDescription ?? '',
                            context_description1: input.contextDescription1 ?? '',
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE10,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0) {
                            delete BE10DataObject.created_by;
                            delete BE10DataObject.created_on;
                            BE10DataObject.modified_by = req.userData.UserID;
                            BE10DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE10, `id=${existingEmpDetails[0].id}`, BE10DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE10,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );
                            if (existingYearDetails?.length > 0) {
                                delete BE10DataObject.created_by;
                                delete BE10DataObject.created_on;
                                BE10DataObject.modified_by = req.userData.UserID;
                                BE10DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE10, `id=${existingYearDetails[0].id}`, BE10DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE10, BE10DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }



            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
             AND be_goal_id=${existingGoalCode} 
             AND progress_indicator_id=${pi.id} 
             AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }


                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        progress_indicator_id: pi.id,
                        company_id: req.userData.CompanyID,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        fit_entry_id: 0,
                        year: pi.year ?? null,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }


            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                // 🔹 Step 1: Soft delete old records for all context_ids that are coming
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
             AND be_goal_id=${existingGoalCode} 
             AND context_indicator_id=${ci.id} 
             AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                // 🔹 Step 2: Insert fresh records
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year ?? null,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }





            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE10 Form Updated Successfully" : "BE10 Form Submitted Successfully",
                data: { fit_entry: fit_id }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be11: async function (req, res) {
        try {
            let isUpdate = false;

            const validationResult = await validateBE11Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;

            const {
                employee,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;


            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE11DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            employee_id: emp.employeeId,
                            year: input.year,
                            fit_entry_id: 0,
                            // number_of_employees:input.fitnessnumber_of_employees,
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            number_of_employees_living_wage: input.number_of_employees_living_wage ?? 0,
                            employee_fitness_percentage: parseFloat(input.employee_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE11,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0) {
                            delete BE11DataObject.created_by;
                            delete BE11DataObject.created_on;
                            BE11DataObject.modified_by = req.userData.UserID;
                            BE11DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE11, `id=${existingEmpDetails[0].id}`, BE11DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE11,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );
                            if (existingYearDetails?.length > 0) {
                                delete BE11DataObject.created_by;
                                delete BE11DataObject.created_on;
                                BE11DataObject.modified_by = req.userData.UserID;
                                BE11DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE11, `id=${existingYearDetails[0].id}`, BE11DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE11, BE11DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }




            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE11 Form Updated Successfully" : "BE11 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be12: async function (req, res) {
        try {
            // console.log("BE12 Req", req.body);
            let isUpdate = false;

            const validationResult = await validateBE12Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;

            const {
                employee,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;


            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE12DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            employee_id: emp.employeeId,
                            year: input.year,
                            fit_entry_id: 0,
                            // number_of_employees:input.fitnessnumber_of_employees,
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            no_child_labour: (input.no_child_labour ?? false) ? 1 : 0,
                            fair_employment_status: (input.fair_employment_status ?? false) ? 1 : 0,
                            freedom_of_association: (input.freedom_of_association ?? false) ? 1 : 0,
                            fair_working_hours: (input.fair_working_hours ?? false) ? 1 : 0,
                            overtime_compensation: (input.overtime_compensation ?? false) ? 1 : 0,
                            right_to_refuse_irregular_work: (input.right_to_refuse_irregular_work ?? false) ? 1 : 0,
                            reasonable_schedule_notice: (input.reasonable_schedule_notice ?? false) ? 1 : 0,
                            holiday_entitlement: (input.holiday_entitlement ?? false) ? 1 : 0,
                            weekly_rest_day: (input.weekly_rest_day ?? false) ? 1 : 0,
                            maternity_paternity_leave: (input.maternity_paternity_leave ?? false) ? 1 : 0,
                            employee_fitness_percentage: parseFloat(input.employee_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE12,
                            1,
                            `flag_deleted=0 AND company_id = ${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0 && existingEmpDetails[0]?.id > 0) {
                            delete BE12DataObject.created_by;
                            delete BE12DataObject.created_on;
                            BE12DataObject.modified_by = req.userData.UserID;
                            BE12DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE12, `id = ${existingEmpDetails[0].id}`, BE12DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE12,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                                delete BE12DataObject.created_by;
                                delete BE12DataObject.created_on;
                                BE12DataObject.modified_by = req.userData.UserID;
                                BE12DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE12, `id = ${existingYearDetails[0].id}`, BE12DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE12, BE12DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE12 Form Updated Successfully" : "BE12 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be13: async function (req, res) {
        try {
            // console.log("BE13 Req", req.body);
            let isUpdate = false;

            const validationResult = await validateBE13Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;
            const {
                employee,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;


            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE13DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            employee_id: emp.employeeId,
                            year: input.year,
                            fit_entry_id: 0,
                            // number_of_employees:input.fitnessnumber_of_employees,
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            clear_policy_commitment: (input.clear_policy_commitment ?? false) ? 1 : 0,
                            senior_official_responsible: (input.senior_official_responsible ?? false) ? 1 : 0,
                            policy_communicated: (input.policy_communicated ?? false) ? 1 : 0,
                            policy_in_hr_practices: (input.policy_in_hr_practices ?? false) ? 1 : 0,
                            reporting_procedure_available: (input.reporting_procedure_available ?? false) ? 1 : 0,
                            actions_and_feedback_documented: (input.actions_and_feedback_documented ?? false) ? 1 : 0,
                            control_effectiveness_assessed: (input.control_effectiveness_assessed ?? false) ? 1 : 0,
                            controls_adjusted_if_needed: (input.controls_adjusted_if_needed ?? false) ? 1 : 0,
                            employee_fitness_percentage: parseFloat(input.employee_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };


                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE13,
                            1,
                            `flag_deleted=0 AND company_id = ${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0) {
                            delete BE13DataObject.created_by;
                            delete BE13DataObject.created_on;
                            BE13DataObject.modified_by = req.userData.UserID;
                            BE13DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE13, `id = ${existingEmpDetails[0].id}`, BE13DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {

                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE13,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE13DataObject.created_by;
                                delete BE13DataObject.created_on;
                                BE13DataObject.modified_by = req.userData.UserID;
                                BE13DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE13, `id = ${existingYearDetails[0].id}`, BE13DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE13, BE13DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE13 Form Updated Successfully" : "BE13 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be14: async function (req, res) {
        try {
            let isUpdate = false;

            const validationResult = await validateBE14Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;

            const {
                employee,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;


            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE14DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            employee_id: emp.employeeId,
                            year: input.year,
                            fit_entry_id: 0,
                            //  number_of_employees:input.fitnessnumber_of_employees,
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            design_involvement: (input.design_involvement ?? false) ? 1 : 0,
                            issue_scope_inclusive: (input.issue_scope_inclusive ?? false) ? 1 : 0,
                            timely_resolution: (input.timely_resolution ?? false) ? 1 : 0,
                            active_communication: (input.active_communication ?? false) ? 1 : 0,
                            confidentiality_protection: (input.confidentiality_protection ?? false) ? 1 : 0,
                            responsibility_assigned: (input.responsibility_assigned ?? false) ? 1 : 0,
                            independent_advice_access: (input.independent_advice_access ?? false) ? 1 : 0,
                            full_information_during_process: (input.full_information_during_process ?? false) ? 1 : 0,
                            consulted_on_changes: (input.consulted_on_changes ?? false) ? 1 : 0,
                            feedback_requested: (input.feedback_requested ?? false) ? 1 : 0,
                            performance_monitored: (input.performance_monitored ?? false) ? 1 : 0,
                            feedback_included_in_assessment: (input.feedback_included_in_assessment ?? false) ? 1 : 0,
                            improvements_implemented: (input.improvements_implemented ?? false) ? 1 : 0,
                            employee_fitness_percentage: parseFloat(input.employee_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };


                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE14,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0) {
                            delete BE14DataObject.created_by;
                            delete BE14DataObject.created_on;
                            BE14DataObject.modified_by = req.userData.UserID;
                            BE14DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE14, `id = ${existingEmpDetails[0].id}`, BE14DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {

                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE14,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE14DataObject.created_by;
                                delete BE14DataObject.created_on;
                                BE14DataObject.modified_by = req.userData.UserID;
                                BE14DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE14, `id = ${existingYearDetails[0].id}`, BE14DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE14, BE14DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }




            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE14 Form Updated Successfully" : "BE14 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be151: async function (req, res) {
        try {
            // console.log("BE15 Req" + req.body)
            const validationResult = await validateBE15Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }
            var exists_user = 0;
            var message = '';
            // var fit_id = (req.body.FitID) ? req.body.FitID : 0;
            var fit_id = (req.body.fit_entry_id) ? req.body.fit_entry_id : 0;
            // const { sites } = req.body;
            const { products, progressIndicatorVal, progress_indicator_ids, contextIndixator_TotalNo, context_indicator_ids, goalCode_id } = req.body;
            const goalCodeStr = req.body.goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_code = '${goalCodeStr}' AND flag_deleted != 1`);
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;
            const goCode = goalCodeStr.toUpperCase();

            let BEinsertedID = 0;
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        var BE15DataObject = {
                            'company_id': req.userData.CompanyID,
                            'relevance_id': input.relevance,
                            'product_id': productDetails.product_id,
                            'fit_entry_id': 0,
                            'year': input.year,
                            'user_groups_communicationplans': input.user_groups_communicationplans ?? false,
                            'communications_are_considered': input.communications_are_considered ?? false,
                            'communications_crucial_information': input.communications_crucial_information ?? false,
                            'communications_product_information': input.communications_product_information ?? false,
                            'purchase_information_needed': input.purchase_information_needed ?? false,
                            'purchase_physical_goods': input.purchase_physical_goods ?? false,
                            'purchase_nature_andquantities': input.purchase_nature_andquantities ?? false,
                            'purchase_characteristics_ofproducts': input.purchase_characteristics_ofproducts ?? false,
                            'purchase_ambiguous_term': input.purchase_ambiguous_term ?? false,
                            'purchase_comparative': input.purchase_comparative ?? false,
                            'purchase_user_groups': input.purchase_user_groups ?? false,
                            'use_users_provided': input.use_users_provided ?? false,
                            'use_nutrition_information': input.use_nutrition_information ?? false,
                            'use_with_guidance': input.use_with_guidance ?? false,
                            'use_guidance_provided': input.use_guidance_provided ?? false,
                            'post_physical_good': input.post_physical_good ?? false,
                            'post_improper_disposal': input.post_improper_disposal ?? false,
                            'product_fitness_percentage': input.product_fitness_percentage ?? 0,
                            'comments': input.comments,
                            'created_by': req.userData.UserID,
                            'created_on': new Date(),
                        };
                        BE15DataObject.flag_deleted = 0;
                        var existingProductDetails = await Common.get_info(1, tableName.TBL_BE15, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND product_id=' + productDetails.product_id + ' AND id =' + input.id, 'id');

                        if (existingProductDetails?.length > 0 && existingProductDetails[0]?.id > 0) {
                            delete BE15DataObject.created_by;
                            delete BE15DataObject.created_on;
                            BE15DataObject.modified_by = req.userData.UserID;
                            BE15DataObject.modified_on = new Date();
                            // Update existing record
                            await Common.update(tableName.TBL_BE15, `id = ${existingProductDetails[0].id}`, BE15DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            var existingyearDetails = await Common.get_info(1, tableName.TBL_BE15, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND product_id=' + productDetails.product_id + ' AND year =' + input.year, 'id');
                            if (existingyearDetails?.length > 0 && existingyearDetails[0]?.id > 0) {
                                delete BE15DataObject.created_by;
                                delete BE15DataObject.created_on;
                                BE15DataObject.modified_by = req.userData.UserID;
                                BE15DataObject.modified_on = new Date();
                                // Update existing record
                                await Common.update(tableName.TBL_BE15, `id = ${existingyearDetails[0].id}`, BE15DataObject);
                                isUpdate = true;
                                BEinsertedID = site.BEID;

                            } else {
                                BEinsertedID = await Common.insert(tableName.TBL_BE15, BE15DataObject);
                                BEinsertedID = BEinsertedID.insertId ? BEinsertedID.insertId : 0; // Ensure BE15DataObject has the inserted ID
                            }
                            // BEinsertedID = await Common.insert(tableName.TBL_BE15, BE15DataObject);
                            // BEinsertedID = BEinsertedID.insertId ? BEinsertedID.insertId : 0; // Ensure BE15DataObject has the inserted ID
                        }
                        // await Common.insert(tableName.TBL_BE15, BE15DataObject);
                    }
                }
            }


            for (const progress_id of progress_indicator_ids) {
                var ProgressIndicatorDataObject = {
                    be_goal_id: existingGoalCode,
                    company_id: req.userData.CompanyID,
                    progress_indicator_id: progress_id,
                    score: progressIndicatorVal,
                    fit_entry_id: fit_id,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };
                var existingIndicator = await Common.get_info(1, tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND be_goal_id=' + existingGoalCode + ' AND progress_indicator_id=' + progress_id, 'progress_indicator_id');
                if (existingIndicator?.length > 0) {
                    delete ProgressIndicatorDataObject.created_by;
                    delete ProgressIndicatorDataObject.created_on;
                    ProgressIndicatorDataObject.modified_by = req.userData.UserID;
                    ProgressIndicatorDataObject.modified_on = new Date();
                    // Update existing record
                    await Common.update(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, `progress_indicator_id = ${progress_id} AND company_id = ${req.userData.CompanyID}`, ProgressIndicatorDataObject);
                } else {
                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
                // await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
            }
            const contextScores = [
                contextIndixator_TotalNo
            ];

            for (let i = 0; i < context_indicator_ids.length; i++) {
                const context_id = context_indicator_ids[i];
                const score = contextScores[i] ?? 0;

                //  console.log("context_id:", context_id, "score:", score);
                const ContextIndicatorDataObject = {
                    be_goal_id: existingGoalCode,
                    company_id: req.userData.CompanyID,
                    context_indicator_id: context_id,
                    score: score,
                    fit_entry_id: fit_id,

                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };
                var existingcontextIndicator = await Common.get_info(1, tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND be_goal_id=' + existingGoalCode + ' AND context_indicator_id=' + context_id, 'cbci_id');
                if (existingcontextIndicator?.length > 0) {
                    delete ContextIndicatorDataObject.created_by;
                    delete ContextIndicatorDataObject.created_on;
                    ContextIndicatorDataObject.modified_by = req.userData.UserID;
                    ContextIndicatorDataObject.modified_on = new Date();
                    // Update existing record
                    await Common.update(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, `context_indicator_id = ${context_id} AND company_id = ${req.userData.CompanyID}`, ContextIndicatorDataObject);
                } else {
                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
                // await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
            }
            if (progress_indicator_ids?.length >= 1) {
                const emissionsCompleteness = req.body.data_completeness?.['product'];
                const emissionsIndicatorId = progress_indicator_ids[0];
                if (emissionsIndicatorId) {
                    await Common.update(
                        tableName.TBL_BE_PROGRESS_INDICATOR,
                        `progress_indicator_id = ${emissionsIndicatorId}`,
                        {
                            data_completeness: emissionsCompleteness,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
            }


            return res.status(200).json({ status: true, message: "BE15 Form Submitted Successfully", data: { fit_entry: 0 } });

        } catch (ex) {
            console.log(ex, ' ==== ex')
            Logs.ErrorHandler(ex, res);
        }
    },
    submit_be15: async function (req, res) {
        try {
            let isUpdate = false;

            // console.log("BE15 Req", req.body);

            const validationResult = await validateBE15Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;

            const {
                products,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // -------- PRODUCTS LOOP ----------
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        const BE15DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            product_id: productDetails.product_id,
                            fit_entry_id: 0,
                            year: input.year,
                            revenue: parseInt(input.revenue) || 0,
                            user_groups_communicationplans: (input.user_groups_communicationplans ?? false) ? 1 : 0,
                            communications_are_considered: (input.communications_are_considered ?? false) ? 1 : 0,
                            communications_crucial_information: (input.communications_crucial_information ?? false) ? 1 : 0,
                            communications_product_information: (input.communications_product_information ?? false) ? 1 : 0,
                            purchase_information_needed: (input.purchase_information_needed ?? false) ? 1 : 0,
                            purchase_physical_goods: input.purchase_physical_goods ?? null,
                            purchase_nature_andquantities: input.purchase_nature_andquantities ?? null,
                            purchase_characteristics_ofproducts: input.purchase_characteristics_ofproducts ?? null,
                            purchase_ambiguous_term: input.purchase_ambiguous_term ?? null,
                            purchase_comparative: input.purchase_comparative ?? null,
                            purchase_user_groups: input.purchase_user_groups ?? null,
                            use_users_provided: input.use_users_provided ?? null,
                            use_nutrition_information: input.use_nutrition_information ?? null,
                            use_with_guidance: input.use_with_guidance ?? null,
                            use_guidance_provided: input.use_guidance_provided ?? null,
                            post_physical_good: input.post_physical_good ?? null,
                            post_improper_disposal: input.post_improper_disposal ?? null,
                            product_fitness_percentage: parseFloat(input.product_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // check by id
                        const existingProductDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE15,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingProductDetails?.length > 0) {
                            delete BE15DataObject.created_by;
                            delete BE15DataObject.created_on;
                            BE15DataObject.modified_by = req.userData.UserID;
                            BE15DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE15, `id=${existingProductDetails[0].id}`, BE15DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            // check by year
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE15,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE15DataObject.created_by;
                                delete BE15DataObject.created_on;
                                BE15DataObject.modified_by = req.userData.UserID;
                                BE15DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE15, `id=${existingYearDetails[0].id}`, BE15DataObject);
                                isUpdate = true;
                                BEinsertedID = productDetails.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE15, BE15DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE15 Form Updated Successfully" : "BE15 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be16: async function (req, res) {
        try {
            let isUpdate = false;

            // console.log("BE16 Req", req.body);

            const validationResult = await validateBE16Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;

            const {
                products,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // -------- PRODUCTS LOOP ----------
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        const BE16DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            product_id: productDetails.product_id,
                            fit_entry_id: 0,
                            year: input.year,
                            revenue: parseInt(input.revenue) || 0,
                            legitimacy: (input.legitimacy ?? false) ? 1 : 0,
                            positive_outcomes: (input.positive_outcomes ?? false) ? 1 : 0,
                            accessibility: (input.accessibility ?? false) ? 1 : 0,
                            reduce_uncertainty: (input.reduce_uncertainty ?? false) ? 1 : 0,
                            fairness_concerns_investigated: (input.fairness_concerns_investigated ?? false) ? 1 : 0,
                            fairness_policies_consult: (input.fairness_policies_consult ?? false) ? 1 : 0,
                            transparency_throughout_investigation: (input.transparency_throughout_investigation ?? false) ? 1 : 0,
                            transparency_process_investigating: (input.transparency_process_investigating ?? false) ? 1 : 0,
                            transparency_valid_acknowledged: (input.transparency_valid_acknowledged ?? false) ? 1 : 0,
                            transparency_alternatively_investigation: (input.transparency_alternatively_investigation ?? false) ? 1 : 0,
                            engage_actively: (input.engage_actively ?? false) ? 1 : 0,
                            improve_continuously_performance: (input.improve_continuously_performance ?? false) ? 1 : 0,
                            improve_continuously_implement: (input.improve_continuously_implement ?? false) ? 1 : 0,
                            product_fitness_percentage: parseFloat(input.product_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // check by id
                        const existingProductDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE16,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingProductDetails?.length > 0) {
                            delete BE16DataObject.created_by;
                            delete BE16DataObject.created_on;
                            BE16DataObject.modified_by = req.userData.UserID;
                            BE16DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE16, `id=${existingProductDetails[0].id}`, BE16DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            // check by year
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE16,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE16DataObject.created_by;
                                delete BE16DataObject.created_on;
                                BE16DataObject.modified_by = req.userData.UserID;
                                BE16DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE16, `id=${existingYearDetails[0].id}`, BE16DataObject);
                                isUpdate = true;
                                BEinsertedID = productDetails.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE16, BE16DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE16 Form Updated Successfully" : "BE16 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be17: async function (req, res) {
        try {
            let isUpdate = false;

            const validationResult = await validateBE17Array(req.body.products);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;
            const {
                products,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // -------- PRODUCTS LOOP ----------
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        const BE17DataObject = {
                            company_id: req.userData.CompanyID,
                            year: parseInt(input.year) || 0,
                            revenue: parseInt(input.revenue) || 0,
                            relevance_id: input.relevance,
                            product_id: parseInt(productDetails.product_id) || 0,
                            fit_entry_id: 0,
                            GDMMUsePhase: input.GDMMusePhase ?? null,
                            GDMMendOfLife: input.GDMMendOfLife ?? null,
                            physical_weapon: input.WDKMPusePhase ?? null,
                            physical_consumable: input.CWUILHRusePhase ?? null,
                            physical_environmentally_use: input.EDVPusePhase ?? null,
                            physical_environmentally_end: input.EDVendOfLife ?? null,
                            GFUPEusePhase: input.GFUPEusePhase ?? null,
                            GFUPEendOfLife: input.GFUPEendOfLife ?? null,
                            physical_substances_use: input.GCSCusePhase ?? null,
                            physical_substances_end: input.GCSCendOfLife,
                            intermediate_physical: input.phycal_gd_is_an_intrmdt_gd ?? null,
                            intermediate_representative: input.intrmdt_gd_asses_reprvv_user ?? null,
                            intermediate_classified_use: input.RPUFGusePhase ?? null,
                            intermediate_classified_end: input.RPUFGendOfLife ?? null,
                            services_negative: input.service_result_in_negative_impacts ?? null,
                            services_harm: input.service_could_harm_ecosystems ?? null,
                            services_physical: input.service_ngtv_impacts_physcl_mntl_wlbng ?? null,
                            services_behaviours: input.service_reinforce_bhvr_undrm_ftns ?? null,
                            services_infrastructure: input.service_perpetuates_orx_rlc_infr_ngtv_impacts ?? null,
                            product_fitness_usephase: parseFloat(input.productFitnessusePhase) || 0,
                            product_fitness_end: parseFloat(input.productFitnessendOfLife) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // check by id
                        const existingProductDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE17,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingProductDetails?.length > 0) {
                            delete BE17DataObject.created_by;
                            delete BE17DataObject.created_on;
                            BE17DataObject.modified_by = req.userData.UserID;
                            BE17DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE17, `id=${existingProductDetails[0].id}`, BE17DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            // check by year
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE17,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE17DataObject.created_by;
                                delete BE17DataObject.created_on;
                                BE17DataObject.modified_by = req.userData.UserID;
                                BE17DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE17, `id=${existingYearDetails[0].id}`, BE17DataObject);
                                isUpdate = true;
                                BEinsertedID = productDetails.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE17, BE17DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }

            // -------- PROGRESS INDICATORS ----------
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
            AND be_goal_id=${existingGoalCode} 
            AND progress_indicator_id=${pi.id} 
            AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            // -------- CONTEXT INDICATORS ----------
            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                AND be_goal_id=${existingGoalCode} 
                AND context_indicator_id=${ci.id} 
                AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }

            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE17 Form Updated Successfully" : "BE17 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be18: async function (req, res) {
        try {
            let isUpdate = false;

            const validationResult = await validateBE18Array(req.body.products);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;
            const {
                products,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // -------- PRODUCTS LOOP ----------
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        const BE18DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            product_id: productDetails.product_id,
                            fit_entry_id: 0,
                            year: input.year,
                            revenue: parseInt(input.revenue) || 0,
                            fitness_ghg: (input.emitGHGs ?? false) ? 1 : 0,
                            fitness_emission: parseFloat(input.lifetimeUsePhase) || 0,
                            number_unit_sold: parseInt(input.unitSold) || 0,
                            product_fitness_percentage: parseFloat(input.productFitness) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // check by id
                        const existingProductDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE18,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingProductDetails?.length > 0) {
                            delete BE18DataObject.created_by;
                            delete BE18DataObject.created_on;
                            BE18DataObject.modified_by = req.userData.UserID;
                            BE18DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE18, `id=${existingProductDetails[0].id}`, BE18DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            // check by year
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE18,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE18DataObject.created_by;
                                delete BE18DataObject.created_on;
                                BE18DataObject.modified_by = req.userData.UserID;
                                BE18DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE18, `id=${existingYearDetails[0].id}`, BE18DataObject);
                                isUpdate = true;
                                BEinsertedID = productDetails.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE18, BE18DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseFloat(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE18 Form Updated Successfully" : "BE18 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be19: async function (req, res) {
        try {
            let isUpdate = false;

            // console.log("BE19 Req", JSON.stringify(req.body, null, 2));

            const validationResult = await validateBE19Array(req.body.products);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id !== '' ? req.body.fit_entry_id : 0;
            const {
                products,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // -------- PRODUCTS LOOP ----------
            for (const productDetails of products) {
                if (productDetails.fitnessInputs && Array.isArray(productDetails.fitnessInputs)) {
                    for (const input of productDetails.fitnessInputs) {
                        const BE19DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            product_id: productDetails.product_id,
                            fit_entry_id: 0,
                            year: input.year,
                            revenue: parseInt(input.revenue) || 0,
                            numberof_distinct: parseInt(input.numberof_distinct) || 0,
                            fitness1_repurposing: parseFloat(input.fitness1_repurposing) || 0,
                            fitness1_sold: parseInt(input.fitness1_sold) || 0,
                            fitness2_repurposing: parseFloat(input.fitness2_repurposing) || 0,
                            fitness2_sold: parseInt(input.fitness2_sold) || 0,
                            fitness3_repurposing: parseFloat(input.fitness3_repurposing) || 0,
                            fitness3_sold: parseInt(input.fitness3_sold) || 0,
                            fitness4_repurposing: parseFloat(input.fitness4_repurposing) || 0,
                            fitness4_sold: parseInt(input.fitness4_sold) || 0,
                            fitness5_repurposing: parseFloat(input.fitness5_repurposing) || 0,
                            fitness5_sold: parseInt(input.fitness5_sold) || 0,
                            fitness6_repurposing: parseFloat(input.fitness6_repurposing) || 0,
                            fitness6_sold: parseInt(input.fitness6_sold) || 0,
                            fitness7_repurposing: parseFloat(input.fitness7_repurposing) || 0,
                            fitness7_sold: parseInt(input.fitness7_sold) || 0,
                            fitness8_repurposing: parseFloat(input.fitness8_repurposing) || 0,
                            fitness8_sold: parseInt(input.fitness8_sold) || 0,
                            fitness9_repurposing: parseFloat(input.fitness9_repurposing) || 0,
                            fitness9_sold: parseInt(input.fitness9_sold) || 0,
                            fitness10_repurposing: parseFloat(input.fitness10_repurposing) || 0,
                            fitness10_sold: parseInt(input.fitness10_sold) || 0,
                            product_fitness_percentage: parseFloat(input.product_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        // check by id
                        const existingProductDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE19,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND id=${input.id}`,
                            'id'
                        );

                        if (existingProductDetails?.length > 0) {
                            delete BE19DataObject.created_by;
                            delete BE19DataObject.created_on;
                            BE19DataObject.modified_by = req.userData.UserID;
                            BE19DataObject.modified_on = new Date();

                            await Common.update(tableName.TBL_BE19, `id=${existingProductDetails[0].id}`, BE19DataObject);
                            isUpdate = true;
                            BEinsertedID = productDetails.BEID;
                        } else {
                            // check by year
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE19,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND product_id=${productDetails.product_id} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0) {
                                delete BE19DataObject.created_by;
                                delete BE19DataObject.created_on;
                                BE19DataObject.modified_by = req.userData.UserID;
                                BE19DataObject.modified_on = new Date();

                                await Common.update(tableName.TBL_BE19, `id=${existingYearDetails[0].id}`, BE19DataObject);
                                isUpdate = true;
                                BEinsertedID = productDetails.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE19, BE19DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE19 Form Updated Successfully" : "BE19 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be20: async function (req, res) {
        try {
            // console.log("BE20 Req", JSON.stringify(req.body, null, 2));

            let isUpdate = false;

            const validationResult = await validateBE20Array(req.body);
            if (!validationResult.success) {
                return res.status(400).json({ errors: validationResult.errors });
            }

            let fit_id = req.body?.fit_entry_id ? req.body.fit_entry_id : 0;
            const { employee, progress_indicators, context_indicators, goalCode_id } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;

            // === Employee Fitness Inputs ===
            for (const emp of employee) {
                if (emp.fitnessInputs && Array.isArray(emp.fitnessInputs)) {
                    for (const input of emp.fitnessInputs) {
                        const BE20DataObject = {
                            company_id: req.userData.CompanyID,
                            relevance_id: input.relevance,
                            employee_id: emp.employeeId,
                            year: input.year,
                            fit_entry_id: 0,
                            // number_of_employees:input.fitnessnumber_of_employees,
                            number_of_employees: parseInt(input.fitnessnumber_of_employees) || 0,
                            hotspot_assessment: (input.hotspot_assessment ?? false) ? 1 : 0,
                            hotspot_procedures: (input.hotspot_Procedures ?? false) ? 1 : 0,
                            ethics_inplace: (input.ethics_inplace ?? false) ? 1 : 0,
                            ethics_positions: (input.ethics_positions ?? false) ? 1 : 0,
                            internal_breaches: (input.internal_breaches ?? false) ? 1 : 0,
                            internal_issues: (input.internal_issues ?? false) ? 1 : 0,
                            internal_employees: (input.internal_employees ?? false) ? 1 : 0,
                            internal_processes: (input.internal_processes ?? false) ? 1 : 0,
                            employee_fitness_percentage: parseFloat(input.employee_fitness_percentage) || 0,
                            comments: input.comments,
                            created_by: req.userData.UserID,
                            created_on: new Date(),
                            flag_deleted: 0
                        };

                        const existingEmpDetails = await Common.get_info(
                            1,
                            tableName.TBL_BE20,
                            1,
                            `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND id=${input.id}`,
                            'id'
                        );

                        if (existingEmpDetails?.length > 0 && existingEmpDetails[0]?.id > 0) {
                            delete BE20DataObject.created_by;
                            delete BE20DataObject.created_on;
                            BE20DataObject.modified_by = req.userData.UserID;
                            BE20DataObject.modified_on = new Date();
                            await Common.update(tableName.TBL_BE20, `id=${existingEmpDetails[0].id}`, BE20DataObject);
                            isUpdate = true;
                            BEinsertedID = emp.BEID;
                        } else {
                            const existingYearDetails = await Common.get_info(
                                1,
                                tableName.TBL_BE20,
                                1,
                                `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND employee_id=${emp.employeeId} AND year=${input.year}`,
                                'id'
                            );

                            if (existingYearDetails?.length > 0 && existingYearDetails[0]?.id > 0) {
                                delete BE20DataObject.created_by;
                                delete BE20DataObject.created_on;
                                BE20DataObject.modified_by = req.userData.UserID;
                                BE20DataObject.modified_on = new Date();
                                await Common.update(tableName.TBL_BE20, `id=${existingYearDetails[0].id}`, BE20DataObject);
                                isUpdate = true;
                                BEinsertedID = emp.BEID;
                            } else {
                                const inserted = await Common.insert(tableName.TBL_BE20, BE20DataObject);
                                BEinsertedID = inserted?.insertId || 0;
                            }
                        }
                    }
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }


            return res.status(200).json({
                status: true,
                message: isUpdate ? "BE20 Form Updated Successfully" : "BE20 Form Submitted Successfully",
                data: { fit_entry: fit_id, BEID: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, ' ==== ex');
            Logs.ErrorHandler(ex, res);
        }
    },


    submit_be21: async function (req, res) {
        try {
            let fit_id = req.body.fit_entry_id ? req.body.fit_entry_id : 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                progress_indicator_ids,
                context_indicator_ids,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;
            const be21FormData = sites[0];

            for (const input of be21FormData.fitnessInputs) {
                const BE21DataObject = {
                    year: input.year,
                    company_id: req.userData.CompanyID,
                    fit_entry_id: 0,
                    companyis_mnc: (input.companyis_mnc ?? false) ? 1 : 0,
                    not_relevant_for_nonprofit: (input.not_relevant_for_nonprofit ?? false) ? 1 : 0,
                    public_website: (input.public_website ?? false) ? 1 : 0,
                    public_tax_appointed: (input.public_tax_appointed ?? false) ? 1 : 0,
                    public_tax_strategy: (input.public_tax_strategy ?? false) ? 1 : 0,
                    public_tax_marketed: (input.public_tax_marketed ?? false) ? 1 : 0,
                    public_tax_no_tax: (input.public_tax_no_tax ?? false) ? 1 : 0,
                    public_tax_direct: (input.public_tax_direct ?? false) ? 1 : 0,
                    public_tax_stated: (input.public_tax_stated ?? false) ? 1 : 0,
                    public_tax_independent: (input.public_tax_independent ?? false) ? 1 : 0,
                    public_tax_discloses: (input.public_tax_discloses ?? false) ? 1 : 0,
                    tax_policies_totalescore: parseInt(input.tax_policies_totalescore) || 0,

                    transparency_company: (input.transparency_company ?? false) ? 1 : 0,
                    transparency_evidence: (input.transparency_evidence ?? false) ? 1 : 0,
                    transparency_address: (input.transparency_address ?? false) ? 1 : 0,
                    transparency_ultimate: (input.transparency_ultimate ?? false) ? 1 : 0,
                    transparency_totalescore: parseInt(input.transparency_totalescore) || 0,

                    taxrate_reconciliation: (input.taxrate_reconciliation ?? false) ? 1 : 0,
                    taxrate_current: (input.taxrate_current ?? false) ? 1 : 0,
                    taxrate_narrative: (input.taxrate_narrative ?? false) ? 1 : 0,
                    taxrate_deferred: (input.taxrate_deferred ?? false) ? 1 : 0,
                    taxrate_totalescore: parseInt(input.taxrate_totalescore) || 0,

                    country_by_disclose: (input.country_by_disclose ?? false) ? 1 : 0,
                    country_by_residence: (input.country_by_residence ?? false) ? 1 : 0,
                    country_by_net_asset_value: (input.country_by_net_asset_value ?? false) ? 1 : 0,
                    country_by_net_period_provided: (input.country_by_net_period_provided ?? false) ? 1 : 0,
                    country_by_income: (input.country_by_income ?? false) ? 1 : 0,
                    country_by_current_tax_charge: (input.country_by_current_tax_charge ?? false) ? 1 : 0,
                    country_by_average_number: (input.country_by_average_number ?? false) ? 1 : 0,
                    country_by_total_context_score: parseInt(input.country_by_total_context_score) || 0,
                    comments: input.comments,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };

                const existingYear = await Common.get_info(
                    1,
                    tableName.TBL_BE21,
                    1,
                    `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND year=${input.year}`,
                    'id'
                );

                if (existingYear?.length > 0) {
                    // Update
                    delete BE21DataObject.created_by;
                    delete BE21DataObject.created_on;
                    BE21DataObject.modified_by = req.userData.UserID;
                    BE21DataObject.modified_on = new Date();

                    await Common.update(tableName.TBL_BE21, `id=${existingYear[0].id}`, BE21DataObject);
                    BEinsertedID = existingYear[0].id;
                } else {
                    // Insert
                    const inserted = await Common.insert(tableName.TBL_BE21, BE21DataObject);
                    BEinsertedID = inserted.insertId ? inserted.insertId : 0;
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }
            // Context Indicators
            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: "BE21 Form Submitted Successfully",
                data: { fit_entry: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, " ==== ex");
            Logs.ErrorHandler(ex, res);
        }
    },

    submit_be22: async function (req, res) {
        try {
            let fit_id = req.body.fit_entry_id || 0;

            const {
                sites,
                progress_indicators,
                context_indicators,
                goalCode_id
            } = req.body;

            const goalCodeStr = goalCode_id?.toLowerCase().trim();
            const existingGoalCodeResult = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_code = '${goalCodeStr}' AND flag_deleted != 1`
            );
            const existingGoalCode = existingGoalCodeResult?.length > 0 ? existingGoalCodeResult[0].goal_id : 0;

            let BEinsertedID = 0;
            const be22FormData = sites[0];


            for (const input of be22FormData.fitnessInputs) {
                const BE22DataObject = {
                    year: input.year,
                    company_id: req.userData.CompanyID,
                    fit_entry_id: 0,
                    Lobbying_seek_to_influence: (input.lobbying_seek_to_influence ?? false) ? 1 : 0,
                    amount_contributed_toLobby: parseFloat(input.amount_contributed_toLobby) || 0,
                    Lobbying_supporting_individuals: (input.lobbying_supporting_individuals ?? false) ? 1 : 0,
                    Lobbying_specific_positions: (input.lobbying_specific_positions ?? false) ? 1 : 0,
                    Lobbying_all_departments: (input.lobbying_all_departments ?? false) ? 1 : 0,
                    contributions_directly_undertake: (input.contributions_directly_undertake ?? false) ? 1 : 0,
                    contributions_diligence_before: (input.contributions_diligence_before ?? false) ? 1 : 0,
                    contributions_recipient_engages: (input.contributions_recipient_engages ?? false) ? 1 : 0,
                    contributions_due_diligence: (input.contributions_due_diligence ?? false) ? 1 : 0,
                    contributions_regular_review: (input.contributions_regular_review ?? false) ? 1 : 0,
                    contributions_clear_guidance: (input.contributions_clear_guidance ?? false) ? 1 : 0,
                    disclosure_recipient_name: (input.disclosure_recipient_name ?? false) ? 1 : 0,
                    disclosure_amount: (input.disclosure_amount ?? false) ? 1 : 0,
                    disclosure_date_of_contribution: (input.disclosure_date_of_contribution ?? false) ? 1 : 0,
                    disclosure_company_raised: (input.disclosure_company_raised ?? false) ? 1 : 0,
                    comments: input.comments,
                    created_by: req.userData.UserID,
                    created_on: new Date(),
                    flag_deleted: 0
                };

                // Check if record exists by year
                const existingYear = await Common.get_info(
                    1,
                    tableName.TBL_BE22,
                    1,
                    `flag_deleted=0 AND company_id=${req.userData.CompanyID} AND year=${input.year}`,
                    'id'
                );

                if (existingYear?.length > 0) {
                    delete BE22DataObject.created_by;
                    delete BE22DataObject.created_on;
                    BE22DataObject.modified_by = req.userData.UserID;
                    BE22DataObject.modified_on = new Date();
                    await Common.update(tableName.TBL_BE22, `id=${existingYear[0].id}`, BE22DataObject);
                    BEinsertedID = existingYear[0].id;
                } else {
                    const inserted = await Common.insert(tableName.TBL_BE22, BE22DataObject);
                    BEinsertedID = inserted.insertId || 0;
                }
            }
            // Progress Indicators
            if (Array.isArray(progress_indicators) && progress_indicators.length > 0) {
                for (const pi of progress_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                          AND be_goal_id=${existingGoalCode} 
                          AND progress_indicator_id=${pi.id} 
                          AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }

                for (const pi of progress_indicators) {
                    const ProgressIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        progress_indicator_id: pi.id,
                        fit_entry_id: 0,
                        score: parseInt(pi.score) || 0,
                        data_completeness: pi.dataCompleteness ?? null,
                        year: pi.year,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, ProgressIndicatorDataObject);
                }
            }

            if (Array.isArray(context_indicators) && context_indicators.length > 0) {
                for (const ci of context_indicators) {
                    await Common.update(
                        tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                        `company_id=${req.userData.CompanyID} 
                              AND be_goal_id=${existingGoalCode} 
                              AND context_indicator_id=${ci.id} 
                              AND flag_deleted=0`,
                        {
                            flag_deleted: 1,
                            modified_by: req.userData.UserID,
                            modified_on: new Date()
                        }
                    );
                }
                for (const ci of context_indicators) {
                    const ContextIndicatorDataObject = {
                        be_goal_id: existingGoalCode,
                        company_id: req.userData.CompanyID,
                        context_indicator_id: ci.id,
                        score: parseInt(ci.score) || 0,
                        year: ci.year,
                        fit_entry_id: 0,
                        created_by: req.userData.UserID,
                        created_on: new Date(),
                        flag_deleted: 0
                    };

                    await Common.insert(tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, ContextIndicatorDataObject);
                }
            }



            return res.status(200).json({
                status: true,
                message: "BE22 Form Submitted Successfully",
                data: { fit_entry: BEinsertedID }
            });

        } catch (ex) {
            console.log(ex, " ==== ex");
            Logs.ErrorHandler(ex, res);
        }
    },



    delete_Be03: async function (req, res) {
        try {
            const formId = req.params.id;
            const existingSite = await Common.selectWhere(tableName.TBL_BE03, `id = ${formId} AND flag_deleted = 0`);
            if (!existingSite.length) {
                return res.status(404).json({
                    status: false,
                    message: 'BE03 not found or already deleted',
                    data: []
                });
            }
            const updateData = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };
            await Common.update(tableName.TBL_BE03, `id = ${formId}`, updateData
            );
            return res.status(200).json({
                status: true,
                message: 'Be03 soft deleted successfully',
                data: []
            });
        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },
    softDelete: async function (req, res) {
        try {
            const TABLE_MAP = {
                be01: "tbl_be01",
                be02: "tbl_be02",
                be03: "tbl_be03",
                be04: "tbl_be04",
                be05: "tbl_be05",
                be06: "tbl_be06",
                be07: "tbl_be07",
                be08: "tbl_be08",
                be09: "tbl_be09",
                be10: "tbl_be10",
                be11: "tbl_be11",
                be12: "tbl_be12",
                be13: "tbl_be13",
                be14: "tbl_be14",
                be15: "tbl_be15",
                be16: "tbl_be16",
                be17: "tbl_be17",
                be18: "tbl_be18",
                be19: "tbl_be19",
                be20: "tbl_be20",
                be21: "tbl_be21",
                be22: "tbl_be22",
                be23: "tbl_be23"
            };
            const { id, form } = req.body;
            const tableName = TABLE_MAP[form];

            if (!id || !tableName) {
                return res.status(400).json({
                    status: false,
                    message: "id and form are required",
                    data: []
                });
            }


            const existingRecord = await Common.selectWhere(
                tableName,
                `id = ${id} AND flag_deleted = 0`
            );

            if (!existingRecord.length) {
                return res.status(404).json({
                    status: false,
                    message: "Record not found or already deleted",
                    data: []
                });
            }


            const updateData = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };

            await Common.update(tableName, `id = ${id}`, updateData);

            return res.status(200).json({
                status: true,
                message: "Record soft deleted successfully",
                data: []
            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    }




}
function generateShortFutureFitName() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    return `FutureFit-${yy}${mm}${dd}-${hh}${min}`;
}
