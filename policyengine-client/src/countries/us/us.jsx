/*
 * Parameters for the US app.
*/

import Country from "../country"
import TimeTravel from "../uk/components/timeTravel";
/* Icons/logos */
import USGovernmentLogo from "../../images/parameter-icons/us/us.webp"
import DOELogo from "../../images/parameter-icons/us/us-government/doe.png"
import FCCLogo from "../../images/parameter-icons/us/us-government/fcc.png"
import IRSLogo from "../../images/parameter-icons/us/us-government/irs.png"
import HHSLogo from "../../images/parameter-icons/us/us-government/hhs.webp"
import HUDLogo from "../../images/parameter-icons/us/us-government/hud.svg"
import SSALogo from "../../images/parameter-icons/us/us-government/ssa.png"
import USDALogo from "../../images/parameter-icons/us/us-government/usda.png"
import StateGovernmentsLogo from "../../images/parameter-icons/us/state-governments.png"
import ThirdPartyLogo from "../../images/parameter-icons/third-party.png";
import UBICenterLogo from "../../images/parameter-icons/ubi-center.png"
import CongressLogo from "../../images/parameter-icons/us/third-party/congress.svg.png"
import SimulationLogo from "../../images/parameter-icons/simulation.webp";
/* Seals for each state */
import MALogo from "../../images/parameter-icons/us/state-governments/ma.png";
import WALogo from "../../images/parameter-icons/us/state-governments/wa.png";
import NYLogo from "../../images/parameter-icons/us/state-governments/ny.webp";
import MDLogo from "../../images/parameter-icons/us/state-governments/md.jpeg";
import ORLogo from "../../images/parameter-icons/us/state-governments/or.png";
import PALogo from "../../images/parameter-icons/us/state-governments/pa.webp";
import StateSpecific from "./components/stateSpecific";

import translateTimePeriod from "../utils/timePeriod";

const childNamer = {
    1: "Your first dependent",
    2: "Your second dependent",
    3: "Your third dependent",
    4: "Your fourth dependent",
    5: "Your fifth dependent",
}

function validatePolicy(policy, defaultPolicy) {
    if (defaultPolicy) {
        for (let parameter in policy) {
            if (policy[parameter].baselineValue === undefined) {
                policy[parameter].baselineValue = defaultPolicy[parameter].value;
            }
        }
    }
    return { policy: policy, policyValid: true };
}

export class US extends Country {
    constructor() {
        super();
        this.baseApiUrl = !this.useLocalServer ?
            (
                this.usePolicyEngineOrgServer ?
                    "https://policyengine.org/" :
                    `${window.location.protocol}//${window.location.hostname}`
            ) :
            `http://127.0.0.1:5000`;
        this.apiURL = `${this.baseApiUrl}/${this.name}/api`;
        this.situation = this.createDefaultSituation();
    }
    name = "us"
    properName = "US"
    beta = true;
    // Pages to show
    showPolicy = true;
    showPopulationImpact = true;
    showHousehold = true;
    showEarningsVariation = true;
    showWealth = false;
    showFAQ = true
    // Vanity URLs
    namedPolicies = {}
    validatePolicy = validatePolicy;
    year = 2022
    showDatePicker = true;

    setYear(year) {
        let situation = translateTimePeriod(this.situation, this.year, year);
        this.setState({
            year: year,
            situation: situation,
        });
    }

