export const VARIABLE_HIERARCHY = {
    "Demographic": {
        "Personal": [
            "age",
        ],
        "Household": [
            "region",
        ],
    },
    "Income": [
        "employment_income",
        "self_employment_income",
    ]
}

const PERSON_DEMOGRAPHICS = [
    "age",
]

const PERSON_INCOME_SOURCES = [
    "employment_income",
    "self_employment_income",
    "pension_income",
    "state_pension",
    "dividend_income",
    "property_income",
    "savings_interest_income",
]

const PERSON_JOB_RELATED = [
    "is_in_startup_period",
    "limited_capability_for_WRA",
    "weekly_hours",
]

const PERSON_OUTPUTS = [
    "tax",
]

export const PERSON_VARIABLES = [
    ...PERSON_DEMOGRAPHICS,
    ...PERSON_INCOME_SOURCES,
    ...PERSON_JOB_RELATED,
    ...PERSON_OUTPUTS,
]

const BENUNIT_DEMOGRAPHICS = [
    "is_married",
    "claims_all_entitled_benefits",
]

const BENUNIT_EXPENSES = [
    "benunit_rent",
]

const BENUNIT_OUTPUTS = [
    "universal_credit",
]

export const BENUNIT_VARIABLES = [
    ...BENUNIT_DEMOGRAPHICS,
    ...BENUNIT_EXPENSES,
    ...BENUNIT_OUTPUTS,
]

const HOUSEHOLD_DEMOGRAPHICS = [
    "BRMA",
    "region",
    "country",
]

const HOUSEHOLD_CONSUMPTION = [
    "food_and_non_alcoholic_beverages_consumption",
    "alcohol_and_tobacco_consumption",
    "clothing_and_footwear_consumption",
    "housing_water_and_electricity_consumption",
    "household_furnishings_consumption",
    "health_consumption",
    "transport_consumption",
    "communication_consumption",
    "recreation_consumption",
    "education_consumption",
    "restaurants_and_hotels_consumption",
    "miscellaneous_consumption",
    "council_tax",
]

const HOUSEHOLD_WEALTH = [
    "owned_land",
    "main_residence_value",
    "other_residential_property_value",
    "non_residential_property_value",
    "corporate_wealth",
]

const HOUSEHOLD_OUTPUTS = [
    "land_value",
    "LVT",
    "carbon_consumption",
    "carbon_tax",
    "household_tax",
    "expected_sdlt",
    "expected_ltt",
    "expected_lbtt",
    "business_rates",
]

export const HOUSEHOLD_VARIABLES = [
    ...HOUSEHOLD_DEMOGRAPHICS,
    ...HOUSEHOLD_CONSUMPTION,
    ...HOUSEHOLD_WEALTH,
    ...HOUSEHOLD_OUTPUTS,
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
    "Demographics": [
        ...PERSON_DEMOGRAPHICS,
        ...BENUNIT_DEMOGRAPHICS,
        ...HOUSEHOLD_DEMOGRAPHICS,
    ],
    "Income": [
        ...PERSON_INCOME_SOURCES,
    ],
    "Employment": [
        ...PERSON_JOB_RELATED,
    ],
    "Consumption": [
        ...HOUSEHOLD_CONSUMPTION,
    ],
    "Wealth": [
        ...HOUSEHOLD_WEALTH,
    ],
    "Tax/Benefit": [
        ...PERSON_OUTPUTS,
        ...BENUNIT_OUTPUTS,
        ...HOUSEHOLD_OUTPUTS,
    ],
}

export const INPUT_VARIABLES = [
    ...PERSON_DEMOGRAPHICS,
    ...PERSON_INCOME_SOURCES,
    ...PERSON_JOB_RELATED,
    ...BENUNIT_DEMOGRAPHICS,
    ...HOUSEHOLD_DEMOGRAPHICS,
    ...HOUSEHOLD_CONSUMPTION,
    ...HOUSEHOLD_WEALTH,
]

export const OPEN_CATEGORIES = [
    "Demographics",
    "Tax/Benefit",
]

export const DEFAULT_SITUATION = {
    "people": {},
    "benunits": {},
    "households": {}
}