const Logs = require('./common/logs.controller');
const tableName = require('./common/table.controller');
const Common = require('../models/common');
const { Validator } = require('node-input-validator');
const bcrypt = require('bcryptjs');

var auth = {

    getBasicDetails: async function (req, res) {
        try {
            const fit_entry_id = req.params.fit_id;
            const selectedFields = 'fit_entry_id,company_id,future_fit_name,fit_year,fit_month,status_id';
            const data = await Common.get_info(fit_entry_id, tableName.TBL_COMPANY_FUTURE_FIT, 'fit_entry_id', 'flag_deleted = 0', selectedFields);
            res.status(200).json({
                status: true,
                message: 'Data fetched successfully',
                data: data
            });
        } catch (error) {
            Logs.ErrorHandler(error, res)
        }
    },

    getSiteDetails: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const fit_entry_id = req.params.fit_id;
            const { goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be01Fields = `  id, relevance_id, fit_entry_id,site_id,amount_of_renewable_energy_used, total_amount_of_energy_used, site_fitness, comments,year`;

            const be02Fields = `  id, relevance_id, fit_entry_id,site_id,water_consumption_fit_sources, water_consumption_unfit_sources,commercial_water_consumption_offset,water_consumed_by_workers_fit_sources,water_consumed_by_workers_unfit_sources,commercial_water_consumption_fit_source,commercial_water_consumption_unfit_source,total_commercial_water_consumption, site_fitness, Relevance_id_2,fit_discharged_water, total_discharged_water,site_fitness1, comments`;

            // const be03Fields = `  id, relevance_id, fit_entry_id,natural_resource,resource_id, natural_resource_id, location,value_of_natural_resource,common_fitness_criteria_id,renewable_respect_regeneration_rates,renewable_respect_regeneration_rates,renewable_ecosystem_health,renewable_aquatic_protection,renewable_invasive_species_control, renewable_no_destructive_techniques,renewable_sourcing_industry_standards,animal_welfare_maintained,animal_no_endangered_hunting,animalSourcingstandards,nonrenewable_sourcing_industry_standards,nonrenewable_sourcing_industry_standards,nonrenewable_no_conflict_or_hr_violation,nonrenewable_no_destructive_extraction,nonrenewable_ecosystem_health_maintained,nonrenewable_ecosystem_production_impact_control, resource_fitness_percent, comments`;
            const be03Fields = ` id,
  relevance_id,
  fit_entry_id,
  year,
  natural_resource,
  resource_id,
  natural_resource_id,
  location,
  value_of_natural_resource,
  common_fitness_criteria_id,
  renewable_respect_regeneration_rates,
  renewable_ecosystem_health,
  renewable_aquatic_protection,
  renewable_invasive_species_control,
  renewable_no_destructive_techniques,
  renewable_sourcing_industry_standards,
  animal_welfare_maintained,
  animal_no_endangered_hunting,
  animalSourcingstandards,
  nonrenewable_sourcing_industry_standards,
  nonrenewable_no_conflict_or_hr_violation,
  nonrenewable_no_destructive_extraction,
  nonrenewable_ecosystem_health_maintained,
  nonrenewable_ecosystem_production_impact_control,
  resource_fitness_percent,
  comments`;


            const be05Fields = `  id, fit_entry_id,site_id,relevance_id_gaseous,gaseous_reference_year,gaseous_reporting_year,gaseous_site_fitness_percent,relevance_id_liquid,liquid_reference_year,liquid_reporting_year,liquid_site_fitness_percent,relevance_id_solid,solid_reference_year,solid_reporting_year,solid_site_fitness_percent, comments`;

            const be06Fields = `  id, fit_entry_id,relevance_id,site_id,no_ghg_emission_id,ghg_reference_year,ghg_reporting_year,ghg_adequately_offset,site_fitness_percent, comments`;

            const be07Fields = `  id, fit_entry_id,site_id,relevance_id,site_assessed_waste_id,waste_reference_year,waste_reporting_year,site_fitness_percent, comments`;

            const be08Fields = `  id, fit_entry_id,site_id, relevance_id,site_area,local_impact_identified,value_area_identified,value_area_protected,no_impact_on_pristine_ecosystems,land_rights_uncontested,community_consent_obtained,past_damage_neutralized,site_fitness_percent, comments`;

            const be09Fields = `  id, fit_entry_id,site_id, relevance_id,assessment_conducted,affected_communities_identified,communities_at_risk,mechanism_inclusive,stakeholders_involved_in_mechanism_design,concerns_resolved_timely,info_accessible,info_communicated,appropriate_communication_channels,responsible_party_assigned,access_to_neutral_advice,users_informed,complaint_publicly_viewable,user_feedback_collected,performance_monitored,improvements_implemented,community_consultation_prior_activities,site_fitness_percentage, comments`;

            const be21Fields = `id, fit_entry_id,companyis_mnc,not_relevant_for_nonprofit,public_website,public_tax_appointed,public_tax_strategy,public_tax_marketed,public_tax_no_tax,public_tax_direct,public_tax_stated,public_tax_independent,public_tax_discloses,tax_policies_totalescore,transparency_company,transparency_evidence,transparency_address,transparency_ultimate,transparency_totalescore,taxrate_reconciliation,taxrate_current,taxrate_narrative,taxrate_deferred,taxrate_totalescore,country_by_residence,country_by_net_asset_value,country_by_net_period_provided,country_by_income,country_by_income,country_by_current_tax_charge,country_by_average_number,country_by_total_context_score`;

            const be22Fields = `id, fit_entry_id,Lobbying_seek_to_influence,Lobbying_supporting_individuals,Lobbying_specific_positions,Lobbying_all_departments,contributions_directly_undertake,contributions_diligence_before,contributions_recipient_engages,contributions_due_diligence,contributions_regular_review,contributions_clear_guidance,disclosure_recipient_name,disclosure_amount,disclosure_date_of_contribution,disclosure_company_raised`;

            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be01Details = await Common.get_info(siteId, tableName.TBL_BE01, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be01Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be01_data = be01Details;

                const be02Details = await Common.get_info(siteId, tableName.TBL_BE02, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be02Fields);
                sites[i].be02_data = be02Details;

                const be03Details = await Common.get_info(1, tableName.TBL_BE03, 1, `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be03Fields);
                sites[i].be03_data = be03Details;

                const be05Details = await Common.get_info(siteId, tableName.TBL_BE05, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be05Fields);
                sites[i].be05_data = be05Details;

                const be06Details = await Common.get_info(siteId, tableName.TBL_BE06, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be06Fields);
                sites[i].be06_data = be06Details;

                const be07Details = await Common.get_info(siteId, tableName.TBL_BE07, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be07Fields);
                sites[i].be07_data = be07Details;

                const be08Details = await Common.get_info(siteId, tableName.TBL_BE08, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be08Fields);
                sites[i].be08_data = be08Details;

                const be09Details = await Common.get_info(siteId, tableName.TBL_BE09, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be09Fields);
                sites[i].be09_data = be09Details;

                const be21Details = await Common.get_info(1, tableName.TBL_BE21, 1, `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be21Fields);
                sites[i].be21_data = be21Details;

                const be22Details = await Common.get_info(1, tableName.TBL_BE22, 1, `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be22Fields);
                sites[i].be22_data = be22Details;


            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(contextIndicatorIDs[i], tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, 'context_indicator_id', where, 'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }
            // console.log("prodtaa" + progressScores);
            const t = sites
            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                // goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: { sites: sites, siteIDs: siteIDs, goalIDs: goalIDs },

            });

        }
        catch (error) {
            Logs.ErrorHandler(error, res)
        }
    },
    getSiteDetailsNew: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;
            const fit_entry_id = req.params.fit_id;
            const { goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be01Fields = `  id, relevance_id, fit_entry_id,site_id,amount_of_renewable_energy_used, total_amount_of_energy_used, site_fitness, comments,year`;

            const be02Fields = `  id, year,relevance_id, fit_entry_id,site_id,water_consumption_fit_sources,context_description, water_consumption_unfit_sources,commercial_water_consumption_offset,water_consumed_by_workers_fit_sources,water_consumed_by_workers_unfit_sources,commercial_water_consumption_fit_source,commercial_water_consumption_unfit_source,total_commercial_water_consumption, site_fitness, Relevance_id_2,fit_discharged_water, total_discharged_water,site_fitness1, comments`;


            const be03Fields = ` id,  relevance_id, fit_entry_id, natural_resource, resource_id, year,  context_description,  site_id, natural_resource_id, location, value_of_natural_resource, common_fitness_criteria_id, renewable_respect_regeneration_rates,
  renewable_ecosystem_health, renewable_aquatic_protection, renewable_invasive_species_control, renewable_no_destructive_techniques, renewable_sourcing_industry_standards,
  animal_welfare_maintained, animal_no_endangered_hunting,animalSourcingstandards, nonrenewable_sourcing_industry_standards, nonrenewable_no_conflict_or_hr_violation,
  nonrenewable_no_destructive_extraction, nonrenewable_ecosystem_health_maintained, nonrenewable_ecosystem_production_impact_control, resource_fitness_percent, comments`;
            const be04Fields = `id, year, purchase_information_id, category_id, relevance_id, purchase_does_not_use_phase, hotspot_conducted, potential_hotspot, actual_hotspot, all_high_intensity_hotspot, all_hotspot_have_been_avoided, all_hotspot_from_cradle, company_continuosly, purchase_fitness, comments`;
            const be05Fields = `  id, year ,context_description, fit_entry_id,site_id,relevance_id_gaseous,gaseous_reference_year,gaseous_reporting_year,gaseous_site_fitness_percent,relevance_id_liquid,liquid_reference_year,liquid_reporting_year,liquid_site_fitness_percent,relevance_id_solid,solid_reference_year,solid_reporting_year,solid_site_fitness_percent, comments`;

            const be06Fields = `  id, year, fit_entry_id,relevance_id,site_id,no_ghg_emission_id,ghg_reference_year,ghg_reporting_year,ghg_adequately_offset,site_fitness_percent, comments`;

            const be07Fields = `  id, year,fit_entry_id,site_id,relevance_id,site_assessed_waste_id,waste_reference_year,waste_reporting_year,site_fitness_percent, comments`;

            const be08Fields = `  id, year, fit_entry_id,site_id, relevance_id,site_area,local_impact_identified,value_area_identified,value_area_protected,no_impact_on_pristine_ecosystems,land_rights_uncontested,community_consent_obtained,past_damage_neutralized,site_fitness_percent, comments`;

            const be09Fields = `  id, year,context_description, fit_entry_id,site_id, relevance_id,assessment_conducted,affected_communities_identified,communities_at_risk,mechanism_inclusive,stakeholders_involved_in_mechanism_design,concerns_resolved_timely,info_accessible,info_communicated,appropriate_communication_channels,responsible_party_assigned,access_to_neutral_advice,users_informed,complaint_publicly_viewable,user_feedback_collected,performance_monitored,improvements_implemented,community_consultation_prior_activities,site_fitness_percentage, comments`;

            const be21Fields = `id, year,fit_entry_id,companyis_mnc, not_relevant_for_nonprofit,public_website,public_tax_appointed,public_tax_strategy,public_tax_marketed,public_tax_no_tax,public_tax_direct,public_tax_stated,public_tax_independent,public_tax_discloses,tax_policies_totalescore,transparency_company,transparency_evidence,transparency_address,transparency_ultimate,transparency_totalescore,taxrate_reconciliation,taxrate_current,taxrate_narrative,taxrate_deferred,taxrate_totalescore,country_by_residence,country_by_net_asset_value,country_by_net_period_provided,country_by_income,country_by_income,country_by_current_tax_charge,country_by_average_number,country_by_total_context_score,comments`;

            const be22Fields = `id, year,fit_entry_id,amount_contributed_toLobby,Lobbying_seek_to_influence,Lobbying_supporting_individuals,Lobbying_specific_positions,Lobbying_all_departments,contributions_directly_undertake,contributions_diligence_before,contributions_recipient_engages,contributions_due_diligence,contributions_regular_review,contributions_clear_guidance,disclosure_recipient_name,disclosure_amount,disclosure_date_of_contribution,disclosure_company_raised,comments`;

            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be01Details = await Common.get_info(siteId, tableName.TBL_BE01, 'site_id', `flag_deleted=0`, be01Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be01_data = be01Details;

                const be02Details = await Common.get_info(siteId, tableName.TBL_BE02, 'site_id', `flag_deleted=0`, be02Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be02_data = be02Details;

                const be03Details = await Common.get_info(1, tableName.TBL_BE03, 1, `flag_deleted=0 AND company_id = ${company_id}`, be03Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be03_data = be03Details;

                const be04Details = await Common.get_info(1, tableName.TBL_BE04, 1, `flag_deleted=0 AND company_id = ${company_id}`, be04Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be04_data = be04Details;

                const be05Details = await Common.get_info(siteId, tableName.TBL_BE05, 'site_id', `flag_deleted=0`, be05Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be05_data = be05Details;

                const be06Details = await Common.get_info(siteId, tableName.TBL_BE06, 'site_id', `flag_deleted=0`, be06Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be06_data = be06Details;

                const be07Details = await Common.get_info(siteId, tableName.TBL_BE07, 'site_id', `flag_deleted=0`, be07Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be07_data = be07Details;

                const be08Details = await Common.get_info(siteId, tableName.TBL_BE08, 'site_id', `flag_deleted=0`, be08Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be08_data = be08Details;

                const be09Details = await Common.get_info(siteId, tableName.TBL_BE09, 'site_id', `flag_deleted=0`, be09Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be09_data = be09Details;

                const be21Details = await Common.get_info(req.userData.CompanyID, tableName.TBL_BE21, 'company_id', `flag_deleted=0`, be21Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be21_data = be21Details;

                const be22Details = await Common.get_info(req.userData.CompanyID, tableName.TBL_BE22, 'company_id', `flag_deleted=0`, be22Fields, false, [], false, { field: 'year', order: 'ASC' });
                sites[i].be22_data = be22Details;


            }
            //          var existingSiteDetails = await Common.get_info(1, tableName.TBL_BE01, 1, 'flag_deleted=0 AND company_id = ' + req.userData.CompanyID + ' AND site_id=' + site.site_id + ' AND id =' + input.id, 'id');

            const goalData = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `flag_deleted=0`;
                const scoreRows = await Common.get_info(contextIndicatorIDs[i], tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, 'context_indicator_id', where, 'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }
            // console.log("prodtaa" + progressScores);
            const t = sites
            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                // goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: { sites: sites, siteIDs: siteIDs, goalIDs: goalIDs },

            });

        }
        catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getEmployeeDetails: async function (req, res) {
        try {

            const fit_entry_id = req.params.fit_id;
            const company_id = req.params.company_id;
            // const { company_id } = req.body;
            const goalIdResult = await Common.selectWhere(tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS, `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`, 'be_detail_id'
            );
            const goal_id = goalIdResult?.[0]?.be_detail_id ?? 0;
            const goalCodeData = await Common.selectWhere(tableName.TBL_BREAK_EVEN_GOALS, `goal_id = ${goal_id} AND flag_deleted = 0`, 'goal_code'



            );
            const goal_code = goalCodeData?.[0]?.goal_code ?? '';

            const selectedFields = 'employee_id,employee_group,year,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(company_id, tableName.TBL_EMPLOYEE, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const employeeIDs = employees.map(employee => employee.employee_id);
            const be10Fields = `id, fit_entry_id, context_description,context_description1,number_of_employees, employee_id,relevance_id,hazard_controls_in_place,risk_assessment_done,risk_training_provided,safety_policies_monitored,anti_bullying_policy,flexible_work_conditions,stress_guidance_access,health_issue_support_policy,smoke_free_work_environment,smoke_free_communal_areas,healthy_eating_access,work_breaks_allowed,flexible_breaks_for_exercise,site_fitness_percentage,year, comments`;

            const be11Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, number_of_employees_living_wage, employee_fitness_percentage, comments`;

            const be12Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, no_child_labour, fair_employment_status, 
            freedom_of_association, fair_working_hours, overtime_compensation, right_to_refuse_irregular_work, 
            reasonable_schedule_notice, holiday_entitlement, weekly_rest_day, maternity_paternity_leave, 
            employee_fitness_percentage, comments`;

            const be13Fields = `id, fit_entry_id, employee_id, number_of_employees,relevance_id, year,clear_policy_commitment, senior_official_responsible, 
            policy_communicated, policy_in_hr_practices, reporting_procedure_available, actions_and_feedback_documented, 
            control_effectiveness_assessed, controls_adjusted_if_needed, employee_fitness_percentage, comments`;

            const be14Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, design_involvement, issue_scope_inclusive,
            timely_resolution, active_communication, confidentiality_protection, responsibility_assigned,
            independent_advice_access, full_information_during_process, consulted_on_changes,
            feedback_requested, performance_monitored, feedback_included_in_assessment,
            improvements_implemented, employee_fitness_percentage, comments`;

            const be20Fields = `id, fit_entry_id,relevance_id,number_of_employees, year,hotspot_assessment,hotspot_Procedures,ethics_inplace,ethics_positions,internal_breaches,internal_issues,internal_employees,internal_processes,employee_fitness_percentage,comments`;

            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be10Details = await Common.get_info(employeeID, tableName.TBL_BE10, 'employee_id', `flag_deleted=0`, be10Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be10_data = be10Details;

                const be11Details = await Common.get_info(employeeID, tableName.TBL_BE11, 'employee_id', `flag_deleted=0`, be11Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be11_data = be11Details;

                const be12Details = await Common.get_info(employeeID, tableName.TBL_BE12, 'employee_id', `flag_deleted=0`, be12Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be12_data = be12Details;

                const be13Details = await Common.get_info(employeeID, tableName.TBL_BE13, 'employee_id', `flag_deleted=0`, be13Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be13_data = be13Details;

                const be14Details = await Common.get_info(employeeID, tableName.TBL_BE14, 'employee_id', `flag_deleted=0`, be14Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be14_data = be14Details;

                const be20Details = await Common.get_info(employeeID, tableName.TBL_BE20, 'employee_id', `flag_deleted=0`, be20Fields, false, [], false, { field: 'year', order: 'ASC' });
                employees[i].be20_data = be20Details;
            }

            // const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalData = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `company_id = ${req.userData.CompanyID} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `company_id = ${req.userData.CompanyID} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,

                data: {
                    employees: employees,
                    employeeIDs: employeeIDs,
                    goalIDs: goalIDs
                }

            });


        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getProductDetails: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const fit_entry_id = req.params.fit_id;
            const { goal_code } = req.body;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            const be15Fields = `id, year,revenue, fit_entry_id,product_id,relevance_id,user_groups_communicationplans,communications_are_considered,communications_crucial_information,communications_product_information,purchase_information_needed,purchase_physical_goods,purchase_nature_andquantities,purchase_characteristics_ofproducts,purchase_ambiguous_term,purchase_comparative,purchase_user_groups,use_users_provided,use_nutrition_information,use_with_guidance,use_guidance_provided,post_physical_good,post_improper_disposal,product_fitness_percentage,comments`;

            const be16Fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,legitimacy,positive_outcomes,accessibility,reduce_uncertainty,fairness_concerns_investigated,fairness_policies_consult,transparency_throughout_investigation,transparency_process_investigating,transparency_valid_acknowledged,transparency_alternatively_investigation,engage_actively,improve_continuously_performance,improve_continuously_implement,product_fitness_percentage,progress_indicators,comments`;

            const be17Fields = `id, year,revenue,relevance_id, fit_entry_id,product_id,GDMMUsePhase,GDMMendOfLife,physical_weapon,physical_consumable,physical_environmentally_use,physical_environmentally_end,GFUPEusePhase,GFUPEendOfLife,physical_substances_use,physical_substances_end,intermediate_physical,intermediate_representative,intermediate_classified_use,intermediate_classified_end,services_negative,services_harm,services_physical,services_behaviours,services_infrastructure,product_fitness_usephase,product_fitness_end,progress_indicators_service_use,progress_indicators_service_end,progress_indicators_supp_use,progress_indicators_supp_end,comments`;

            const be18Fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,fitness_ghg,fitness_emission,number_unit_sold,product_fitness_percentage,comments`;

            const be19Fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,numberof_distinct,fitness1_repurposing,fitness1_sold,fitness2_repurposing,fitness2_sold,fitness3_repurposing,fitness3_sold,fitness4_repurposing,fitness4_sold,fitness5_repurposing,fitness5_sold,fitness6_repurposing,fitness6_sold,fitness7_repurposing, fitness7_sold,fitness8_repurposing,fitness8_sold,fitness9_repurposing,fitness9_sold,fitness10_repurposing,fitness10_sold,product_fitness_percentage,comments`;
            const be23Fields = `id,company_id,relevance_id,finanical_id,category_id,year,financial_asset_does,hotspot_assessmen,potential_hotspots_identified,actual_hotspots,all_high_intensity_hotspot,all_hotspots_have_been,financial_fitness,comments`;


            for (let i = 0; i < productIDs.length; i++) {
                const productID = products[i].product_id;
                const be15Details = await Common.get_info(productID, tableName.TBL_BE15, 'product_id', `flag_deleted=0`, be15Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be15_data = be15Details;

                const be16Details = await Common.get_info(productID, tableName.TBL_BE16, 'product_id', `flag_deleted=0`, be16Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be16_data = be16Details;

                const be17Details = await Common.get_info(productID, tableName.TBL_BE17, 'product_id', `flag_deleted=0`, be17Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be17_data = be17Details;

                const be18Details = await Common.get_info(productID, tableName.TBL_BE18, 'product_id', `flag_deleted=0`, be18Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be18_data = be18Details;

                const be19Details = await Common.get_info(productID, tableName.TBL_BE19, 'product_id', `flag_deleted=0`, be19Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be19_data = be19Details;

                const be23Details = await Common.get_info(1, tableName.TBL_BE23, 1, `flag_deleted=0 AND company_id = ${company_id}`, be23Fields, false, [], false, { field: 'year', order: 'ASC' });
                products[i].be23_data = be23Details;
            }

            // const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalData = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `company_id = ${req.userData.CompanyID} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `company_id = ${req.userData.CompanyID} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                // productIDs: productIDs,
                // goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                // data: products
                data: { products: products, productIDs: productIDs, goalIDs: goalIDs }
            });


        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },

    getPurchaseDetails: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;
            const fit_entry_id = req.params.fit_id;
            const { goal_code } = req.body;

            const selectedFields = 'purchase_information_id,purchase,purchase_id,cost,purchase_type,product_input';
            const purchase = await Common.get_info(company_id, tableName.TBL_PURCHASE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const purchaseIDs = purchase.map(pu => pu.purchase_information_id);


            const be04Fields = `id, year,cost,context_description, purchase_information_id, category_id, relevance_id, purchase_does_not_use_phase, hotspot_conducted, potential_hotspot, actual_hotspot, all_high_intensity_hotspot, all_hotspot_have_been_avoided, all_hotspot_from_cradle, company_continuosly, purchase_fitness, comments`;


            for (let i = 0; i < purchase.length; i++) {
                const purchaseId = purchase[i].purchase_information_id;

                const be04Details = await Common.get_info(purchaseId, tableName.TBL_BE04, 'purchase_information_id', `flag_deleted=0`, be04Fields, false, [], false, { field: 'year', order: 'ASC' });
                purchase[i].be04_data = be04Details;


            }

            // const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalData = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `flag_deleted=0`;
                const scoreRows = await Common.get_info(contextIndicatorIDs[i], tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS, 'context_indicator_id', where, 'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }
            // console.log("prodtaa" + progressScores);
            // const t = sites
            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                // goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: { purchase: purchase, purchaseIDs: purchaseIDs, goalIDs: goalIDs },

            });

        }
        catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getFinancialDetails: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;
            const { goal_code } = req.body;


            const selectedFields = 'finanical_id,year,purchase_date,sale_date, financial_asset, financial_asset_id, monetary_value, reporting_period';
            const financialAssets = await Common.get_info(
                company_id,
                tableName.TBL_FINANCIAL_ASSET,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );

            const financialIDs = financialAssets.map(fa => fa.finanical_id);


            const be23Fields = `id,context_description, year,monetary, finanical_id, category_id, relevance_id, 
            financial_asset_does, hotspot_assessmen, potential_hotspots_identified, 
            actual_hotspots, all_high_intensity_hotspot, all_hotspots_have_been, 
            financial_fitness, comments`;

            for (let i = 0; i < financialAssets.length; i++) {
                const finId = financialAssets[i].finanical_id;

                const be23Details = await Common.get_info(
                    finId,
                    tableName.TBL_BE23,
                    'finanical_id',
                    `flag_deleted=0`,
                    be23Fields,
                    false,
                    [],
                    false,
                    { field: 'year', order: 'ASC' }
                );

                financialAssets[i].be23_data = be23Details;
            }


            // const goalData = await Common.get_info(
            //     `'goal_code'`,
            //     tableName.TBL_BREAK_EVEN_GOALS,
            //     'goal_code',
            //     'flag_deleted=0',
            //     'goal_id'
            // );
            const goalData = await Common.get_info(1, tableName.TBL_BREAK_EVEN_GOALS, 1, 'flag_deleted=0');
            const goalIDs = goalData.map(item => item.goal_id);


            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_CONTEXT_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    'flag_deleted=0',
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }


            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    'flag_deleted=0',
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }


            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: {
                    financialAssets: financialAssets,
                    financialIDs: financialIDs,
                    goalIDs: goalIDs
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },




    getSiteDetailsCompanyWise: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;

            const year = req.params.year;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            if (!sites.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        sites: {
                            sites: [],
                            be01_data: [],
                            be02_data: [],
                            be03_data: [],
                            be05_data: [],
                            be06_data: [],
                            be07_data: [],
                            be08_data: [],
                            be09_data: [],
                            be21_data: [],
                            be22_data: []
                        }
                    }
                });
            }
            const siteIds = sites.map(site => site.site_id);
            const siteIdList = siteIds.map(id => `${id}`).join(',');
            const be01Fields = `  id, relevance_id, fit_entry_id,site_id,amount_of_renewable_energy_used, total_amount_of_energy_used, site_fitness, comments,year`;

            const be02Fields = `  id, year,relevance_id, fit_entry_id,site_id,water_consumption_fit_sources, water_consumption_unfit_sources,commercial_water_consumption_offset,water_consumed_by_workers_fit_sources,water_consumed_by_workers_unfit_sources,commercial_water_consumption_fit_source,commercial_water_consumption_unfit_source,total_commercial_water_consumption, site_fitness, Relevance_id_2,fit_discharged_water, total_discharged_water,site_fitness1, comments`;

            const be03Fields = ` id, year, relevance_id,  natural_resource, resource_id, natural_resource_id, location, value_of_natural_resource, common_fitness_criteria_id,renewable_respect_regeneration_rates, renewable_ecosystem_health,  renewable_aquatic_protection,  renewable_invasive_species_control,  renewable_no_destructive_techniques,renewable_sourcing_industry_standards,  animal_welfare_maintained,  animal_no_endangered_hunting,  animalSourcingstandards, nonrenewable_sourcing_industry_standards, nonrenewable_no_conflict_or_hr_violation,nonrenewable_no_destructive_extraction, nonrenewable_ecosystem_health_maintained,  nonrenewable_ecosystem_production_impact_control,resource_fitness_percent,  comments`;

            const be05Fields = `  id, year ,fit_entry_id,site_id,relevance_id_gaseous,gaseous_reference_year,gaseous_reporting_year,gaseous_site_fitness_percent,relevance_id_liquid,liquid_reference_year,liquid_reporting_year,liquid_site_fitness_percent,relevance_id_solid,solid_reference_year,solid_reporting_year,solid_site_fitness_percent, comments`;

            const be06Fields = `  id, year, fit_entry_id,relevance_id,site_id,no_ghg_emission_id,ghg_reference_year,ghg_reporting_year,ghg_adequately_offset,site_fitness_percent, comments`;

            const be07Fields = `  id, year,fit_entry_id,site_id,relevance_id,site_assessed_waste_id,waste_reference_year,waste_reporting_year,site_fitness_percent, comments`;

            const be08Fields = `  id, year, fit_entry_id,site_id, relevance_id,site_area,local_impact_identified,value_area_identified,value_area_protected,no_impact_on_pristine_ecosystems,land_rights_uncontested,community_consent_obtained,past_damage_neutralized,site_fitness_percent, comments`;

            const be09Fields = `  id, year, fit_entry_id,site_id, relevance_id,assessment_conducted,affected_communities_identified,communities_at_risk,mechanism_inclusive,stakeholders_involved_in_mechanism_design,concerns_resolved_timely,info_accessible,info_communicated,appropriate_communication_channels,responsible_party_assigned,access_to_neutral_advice,users_informed,complaint_publicly_viewable,user_feedback_collected,performance_monitored,improvements_implemented,community_consultation_prior_activities,site_fitness_percentage, comments`;

            const be21Fields = `id, year,fit_entry_id,companyis_mnc,not_relevant_for_nonprofit,public_website,public_tax_appointed,public_tax_strategy,public_tax_marketed,public_tax_no_tax,public_tax_direct,public_tax_stated,public_tax_independent,public_tax_discloses,tax_policies_totalescore,transparency_company,transparency_evidence,transparency_address,transparency_ultimate,transparency_totalescore,taxrate_reconciliation,taxrate_current,taxrate_narrative,taxrate_deferred,taxrate_totalescore,country_by_residence,country_by_net_asset_value,country_by_net_period_provided,country_by_income,country_by_current_tax_charge,country_by_average_number,country_by_total_context_score ,comments`;

            const be22Fields = `id, year,fit_entry_id,Lobbying_seek_to_influence,Lobbying_supporting_individuals,Lobbying_specific_positions,Lobbying_all_departments,contributions_directly_undertake,contributions_diligence_before,contributions_recipient_engages,contributions_due_diligence,contributions_regular_review,contributions_clear_guidance,disclosure_recipient_name,disclosure_amount,disclosure_date_of_contribution,disclosure_company_raised ,comments`;

            const be01Details = await Common.get_info(company_id, tableName.TBL_BE01, 'company_id', `flag_deleted=0 AND year='${year}' AND site_id IN (${siteIdList})`, be01Fields);


            const be02Details = await Common.get_info(company_id, tableName.TBL_BE02, 'company_id', `flag_deleted=0 AND year='${year}' AND site_id IN (${siteIdList})`, be02Fields);

            const be03Details = await Common.get_info(company_id, tableName.TBL_BE03, 'company_id', `flag_deleted=0 AND  year='${year}' AND site_id IN (${siteIdList})`, be03Fields);

            const be05Details = await Common.get_info(company_id, tableName.TBL_BE05, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' AND site_id IN (${siteIdList})`, be05Fields);

            const be06Details = await Common.get_info(company_id, tableName.TBL_BE06, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' AND site_id IN (${siteIdList})`, be06Fields);

            const be07Details = await Common.get_info(company_id, tableName.TBL_BE07, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' AND site_id IN (${siteIdList})`, be07Fields);

            const be08Details = await Common.get_info(company_id, tableName.TBL_BE08, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' AND site_id IN (${siteIdList})`, be08Fields);

            const be09Details = await Common.get_info(company_id, tableName.TBL_BE09, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' AND site_id IN (${siteIdList})`, be09Fields);

            const be21Details = await Common.get_info(company_id, tableName.TBL_BE21, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}' `, be21Fields);

            const be22Details = await Common.get_info(company_id, tableName.TBL_BE22, 'company_id', `flag_deleted=0 AND company_id = ${company_id} AND year='${year}'`, be22Fields);

            const data = {
                sites: sites,
                be01_data: be01Details,
                be02_data: be02Details,
                be03_data: be03Details,
                be05_data: be05Details,
                be06_data: be06Details,
                be07_data: be07Details,
                be08_data: be08Details,
                be09_data: be09Details,
                be21_data: be21Details,
                be22_data: be22Details
            };


            res.status(200).json({
                success: true,
                data: { sites: data },
            });

        }
        catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getSiteDetailsCompanyAllYears: async function (req, res) {
        try {

            const company_id = req.userData.CompanyID;
            const beCode = req.params.beCode?.toUpperCase();

            const selectedFields =
                'site_id,site_name,site_id_manual,location';

            const sites = await Common.get_info(
                company_id,
                tableName.TBL_SITE_INFORMATION,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );

            if (!sites.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        sites: [],
                        beData: [],
                        context_indicator: null
                    }
                });
            }

            const siteIds = sites.map(site => site.site_id);
            const siteIdList = siteIds.join(',');
            let table = '';
            let fields = '';
            let goalId = 0;
            let useSiteFilter = true;
            switch (beCode) {

                case 'BE01':
                    table = tableName.TBL_BE01;
                    goalId = 2;
                    fields = ` id, relevance_id, fit_entry_id, site_id, amount_of_renewable_energy_used,  total_amount_of_energy_used,  site_fitness, comments, year`;
                    break;
                case 'BE02':
                    table = tableName.TBL_BE02;
                    goalId = 3;
                    fields = ` id, year,relevance_id, fit_entry_id,site_id,water_consumption_fit_sources, water_consumption_unfit_sources,commercial_water_consumption_offset,water_consumed_by_workers_fit_sources,water_consumed_by_workers_unfit_sources,commercial_water_consumption_fit_source,commercial_water_consumption_unfit_source,total_commercial_water_consumption, site_fitness, Relevance_id_2,fit_discharged_water, total_discharged_water,site_fitness1, comments`;
                    break;
                case 'BE03':
                    table = tableName.TBL_BE03;
                    goalId = 4;
                    fields = ` id, year, relevance_id,  natural_resource, resource_id, natural_resource_id, location, value_of_natural_resource, common_fitness_criteria_id,renewable_respect_regeneration_rates, renewable_ecosystem_health,  renewable_aquatic_protection,  renewable_invasive_species_control,  renewable_no_destructive_techniques,renewable_sourcing_industry_standards,  animal_welfare_maintained,  animal_no_endangered_hunting,  animalSourcingstandards, nonrenewable_sourcing_industry_standards, nonrenewable_no_conflict_or_hr_violation,nonrenewable_no_destructive_extraction, nonrenewable_ecosystem_health_maintained,  nonrenewable_ecosystem_production_impact_control,resource_fitness_percent,  comments`;
                    break;
                case 'BE05':
                    table = tableName.TBL_BE05;
                    goalId = 5;
                    fields = ` id, year ,fit_entry_id,site_id,relevance_id_gaseous,gaseous_reference_year,gaseous_reporting_year,gaseous_site_fitness_percent,relevance_id_liquid,liquid_reference_year,liquid_reporting_year,liquid_site_fitness_percent,relevance_id_solid,solid_reference_year,solid_reporting_year,solid_site_fitness_percent, comments`;
                    break;

                case 'BE06':
                    table = tableName.TBL_BE06;
                    goalId = 7;
                    fields = `id, year, fit_entry_id,relevance_id,site_id,no_ghg_emission_id,ghg_reference_year,ghg_reporting_year,ghg_adequately_offset,site_fitness_percent, comments`;
                    break;

                case 'BE07':
                    table = tableName.TBL_BE07;
                    goalId = 8;
                    fields = `id, year,fit_entry_id,site_id,relevance_id,site_assessed_waste_id,waste_reference_year,waste_reporting_year,site_fitness_percent, comments`;
                    break;

                case 'BE08':
                    table = tableName.TBL_BE08;
                    goalId = 9;
                    fields = `id, year, fit_entry_id,site_id, relevance_id,site_area,local_impact_identified,value_area_identified,value_area_protected,no_impact_on_pristine_ecosystems,land_rights_uncontested,community_consent_obtained,past_damage_neutralized,site_fitness_percent, comments`;
                    break;
                case 'BE09':
                    table = tableName.TBL_BE09;
                    goalId = 10;
                    fields = `id, year, fit_entry_id,site_id, relevance_id,assessment_conducted,affected_communities_identified,communities_at_risk,mechanism_inclusive,stakeholders_involved_in_mechanism_design,concerns_resolved_timely,info_accessible,info_communicated,appropriate_communication_channels,responsible_party_assigned,access_to_neutral_advice,users_informed,complaint_publicly_viewable,user_feedback_collected,performance_monitored,improvements_implemented,community_consultation_prior_activities,site_fitness_percentage, comments`;
                    break;


                case 'BE21':
                    table = tableName.TBL_BE21;
                    goalId = 23;
                    useSiteFilter = false;
                    fields = `id, year,fit_entry_id,companyis_mnc,not_relevant_for_nonprofit,public_website,public_tax_appointed,public_tax_strategy,public_tax_marketed,public_tax_no_tax,public_tax_direct,public_tax_stated,public_tax_independent,public_tax_discloses,tax_policies_totalescore,transparency_company,transparency_evidence,transparency_address,transparency_ultimate,transparency_totalescore,taxrate_reconciliation,taxrate_current,taxrate_narrative,taxrate_deferred,taxrate_totalescore,country_by_residence,country_by_net_asset_value,country_by_net_period_provided,country_by_income,country_by_current_tax_charge,country_by_average_number,country_by_total_context_score ,comments`;
                    break;

                case 'BE22':
                    table = tableName.TBL_BE22;
                    goalId = 19;
                    useSiteFilter = false;
                    fields = `id, year,fit_entry_id,amount_contributed_toLobby,Lobbying_seek_to_influence,Lobbying_supporting_individuals,Lobbying_specific_positions,Lobbying_all_departments,contributions_directly_undertake,contributions_diligence_before,contributions_recipient_engages,contributions_due_diligence,contributions_regular_review,contributions_clear_guidance,disclosure_recipient_name,disclosure_amount,disclosure_date_of_contribution,disclosure_company_raised,comments`;
                    break;


                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid BE Code'
                    });
            }
            let whereCondition = `flag_deleted = 0 AND company_id = ${company_id} `;

            if (useSiteFilter) {
                whereCondition += `  AND site_id IN (${siteIdList}) `;
            }
            const beData = await Common.get_info(
                company_id,
                table,
                'company_id',
                whereCondition,
                fields
            );
            // the BE21 and BE22 the some things the site 
            // const beData = await Common.get_info(
            //     company_id,
            //     table,
            //     'company_id',
            //     `flag_deleted = 0
            //  AND company_id = ${company_id}
            //  AND site_id IN (${siteIdList})`,
            //     fields
            // );

            beData.sort((a, b) => Number(a.year) - Number(b.year));
            const contextIndicator = await Common.get_info(
                goalId,
                tableName.TBL_BE_CONTEXT_INDICATOR,
                'goal_id',
                'flag_deleted = 0',
                'context_indicator_id, context_indicator, unit'
            );

            return res.status(200).json({
                success: true,
                data: {
                    sites,
                    beData,
                    context_indicator:
                        contextIndicator.length > 0
                            ? contextIndicator[0]
                            : null
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getEmployeeDetailsCompanyAllYears: async function (req, res) {
        try {

            const company_id = req.userData.CompanyID;
            const beCode = req.params.beCode?.toUpperCase();

            const selectedFields =
                'employee_id, employee_group, group_id, location, site, company_id, number_of_employees, year';

            const employees = await Common.get_info(
                company_id,
                tableName.TBL_EMPLOYEE,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );

            if (!employees.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        employees: [],
                        beData: [],
                        context_indicator: null
                    }
                });
            }

            const employeeIds = employees.map(x => x.employee_id);
            const employeeIdList = employeeIds.join(',');

            let table = '';
            let fields = '';
            let goalId = 0;

            switch (beCode) {
                case 'BE10':
                    table = tableName.TBL_BE10;
                    goalId = 11;
                    fields = `id, fit_entry_id,number_of_employees,employee_id,relevance_id,hazard_controls_in_place,risk_assessment_done,risk_training_provided,safety_policies_monitored,anti_bullying_policy,flexible_work_conditions,stress_guidance_access,health_issue_support_policy,smoke_free_work_environment,smoke_free_communal_areas,healthy_eating_access,work_breaks_allowed,flexible_breaks_for_exercise,site_fitness_percentage,year, comments`;
                    break;
                case 'BE11':
                    table = tableName.TBL_BE11;
                    goalId = 12;
                    fields = `id, fit_entry_id, number_of_employees,employee_id, relevance_id,year, number_of_employees_living_wage, employee_fitness_percentage, comments`;
                    break;

                case 'BE12':
                    table = tableName.TBL_BE12;
                    goalId = 13;
                    fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, no_child_labour, fair_employment_status, 
                     freedom_of_association, fair_working_hours, overtime_compensation, right_to_refuse_irregular_work, 
                     reasonable_schedule_notice, holiday_entitlement, weekly_rest_day, maternity_paternity_leave, 
                     employee_fitness_percentage, comments`;
                    break;

                case 'BE13':
                    table = tableName.TBL_BE13;
                    goalId = 14;
                    fields = `id, fit_entry_id, employee_id, number_of_employees,relevance_id, year,clear_policy_commitment, senior_official_responsible, 
                     policy_communicated, policy_in_hr_practices, reporting_procedure_available, actions_and_feedback_documented, 
                     control_effectiveness_assessed, controls_adjusted_if_needed, employee_fitness_percentage, comments`;
                    break;

                case 'BE14':
                    table = tableName.TBL_BE14;
                    goalId = 15;
                    fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, design_involvement, issue_scope_inclusive,
                     timely_resolution, active_communication, confidentiality_protection, responsibility_assigned,
                     independent_advice_access, full_information_during_process, consulted_on_changes,
                     feedback_requested, performance_monitored, feedback_included_in_assessment,
                     improvements_implemented, employee_fitness_percentage, comments`;
                    break;

                case 'BE20':
                    table = tableName.TBL_BE20;
                    goalId = 22;
                    fields = `id, fit_entry_id,number_of_employees,relevance_id, year,hotspot_assessment,hotspot_Procedures,ethics_inplace,ethics_positions,internal_breaches,internal_issues,internal_employees,internal_processes,employee_fitness_percentage,comments`;
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid BE Code'
                    });
            }

            const beData = await Common.get_info(
                company_id,
                table,
                'company_id',
                `flag_deleted = 0
             AND company_id = ${company_id}
             AND employee_id IN (${employeeIdList})`,
                fields
            );

            beData.sort((a, b) => Number(a.year) - Number(b.year));

            const contextIndicator = await Common.get_info(
                goalId,
                tableName.TBL_BE_CONTEXT_INDICATOR,
                'goal_id',
                'flag_deleted = 0',
                'context_indicator_id, context_indicator, unit'
            );

            return res.status(200).json({
                success: true,
                data: {
                    employees,
                    beData,
                    context_indicator:
                        contextIndicator.length > 0
                            ? contextIndicator[0]
                            : null
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    // getSiteDetailsCompanyAllYears: async function (req, res) {
    //     try {
    //         const company_id = req.userData.CompanyID;
    //         const selectedFields =
    //             'site_id,site_name,site_id_manual,location';
    //         const sites = await Common.get_info(
    //             company_id,
    //             tableName.TBL_SITE_INFORMATION,
    //             'company_id',
    //             'flag_deleted = 0 AND is_active = 1',
    //             selectedFields
    //         );
    //         if (!sites.length) {
    //             return res.status(200).json({
    //                 success: true,
    //                 data: {
    //                     sites: [],
    //                     be01_data: []
    //                 }
    //             });
    //         }
    //         const siteIds = sites.map(site => site.site_id);
    //         const siteIdList = siteIds.join(',');
    //         const be01Fields = `
    //         id,
    //         relevance_id,
    //         fit_entry_id,
    //         site_id,
    //         amount_of_renewable_energy_used,
    //         total_amount_of_energy_used,
    //         site_fitness,
    //         comments,
    //         year
    //     `;


    //         const be01Details = await Common.get_info(
    //             company_id,
    //             tableName.TBL_BE01,
    //             'company_id',
    //             `flag_deleted = 0 
    //          AND company_id = ${company_id}
    //          AND site_id IN (${siteIdList})`,
    //             be01Fields
    //         );
    //         be01Details.sort((a, b) => Number(a.year) - Number(b.year));
    //         const be01ContextIndicator = await Common.get_info(
    //             2,
    //             tableName.TBL_BE_CONTEXT_INDICATOR,
    //             'goal_id',
    //             'flag_deleted = 0',
    //             'context_indicator_id, context_indicator, unit'
    //         );
    //         const data = {
    //             sites: sites,
    //             be01_data: be01Details,
    //             context_indicator: be01ContextIndicator.length > 0
    //                 ? be01ContextIndicator[0]
    //                 : null
    //         };
    //         return res.status(200).json({
    //             success: true,
    //             data: data
    //         });

    //     } catch (error) {
    //         console.error(
    //             "Error in getSiteDetailsCompanyAllYears:",
    //             error
    //         );
    //         return res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error",
    //             error: error
    //         });

    //     }
    // },
    getEmployeeDetailsCompanyWise: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;
            const year = req.params.year;
            const fit_entry_id = req.params.fit_id;


            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees,year';
            const employees = await Common.get_info(company_id, tableName.TBL_EMPLOYEE, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);

            if (!employees.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        employees: {
                            employees: [],
                            be10_data: [],
                            be11_data: [],
                            be12_data: [],
                            be13_data: [],
                            be14_data: [],
                            be20_data: []
                        }
                    }
                });
            }
            const employeeIDs = employees.map(employee => employee.employee_id);


            // const employeeIdList = employeeIDs.map(id => `'${id}'`).join(',');
            const employeeIdList = employeeIDs.map(id => `${id}`).join(',');
            const be10Fields = `id, fit_entry_id,number_of_employees,employee_id,relevance_id,hazard_controls_in_place,risk_assessment_done,risk_training_provided,safety_policies_monitored,anti_bullying_policy,flexible_work_conditions,stress_guidance_access,health_issue_support_policy,smoke_free_work_environment,smoke_free_communal_areas,healthy_eating_access,work_breaks_allowed,flexible_breaks_for_exercise,site_fitness_percentage,year, comments`;

            const be11Fields = `id, fit_entry_id, number_of_employees,employee_id, relevance_id,year, number_of_employees_living_wage, employee_fitness_percentage, comments`;

            const be12Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, no_child_labour, fair_employment_status, 
            freedom_of_association, fair_working_hours, overtime_compensation, right_to_refuse_irregular_work, 
            reasonable_schedule_notice, holiday_entitlement, weekly_rest_day, maternity_paternity_leave, 
            employee_fitness_percentage, comments`;

            const be13Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id, year,clear_policy_commitment, senior_official_responsible, 
            policy_communicated, policy_in_hr_practices, reporting_procedure_available, actions_and_feedback_documented, 
            control_effectiveness_assessed, controls_adjusted_if_needed, employee_fitness_percentage, comments`;

            const be14Fields = `id, fit_entry_id,number_of_employees, employee_id, relevance_id,year, design_involvement, issue_scope_inclusive,
            timely_resolution, active_communication, confidentiality_protection, responsibility_assigned,
            independent_advice_access, full_information_during_process, consulted_on_changes,
            feedback_requested, performance_monitored, feedback_included_in_assessment,
            improvements_implemented, employee_fitness_percentage, comments`;

            const be20Fields = `id, fit_entry_id,number_of_employees,relevance_id, year,hotspot_assessment,hotspot_Procedures,ethics_inplace,ethics_positions,internal_breaches,internal_issues,internal_employees,internal_processes,employee_fitness_percentage,comments`;



            const be10Details = await Common.get_info(company_id, tableName.TBL_BE10, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be10Fields);

            const be11Details = await Common.get_info(company_id, tableName.TBL_BE11, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be11Fields);

            const be12Details = await Common.get_info(company_id, tableName.TBL_BE12, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be12Fields);

            const be13Details = await Common.get_info(company_id, tableName.TBL_BE13, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be13Fields);

            const be14Details = await Common.get_info(company_id, tableName.TBL_BE14, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be14Fields);

            const be20Details = await Common.get_info(company_id, tableName.TBL_BE20, 'company_id', `flag_deleted=0 AND year='${year}' AND employee_id IN (${employeeIdList})`, be20Fields);

            const data = {
                employees: employees,
                be10_data: be10Details,
                be11_data: be11Details,
                be12_data: be12Details,
                be13_data: be13Details,
                be14_data: be14Details,
                be20_data: be20Details

            };


            res.status(200).json({
                success: true,
                data: { employees: data },
            });



        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getProductDetailsCompanyAllYears: async function (req, res) {
        try {

            const company_id = req.userData.CompanyID;
            const beCode = req.params.beCode?.toUpperCase();

            const selectedFields =
                'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';

            const products = await Common.get_info(
                company_id,
                tableName.TBL_PRODUCT,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );

            if (!products.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        products: [],
                        beData: [],
                        context_indicator: null
                    }
                });
            }

            const productIds = products.map(x => x.product_id);
            const productIdList = productIds.join(',');

            let table = '';
            let fields = '';
            let goalId = 0;

            switch (beCode) {

                case 'BE15':
                    table = tableName.TBL_BE15;
                    goalId = 16;
                    fields = `id, year,revenue, fit_entry_id,product_id,relevance_id,user_groups_communicationplans,communications_are_considered,communications_crucial_information,communications_product_information,purchase_information_needed,purchase_physical_goods,purchase_nature_andquantities,purchase_characteristics_ofproducts,purchase_ambiguous_term,purchase_comparative,purchase_user_groups,use_users_provided,use_nutrition_information,use_with_guidance,use_guidance_provided,post_physical_good,post_improper_disposal,product_fitness_percentage,comments`;
                    break;

                case 'BE16':
                    table = tableName.TBL_BE16;
                    goalId = 17;
                    fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,legitimacy,positive_outcomes,accessibility,reduce_uncertainty,fairness_concerns_investigated,fairness_policies_consult,transparency_throughout_investigation,transparency_process_investigating,transparency_valid_acknowledged,transparency_alternatively_investigation,engage_actively,improve_continuously_performance,improve_continuously_implement,product_fitness_percentage,progress_indicators,comments`;
                    break;

                case 'BE17':
                    table = tableName.TBL_BE17 + ' as b';
                    goalId = 18;
                    fields = `id, b.year, p.product_type as product_type_id,pt.product_typename as product_type_name,relevance_id, revenue,fit_entry_id,b.product_id,GDMMUsePhase,GDMMendOfLife,physical_weapon,physical_consumable,physical_environmentally_use,physical_environmentally_end,GFUPEusePhase,GFUPEendOfLife,physical_substances_use,physical_substances_end,intermediate_physical,intermediate_representative,intermediate_classified_use,intermediate_classified_end,services_negative,services_harm,services_physical,services_behaviours,services_infrastructure,product_fitness_usephase,product_fitness_end,progress_indicators_service_use,progress_indicators_service_end,progress_indicators_supp_use,progress_indicators_supp_end,comments`;
                    joins = [
                        {
                            type: 'LEFT',
                            table: tableName.TBL_PRODUCT + ' as p',
                            on: 'p.product_id = b.product_id'
                        },
                        {
                            type: 'LEFT',
                            table: tableName.TBL_PRODUCTTYPE + ' as pt',
                            on: 'pt.product_type_id = p.product_type'
                        }
                    ];
                    break;
                case 'BE18':
                    table = tableName.TBL_BE18;
                    goalId = 20;
                    fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,fitness_ghg,fitness_emission,number_unit_sold,product_fitness_percentage,comments`;
                    break;
                case 'BE19':
                    table = tableName.TBL_BE19 + ' as b';
                    goalId = 21;
                    fields = `id, b.year,p.product_type as product_type_id,pt.product_typename as product_type_name, revenue,fit_entry_id,b.product_id,relevance_id,numberof_distinct,fitness1_repurposing,fitness1_sold,fitness2_repurposing,fitness2_sold,fitness3_repurposing,fitness3_sold,fitness4_repurposing,fitness4_sold,fitness5_repurposing,fitness5_sold,fitness6_repurposing,fitness6_sold,fitness7_repurposing, fitness7_sold,fitness8_repurposing,fitness8_sold,fitness9_repurposing,fitness9_sold,fitness10_repurposing,fitness10_sold,product_fitness_percentage,comments`;
                    joins = [
                        {
                            type: 'LEFT',
                            table: tableName.TBL_PRODUCT + ' as p',
                            on: 'p.product_id = b.product_id'
                        },
                        {
                            type: 'LEFT',
                            table: tableName.TBL_PRODUCTTYPE + ' as pt',
                            on: 'pt.product_type_id = p.product_type'
                        }
                    ];
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid BE Code'
                    });
            }
            const useAlias = ['BE17', 'BE19'].includes(beCode);
            const beData = await Common.get_info(
                company_id,
                table,
                useAlias ? 'b.company_id' : 'company_id',
                `
        ${useAlias ? 'b.' : ''}flag_deleted = 0
        AND ${useAlias ? 'b.' : ''}company_id = ${company_id}
        AND ${useAlias ? 'b.' : ''}product_id IN (${productIdList})
    `,
                fields,false,joins
            );

            beData.sort((a, b) => Number(a.year) - Number(b.year));

            const contextIndicator = await Common.get_info(
                goalId,
                tableName.TBL_BE_CONTEXT_INDICATOR,
                'goal_id',
                'flag_deleted = 0',
                'context_indicator_id, context_indicator, unit'
            );

            return res.status(200).json({
                success: true,
                data: {
                    products,
                    beData,
                    context_indicator:
                        contextIndicator.length > 0
                            ? contextIndicator[0]
                            : null
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },

    getProductDetailsCompanyWise: async function (req, res) {
        try {
            const company_id = req.userData.CompanyID;
            const year = req.params.year;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id,year';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            if (!productIDs.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        products: {
                            products: [],
                            be15_data: [],
                            be16_data: [],
                            be17_data: [],
                            be18_data: [],
                            be19_data: []
                        }
                    }
                });
            }
            const productIdList = productIDs.map(id => `${id}`).join(',')
            const be15Fields = `id, year, revenue,fit_entry_id,product_id,relevance_id,user_groups_communicationplans,communications_are_considered,communications_crucial_information,communications_product_information,purchase_information_needed,purchase_physical_goods,purchase_nature_andquantities,purchase_characteristics_ofproducts,purchase_ambiguous_term,purchase_comparative,purchase_user_groups,use_users_provided,use_nutrition_information,use_with_guidance,use_guidance_provided,post_physical_good,post_improper_disposal,product_fitness_percentage,comments`;

            const be16Fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,legitimacy,positive_outcomes,accessibility,reduce_uncertainty,fairness_concerns_investigated,fairness_policies_consult,transparency_throughout_investigation,transparency_process_investigating,transparency_valid_acknowledged,transparency_alternatively_investigation,engage_actively,improve_continuously_performance,improve_continuously_implement,product_fitness_percentage,progress_indicators,comments`;
            const be17Join = [{ type: 'LEFT', table: tableName.TBL_PRODUCT + ' as p', on: 'p.product_id = b.product_id' },
            {
                type: 'LEFT',
                table: tableName.TBL_PRODUCTTYPE + ' as pt',
                on: 'pt.product_type_id = p.product_type'
            }
            ];
            const be17Fields = `id, b.year, p.product_type as product_type_id,pt.product_typename as product_type_name,relevance_id, revenue,fit_entry_id,b.product_id,GDMMUsePhase,GDMMendOfLife,physical_weapon,physical_consumable,physical_environmentally_use,physical_environmentally_end,GFUPEusePhase,GFUPEendOfLife,physical_substances_use,physical_substances_end,intermediate_physical,intermediate_representative,intermediate_classified_use,intermediate_classified_end,services_negative,services_harm,services_physical,services_behaviours,services_infrastructure,product_fitness_usephase,product_fitness_end,progress_indicators_service_use,progress_indicators_service_end,progress_indicators_supp_use,progress_indicators_supp_end,comments`;

            const be18Fields = `id, year,revenue,fit_entry_id,product_id,relevance_id,fitness_ghg,fitness_emission,number_unit_sold,product_fitness_percentage,comments`;

            const be19Fields = `id, b.year,p.product_type as product_type_id,pt.product_typename as product_type_name, revenue,fit_entry_id,b.product_id,relevance_id,numberof_distinct,fitness1_repurposing,fitness1_sold,fitness2_repurposing,fitness2_sold,fitness3_repurposing,fitness3_sold,fitness4_repurposing,fitness4_sold,fitness5_repurposing,fitness5_sold,fitness6_repurposing,fitness6_sold,fitness7_repurposing, fitness7_sold,fitness8_repurposing,fitness8_sold,fitness9_repurposing,fitness9_sold,fitness10_repurposing,fitness10_sold,product_fitness_percentage,comments`;

            const be15Details = await Common.get_info(company_id, tableName.TBL_BE15, 'company_id', `flag_deleted=0 AND year='${year}' AND product_id IN (${productIdList})`, be15Fields);


            const be16Details = await Common.get_info(company_id, tableName.TBL_BE16, 'company_id', `flag_deleted=0 AND year='${year}' AND product_id IN (${productIdList})`, be16Fields);

            const be17Details = await Common.get_info(
                company_id,
                tableName.TBL_BE17 + ' as b',
                'b.company_id',
                `b.flag_deleted=0 AND b.year='${year}' AND b.product_id IN (${productIdList})`,
                be17Fields + ', p.product_type as product_type_id, pt.product_typename as product_type_name',
                false,
                be17Join
            );


            const be18Details = await Common.get_info(company_id, tableName.TBL_BE18, 'company_id', `flag_deleted=0 AND year='${year}' AND product_id IN (${productIdList})`, be18Fields);
            //products[i].be18_data = be18Details;
            const be19Details = await Common.get_info(
                company_id,
                tableName.TBL_BE19 + ' as b',
                'b.company_id',
                `b.flag_deleted=0 AND b.year='${year}' AND b.product_id IN (${productIdList})`,
                be19Fields + ', p.product_type as product_type_id, pt.product_typename as product_type_name',
                false,
                be17Join
            );


            const data = {
                products: products,
                be15_data: be15Details,
                be16_data: be16Details,
                be17_data: be17Details,
                be18_data: be18Details,
                be19_data: be19Details
            };

            res.status(200).json({
                success: true,
                data: { products: data },
            });


        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE02Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be02Fields = `  id, relevance_id, fit_entry_id,water_consumption_fit_sources,water_consumption_unfit_sources,commercial_water_consumption_offset,water_consumed_by_workers_fit_sources,water_consumed_by_workers_unfit_sources,commercial_water_consumption_fit_source,commercial_water_consumption_unfit_source,total_commercial_water_consumption, site_fitness,Relevance_id_2,fit_discharged_water,total_discharged_water,site_fitness1, comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be02Details = await Common.get_info(siteId, tableName.TBL_BE02, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be02Fields);
                sites[i].be02_data = be02Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    // check   
    getBE03Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const be03Fields = `  id, relevance_id, fit_entry_id,natural_resource,natural_resource_id,location,value_of_natural_resource,common_fitness_criteria_id,renewable_respect_regeneration_rates,renewable_ecosystem_health,renewable_aquatic_protection,renewable_invasive_species_control,renewable_no_destructive_techniques,renewable_sourcing_industry_standards,animal_welfare_maintained,animal_no_endangered_hunting,animalSourcingstandards,nonrenewable_sourcing_industry_standards,nonrenewable_no_conflict_or_hr_violation,nonrenewable_no_destructive_extraction,nonrenewable_ecosystem_health_maintained,nonrenewable_ecosystem_production_impact_control,resource_fitness_percent, comments`;
            const be03Details = await Common.get_info(fit_entry_id, tableName.TBL_BE03, 'fit_entry_id', `fit_entry_id = ${fit_entry_id}`, be03Fields);
            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', '', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: be03Details
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE05Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be05Fields = `  id, fit_entry_id,site_id,relevance_id_gaseous,gaseous_reference_year,gaseous_reporting_year,gaseous_site_fitness_percent,relevance_id_liquid,liquid_reference_year,liquid_reporting_year,liquid_site_fitness_percent,relevance_id_solid,solid_reference_year,solid_reporting_year,solid_site_fitness_percent, comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be05Details = await Common.get_info(siteId, tableName.TBL_BE05, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be05Fields);
                sites[i].be05_data = be05Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE06Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be06Fields = `  id, fit_entry_id,site_id,relevance_id,no_ghg_emission_id,ghg_reference_year,ghg_reporting_year,ghg_adequately_offset,site_fitness_percent, comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be06Details = await Common.get_info(siteId, tableName.TBL_BE06, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be06Fields);
                sites[i].be06_data = be06Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE07Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be07Fields = `  id, fit_entry_id,site_id,relevance_id,site_assessed_waste_id,waste_reference_year,waste_reporting_year,site_fitness_percent,comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be07Details = await Common.get_info(siteId, tableName.TBL_BE07, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be07Fields);
                sites[i].be07_data = be07Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }



            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE08Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;

            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be08Fields = `  id, fit_entry_id,site_id,relevance_id,site_area,local_impact_identified,value_area_identified,value_area_protected,no_impact_on_pristine_ecosystems,land_rights_uncontested,community_consent_obtained,past_damage_neutralized,site_fitness_percent, comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be08Details = await Common.get_info(siteId, tableName.TBL_BE08, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be08Fields);
                sites[i].be08_data = be08Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE09Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'site_id,site_name,site_id_manual,location';
            const sites = await Common.get_info(company_id, tableName.TBL_SITE_INFORMATION, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const siteIDs = sites.map(site => site.site_id);
            const be09Fields = `  id, fit_entry_id,site_id,relevance_id,assessment_conducted,affected_communities_identified,communities_at_risk,mechanism_inclusive,stakeholders_involved_in_mechanism_design,concerns_resolved_timely,info_accessible,info_communicated,appropriate_communication_channels,responsible_party_assigned,access_to_neutral_advice,users_informed,complaint_publicly_viewable,user_feedback_collected,performance_monitored,improvements_implemented,community_consultation_prior_activities,site_fitness_percentage, comments`;
            for (let i = 0; i < sites.length; i++) {
                const siteId = sites[i].site_id;
                const be09Details = await Common.get_info(siteId, tableName.TBL_BE09, 'site_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be09Fields);
                sites[i].be09_data = be09Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: sites
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE11Details: async function (req, res) {
        try {
            const fit_entry_id = req.params.fit_id;
            const { company_id } = req.body;


            const goalIdResult = await Common.selectWhere(
                tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                'be_detail_id'
            );
            const goal_id = goalIdResult?.[0]?.be_detail_id ?? 0;

            const goalCodeData = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_id = ${goal_id} AND flag_deleted = 0`,
                'goal_code'
            );
            const goal_code = goalCodeData?.[0]?.goal_code ?? '';


            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(
                company_id,
                tableName.TBL_EMPLOYEE,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );
            const employeeIDs = employees.map(employee => employee.employee_id);


            const be11Fields = `id, fit_entry_id, employee_id, relevance_id, number_of_employees_living_wage, employee_fitness_percentage, comments`;
            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be11Details = await Common.get_info(
                    employeeID,
                    tableName.TBL_BE11,
                    'employee_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    be11Fields
                );
                employees[i].be11_data = be11Details;
            }


            const goalData = await Common.get_info(
                goal_code,
                tableName.TBL_BREAK_EVEN_GOALS,
                'goal_code',
                'flag_deleted = 0',
                'goal_id'
            );
            const goalIDs = goalData.map(item => item.goal_id);


            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_CONTEXT_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }


            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`;
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }


            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }


            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }


            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: {
                    employees: employees,
                    employeeIDs: employeeIDs,
                    goalIDs: goalIDs
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE12Details: async function (req, res) {
        try {
            const fit_entry_id = req.params.fit_id;
            const { company_id } = req.body;


            const goalIdResult = await Common.selectWhere(
                tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                'be_detail_id'
            );
            const goal_id = goalIdResult?.[0]?.be_detail_id ?? 0;


            const goalCodeData = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_id = ${goal_id} AND flag_deleted = 0`,
                'goal_code'
            );
            const goal_code = goalCodeData?.[0]?.goal_code ?? '';


            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(
                company_id,
                tableName.TBL_EMPLOYEE,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );
            const employeeIDs = employees.map(employee => employee.employee_id);


            const be12Fields = `id, fit_entry_id, employee_id, relevance_id, no_child_labour, fair_employment_status, 
            freedom_of_association, fair_working_hours, overtime_compensation, right_to_refuse_irregular_work, 
            reasonable_schedule_notice, holiday_entitlement, weekly_rest_day, maternity_paternity_leave, 
            employee_fitness_percentage, comments`;

            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be12Details = await Common.get_info(
                    employeeID,
                    tableName.TBL_BE12,
                    'employee_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    be12Fields
                );
                employees[i].be12_data = be12Details;
            }


            const goalData = await Common.get_info(
                goal_code,
                tableName.TBL_BREAK_EVEN_GOALS,
                'goal_code',
                'flag_deleted = 0',
                'goal_id'
            );
            const goalIDs = goalData.map(item => item.goal_id);


            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_CONTEXT_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'context_indicator_id'
                );
                if (contextRows?.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }


            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }


            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'progress_indicator_id'
                );
                if (progressRows?.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }


            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }


            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: {
                    employees: employees,
                    employeeIDs: employeeIDs,
                    goalIDs: goalIDs
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE13Details: async function (req, res) {
        try {
            const fit_entry_id = req.params.fit_id;
            const { company_id } = req.body;


            const goalIdResult = await Common.selectWhere(
                tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                'be_detail_id'
            );
            const goal_id = goalIdResult?.[0]?.be_detail_id ?? 0;


            const goalCodeData = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_id = ${goal_id} AND flag_deleted = 0`,
                'goal_code'
            );
            const goal_code = goalCodeData?.[0]?.goal_code ?? '';


            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(
                company_id,
                tableName.TBL_EMPLOYEE,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );
            const employeeIDs = employees.map(employee => employee.employee_id);


            const be13Fields = `id, fit_entry_id, employee_id, relevance_id, clear_policy_commitment, senior_official_responsible, 
            policy_communicated, policy_in_hr_practices, reporting_procedure_available, actions_and_feedback_documented, 
            control_effectiveness_assessed, controls_adjusted_if_needed, employee_fitness_percentage, comments`;

            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be13Details = await Common.get_info(
                    employeeID,
                    tableName.TBL_BE13,
                    'employee_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    be13Fields
                );
                employees[i].be13_data = be13Details;
            }


            const goalData = await Common.get_info(
                goal_code,
                tableName.TBL_BREAK_EVEN_GOALS,
                'goal_code',
                'flag_deleted = 0',
                'goal_id'
            );
            const goalIDs = goalData.map(item => item.goal_id);


            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_CONTEXT_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'context_indicator_id'
                );
                if (contextRows?.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }


            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }


            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'progress_indicator_id'
                );
                if (progressRows?.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }


            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }


            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: {
                    employees: employees,
                    employeeIDs: employeeIDs,
                    goalIDs: goalIDs
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },

    getBE14Details: async function (req, res) {
        try {
            const fit_entry_id = req.params.fit_id;
            const { company_id } = req.body;


            const goalIdResult = await Common.selectWhere(
                tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                'be_detail_id'
            );
            const goal_id = goalIdResult?.[0]?.be_detail_id ?? 0;


            const goalCodeData = await Common.selectWhere(
                tableName.TBL_BREAK_EVEN_GOALS,
                `goal_id = ${goal_id} AND flag_deleted = 0`,
                'goal_code'
            );
            const goal_code = goalCodeData?.[0]?.goal_code ?? '';


            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(
                company_id,
                tableName.TBL_EMPLOYEE,
                'company_id',
                'flag_deleted = 0 AND is_active = 1',
                selectedFields
            );
            const employeeIDs = employees.map(employee => employee.employee_id);


            const be14Fields = `id, fit_entry_id, employee_id, relevance_id, design_involvement, issue_scope_inclusive,
            timely_resolution, active_communication, confidentiality_protection, responsibility_assigned,
            independent_advice_access, full_information_during_process, consulted_on_changes,
            feedback_requested, performance_monitored, feedback_included_in_assessment,
            improvements_implemented, employee_fitness_percentage, comments`;

            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be14Details = await Common.get_info(
                    employeeID,
                    tableName.TBL_BE14,
                    'employee_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    be14Fields
                );
                employees[i].be14_data = be14Details;
            }


            const goalData = await Common.get_info(
                goal_code,
                tableName.TBL_BREAK_EVEN_GOALS,
                'goal_code',
                'flag_deleted = 0',
                'goal_id'
            );
            const goalIDs = goalData.map(item => item.goal_id);


            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_CONTEXT_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'context_indicator_id'
                );
                if (contextRows?.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }


            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }


            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted = 0',
                    'progress_indicator_id'
                );
                if (progressRows?.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }


            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    `fit_entry_id = ${fit_entry_id} AND flag_deleted = 0`,
                    'score'
                );
                if (scoreRows?.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }


            res.status(200).json({
                success: true,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: {
                    employees: employees,
                    employeeIDs: employeeIDs,
                    goalIDs: goalIDs
                }
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },


    getBE16Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            const be16Fields = `id, fit_entry_id,product_id,relevance_id,legitimacy,positive_outcomes,accessibility,reduce_uncertainty,fairness_concerns_investigated,fairness_policies_consult,transparency_throughout_investigation,transparency_process_investigating,transparency_valid_acknowledged,transparency_alternatively_investigation,engage_actively,improve_continuously_performance,improve_continuously_implement,product_fitness_percentage,comments`;
            for (let i = 0; i < productIDs.length; i++) {
                const productID = products[i].product_id;
                const be16Details = await Common.get_info(productID, tableName.TBL_BE16, 'product_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be16Fields);
                products[i].be16_data = be16Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                productIDs: productIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: products
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE17Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            const be17Fields = `id, fit_entry_id,product_id,relevance_id,physical_good_usephase,physical_weapon,physical_consumable,physical_environmentally_use,physical_environmentally_end,physical_good_end,physical_substances_use,physical_substances_end,intermediate_physical,intermediate_representative,intermediate_classified_use,intermediate_classified_end,services_negative,services_harm,services_physical,services_behaviours,services_infrastructure,product_fitness_usephase,product_fitness_end,comments`;
            for (let i = 0; i < productIDs.length; i++) {
                const productID = products[i].product_id;
                const be17Details = await Common.get_info(productID, tableName.TBL_BE17, 'product_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be17Fields);
                products[i].be17_data = be17Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                productIDs: productIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: products
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE18Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            const be18Fields = `id, fit_entry_id,product_id,relevance_id,fitness_ghg,fitness_emission,number_unit_sold,product_fitness_percentage,comments`;
            for (let i = 0; i < productIDs.length; i++) {
                const productID = products[i].product_id;
                const be18Details = await Common.get_info(productID, tableName.TBL_BE18, 'product_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be18Fields);
                products[i].be18_data = be18Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                productIDs: productIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: products
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE19Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'product_id,company_id,product_type,product_name,product_id_manual,revenue_cost,user_group,user_group_id';
            const products = await Common.get_info(company_id, tableName.TBL_PRODUCT, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const productIDs = products.map(product => product.product_id);
            const be19Fields = `id, fit_entry_id,product_id,relevance_id,numberof_distinct,fitness1_repurposing,fitness1_sold,fitness2_repurposing,fitness2_sold,fitness3_repurposing,fitness3_sold,fitness4_repurposing,fitness4_sold,fitness5_repurposing,fitness5_sold,fitness6_repurposing,fitness6_sold,fitness7_repurposing,fitness7_sold,fitness8_repurposing,fitness8_sold,fitness9_repurposing,fitness9_sold,fitness10_repurposing,fitness10_sold,product_fitness_percentage,comments`;
            for (let i = 0; i < productIDs.length; i++) {
                const productID = products[i].product_id;
                const be19Details = await Common.get_info(productID, tableName.TBL_BE19, 'product_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be19Fields);
                products[i].be19_data = be19Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                productIDs: productIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: products
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE20Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const selectedFields = 'employee_id,employee_group,group_id,location,site,company_id,number_of_employees';
            const employees = await Common.get_info(company_id, tableName.TBL_EMPLOYEE, 'company_id', 'flag_deleted = 0 AND is_active = 1', selectedFields);
            const employeeIDs = employees.map(employee => employee.employee_id);
            const be20Fields = `id, fit_entry_id,employee_id,relevance_id,hotspot_assessment,hotspot_Procedures,ethics_inplace,ethics_positions,internal_breaches,internal_issues,internal_employees,internal_processes,employee_fitness_percentage, comments`;
            for (let i = 0; i < employeeIDs.length; i++) {
                const employeeID = employees[i].employee_id;
                const be20Details = await Common.get_info(employeeID, tableName.TBL_BE20, 'employee_id', `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`, be20Fields);
                employees[i].be20_data = be20Details;
            }

            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', 'flag_deleted=0', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);

            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;

                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                employeeIDs: employeeIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: employees
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE21Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const be21Fields = `id, relevance_id, fit_entry_id,companyis_mnc,public_website,public_tax_appointed,public_tax_strategy,public_tax_marketed,public_tax_no_tax,public_tax_direct,public_tax_stated,public_tax_independent,public_tax_discloses,tax_policies_totalescore,transparency_company,transparency_evidence,transparency_address,transparency_ultimate,transparency_totalescore,taxrate_reconciliation,taxrate_current,taxrate_narrative,taxrate_deferred,taxrate_totalescore,country_by_disclose,country_by_residence,country_by_net_asset_value,country_by_net_period_provided,country_by_income,country_by_current_tax_charge,country_by_average_number,country_by_total_context_score`;
            const be21Details = await Common.get_info(fit_entry_id, tableName.TBL_BE21, 'fit_entry_id', `fit_entry_id = ${fit_entry_id}`, be21Fields);
            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', '', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);
            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: be21Details
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },
    getBE22Details: async function (req, res) {
        try {
            const company_id = req.params.company_id;
            const { fit_entry_id, goal_code } = req.body;
            const be22Fields = `id, relevance_id, fit_entry_id,Lobbying_seek_to_influence,Lobbying_supporting_individuals,Lobbying_specific_positions,Lobbying_all_departments,contributions_directly_undertake,contributions_diligence_before,contributions_recipient_engages,contributions_due_diligence,contributions_regular_review,contributions_clear_guidance,disclosure_recipient_name,disclosure_amount,disclosure_date_of_contribution,disclosure_company_raised`;
            const be22Details = await Common.get_info(fit_entry_id, tableName.TBL_BE22, 'fit_entry_id', `fit_entry_id = ${fit_entry_id}`, be22Fields);
            const goalData = await Common.get_info(goal_code, tableName.TBL_BREAK_EVEN_GOALS, 'goal_code', '', 'goal_id');
            const goalIDs = goalData.map(item => item.goal_id);
            let contextIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const contextRows = await Common.get_info(goalIDs[i], tableName.TBL_BE_CONTEXT_INDICATOR, 'goal_id', 'flag_deleted=0', 'context_indicator_id'
                );
                if (contextRows && contextRows.length > 0) {
                    contextIndicatorIDs.push(...contextRows.map(row => row.context_indicator_id));
                }
            }

            let contextScores = [];
            for (let i = 0; i < contextIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    contextIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_CONTEXT_INDICATORS,
                    'context_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    contextScores.push(...scoreRows.map(row => row.score));
                }
            }

            let progressIndicatorIDs = [];
            for (let i = 0; i < goalIDs.length; i++) {
                const progressRows = await Common.get_info(
                    goalIDs[i],
                    tableName.TBL_BE_PROGRESS_INDICATOR,
                    'goal_id',
                    'flag_deleted=0',
                    'progress_indicator_id'
                );
                if (progressRows && progressRows.length > 0) {
                    progressIndicatorIDs.push(...progressRows.map(row => row.progress_indicator_id));
                }
            }

            let progressScores = [];
            for (let i = 0; i < progressIndicatorIDs.length; i++) {
                const where = `fit_entry_id = ${fit_entry_id} AND flag_deleted=0`;
                const scoreRows = await Common.get_info(
                    progressIndicatorIDs[i],
                    tableName.TBL_COMPANY_BE_PROGRESS_INDICATORS,
                    'progress_indicator_id',
                    where,
                    'score'
                );
                if (scoreRows && scoreRows.length > 0) {
                    progressScores.push(...scoreRows.map(row => row.score));
                }
            }

            res.status(200).json({
                success: true,
                // siteIDs: siteIDs,
                goal_ids: goalIDs,
                context_indicator_ids: contextIndicatorIDs,
                context_scores: contextScores,
                progress_indicator_ids: progressIndicatorIDs,
                progress_scores: progressScores,
                data: be22Details
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },

    datatable: async function (req, res) {
        try {

            var page = req.query.page ? req.query.page : 1;
            var offset = req.query.page ? req.query.page : 1;
            var filter = req.query.filter ? req.query.filter : '';
            var per_page = req.query.per_page ? req.query.per_page : 10;


            var filterWhere = '1=1';
            if (filter != '') {
                filterWhere += ' AND (fit.future_fit_name LIKE "%' + filter + '%" OR fit.fit_year LIKE "%' + filter + '%" OR fit.fit_month LIKE "%' + filter + '%" OR sts.status_name LIKE "%' + filter + '%")'
            }
            if (req.userData.RoleID != 1) {
                filterWhere += ' AND fit.company_id = ' + req.userData.CompanyID;
            }

            join = [

                {
                    'type': 'LEFT',
                    'table': tableName.TBL_STATUS + ' as sts',
                    'on': 'sts.status_id = fit.status_id'
                },
            ];


            var totalcompanyData = await Common.get_info(0, tableName.TBL_COMPANY_FUTURE_FIT + ' fit', 'fit.flag_deleted', '' + filterWhere, 'count(fit.fit_entry_id) as Totalcompanys', false, join);
            var totalcompanys = 0;
            var totalPages = 0;

            $page = 1;
            if (page != 0) {
                offset = (req.query.page - 1) * per_page;
            }
            if (totalcompanyData.length > 0) {
                totalcompanys = totalcompanyData[0].Totalcompanys
                totalPages = totalcompanys / per_page;

                totalPages = totalPages < 1 ? 1 : totalPages;

            }


            var companyData = await Common.get_info(0, tableName.TBL_COMPANY_FUTURE_FIT + ' fit', 'fit.flag_deleted', '' + filterWhere, 'fit.fit_entry_id,fit.future_fit_name AS \`Break-Even Goal Reference\`,CONCAT(fit.fit_year,"-", fit.fit_month) as date,sts.status_name', false, join, false, { 'field': 'fit.created_on', 'order': 'DESC' }, per_page, offset);
            if (companyData.length) {

                return res.status(200).json({ status: true, message: '  List Found', data: companyData, page: page, per_page: per_page, total: totalcompanys, total_pages: totalPages });
            } else {
                return res.status(400).json({ status: false, message: '  List Empty', data: [], page: page, per_page: per_page, total: totalcompanys, total_pages: totalPages });

            }
        } catch (ex) {
            Logs.ErrorHandler(ex, res)
        }
    },
    datatable_new: async function (req, res) {
        try {
            const filter = req.query.filter ? req.query.filter.trim() : '';

            const companyId = req.userData.CompanyID;
            if (!companyId) {
                return res.status(400).json({ status: false, message: 'company_id is required' });
            }
            var page = req.query.page ? parseInt(req.query.page) : 1;
            var per_page = req.query.per_page ? parseInt(req.query.per_page) : 5;
            const perPage = parseInt(req.query.per_page) || 10;
            var offset = (page - 1) * per_page;

            var totalcompanyData = await Common.get_info(0, tableName.TBL_BREAK_EVEN_GOALS + ' fit', 'fit.flag_deleted', false, 'count(fit.goal_id) as Totalgoals');
            var totalGoals = 0;
            var Totalgoals = 0;
            $page = 1;
            if (page != 0) {
                offset = (req.query.page - 1) * per_page;
            }
            if (totalcompanyData.length > 0) {
                totalGoals = totalcompanyData[0].Totalgoals
                Totalgoals = totalGoals / per_page;

                totalPages = Totalgoals < 1 ? 1 : Totalgoals;

            }
            var totalPages = Math.ceil(totalGoals / per_page);
            let user_where = "";
            if (req.userData.RoleID != 1 && req.userData.RoleID != 2) {
                user_goal_data = await Common.get_info(req.userData.UserID, tableName.TBL_USERBEDETAILS, 'user_id', 'is_deleted=0', 'goal_id');
                if (user_goal_data && user_goal_data.length > 0) {
                    user_goal_ids = user_goal_data.map(item => item.goal_id);
                    user_where = "WHERE  g.goal_id IN (" + user_goal_ids.join(',') + ")";
                }
            } else {
                user_where = "";
            }
            var Data = await Common.query("SELECT  g.goal_code,goal_short_name, g.goal_name,  (u.first_name + ' ' + u.last_name) AS last_updated_by, FORMAT(be.latest_modified, 'dd-MM-yyyy') as latest_modified FROM " + tableName.TBL_BREAK_EVEN_GOALS + " g LEFT JOIN ( " +
                "SELECT 'BE01' AS goal_code, MAX(COALESCE(modified_on, created_on)) AS latest_modified, CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END AS created_by FROM " + tableName.TBL_BE01 + " WHERE flag_deleted = 0 and company_id= " + companyId
                + " UNION ALL SELECT 'BE02', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE02 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE03', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE03 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE04', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE04 + " WHERE flag_deleted = 0 and company_id=" + companyId

                + " UNION ALL  SELECT 'BE05', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE05 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE06', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE06 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE07', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE07 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE08', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE08 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE09', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE09 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE10', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE10 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE11', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE11 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE12', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE12 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE13', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE13 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE14', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE14 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE15', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE15 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE16', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE16 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE17', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE17 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE18', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE18 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE19', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE19 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE20', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE20 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE21', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE21 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE22', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE22 + " WHERE flag_deleted = 0 and company_id=" + companyId
                + " UNION ALL  SELECT 'BE23', MAX(COALESCE(modified_on, created_on)), CASE WHEN MAX(modified_on) IS NOT NULL THEN MAX(modified_by) ELSE MAX(created_by) END as created_by FROM " + tableName.TBL_BE23 + " WHERE flag_deleted = 0 and company_id=" + companyId

                + ") be ON g.goal_code = be.goal_code  LEFT JOIN " + tableName.TBL_USERS + " u ON be.created_by = u.user_id " + user_where
                + (filter ? (user_where ? " AND " : " WHERE ") + `(
      g.goal_code LIKE '%${filter}%' OR
      FORMAT(be.latest_modified, 'dd-MM-yyyy') LIKE '%${filter}%' OR
      (u.first_name + ' ' + u.last_name) LIKE '%${filter}%'
   )` : 'AND g.flag_deleted=0')
                + " ORDER BY g.goal_code ASC OFFSET " + offset + " ROWS FETCH NEXT " + perPage + " ROWS ONLY"

            );

            return res.status(200).json({
                status: true,
                message: 'Goal update list fetched',
                data: Data,
                page,
                per_page: perPage,
                total: totalGoals,
                total_pages: totalPages
            });

        } catch (error) {
            Logs.ErrorHandler(error, res);
        }
    },

    delete: async function (req, res) {
        try {
            const fitEntryId = req.params.fit_entry_id;
            const existingRecord = await Common.selectWhere(
                tableName.TBL_COMPANY_FUTURE_FIT,
                `fit_entry_id = ${fitEntryId} AND flag_deleted = 0`
            );

            if (!existingRecord.length) {
                return res.status(404).json({
                    status: false,
                    message: 'Future Fit record not found or already deleted',
                    data: []
                });
            }
            const updateData = {
                flag_deleted: 1,
                deleted_on: new Date(),
                modified_on: new Date()
            };
            await Common.update(
                tableName.TBL_COMPANY_FUTURE_FIT,
                `fit_entry_id = ${fitEntryId}`,
                updateData
            );
            return res.status(200).json({
                status: true,
                message: 'Future Fit record deleted successfully',
                data: []
            });

        } catch (ex) {
            Logs.ErrorHandler(ex, res);
        }
    },


    // Dashbord Chart API's


}
module.exports = auth;