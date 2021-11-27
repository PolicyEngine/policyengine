import { PERSON_VARIABLES, BENUNIT_VARIABLES, HOUSEHOLD_VARIABLES } from "../data/situation";

export function validateSituation(situation) {
    if(Object.keys(situation.people).length === 0) {
        situation.people["You"] = {}
    }
    if(Object.keys(situation.benunits).length === 0) {
        situation.benunits = {
            "Your immediate family": {
                "adults": ["You"],
                "children": [],
                "claims_all_entitled_benefits": {"2021": true},
                "claims_legacy_benefits": {"2021": false},
            }
        };
    }
    if(Object.keys(situation.households).length === 0) {
        situation.households = {
            "Your household": {
                "adults": ["You"],
                "children": [],
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
    for(let benunit in situation.benunits) {
        for (let variable of BENUNIT_VARIABLES) {
            if(!Object.keys(situation.benunits[benunit]).includes(variable)) {
                situation.benunits[benunit][variable] = {"2021": null};
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

export const situationButtons = {
    addPartnerToMyBenUnit: {
        text: "Add partner",
        available: situation => situation.benunits["Your immediate family"].adults.length < 2,
        apply: situation => {
            situation.people["Your partner"] = {};
            situation.benunits["Your immediate family"].adults.push("Your partner");
            situation.households["Your household"].adults.push("Your partner");
            return validateSituation(situation).situation;
        }
    },
    addChildToMyBenUnit: {
        text: "Add child",
        available: situation => situation.benunits["Your immediate family"].children.length < 5,
        apply: situation => {
            const childName = childNamer[situation.benunits["Your immediate family"].children.length + 1];
            situation.people[childName] = {};
            situation.benunits["Your immediate family"].children.push(childName);
            situation.households["Your household"].children.push(childName);
            return validateSituation(situation).situation;
        }
    },
    removePerson: {
        available: () => false,
        apply: (situation, name) => {
            for(let benunit of Object.keys(situation.benunits)) {
                if(situation.benunits[benunit].adults.includes(name)) {
                    situation.benunits[benunit].adults.pop(name);
                }
                if(situation.benunits[benunit].children.includes(name)) {
                    situation.benunits[benunit].children.pop(name);
                }
            }
            if(situation.households["Your household"].adults.includes(name)) {
                situation.households["Your household"].adults.pop(name);
            }
            if(situation.households["Your household"].children.includes(name)) {
                situation.households["Your household"].children.pop(name);
            }
            delete situation.people[name];
            return validateSituation(situation).situation;
        }
    }
}