    parameterComponentOverrides = {
        timeTravel: <TimeTravel />,
        stateSpecific: <StateSpecific />,
    }
    // Policy page metadata
    parameterHierarchy = {
        "Simulation": {
            "Snapshot": [
                "timeTravel",
            ],
            "Geography": [
                "stateSpecific",
            ],
        },
        "US government": {
            "IRS": {
                "General": [
                    "abolish_income_tax",
                    "abolish_emp_payroll_tax",
                    "abolish_self_emp_tax",
                ],
                "Income tax schedule": [
                    "gov_irs_income_bracket_rates",
                    "gov_irs_income_bracket_thresholds",
                ],
                "Credits": {
                    "Child tax credit": {
                        "General": [
                            "abolish_non_refundable_ctc",
                            "abolish_refundable_ctc",
                        ],
                        "Eligibility": [
                            "ctc_child_age",
                        ],
                        "Amount": [
                            "ctc_child",
                            "ctc_adult_dependent",
                        ],
                        "Phase-out": [
                            "ctc_phase_out_rate",
                            "ctc_phase_out_threshold",
                        ],
                        "Refundability": [
                            "ctc_refundable_child_max",
                            "ctc_refundable_phase_in_rate",
                            "ctc_refundable_phase_in_threshold",
                        ],
                    },
                    "Child and dependent care": {
                        "General": [
                            "abolish_cdcc",
                        ],
                        "Maximum rate": [
                            "cdcc_max_expense",
                            "cdcc_max_rate",
                            "cdcc_refundable",
                        ],
                        "Eligibility": [
                            "cdcc_dependent_child_age",
                        ],
                        "Phase-out": [
                            "cdcc_phase_out_rate",
                            "cdcc_phase_out_start",
                            "cdcc_min_rate",
                        ],
                    },
                    "Clean vehicle": {
                        "New": {
                            "Battery components": [
                                "new_clean_vehicle_credit_battery_components_amount",
                                "new_clean_vehicle_credit_battery_components_threshold",
                            ],
                            "Critical minerals": [
                                "new_clean_vehicle_credit_critical_minerals_amount",
                                "new_clean_vehicle_credit_critical_minerals_threshold",
                            ],
                            "Eligibility": [
                                "new_clean_vehicle_credit_income_limit",
                                "new_clean_vehicle_credit_msrp_limit",
                                "new_clean_vehicle_credit_min_kwh",
                            ],
                            "kWh-based amount": [
                                "new_clean_vehicle_credit_base_amount",
                                "new_clean_vehicle_credit_amount_per_kwh",
                                "new_clean_vehicle_credit_kwh_threshold",
                                "new_clean_vehicle_credit_max_amount_for_capacity_bonus",
                            ]
                        },
                        "Used": {
                            "Amount": [
                                "used_clean_vehicle_credit_max_amount",
                                "used_clean_vehicle_credit_sale_price_percent",
                            ],
                            "Eligibility": [
                                "used_clean_vehicle_credit_income_limit",
                                "used_clean_vehicle_credit_sale_price_limit",
                            ]
                        }
                    },
                    "Earned Income Tax Credit": {
                        "General": [
                            "abolish_eitc",
                        ],
                        "Eligibility": [
                            "eitc_min_age_childless",
                            "eitc_max_age_childless",
                            "eitc_qualifying_child_max_age_student",
                            "eitc_qualifying_child_max_age_non_student",
                            "eitc_max_inv_income",
                        ],
                    },
                    "Education": {
                        "Phase-out": [
                            "education_credit_phase_out_start_single",
                            "education_credit_phase_out_start_joint",
                            "education_credit_phase_out_length_single",
                            "education_credit_phase_out_length_joint",
                        ],
                        "Lifetime Learning Credit": [
                            "abolish_llc",
                            "llc_max_expense",
                        ],
                        "American Opportunity Credit": [
                            "abolish_aoc",
                            "aoc_refundable_percentage",
                        ],
                    },
                    "Energy efficient home improvement": {
                        "Cap": {
                            "Annual": [
                                "energy_efficient_home_improvement_credit_advanced_main_air_circulating_fan_cap",
                                "energy_efficient_home_improvement_credit_annual_cap_doors",
                                "energy_efficient_home_improvement_credit_energy_efficient_building_property_cap",
                                "energy_efficient_home_improvement_credit_energy_efficient_central_air_conditioner_cap",
                                "energy_efficient_home_improvement_credit_annual_cap_heat_pumps_heat_pump_water_heaters_biomass_stoves_boilers",
                                "energy_efficient_home_improvement_credit_home_energy_audit_cap",
                                "energy_efficient_home_improvement_credit_energy_efficient_insulation_material_cap",
                                "energy_efficient_home_improvement_credit_furnace_boiler_cap",
                                "energy_efficient_home_improvement_credit_annual_cap_roofs",
                                "energy_efficient_home_improvement_credit_annual_cap_windows",
                                "energy_efficient_home_improvement_credit_annual_cap_total",
                            ],
                            "Lifetime": [
                                "energy_efficient_home_improvement_credit_lifetime_cap",
                                "energy_efficient_home_improvement_credit_lifetime_window_cap",
                            ]
                        },
                        "Rate": [
                            "energy_efficient_home_improvement_credit_audit_rate",
                            "energy_efficient_home_improvement_credit_improvements_rate",
                            "energy_efficient_home_improvement_credit_property_rate",
                        ]
                    },
                    "Residential clean energy": [
                        "residential_clean_energy_credit_applicable_percentage",
                        "residential_clean_energy_credit_fuel_cell_cap_per_kw",
                    ]
                },
                "Social Security": [
                    "employee_social_security_tax_rate",
                    "social_security_tax_cap",
                    "self_employment_net_earnings_exemption",
                    "self_employment_social_security_tax_rate",
                ],
                "Medicare": [
                    "employee_medicare_rate",
                    "self_employment_medicare_rate",
                    "additional_medicare_rate",
                ]
            },
            "DOE": {
                "High efficiency electric home rebate": {
                    "Percent covered": [
                        "high_efficiency_electric_home_rebate_percent_covered",
                    ],
                    "Cap": [
                        "high_efficiency_electric_home_rebate_annual_cap_electric_heat_pump_clothes_dryer",
                        "high_efficiency_electric_home_rebate_annual_cap_electric_load_service_center_upgrade",
                        "high_efficiency_electric_home_rebate_annual_cap_electric_stove_cooktop_range_or_oven",
                        "high_efficiency_electric_home_rebate_annual_cap_electric_wiring",
                        "high_efficiency_electric_home_rebate_annual_cap_heat_pump",
                        "high_efficiency_electric_home_rebate_annual_cap_heat_pump_water_heater",
                        "high_efficiency_electric_home_rebate_annual_cap_insulation_air_sealing_ventilation",
                        "high_efficiency_electric_home_rebate_annual_cap_total",
                    ]
                },
                "Residential efficiency and electrification rebate": {
                    "Cap": [
                        "residential_efficiency_electrification_rebate_cap_low_amount",
                        "residential_efficiency_electrification_rebate_cap_medium",
                        "residential_efficiency_electrification_rebate_cap_high",
                    ],
                    "Percent": [
                        "residential_efficiency_electrification_rebate_percent",
                    ],
                    "Threshold": [
                        "residential_efficiency_electrification_rebate_threshold_low",
                        "residential_efficiency_electrification_rebate_threshold_medium",
                        "residential_efficiency_electrification_rebate_threshold_high",
                    ]
                },
            },
            "FCC": {
                "Lifeline": {
                    "Eligibility": [
                        "lifeline_income_fpl_limit",
                    ],
                    "Amount": [
                        "lifeline_amount",
                        "lifeline_rural_tribal_supplement",
                    ]
                },
                "Affordable Connectivity Program": {
                    "Eligibility": [
                        "acp_income_fpl_limit",
                    ],
                    "Amount": [
                        "acp_standard_amount",
                        "acp_tribal_amount",
                    ],
                },
            },
            "HUD": {
                "General": [
                    "abolish_housing_subsidies",
                ],
            },
            "HHS": {
                "General": [
                    "abolish_tanf",
                ],
            },
            "SSA": {
                "Social Security": [
                    "abolish_social_security",
                ],
                "SSI": {
                    "General": [
                        "abolish_ssi",
                    ],
                    "Eligibility": [
                        "ssi_aged_threshold",
                    ],
                    "Amount": [
                        "ssi_amount_individual",
                        "ssi_amount_couple",
                    ],
                    "Exclusions": [
                        "ssi_flat_general_income_exclusion",
                        "ssi_flat_earned_income_exclusion",
                        "ssi_earned_income_exclusion_share",
                    ],
                }
            },
            "USDA": {
                "SNAP": {
                    "General": [
                        "abolish_snap",
                        "abolish_snap_ea",
                    ],
                    "Eligibility": [
                        "snap_gross_income_limit",
                        "snap_net_income_limit",
                    ],
                    "Deductions": [
                        "snap_earned_income_deduction",
                        "snap_medical_expense_disregard",
                        "snap_homeless_shelter_deduction",
                        "snap_shelter_deduction_income_share_disregard",
                        "abolish_snap_dependent_care_deduction",
                    ],
                    "Allotment": [
                        "snap_max_allotment_main",
                    ],
                },
                "School meals": {
                    "Eligibility": [
                        "school_meal_free_fpg_limit",
                        "school_meal_reduced_fpg_limit",
                    ]
                },
                "WIC": {
                    "General": [
                        "abolish_wic",
                    ]
                }
            },
        },
        "State governments": {
            "Maryland": {
                "State income tax": {
                    "Subtractions": [
                        "abolish_md_dependent_care_subtraction",
                    ],
                    "Deductions": {
                        "Standard": [
                            "md_standard_deduction_rate",
                            "md_min_standard_deduction",
                            "md_max_standard_deduction",
                        ]
                    },
                    "Exemptions": {
                        "Personal": [
                            "md_personal_exemption_single",
                            "md_personal_exemption_separate",
                            "md_personal_exemption_joint",
                            "md_personal_exemption_head",
                            "md_personal_exemption_widow",
                        ],
                        "Aged and blind": [
                            "md_income_tax_aged_exemption",
                            "md_income_tax_aged_dependent_exemption",
                            "md_income_tax_aged_exemption_age_threshold",
                            "md_income_tax_blind_exemption",
                        ]
                    },
                    "Credits": {
                        "Child and Dependent Care Credit": {
                            "Amount": [
                                "md_cdcc_percent",
                            ],
                            "Eligibility": [
                                "md_cdcc_agi_cap",
                                "md_cdcc_refundable_agi_cap",
                            ],
                            "Phase-out": [
                                "md_cdcc_phase_out_start",
                                "md_cdcc_phase_out_increment",
                                "md_cdcc_phase_out_percent",
                            ],
                        },
                        "Earned Income Tax Credit": [
                            "md_non_single_childless_non_refundable_eitc_match",
                            "md_eitc_refundable_match",
                            "md_eitc_childless_match",
                            "md_eitc_childless_max",
                        ],
                        "Poverty Line Credit": [
                            "md_poverty_line_credit_rate",
                        ]
                    },
                    "Rates": [
                        "md_income_tax_rate_single",
                        "md_income_tax_rate_separate",
                        "md_income_tax_rate_joint",
                        "md_income_tax_rate_head",
                        "md_income_tax_rate_widow",
                    ]
                }
            },
            "Massachusetts": {
                "State income tax": {
                    "Rates": [
                        "ma_part_a_int_div_rate",
                        "ma_part_a_stcg_rate",
                        "ma_part_b_rate",
                        "ma_part_c_rate",
                    ],
                    "Exemptions": [
                        "ma_income_tax_personal_exemption",
                        "ma_interest_exemption",
                        "ma_income_tax_dependent_exemption",
                        "ma_income_tax_blind_exemption",
                        "ma_income_tax_aged_exemption_age_threshold",
                        "ma_income_tax_aged_exemption",
                    ],
                    "Deductions": [
                        "ma_income_tax_pension_contributions_max",
                        "ma_income_tax_rent_deduction_cap",
                        "ma_income_tax_rent_deduction_share",
                        "ma_income_tax_max_capital_gains_deductible_against_interest_dividends",
                        "ma_ltcg_deduction_rate",
                    ],
                    "Credits": {
                        "Dependent credit": [
                            "ma_dependent_credit",
                            "ma_dependent_credit_dependent_cap",
                            "ma_dependent_credit_child_age_limit",
                            "ma_dependent_credit_elderly_age_limit",
                        ],
                        "Dependent care credit": [
                            "ma_dependent_care_credit_amount",
                            "ma_dependent_care_credit_dependent_cap",],
                        "EITC": [
                            "ma_eitc_percent",
                        ],
                        "Limited Income Credit": [
                            "ma_limited_income_tax_credit_percent",
                            "ma_limited_income_tax_credit_income_limit",
                        ],
                        "Senior Circuit Breaker": {
                            "Amount": [
                                "ma_scb_max_payment",
                                "ma_scb_ret_threshold",
                                "ma_scb_rent_tax_share",
                            ],
                            "Eligibility": [
                                "ma_scb_min_age",
                                "ma_scb_max_income",
                                "ma_scb_max_property_value",
                            ]
                        },
                    },
                },
            },
            "New York": {
                "State income tax": {
                    "Adjusted gross income": [
                        "ny_pension_exclusion_cap",
                        "ny_pension_exclusion_min_age",
                    ],
                    "Rates": {
                        "Main": [
                            "ny_income_tax_rate_single",
                            "ny_income_tax_rate_joint",
                            "ny_income_tax_rate_hoh",
                            "ny_income_tax_rate_separate",
                            "ny_income_tax_rate_widow",
                        ],
                        "Supplemental": [
                            "ny_sup_min_agi",
                            "ny_sup_phase_in_length",
                        ],
                    },
                    "Exemptions": [
                        "ny_dependent_exemption_amount",
                    ],
                    "Deductions": {
                        "Standard": [
                            "ny_standard_deduction_amount",
                            "ny_standard_deduction_dependent_elsewhere",
                        ],
                        "Itemized": [
                            "ny_college_tuition_deduction_max",
                        ],
                    },
                    "Credits": {
                        "Empire State Child Credit": [
                            "ny_escc_minimum_age",
                            "ny_escc_federal_share",
                            "ny_escc_amount_minimum",
                        ],
                        "NY EITC": [
                            "ny_eitc_match",
                            "ny_supplemental_eitc_match",
                        ],
                        "NY CDCC": {
                            "General": [
                                "ny_cdcc_max_amount",
                                "ny_cdcc_multiplier",
                            ],
                            "Main fraction": [
                                "ny_cdcc_main_multiplier",
                                "ny_cdcc_main_base",
                                "ny_cdcc_main_frac_denom",
                                "ny_cdcc_main_frac_num_min",
                                "ny_cdcc_main_frac_num_top",
                            ],
                            "Alternate fraction": [
                                "ny_cdcc_alt_max_agi",
                                "ny_cdcc_alt_multiplier",
                                "ny_cdcc_alt_base",
                                "ny_cdcc_alt_frac_denom",
                                "ny_cdcc_alt_frac_num_min",
                                "ny_cdcc_alt_frac_num_top",
                            ],
                        },
                        "NY household credit": [
                            "ny_household_credit_single",
                            "ny_household_credit_non_single_base",
                            "ny_household_credit_non_single_additional",
                        ],
                        "NY college tuition credit": [
                            "ny_college_tuition_credit_rate",
                        ],
                        "NY real property tax credit": {
                            "Excess RPT": [
                                "ny_rent_tax_equivalent",
                                "ny_rptc_excess_rpt",
                            ],
                            "Eligibility": [
                                "ny_max_rent",
                                "ny_rptc_max_property_value",
                                "ny_rptc_max_agi",
                            ],
                            "Maximum credit": [
                                "ny_rptc_rate",
                                "ny_rptc_elderly_age",
                                "ny_rptc_excess_rpt_non_elderly",
                                "ny_rptc_excess_rpt_elderly",
                            ],
                        },
                    },
                }
            },
            "Oregon": {
                "State income tax": {
                    "Rates": [
                        "or_income_tax_rate_single",
                        "or_income_tax_rate_joint",
                        "or_income_tax_rate_head",
                        "or_income_tax_rate_separate",
                        "or_income_tax_rate_widow",
                    ],
                    "Subtractions": {
                        "Federal tax liability cap": [
                            "or_federal_tax_liability_subtraction_cap_single",
                            "or_federal_tax_liability_subtraction_cap_joint",
                            "or_federal_tax_liability_subtraction_cap_head",
                            "or_federal_tax_liability_subtraction_cap_separate",
                            "or_federal_tax_liability_subtraction_cap_widow",
                        ]
                    },
                    "Credits": {
                        "Earned income tax credit": [
                            "or_eitc_percent_no_young_child",
                            "or_eitc_percent_young_child",
                            "or_eitc_percent_young_child_age",
                        ],
                        "Exemption credit": [
                            "or_exemption_credit_amount",
                            "or_exemption_credit_income_limit_regular",
                        ]
                    }
                }
            },
            "Pennsylvania": {
                "State income tax": {
                    "Rate": [
                        "pa_income_tax_rate",
                    ],
                    "Forgiveness": [
                        "pa_tax_forgiveness_base_rate",
                        "pa_tax_forgiveness_dependent_rate",
                        "pa_tax_forgiveness_rate_increment",
                        "pa_tax_forgiveness_rate_percentage",
                    ],
                    "Use tax": {
                        "Main": [
                            "pa_phildelphia_use_tax_amount",
                            "pa_allegheny_use_tax_amount",
                            "rest_of_pa_use_tax_amount"
                        ],
                        "Higher": {
                            "Threshold": [
                                "pa_use_tax_higher_threshold",
                            ],
                            "Rate": [
                                "pa_philadelphia_use_tax_rate",
                                "pa_allegheny_county_use_tax_rate",
                                "rest_of_pa_use_tax_rate",
                            ],
                            "Cap": [
                                "pa_philadelphia_use_tax_cap",
                                "pa_allegheny_county_use_tax_cap",
                                "rest_of_pa_use_tax_cap",
                            ]
                        }
                    }
                },
            },
            "Washington": {
                "Capital gains tax": {
                    "Rate": [
                        "wa_ltcg_rate",
                    ],
                    "Deductions": [
                        "wa_ltcg_standard_deduction",
                        "wa_ltcg_charitable_contributions_exemption",
                        "wa_ltcg_charitable_contributions_cap",
                    ],
                },
                "Working Families Tax Credit": {
                    "Amount": [
                        "wa_wftc_max_amount",
                        "wa_wftc_min_amount",
                    ],
                    "Phase-out": [
                        "wa_wftc_phase_out_start_below_eitc_income_limit",
                    ]
                }
            }
        },
        "Third party": {
            "Congress": {
                "House": {
                    "Rep Tlaib": {
                        "End Child Poverty Act": {
                            "Adult dependent credit": [
                                "end_child_poverty_act_adult_dependent_credit_amount",
                                "end_child_poverty_act_adult_dependent_credit_min_age",
                            ],
                            "Filer credit": {
                                "Amount": [
                                    "end_child_poverty_act_filer_credit_amount",
                                    "end_child_poverty_act_filer_credit_phase_out_start",
                                    "end_child_poverty_act_filer_credit_phase_out_rate",
                                ],
                                "Eligibility": [
                                    "end_child_poverty_act_filer_credit_min_age",
                                    "end_child_poverty_act_filer_credit_max_age",
                                ]
                            }
                        }
                    },
                },
            },
            "UBI Center": {
                "Basic income": {
                    "Amounts": [
                        "bi_amount",
                        "young_child_bi_amount",
                        "older_child_bi_age",
                        "older_child_bi_amount",
                        "young_adult_bi_age",
                        "young_adult_bi_amount",
                        "older_adult_bi_age",
                        "older_adult_bi_amount",
                        "senior_bi_age",
                        "senior_bi_amount",
                        "bi_fpg_percent",
                    ],
                    "Phase-out": [
                        "bi_phase_out_threshold",
                        "bi_phase_out_by_rate",
                        "bi_phase_out_rate",
                        "bi_phase_out_end",
                        "bi_taxability",
                    ],
                    "Eligibility": [
                        "bi_agi_limit_in_effect",
                        "bi_agi_limit_amount",
                    ],
                },
                "Flat tax": [
                    "flat_tax",
                    "ptc_exemption",
                ],
            },
        }
    }
    organisations = {
        "Simulation": {
            logo: SimulationLogo,
        },
        "US government": {
            logo: USGovernmentLogo,
        },
        "DOE": {
            logo: DOELogo,
        },
        "FCC": {
            logo: FCCLogo,
        },
        "IRS": {
            logo: IRSLogo,
        },
        "HHS": {
            logo: HHSLogo,
        },
        "HUD": {
            logo: HUDLogo,
        },
        "USDA": {
            logo: USDALogo,
        },
        "SSA": {
            logo: SSALogo,
        },
        "State governments": {
            logo: StateGovernmentsLogo,
        },
        "Maryland": {
            logo: MDLogo,
        },
        "Massachusetts": {
            logo: MALogo,
        },
        "New York": {
            logo: NYLogo,
        },
        "Oregon": {
            logo: ORLogo,
        },
        "Pennsylvania": {
            logo: PALogo,
        },
        "Washington": {
            logo: WALogo,
        },
        "Third party": {
            logo: ThirdPartyLogo,
        },
        "Congress": {
            logo: CongressLogo,
        },
        "UBI Center": {
            logo: UBICenterLogo,
        },
    }
    defaultOpenParameterGroups = [];
    defaultSelectedParameterGroup = "/US government/IRS/Income tax schedule"
    showSnapShot = true
    // OpenFisca data
    parameters = null
    entities = null
    variables = null
    // Adjustments to OpenFisca data
    extraParameterMetadata = {
        ctc_child_age: { max: 21 },
        ctc_child: { max: 10_000 },
        ctc_child_young_bonus: { max: 10_000 },
        ctc_adult_dependent: { max: 10_000 },
        snap_net_income_limit: { max: 10 },
        ssi_amount_individual: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_adult_dependent_credit_amount: { max: 10_000 },
        // Massachusetts.
        ma_dependent_care_credit_amount: { max: 1_000 },
        ma_dependent_credit: { max: 1_000 },
        // Maryland.
        md_min_standard_deduction: { max: 1_000 },
        md_max_standard_deduction: { max: 1_000 },
        md_income_tax_aged_exemption: { max: 10_000 },
        md_income_tax_aged_dependent_exemption: { max: 10_000 },
        md_income_tax_blind_exemption: { max: 10_000 },
        md_eitc_childless_max: { max: 1_000 },
        // Washington.
        wa_wftc_max_amount: { max: 10_000 },
        wa_wftc_min_amount: { max: 1_000 },
        // Inflation Reduction Act.
        clean_vehicle_battery_components_amount: { max: 10_000 },
        clean_vehicle_critical_minerals_amount: { max: 10_000 },
        // Each parameter breakdown requires separate treatment.
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_SINGLE: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_JOINT: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_SEPARATE: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_HEAD_OF_HOUSEHOLD: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_WIDOW: { max: 10_000 },
    }
    extraVariableMetadata = {
        new_clean_vehicle_msrp: { max: 100_000 },
        new_clean_vehicle_battery_capacity: { max: 100 },
        used_clean_vehicle_sale_price: { max: 100_000 },
    }

