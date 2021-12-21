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
    "would_claim_child_benefit",
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
    "carbon_consumption",
    "owned_land",
    "property_wealth",
    "main_residence_value",
    "other_residential_property_value",
    "non_residential_property_value",
    "expected_sdlt",
    "corporate_wealth",
    "land_value",
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
        "owned_land",
        "main_residence_value",
        "other_residential_property_value",
        "non_residential_property_value",
        "property_wealth",
        "corporate_wealth",
        "land_value",
    ],
    "Consumption": [
        "benunit_rent",
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
        "carbon_consumption",
    ],
    "Benefits": [
        "claims_all_entitled_benefits",
        "claims_UC",
        "is_in_startup_period",
        "limited_capability_for_WRA",
        "would_claim_child_benefit",
        "claims_legacy_benefits",
        "would_claim_WTC",
        "would_claim_CTC",
        "would_claim_HB",
        "would_claim_JSA",
        "would_claim_PC",
    ],
    "Tax": [
        "expected_stamp_duty",
    ]
}

export const DEFAULT_SITUATION = {
    "people": {},
    "benunits": {},
    "households": {}
}