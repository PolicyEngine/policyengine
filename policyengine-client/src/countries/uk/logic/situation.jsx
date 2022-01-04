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
    situation["states"] = {"state": {"citizens": Object.keys(situation.people)}}
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

function addPartner(situation) {
    situation.people["Your partner"] = {};
    situation.benunits["Your immediate family"].adults.push("Your partner");
    situation.households["Your household"].adults.push("Your partner");
    return validateSituation(situation).situation;
}

function addChild(situation) {
    const childName = childNamer[situation.benunits["Your immediate family"].children.length + 1];
    situation.people[childName] = {};
    situation.benunits["Your immediate family"].children.push(childName);
    situation.households["Your household"].children.push(childName);
    return validateSituation(situation).situation;
}

function removePerson(situation, name) {
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

function setNumAdults(situation, numAdults) {
    const numExistingAdults = situation.households["Your household"].adults.length;
    if(numExistingAdults == 1 && numAdults == 2) {
        situation = addPartner(situation);
    } else if(numExistingAdults == 2 && numAdults == 1) {
        situation = removePerson(situation, "Your partner");
    }
    return validateSituation(situation).situation;
}

function setNumChildren(situation, numChildren) {
    const numExistingChildren = situation.households["Your household"].children.length;
    if(numExistingChildren < numChildren) {
        for(let i = numExistingChildren; i < numChildren; i++) {
            situation = addChild(situation);
        }
    } else if(numExistingChildren > numChildren) {
        for(let i = numExistingChildren; i > numChildren; i--) {
            situation = removePerson(situation, childNamer[i]);
        }
    }
    return validateSituation(situation).situation;
}

export const situationActions = {
    addPartner: addPartner,
    addChild: addChild,
    removePerson: removePerson,
    setNumAdults: setNumAdults,
    setNumChildren: setNumChildren,
}