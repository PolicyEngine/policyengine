export const PERSON_VARIABLES = [
    "age",
    "market_income",
];

export const TAX_UNIT_VARIABLES = [
    "mars",
];

export const FAMILY_VARIABLES = [];

export const SPM_UNIT_VARIABLES = [
    "school_meal_subsidy",
    "snap_gross_income",
    "snap_deductions",
    "snap_standard_deduction",
    "snap_earnings_deduction",
    "snap_medical_expense_deduction",
    "snap_child_support_deduction",
    "snap_dependent_care_deduction",
    "snap_shelter_deduction",
    "snap_utility_allowance_type",
    "snap_utility_allowance",
    "snap_net_income",
    "snap_max_benefit",
    "snap_expected_contribution",
    "snap",
    "housing_cost",
];

export const HOUSEHOLD_VARIABLES = [
    "state_code",
    "has_heating_cooling_expense",
    "has_telephone_expense",
    "has_other_utility_expense",    
]

export const EXTRA_VARIABLE_METADATA = {
    "age": {
        "max": 100,
    },
    "school_meal_subsidy": {
        "max": 10_000,
    },
    "market_income": {
        "max": 100_000,
    },
    "snap_gross_income": {
        "max": 100_000,
    }
};

export const VARIABLE_CATEGORIES = {
    "Income": [
        "market_income",
    ],
    "Demographic": [
        "age",
        "mars",
        "state_code",
    ],
    "School meal subsidy": [
        "school_meal_subsidy",
    ],
    "SNAP (Overview)": [
        "snap_gross_income",
        "snap_deductions",
        "snap_net_income",
        "snap_max_benefit",
        "snap_expected_contribution",
        "snap",
    ],
    "SNAP (Deductions)": [
        "snap_standard_deduction",
        "snap_earnings_deduction",
        "snap_medical_expense_deduction",
        "snap_child_support_deduction",
        "snap_dependent_care_deduction",
        "snap_shelter_deduction",
        "snap_utility_allowance_type",
        "snap_utility_allowance",
    ],
    "Housing expenses": [
        "housing_cost",
        "has_heating_cooling_expense",
        "has_telephone_expense",
        "has_other_utility_expense",
    ],
}

export const DEFAULT_SITUATION = {
    "people": {},
    "tax_units": {},
    "families": {},
    "spm_units": {},
    "households": {},
}