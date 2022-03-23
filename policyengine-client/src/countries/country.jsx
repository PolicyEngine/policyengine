/* 
    * This file contains static data for each country.
*/
import { createContext } from "react";

export default class Country {
    stateHolder = null
    populationImpactResults = null
    populationImpactBreakdownResults = null

    updatePolicy(name, value) {
        // Update a parameter - validate, then update the state
        let oldPolicy = this.policy;
        oldPolicy[name].value = value;
        let { policy, policyValid } = this.validatePolicy(oldPolicy);
        this.stateHolder.setCountryState({
            policy: policy,
            policyValid: policyValid,
            populationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
            situationVariationImpactIsOutdated: true
        });
    }

    updateEntirePolicy(policy) {
        this.stateHolder.setCountryState({
            policy: policy,
            populationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
            situationVariationImpactIsOutdated: true
        });
    }

    getPolicyJSONPayload() {
        const submission = {};
        for (const key in this.policy) {
            if (this.policy[key].value !== this.policy[key].defaultValue) {
                submission[key] = this.policy[key].value;
            }
        }
        return submission;
    }

    setState(object, callback) {
        this.stateHolder.setCountryState(object, callback);
    }

    validatePolicy = policy => { return { policy: policy, valid: true } };

    parameterHierarchy = {};

    validateSituation(situation) {
        let metadata;
        let entity;
        let value;
        for (let variable of this.inputVariables) {
            metadata = this.variables[variable];
            if (!metadata) {
                throw new Error(`Failed to load ${variable}.`)
            }
            value = metadata.valueType === "Enum" ? metadata.defaultValue.key : metadata.defaultValue;
            entity = this.entities[metadata.entity];
            for (let entityInstance of Object.keys(situation[entity.plural])) {
                if (!Object.keys(situation[entity.plural][entityInstance]).includes(variable)) {
                    situation[entity.plural][entityInstance][variable] = { "2022": value };
                }
            }
        }
        for (let variable of this.outputVariables) {
            metadata = this.variables[variable];
            if (!metadata) {
                throw new Error(`Failed to load ${variable}.`)
            }
            entity = this.entities[metadata.entity];
            for (let entityInstance of Object.keys(situation[entity.plural])) {
                if (!Object.keys(situation[entity.plural][entityInstance]).includes(variable)) {
                    situation[entity.plural][entityInstance][variable] = { "2022": null };
                }
            }
        }
        return { situation: situation, valid: true }
    }

    policyIsOutdated = true;
    situationIsOutdated = true;
    populationImpactIsOutdated = true;
    baselineSituationImpactIsOutdated = true;
    reformSituationImpactIsOutdated = true;
    situationVariationImpactIsOutdated = true;

    computedBaselineSituation = null;
    computedReformSituation = null;

    updateSituationValue(entityType, entityName, variable, value) {
        let situation = this.situation;
        situation[this.entities[entityType].plural][entityName][variable] = { "2022": value };
        this.setState({
            situation: situation,
            baselineSituationImpactIsOutdated: true,
            situationVariationImpactIsOutdated: true,
            reformSituationImpactIsOutdated: true,
        });
    }

    useLocalServer = false;
    usePolicyEngineOrgServer = false;
}

export const CountryContext = createContext({name: "uk"});