    createDefaultSituation() {
        let year = this.year;
        return {
            "people": {
                "You": {
                    "age": { [year]: 25 },
                    "is_tax_unit_head": { [year]: true },
                    "is_tax_unit_dependent": { [year]: false },
                    "is_tax_unit_spouse": { [year]: false },
                },
            },
            "tax_units": {
                "Your tax unit": {
                    "members": ["You"],
                },
            },
            "marital_units": {
                "Your marital unit": {
                    "members": ["You"],
                },
            },
            "families": {
                "Your family": {
                    "members": ["You"],
                }
            },
            "spm_units": {
                "Your SPM unit": {
                    "members": ["You"],
                }
            },
            "households": {
                "Your household": {
                    "members": ["You"],
                }
            }
        };
    }


    inputVariables = [
        // Person.
        "age",
        "employment_income",
        "dividend_income",
        "interest_income",
        "gi_cash_assistance",
        "unemployment_compensation",
        "medical_out_of_pocket_expenses",
        "social_security_dependents",
        "social_security_disability",
        "social_security_retirement",
        "social_security_survivors",
        "is_tax_unit_dependent",
        "is_blind",
        "is_ssi_disabled",
        "is_permanently_disabled_veteran",
        "is_surviving_spouse_of_disabled_veteran",
        "is_surviving_child_of_disabled_veteran",
        "is_in_k12_school",
        "is_full_time_college_student",
        "is_mother",
        "is_pregnant",
        "is_breastfeeding",
        "is_wic_at_nutritional_risk",
        "ca_cvrp_vehicle_rebate_amount",
        "qualified_tuition_expenses",
        "charitable_cash_donations",
        "charitable_non_cash_donations",
        "is_eligible_for_american_opportunity_credit",
        // Tax unit.
        "premium_tax_credit",
        "new_clean_vehicle_battery_capacity",
        "new_clean_vehicle_battery_components_made_in_north_america",
        "new_clean_vehicle_battery_critical_minerals_extracted_in_trading_partner_country",
        "new_clean_vehicle_classification",
        "new_clean_vehicle_msrp",
        "purchased_qualifying_new_clean_vehicle",
        "purchased_qualifying_used_clean_vehicle",
        "used_clean_vehicle_sale_price",
        "residential_efficiency_electrification_retrofit_expenditures",
        "residential_efficiency_electrification_retrofit_energy_savings",
        "home_energy_audit_expenditures",
        "energy_efficient_door_expenditures",
        "energy_efficient_insulation_expenditures",
        "energy_efficient_roof_expenditures",
        "energy_efficient_window_expenditures",
        "advanced_main_air_circulating_fan_expenditures",
        "air_sealing_ventilation_expenditures",
        "biomass_stove_boiler_expenditures",
        "electric_heat_pump_clothes_dryer_expenditures",
        "electric_load_service_center_upgrade_expenditures",
        "electric_stove_cooktop_range_or_oven_expenditures",
        "electric_wiring_expenditures",
        "energy_efficient_central_air_conditioner_expenditures",
        "heat_pump_expenditures",
        "heat_pump_water_heater_expenditures",
        "qualified_furnace_or_hot_water_boiler_expenditures",
        "fuel_cell_property_capacity",
        "fuel_cell_property_expenditures",
        "geothermal_heat_pump_property_expenditures",
        "qualified_battery_storage_technology_expenditures",
        "small_wind_energy_property_expenditures",
        "solar_electric_property_expenditures",
        "solar_water_heating_property_expenditures",
        "tax_unit_income_ami_ratio",
        // SPM unit.
        "housing_cost",
        "childcare_expenses",
        "fdpir",
        "phone_cost",
        "broadband_cost",
        // Household.
        "state_code",
        "is_on_tribal_land",
        "is_rural",
        "is_homeless",
        "current_home_energy_use",
        "average_home_energy_use_in_state",
    ]
    outputVariables = [
        // Top level.
        "spm_unit_net_income",
        // Second level.
        "spm_unit_market_income",
        "spm_unit_benefits",
        "spm_unit_taxes",
        // Third level - spm_unit_market_income.
        "employment_income",
        "dividend_income",
        "interest_income",
        // Third level - spm_unit_benefits.
        "snap",
        "free_school_meals",
        "reduced_price_school_meals",
        "ssi",
        "social_security",
        "lifeline",
        "ebb",
        "acp",
        "ca_cvrp",
        "wic",
        "high_efficiency_electric_home_rebate",
        "residential_efficiency_electrification_rebate",
        // Third level - spm_unit_taxes.
        "spm_unit_payroll_tax",
        "spm_unit_self_employment_tax",
        "spm_unit_federal_tax",
        "spm_unit_state_tax",
        "refundable_ctc",
        "eitc",
        // Fourth level - SNAP decomposition.
        "snap_normal_allotment",
        "snap_emergency_allotment",
        // Federal income tax breakdown
        "income_tax_before_credits",
        "income_tax_capped_non_refundable_credits",
        "income_tax_refundable_credits",
        // State income taxes.
        // Massachusetts.
        "ma_income_tax",
        "ma_limited_income_tax_credit",
        "ma_eitc",
        "ma_dependent_credit",
        "ma_income_tax_before_credits",
        // Maryland.
        "md_income_tax",
        "md_income_tax_after_non_refundable_credits",
        "md_refundable_credits",
        "md_income_tax_before_credits",
        "md_non_refundable_credits",
        "md_refundable_cdcc",
        "md_non_single_childless_refundable_eitc",
        "md_single_childless_eitc",
        "md_ctc",
        // New York.
        "ny_income_tax",
        "ny_income_tax_before_credits",
        "ny_main_income_tax",
        "ny_non_refundable_credits",
        "ny_supplemental_tax",
        "ny_ctc",
        "ny_cdcc",
        "ny_eitc",
        "ny_household_credit",
        "ny_college_tuition_credit",
        "ny_real_property_tax_credit",
        // Oregon.
        "or_income_tax_after_refundable_credits",
        "or_income_tax_after_non_refundable_credits",
        "or_refundable_credits",
        "or_eitc",
        "or_kicker",
        // Pennsylvania.
        "pa_income_tax",
        "pa_income_tax_after_forgiveness",
        "pa_use_tax",
        // Washington.
        "wa_income_tax",
        "wa_working_families_tax_credit",
        "wa_capital_gains_tax",
        // Contributed.
        "basic_income",
        "ecpa_filer_credit",
        "ecpa_adult_dependent_credit",
        "filing_status",
        "is_tax_unit_dependent",
        "is_tax_unit_head",
        "is_tax_unit_spouse",
        "income_tax",
        "adjusted_gross_income",
        "high_efficiency_electric_home_rebate",
        "residential_efficiency_electrification_rebate",
        "tanf",
    ]
    inputVariableHierarchy = {
        "Household": {
            "People": [
                "setup",
            ],
            "Location": [
                "state_code",
                "is_on_tribal_land",
                "is_rural",
                "average_home_energy_use_in_state",
            ],
            "AMI": [
                "tax_unit_income_ami_ratio",
            ],
            "Home": [
                "is_homeless",
                "current_home_energy_use",
            ],
            "Expenses": {
                "Household": [
                    "housing_cost",
                    "childcare_expenses",
                    "phone_cost",
                    "broadband_cost",
                ],
                "Retrofits": [
                    "home_energy_audit_expenditures",
                    "residential_efficiency_electrification_retrofit_expenditures",
                    "residential_efficiency_electrification_retrofit_energy_savings",
                ],
                "Energy efficiency improvements": [
                    "energy_efficient_door_expenditures",
                    "energy_efficient_insulation_expenditures",
                    "energy_efficient_roof_expenditures",
                    "energy_efficient_window_expenditures",
                ],
                "Energy efficient property": [
                    "fuel_cell_property_capacity",
                    "fuel_cell_property_expenditures",
                    "geothermal_heat_pump_property_expenditures",
                    "qualified_battery_storage_technology_expenditures",
                    "small_wind_energy_property_expenditures",
                    "solar_electric_property_expenditures",
                    "solar_water_heating_property_expenditures",
                ],
                "Energy property": [
                    "advanced_main_air_circulating_fan_expenditures",
                    "air_sealing_ventilation_expenditures",
                    "biomass_stove_boiler_expenditures",
                    "electric_heat_pump_clothes_dryer_expenditures",
                    "electric_load_service_center_upgrade_expenditures",
                    "electric_stove_cooktop_range_or_oven_expenditures",
                    "electric_wiring_expenditures",
                    "energy_efficient_central_air_conditioner_expenditures",
                    "heat_pump_expenditures",
                    "heat_pump_water_heater_expenditures",
                    "qualified_furnace_or_hot_water_boiler_expenditures",
                ],
                "Clean vehicle": {
                    "New": [
                        "purchased_qualifying_new_clean_vehicle",
                        "new_clean_vehicle_classification",
                        "new_clean_vehicle_msrp",
                        "new_clean_vehicle_battery_capacity",
                        "new_clean_vehicle_battery_components_made_in_north_america",
                        "new_clean_vehicle_battery_critical_minerals_extracted_in_trading_partner_country",
                    ],
                    "Used": [
                        "purchased_qualifying_used_clean_vehicle",
                        "used_clean_vehicle_sale_price",
                    ],
                },
            },
            "Benefits": [
                "fdpir",
            ],
            "Taxes": [
                "premium_tax_credit"
            ]
        },
        "People": {
            "Income": [
                "employment_income",
                "dividend_income",
                "interest_income",
                "gi_cash_assistance",
                "unemployment_compensation",
            ],
            "Benefits": [
                "social_security_retirement",
                "social_security_survivors",
                "social_security_dependents",
                "social_security_disability",
            ],
            "Demographics": [
                "age",
                "is_in_k12_school",
                "is_full_time_college_student",
                "is_eligible_for_american_opportunity_credit",
                "is_blind",
                "is_ssi_disabled",
                "is_permanently_disabled_veteran",
                "is_surviving_spouse_of_disabled_veteran",
                "is_surviving_child_of_disabled_veteran",
                "is_mother",
                "is_pregnant",
                "is_breastfeeding",
                "is_wic_at_nutritional_risk",
            ],
            "Expenses": [
                "medical_out_of_pocket_expenses",
                "qualified_tuition_expenses",
                "charitable_cash_donations",
                "charitable_non_cash_donations",
                "ca_cvrp_vehicle_rebate_amount",
            ],
        }
    }
    defaultOpenVariableGroups = [
        "/Household",
        "/People"
    ]
    defaultSelectedVariableGroup = "/Household/People"
    outputVariableHierarchy = {
        "spm_unit_net_income": {
            "add": [
                "spm_unit_market_income",
                "spm_unit_benefits",
            ],
            "subtract": [
                "spm_unit_taxes",
            ]
        },
        "spm_unit_market_income": {
            "add": [
                "employment_income",
                "dividend_income",
                "interest_income",
                "gi_cash_assistance",
            ],
            "subtract": []
        },
        "spm_unit_benefits": {
            "add": [
                "snap",
                "free_school_meals",
                "reduced_price_school_meals",
                "lifeline",
                "ebb",
                "acp",
                "ca_cvrp",
                "ssi",
                "social_security",
                "wic",
                "tanf",
                "high_efficiency_electric_home_rebate",
                "residential_efficiency_electrification_rebate",
                // Contributed.
                "basic_income",
            ],
            "subtract": []
        },
        "spm_unit_taxes": {
            "add": [
                "spm_unit_payroll_tax",
                "spm_unit_self_employment_tax",
                "income_tax",
                "ma_income_tax",
                "md_income_tax",
                "or_income_tax_after_refundable_credits",
                "ny_income_tax",
                "pa_income_tax",
                "wa_income_tax",
            ],
            "subtract": []
        },
        "snap": {
            "add": [
                "snap_normal_allotment",
                "snap_emergency_allotment",
            ],
            "subtract": []
        },
        "income_tax": {
            "add": [
                "income_tax_before_credits",
            ],
            "subtract": [
                "income_tax_capped_non_refundable_credits",
                "income_tax_refundable_credits",
            ]
        },
        "income_tax_refundable_credits": {
            "add": [
                "eitc",
                "refundable_ctc",
                "ecpa_filer_credit",
                "ecpa_adult_dependent_credit",
            ]
        },
        "ma_income_tax": {
            "add": [
                "ma_income_tax_before_credits",
            ],
            "subtract": [
                "ma_limited_income_tax_credit",
                "ma_eitc",
                "ma_dependent_credit",
            ]
        },
        "md_income_tax": {
            "add": [
                "md_income_tax_after_non_refundable_credits"
            ],
            "subtract": [
                "md_refundable_credits"
            ]
        },
        "md_income_tax_after_non_refundable_credits": [
            "md_income_tax_before_credits",
            "md_non_refundable_credits"
        ],
        "md_refundable_credits": [
            "md_refundable_cdcc",
            "md_non_single_childless_refundable_eitc",
            "md_single_childless_eitc",
            "md_ctc",
        ],
        "pa_income_tax": {
            "add": [
                "pa_income_tax_after_forgiveness",
                "pa_use_tax",
            ],
            "subtract": []
        },
        "wa_income_tax": {
            "add": [
                "wa_capital_gains_tax"
            ],
            "subtract": [
                "wa_working_families_tax_credit"
            ]
        },
        "ny_income_tax": {
            "add": [
                "ny_income_tax_before_credits"
            ],
            "subtract": [
                "ny_non_refundable_credits",
                "ny_ctc",
                "ny_cdcc",
                "ny_eitc",
                "ny_household_credit",
                "ny_college_tuition_credit",
                "ny_real_property_tax_credit",
            ],
        },
        "ny_income_tax_before_credits": {
            "add": [
                "ny_main_income_tax",
                "ny_supplemental_tax",
            ],
        },
        "or_income_tax_after_refundable_credits": {
            "add": [
                "or_income_tax_after_non_refundable_credits",
            ],
            "subtract": [
                "or_refundable_credits",
            ],
        },
        "or_refundable_credits": {
            "add": [
                "or_eitc",
                "or_kicker",
            ]
        }
    }

