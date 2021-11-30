export const PERSON_VARIABLES = [
    "age",
];

export const TAX_UNIT_VARIABLES = [
    "mars",
];

export const FAMILY_VARIABLES = [];

export const SPM_UNIT_VARIABLES = [
    "school_meal_subsidy",
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
    }
};

export const VARIABLE_CATEGORIES = {
    "Demographic": [
        "age",
        "mars",
        "state_code",
    ],
    "Benefits": [
        "school_meal_subsidy",
    ]
}

export const DEFAULT_SITUATION = {
    "people": {},
    "tax_units": {},
    "families": {},
    "spm_units": {},
    "households": {},
}