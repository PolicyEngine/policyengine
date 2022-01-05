/* 
    * This file contains static data for each country.
*/
import { createContext } from "react";

export default class Country {
    stateHolder = null
    populationImpactResults = null
    populationImpactBreakdownResults = null
    populationImpactOutdated = true

    updatePolicy(name, value) {
        // Update a parameter - validate, then update the state
        let oldPolicy = this.policy;
		oldPolicy[name].value = value;
		let { policy, policyValid } = this.validatePolicy(oldPolicy);
		this.stateHolder.setCountryState({policy: policy, policyValid: policyValid, populationImpactOutdated: true});
    }

    updateEntirePolicy(policy) {
        this.stateHolder.setCountryState({policy: policy, populationImpactOutdated: true});
    }

    getPolicyJSONPayload() {
        const submission = {};
		for (const key in this.policy) {
			if(this.policy[key].value !== this.policy[key].defaultValue) {
				submission[key] = this.policy[key].value;
			}
		}
        return submission;
    }

    setState(object) {
        this.stateHolder.setCountryState(object);
    }

    validatePolicy = policy => {return {policy: policy, valid: true}};

    parameterHierarchy = {};
}

export const CountryContext = createContext(null);