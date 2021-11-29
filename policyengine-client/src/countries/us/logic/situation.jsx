import { PERSON_VARIABLES, TAX_UNIT_VARIABLES, FAMILY_VARIABLES, SPM_UNIT_VARIABLES, HOUSEHOLD_VARIABLES } from "../data/situation";

export function validateSituation(situation) {
    if(Object.keys(situation.people).length === 0) {
        situation.people["You"] = {
            "age": {"2021": 18},
            "is_tax_unit_spouse": {"2021": false},
        }
    }
    if(Object.keys(situation.tax_units).length === 0) {
        situation.tax_units = {
            "Your tax unit": {
                "members": ["You"],
            }
        };
    }
    if(Object.keys(situation.families).length === 0) {
        situation.families = {
            "Your family": {
                "members": ["You"],
            }
        };
    }
    if(Object.keys(situation.spm_units).length === 0) {
        situation.spm_units = {
            "Your SPM unit": {
                "members": ["You"],
            }
        };
    }
    if(Object.keys(situation.households).length === 0) {
        situation.households = {
            "Your household": {
                "members": ["You"],
            }
        };
    }
    for(let person in situation.people) {
        for (let variable of PERSON_VARIABLES) {
            if(!Object.keys(situation.people[person]).includes(variable)) {
                situation.people[person][variable] = {"2021": null};
            }
        }
    }
    for(let tax_unit in situation.tax_units) {
        for (let variable of TAX_UNIT_VARIABLES) {
            if(!Object.keys(situation.tax_units[tax_unit]).includes(variable)) {
                situation.tax_units[tax_unit][variable] = {"2021": null};
            }
        }
    }
    for(let family in situation.families) {
        for (let variable of FAMILY_VARIABLES) {
            if(!Object.keys(situation.families[family]).includes(variable)) {
                situation.families[family][variable] = {"2021": null};
            }
        }
    }
    for(let spm_unit in situation.spm_units) {
        for (let variable of SPM_UNIT_VARIABLES) {
            if(!Object.keys(situation.spm_units[spm_unit]).includes(variable)) {
                situation.spm_units[spm_unit][variable] = {"2021": null};
            }
        }
    }
    for (let variable of HOUSEHOLD_VARIABLES) {
        if(!Object.keys(situation.households["Your household"]).includes(variable)) {
            situation.households["Your household"][variable] = {"2021": null};
        }
    }
    return {
        situation: situation,
        situationValid: true,
    }
}

const childNamer = {
    1: "Your first child",
    2: "Your second child",
    3: "Your third child",
    4: "Your fourth child",
    5: "Your fifth child",
}

function numAdultsAndChildren(situation) {
    let numAdults = 0;
    let numChildren = 0;
    for(let person in situation.people) {
        if(situation.people[person].age["2021"] >= 18) {
            numAdults++;
        } else {
            numChildren++;
        }
    }
    return {
        numAdults: numAdults,
        numChildren: numChildren,
    }
}

export const situationButtons = {
    addPartnerToMyBenUnit: {
        text: "Add partner",
        available: situation => numAdultsAndChildren(situation).numAdults < 2,
        apply: situation => {
            situation.people["Your partner"] = {
                "age": {"2021": 18}, 
                "is_tax_unit_spouse": {"2021": true},
            };
            situation.tax_units["Your tax unit"].members.push("Your partner");
            situation.families["Your family"].members.push("Your partner");
            situation.spm_units["Your SPM unit"].members.push("Your partner");
            situation.households["Your household"].members.push("Your partner");
            return validateSituation(situation).situation;
        }
    },
    addChildToMyBenUnit: {
        text: "Add child",
        available: situation => numAdultsAndChildren(situation).numAdults < 5,
        apply: situation => {
            const childName = childNamer[numAdultsAndChildren(situation).numChildren + 1];
            situation.people[childName] = {
                "age": {"2021": 10},
                "is_tax_unit_spouse": {"2021": false},
            };
            situation.tax_units["Your tax unit"].members.push(childName);
            situation.families["Your family"].members.push(childName);
            situation.spm_units["Your SPM unit"].members.push(childName);
            situation.households["Your household"].members.push(childName);
            return validateSituation(situation).situation;
        }
    },
    removePerson: {
        available: () => false,
        apply: (situation, name) => {
            for(let tax_unit of Object.keys(situation.tax_units)) {
                if(situation.tax_units[tax_unit].members.includes(name)) {
                    situation.tax_units[tax_unit].members.pop(name);
                }
            }
            for(let family of Object.keys(situation.families)) {
                if(situation.families[family].members.includes(name)) {
                    situation.families[family].members.pop(name);
                }
            }
            for(let spm_unit of Object.keys(situation.spm_units)) {
                if(situation.spm_units[spm_unit].members.includes(name)) {
                    situation.spm_units[spm_unit].members.pop(name);
                }
            }
            if(situation.households["Your household"].members.includes(name)) {
                situation.households["Your household"].members.pop(name);
            }
            delete situation.people[name];
            return validateSituation(situation).situation;
        }
    }
}