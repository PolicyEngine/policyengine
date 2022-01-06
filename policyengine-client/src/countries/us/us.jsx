/*
 * Parameters for the US app.
*/

import Country from "../country"

export class US extends Country {
    name = "us"
    properName = "US"
    beta = false
    // Pages to show
    showPolicy = false
    showPopulationImpact = false
    showHousehold = true
    showFAQ = true
    // Vanity URLs
    namedPolicies = {
        "/ubi-labs/resilience-ubi": "WA_adult_UBI_age=16&adult_UBI=184&child_UBI=92&senior_UBI=184&abolish_CB=1&abolish_CTC=1&abolish_ESA_income=1&abolish_IS=1&abolish_JSA_income=1&abolish_PC=1&abolish_SP=1&abolish_UC_carer=1&abolish_UC_child=1&abolish_UC_childcare=1&abolish_UC_standard=1&abolish_WTC=1&personal_allowance=0&higher_threshold=50000&add_rate=60&basic_rate=35&higher_rate=55&NI_add_rate=10&NI_class_4_add_rate=10&NI_class_4_main_rate=10&NI_main_rate=10",
        "/ubi-labs/covid-dividend": "child_UBI=46&adult_UBI=92&senior_UBI=46&WA_adult_UBI_age=16"
    }
    // Policy page metadata
    parameterHierarchy = {}
    defaultOpenParameterGroups = []
    defaultSelectedParameterGroup = null
    organisations = {}
    // OpenFisca data
    apiURL = "http://localhost:5000/us/api"
    parameters = null
    entities = null
    variables = null
    // Adjustments to OpenFisca data
    extraParameterMetadata = {}
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
        "age",
        "state_code",
    ]
    outputVariables = [
        "snap",
        "snap_deductions",
        "snap_gross_income",
        "snap_net_income",
        "snap_standard_deduction",
        "snap_earnings_deduction",
        "snap_dependent_care_deduction",
        "snap_child_support_deduction",
        "snap_medical_expense_deduction",
        "snap_shelter_deduction",
    ]
    inputVariableHierarchy = {
        "General": [],
        "Demographic": {
            "Personal" : [
                "age",
            ],
            "Household": [
                "state_code",
            ]
        },
    }
    defaultOpenVariableGroups = [
        "/Demographic",
    ]
    defaultSelectedVariableGroup = "/General"
    outputVariableHierarchy = {
        "snap_net_income": {
            "add": [
                "snap_gross_income",
            ],
            "subtract": [
                "snap_deductions",
            ]
        },
        "snap_deductions": {
            "add": [
                "snap_standard_deduction",
                "snap_earnings_deduction",
                "snap_dependent_care_deduction",
                "snap_child_support_deduction",
                "snap_medical_expense_deduction",
                "snap_shelter_deduction",
            ]
        }
    }
};
