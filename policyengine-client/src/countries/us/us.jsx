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

export class US extends Country {
    constructor() {
        super();
        this.baseApiUrl = !this.useLocalServer ?
                        `${window.location.protocol}//${window.location.hostname}` :
                        `http://localhost:5000`;
        this.apiURL = `${this.baseApiUrl}/${this.name}/api`;
    }
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


    addPartner(situation) {
        const name = "Your partner"
        situation.people[name] = {
            "age": {"2021": 25},
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
            "age": {"2021": 10},
        };
        situation.families["Your family"].members.push(childName);
        situation.tax_units["Your tax unit"].members.push(childName);
        situation.spm_units["Your SPM unit"].members.push(childName);
        situation.households["Your household"].members.push(childName);
        return this.validateSituation(situation).situation;
    }
    
    removePerson(situation, name) {
        for(let entityPlural of ["tax_units", "families", "spm_units", "households"]) {
            for(let entity of Object.keys(situation[entityPlural])) {
                if(situation[entityPlural][entity].members.includes(name)) {
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
        if(numExistingAdults === 1 && numAdults === 2) {
            situation = this.addPartner(situation);
        } else if(numExistingAdults === 2 && numAdults === 1) {
            situation = this.removePerson(situation, "Your partner");
        }

        this.setState({
            situation: this.validateSituation(situation).situation, 
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
        });    }

    getNumAdults() {
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age["2021"] >= 18
        ).length;
    }
    
    setNumChildren(numChildren) {
        let situation = this.situation;
        const numExistingChildren = this.getNumChildren();
        if(numExistingChildren < numChildren) {
            for(let i = numExistingChildren; i < numChildren; i++) {
                situation = this.addChild(situation);
            }
        } else if(numExistingChildren > numChildren) {
            for(let i = numExistingChildren; i > numChildren; i--) {
                situation = this.removePerson(situation, childNamer[i]);
            }
        }

        this.setState({
            situation: this.validateSituation(situation).situation, 
            baselineSituationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
        });    }

    getNumChildren() {
        return this.situation.households["Your household"].members.filter(
            name => this.situation.people[name].age["2021"] < 18
        ).length;
    }
};