    householdMaritalOptions = ["Single", "Married"]

    householdMaritalStatus = "Single"

    getHouseholdMaritalStatus() {
        return this.householdMaritalStatus;
    }

    setHouseholdMaritalStatus(status) {
        let situation = this.situation;
        if ((status === "Married") && !situation.people.hasOwnProperty("Your spouse")) {
            this.addPartner(situation);
        } else if ((status === "Single") && situation.people.hasOwnProperty("Your spouse")) {
            this.removePerson(situation, "Your spouse");
        }
        this.setState({
            situation: situation,
            householdMaritalStatus: status,
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: false,
            situationVariationImpactIsOutdated: true,
        });
    }


    addPartner(situation) {
        const name = "Your spouse"
        const year = this.year;
        situation.people[name] = {
            "age": { [year]: 25 },
            "is_tax_unit_dependent": { [year]: false },
            "is_tax_unit_spouse": { [year]: true },
            "is_tax_unit_head": { [year]: false },
        };
        situation.families["Your family"].members.push(name);
        situation.marital_units["Your marital unit"].members.push(name);
        situation.tax_units["Your tax unit"].members.push(name);
        situation.spm_units["Your SPM unit"].members.push(name);
        situation.households["Your household"].members.push(name);
        return this.validateSituation(situation).situation;
    }

