/*
 * Parameters for the US app.
*/

import Country from "../country"

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
    beta = false
    // Pages to show
    showPolicy = true
    showPopulationImpact = false
    showHousehold = true
    showFAQ = true
    // Vanity URLs
    namedPolicies = {}
    validatePolicy = validatePolicy;
    // Policy page metadata
    parameterHierarchy = {
        "SNAP": {
            "Eligibility": [
                "snap_gross_income_limit_standard",
                "snap_gross_income_limit_elderly_disabled",
                "snap_net_income_limit_standard",
            ],
            "Deductions": [
                "snap_earned_income_deduction",
            ]
        }
    }
    defaultOpenParameterGroups = ["/SNAP"]
    defaultSelectedParameterGroup = "/SNAP/Eligibility"
    organisations = {}
    // OpenFisca data
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
        // Person.
        "age",
        "employment_income",
        "self_employment_income",
        "dividend_income",
        "interest_income",
        "medical_out_of_pocket_expenses",
        "ssdi",
        "is_ssi_disabled",
        "is_permanently_disabled_veteran",
        "is_surviving_spouse_of_disabled_veteran",
        "is_surviving_child_of_disabled_veteran",
        // SPM unit.
        "ssi",
        "housing_cost",
        "childcare_expenses",
        // Household.
        "state_code",
        "is_homeless",
    ]
    outputVariables = [
        "spm_unit_net_income",
        "snap_max_allotment",
        "snap_expected_contribution",
        "snap",
    ]
    inputVariableHierarchy = {
        "General": [],
        "Personal": [
            "age",
            "employment_income",
            "self_employment_income",
            "dividend_income",
            "interest_income",
            "medical_out_of_pocket_expenses",
            "ssdi",
            "is_ssi_disabled",
            "is_permanently_disabled_veteran",
            "is_surviving_spouse_of_disabled_veteran",
            "is_surviving_child_of_disabled_veteran",
        ],
        "SPM unit": [
            "ssi",
            "housing_cost",
            "childcare_expenses",
        ],
        "Household": [
            "state_code",
            "is_homeless",
        ]
    }
    defaultOpenVariableGroups = []
    defaultSelectedVariableGroup = "/General"
    outputVariableHierarchy = {
        "spm_unit_net_income": {
            "add": [
                "snap",
            ],
            "subtract": []
        },
        "snap": {
            "add": [
                "snap_max_allotment",
            ],
            "subtract": [
                "snap_expected_contribution",
            ]
        }
    }


    addPartner(situation) {
        const name = "Your partner"
        situation.people[name] = {
            "age": { "2021": 25 },
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
            "age": { "2021": 10 },
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
        delete situation.people[name];
        return this.validateSituation(situation).situation;
    }

    setNumAdults(numAdults) {
        let situation = this.situation;
        const numExistingAdults = this.getNumAdults();
        if (numExistingAdults === 1 && numAdults === 2) {
            situation = this.addPartner(situation);
        } else if (numExistingAdults === 2 && numAdults === 1) {
            situation = this.removePerson(situation, "Your partner");
        }

        this.setState({
            situation: this.validateSituation(situation).situation,
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
        });
    }

    getNumAdults() {
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age["2021"] >= 18
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
        });
    }

    getNumChildren() {
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age["2021"] < 18
        ).length;
    }
};
