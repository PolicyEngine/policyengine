export const PERSON_VARIABLES = [
    "age",
    "employment_income",
    "net_income",
];

export const BENUNIT_VARIABLES = [
    "claims_UC",
];

export const HOUSEHOLD_VARIABLES = [
    "household_net_income",
    "household_num_people",
    "household_num_benunits",
    "household_market_income",
]

export const EXTRA_VARIABLE_METADATA = {
    "age": {
        "max": 100,
    }
}

export const VARIABLE_CATEGORIES = {
    "Demographic": ["age"],
    "Income": ["employment_income"],
}

export const DEFAULT_SITUATION = {
    "people": {},
    "benunits": {},
    "households": {}
}