    addChild(situation) {
        const childName = childNamer[this.getNumChildren() + 1];
        const year = this.year
        situation.people[childName] = {
            "age": { [year]: 10 },
            "is_in_k12_school": { [year]: true },
            "is_tax_unit_dependent": { [year]: true },
            "is_tax_unit_spouse": { [year]: false },
            "is_tax_unit_head": { [year]: false },
        };
        situation.families["Your family"].members.push(childName);
        situation.tax_units["Your tax unit"].members.push(childName);
        situation.spm_units["Your SPM unit"].members.push(childName);
        situation.households["Your household"].members.push(childName);
        return this.validateSituation(situation).situation;
    }

    removePerson(situation, name) {
        for (let entityPlural of ["marital_units", "tax_units", "families", "spm_units", "households"]) {
            for (let entity of Object.keys(situation[entityPlural])) {
                situation[entityPlural][entity].members = situation[entityPlural][entity].members.filter(
                    member => member !== name
                )
            }
        }
        let year = this.year
        if (name === "Your spouse") {
            if (!situation["families"]["Your family"]["is_married"]) {
                situation["families"]["Your family"]["is_married"] = { [year]: false }
            }
            situation["families"]["Your family"]["is_married"][this.year] = false;
            situation.marital_units["Your marital unit"].members.pop()
        }
        delete situation.people[name];
        return this.validateSituation(situation).situation;
    }

