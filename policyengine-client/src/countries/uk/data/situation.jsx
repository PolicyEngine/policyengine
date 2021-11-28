export const PERSON_VARIABLES = [
    "age",
    "employment_income",
    "self_employment_income",
    "pension_income",
    "state_pension",
    "dividend_income",
    "property_income",
    "savings_interest_income",
    "is_in_startup_period",
    "limited_capability_for_WRA",
    "weekly_hours",
    "net_income",
    "tax",
];

export const BENUNIT_VARIABLES = [
    "is_married",
    "benunit_rent",
    "claims_all_entitled_benefits",
    "claims_UC",
    "claims_child_benefit",
    "claims_legacy_benefits",
    "would_claim_WTC",
    "would_claim_CTC",
    "would_claim_HB",
    "would_claim_JSA",
    "would_claim_PC",
];

export const HOUSEHOLD_VARIABLES = [
    "household_net_income",
    "household_num_people",
    "household_num_benunits",
    "household_market_income",
    "BRMA",
    "region",
    "country",
    "land_value",
    "carbon_consumption",
]

export const EXTRA_VARIABLE_METADATA = {
    "age": {
        "max": 100,
    },
    "carbon_consumption": {
        "max": 100,
    }
}

export const VARIABLE_CATEGORIES = {
    "Demographic": [
        "age", 
        "is_married",
        "BRMA",
        "region",
        "country",
    ],
    "Income": [
        "employment_income",
        "self_employment_income",
        "pension_income",
        "state_pension",
        "dividend_income",
        "property_income",
        "savings_interest_income",
        "weekly_hours",
    ],
    "Wealth": [
        "land_value",
    ],
    "Expense": [
        "benunit_rent",
        "carbon_consumption",
    ],
    "Benefits": [
        "claims_all_entitled_benefits",
        "claims_UC",
        "is_in_startup_period",
        "limited_capability_for_WRA",
        "claims_child_benefit",
        "claims_legacy_benefits",
        "would_claim_WTC",
        "would_claim_CTC",
        "would_claim_HB",
        "would_claim_JSA",
        "would_claim_PC",
    ]
}

export const DEFAULT_SITUATION = {
    "people": {},
    "benunits": {},
    "households": {}
}