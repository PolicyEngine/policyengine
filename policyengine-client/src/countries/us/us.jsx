/*
 * Parameters for the US app.
*/

import Country from "../country"
import TimeTravel from "../uk/components/timeTravel";

const childNamer = {
    1: "Your first child",
    2: "Your second child",
    3: "Your third child",
    4: "Your fourth child",
    5: "Your fifth child",
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
    showPopulationImpact = false
    showHousehold = true
    showEarningsVariation = true
    showFAQ = true
    // Vanity URLs
    namedPolicies = {}
    validatePolicy = validatePolicy;

    parameterComponentOverrides = {
        timeTravel: <TimeTravel />,
    }
    // Policy page metadata
    parameterHierarchy = {
        "Snapshot": [
            "timeTravel",
        ],
        "IRS": {
            "Income tax schedule": [
                "irs_income_bracket_rates",
                "irs_income_bracket_thresholds",
            ],
            "Credits": {
                "Child tax credit": {
                    "Eligibility": [
                        "ctc_child_age",
                    ],
                    "Amount": [
                        "ctc_child",
                        "ctc_adult_dependent",
                    ],
                    "Phaseout": [
                        "ctc_phaseout_rate",
                        "ctc_phaseout_threshold",
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
                    "Phaseout": [
                        "cdcc_phaseout_rate",
                        "cdcc_phaseout_start",
                        "cdcc_min_rate",
                    ],
                },
                "Education": {
                    "Phaseout": [
                        "education_credit_phaseout_start_single",
                        "education_credit_phaseout_start_joint",
                        "education_credit_phaseout_length_single",
                        "education_credit_phaseout_length_joint",
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
        "USDA": {
            "SNAP": {
                "Eligibility": [
                    "snap_gross_income_limit",
                    "snap_net_income_limit",
                ],
                "Deductions": [
                    "snap_earned_income_deduction",
                    "snap_medical_expense_disregard",
                    "snap_homeless_shelter_deduction",
                    "snap_shelter_deduction_income_share_disregard",
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
        },
        "FCC": {
            "Lifeline": {
                "Eligibility": [
                    "lifeline_income_fpl_limit",
                ],
                "Benefit": [
                    "lifeline_amount",
                    "lifeline_rural_tribal_supplement",
                ]
            },
            "Affordable Connectivity Program": {
                "Eligibility": [
                    "acp_income_fpl_limit",
                ],
            },
        },
    }
    defaultOpenParameterGroups = ["/IRS"];
    defaultSelectedParameterGroup = "/IRS/Income tax schedule"
    showSnapShot = false
    organisations = {}
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
    }
    extraVariableMetadata = {}
    situation = {
        "people": {
            "You": {},
        },
        "tax_units": {
            "Your tax unit": {
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
        "self_employment_income",
        "dividend_income",
        "interest_income",
        "gi_cash_assistance",
        "medical_out_of_pocket_expenses",
        "social_security_dependents",
        "social_security_disability",
        "social_security_retirement",
        "social_security_survivors",
        "is_ssi_disabled",
        "ssi",
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
        "self_employment_income",
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
        "spm_unit_fica",
        "spm_unit_federal_tax",
        "snap_normal_allotment",
        "snap_emergency_allotment",
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
            "Expenses": [
                "housing_cost",
                "childcare_expenses",
                "phone_cost",
                "broadband_cost",
            ],
            "Benefits": [
                "fdpir",
            ],
        },
        "People": {
            "Income": [
                "employment_income",
                "self_employment_income",
                "dividend_income",
                "interest_income",
                "gi_cash_assistance",
            ],
            "Benefits": [
                "social_security_retirement",
                "social_security_survivors",
                "social_security_dependents",
                "social_security_disability",
                "ssi",
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
            ],
            "Expenses": [
                "medical_out_of_pocket_expenses",
                "qualified_tuition_expenses",
                "ca_cvrp_vehicle_rebate_amount",
            ],
        }
    }
    extraVariableMetadata = {
        "state_code": {
            "disabled": true,
            "tooltip": "PolicyEngine currently only calculates benefits for California.",
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
                "self_employment_income",
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
            ],
            "subtract": []
        },
        "spm_unit_taxes": {
            "add": [
                "spm_unit_fica",
                "spm_unit_federal_tax",
            ],
            "subtract": []
        },
        "snap": {
            "add": [
                "snap_normal_allotment",
                "snap_emergency_allotment",
            ],
            "subtract": []
        }
    }

    householdMaritalOptions = ["Single", "Married"]

    getHouseholdMaritalStatus() {
        return this.getNumAdults() > 1 ? "Married" : "Single";
    }

    setHouseholdMaritalStatus(status) {
        this.setNumAdults(status === "Single" ? 1 : 2);
    }


    addPartner(situation) {
        const name = "Your spouse"
        situation.people[name] = {
            "age": { "2022": 25 },
        };
        situation.families["Your family"].members.push(name);
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
        };
        situation.families["Your family"].members.push(childName);
        situation.tax_units["Your tax unit"].members.push(childName);
        situation.spm_units["Your SPM unit"].members.push(childName);
        situation.households["Your household"].members.push(childName);
        return this.validateSituation(situation).situation;
    }

    removePerson(situation, name) {
        for (let entityPlural of ["tax_units", "families", "spm_units", "households"]) {
            for (let entity of Object.keys(situation[entityPlural])) {
                if (situation[entityPlural][entity].members.includes(name)) {
                    situation[entityPlural][entity].members.pop(name);
                }
            }
        }
        if (name === "Your spouse") {
            situation["families"]["Your family"]["is_married"]["2022"] = false;
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
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age["2022"] < 18
        ).length;
    }
};