    setNumAdults(numAdults) {
        let situation = this.situation;
        const numExistingAdults = this.getNumAdults();
        if (numExistingAdults === 1 && numAdults === 2) {
            situation = this.addPartner(situation);
        } else if (numExistingAdults === 2 && numAdults === 1) {
            situation = this.removePerson(situation, "Your spouse");
        }

        this.setState({
            situation: this.validateSituation(situation).situation,
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
            situationVariationImpactIsOutdated: true,
        });
    }

    getNumAdults() {
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age[this.year] >= 18
        ).length;
    }

    setNumChildren(numChildren) {
        let situation = this.situation;
        const numExistingChildren = this.getNumChildren();
        if (numExistingChildren < numChildren) {
            for (let i = numExistingChildren; i < numChildren; i++) {
                situation = this.addChild(situation);
            }
        } else if (numExistingChildren > numChildren) {
            for (let i = numExistingChildren; i > numChildren; i--) {
                situation = this.removePerson(situation, childNamer[i]);
            }
        }

        this.setState({
            situation: this.validateSituation(situation).situation,
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
            situationVariationImpactIsOutdated: true,
        });
    }

    getNumChildren() {
        const countPeople = Object.keys(this.situation.people).length;
        const maritalStatus = this.householdMaritalStatus;
        const mainAdults = maritalStatus === "Married" ? 2 : 1;
        return countPeople - mainAdults;
    }


    // Parameter names not in parameterHierarchy but needed for the app
    extraParameterListNames = [
        "state_specific",
    ]
};
