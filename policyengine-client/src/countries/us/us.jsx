/*
 * Parameters for the US app.
*/

import Country from "../country"
import TimeTravel from "../uk/components/timeTravel";
/* Icons/logos */
import USGovernmentLogo from "../../images/parameter-icons/us/us.webp"
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
import MALogo from "../../images/parameter-icons/us/state-governments/ma.png";
import WALogo from "../../images/parameter-icons/us/state-governments/wa.png";
import MDLogo from "../../images/parameter-icons/us/state-governments/md.jpeg";
import StateSpecific from "./components/stateSpecific";

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
            policy[parameter].defaultValue = defaultPolicy[parameter].value;
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
    }
    name = "us"
    properName = "US"
    beta = true
    // Pages to show
    showPolicy = true
    showPopulationImpact = true
    showHousehold = true
    showEarningsVariation = true
    showWealth = false;
    showFAQ = true
    // Vanity URLs
    namedPolicies = {}
    validatePolicy = validatePolicy;

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
                    "EITC": {
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
                    "Electric vehicle": [
                        "new_ev_credit_base_amount",
                        "new_ev_credit_amount_per_kwh",
                        "new_ev_credit_kwh_threshold",
                        "new_ev_credit_max_amount_for_capacity_bonus",
                        "new_ev_credit_min_kwh",
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
                        "wa_wftc_phase_out_rate",
                    ]
                }
            }
        },
        "Third party": {
            "Congress": {
                "Senate": {
                    "Democrats": {
                        "Inflation Reduction Act": {
                            "General": [
                                "inflation_reduction_act_in_effect"
                            ],
                            "Electric vehicle credit": {
                                "New": {
                                    "Battery components": [
                                        "inflation_reduction_act_ev_battery_components_amount",
                                        "inflation_reduction_act_ev_battery_components_threshold",
                                    ],
                                    "Critical minerals": [
                                        "inflation_reduction_act_ev_critical_minerals_amount",
                                        "inflation_reduction_act_ev_critical_minerals_threshold",
                                    ],
                                    "Eligibility": [
                                        "inflation_reduction_act_ev_new_income_limit",
                                        "inflation_reduction_act_ev_new_msrp_limit",
                                    ]
                                },
                                "Used": {
                                    "Amount": [
                                        "inflation_reduction_act_ev_used_max_amount",
                                        "inflation_reduction_act_ev_used_sale_price_percent",
                                    ],
                                    "Eligibility": [
                                        "inflation_reduction_act_ev_used_income_limit",
                                        "inflation_reduction_act_ev_used_sale_price_limit",
                                    ]
                                }
                            }
                        }
                    }
                },
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
                        "young_child_bi",
                        "older_child_bi_age",
                        "older_child_bi",
                        "young_adult_bi_age",
                        "young_adult_bi",
                        "older_adult_bi_age",
                        "older_adult_bi",
                        "senior_bi_age",
                        "senior_bi",
                    ],
                    "Phase-outs": [
                        "bi_phase_out_rate",
                        "bi_phase_out_threshold",
                    ],
                },
                "Flat tax": [
                    "flat_tax",
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
    showSnapShot = false
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
        inflation_reduction_act_ev_battery_components_amount: { max: 10_000 },
        inflation_reduction_act_ev_critical_minerals_amount: { max: 10_000 },
        // Each parameter breakdown requires separate treatment.
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_SINGLE: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_JOINT: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_SEPARATE: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_HEAD_OF_HOUSEHOLD: { max: 10_000 },
        contrib_tlaib_end_child_poverty_act_filer_credit_amount_WIDOW: { max: 10_000 },
    }
    extraVariableMetadata = {
        new_electric_vehicle_msrp: { max: 100_000 },
        new_electric_vehicle_battery_capacity: { max: 100 },
        used_electric_vehicle_sale_price: { max: 100_000 },
    }
    situation = {
        "people": {
            "You": {
                "age": { 2022: 25 },
                "is_tax_unit_head": { 2022: true },
                "is_tax_unit_dependent": { 2022: false },
                "is_tax_unit_spouse": { 2022: false },
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
    }
    inputVariables = [
        // Person.
        "age",
        "employment_income",
        "dividend_income",
        "interest_income",
        "gi_cash_assistance",
        "medical_out_of_pocket_expenses",
        "social_security_dependents",
        "social_security_disability",
        "social_security_retirement",
        "social_security_survivors",
        "is_tax_unit_dependent",
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
        "is_eligible_for_american_opportunity_credit",
        // Tax unit.
        "premium_tax_credit",
        "new_electric_vehicle_battery_capacity",
        "new_electric_vehicle_battery_components_made_in_north_america",
        "new_electric_vehicle_battery_critical_minerals_extracted_in_trading_partner_country",
        "new_electric_vehicle_classification",
        "new_electric_vehicle_msrp",
        "purchased_qualifying_new_electric_vehicle",
        "purchased_qualifying_used_electric_vehicle",
        "used_electric_vehicle_sale_price",
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
        "cdcc_qualified_dependent",
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
                "is_homeless",
            ],
            "Expenses": {
                "Household": [
                    "housing_cost",
                    "childcare_expenses",
                    "phone_cost",
                    "broadband_cost",
                ],
                "Vehicle": [
                    "purchased_qualifying_new_electric_vehicle",
                    "new_electric_vehicle_classification",
                    "new_electric_vehicle_msrp",
                    "new_electric_vehicle_battery_capacity",
                    "new_electric_vehicle_battery_components_made_in_north_america",
                    "new_electric_vehicle_battery_critical_minerals_extracted_in_trading_partner_country",
                    "purchased_qualifying_used_electric_vehicle",
                    "used_electric_vehicle_sale_price",
                ],
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
                "is_ssi_disabled",
                "is_permanently_disabled_veteran",
                "is_surviving_spouse_of_disabled_veteran",
                "is_surviving_child_of_disabled_veteran",
                "is_mother",
                "is_pregnant",
                "is_breastfeeding",
                "is_wic_at_nutritional_risk",
                "cdcc_qualified_dependent",
            ],
            "Expenses": [
                "medical_out_of_pocket_expenses",
                "qualified_tuition_expenses",
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
        "wa_income_tax": {
            "add": [
                "wa_capital_gains_tax"
            ],
            "subtract": [
                "wa_working_families_tax_credit"
            ]
        },
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
        });
    }


    addPartner(situation) {
        const name = "Your spouse"
        situation.people[name] = {
            "age": { "2022": 25 },
            "is_tax_unit_dependent": { "2022": false },
            "is_tax_unit_spouse": { "2022": true },
            "is_tax_unit_head": { "2022": false },
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
        situation.people[childName] = {
            "age": { "2022": 10 },
            "is_in_k12_school": { "2022": true },
            "is_tax_unit_dependent": { "2022": true },
            "is_tax_unit_spouse": { "2022": false },
            "is_tax_unit_head": { "2022": false },
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
        if (name === "Your spouse") {
            if (!situation["families"]["Your family"]["is_married"]) {
                situation["families"]["Your family"]["is_married"] = { "2022": false }
            }
            situation["families"]["Your family"]["is_married"]["2022"] = false;
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
            name => this.situation.people[name].age["2022"] >= 18
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
