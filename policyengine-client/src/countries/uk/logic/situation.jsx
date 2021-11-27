import { PERSON_VARIABLES, BENUNIT_VARIABLES, HOUSEHOLD_VARIABLES } from "../data/situation";

export function validateSituation(situation) {
    if(Object.keys(situation.people).length === 0) {
        situation.people["You"] = {}
    }
    if(Object.keys(situation.benunits).length === 0) {
        situation.benunits = {
            "Your immediate family": {
                "adults": ["You"],
            }
        };
    }
    if(Object.keys(situation.households).length === 0) {
        situation.households = {
            "Your household": {
                "adults": ["You"],
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
