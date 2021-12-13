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
    "snap_net_income",
    "snap_max_benefit",
    "snap_expected_contribution_towards_food",
    "snap",
];

export const HOUSEHOLD_VARIABLES = [
    "state_code",
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
    "Supplemental Nutrition Assistance Program": [
        "snap_gross_income",
        "snap_deductions",
        "snap_net_income",
        "snap_max_benefit",
        "snap_expected_contribution_towards_food",
        "snap",
    ],
}

export const DEFAULT_SITUATION = {
    "people": {},
    "tax_units": {},
    "families": {},
    "spm_units": {},
    "households": {},
}