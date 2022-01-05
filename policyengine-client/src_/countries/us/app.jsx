import React from "react";
import { urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper, BodyWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import Household from "../../common/pages/household";

import { situationButtons, validateSituation } from "./logic/situation";
import { validatePolicy } from "./logic/policy";
import { DEFAULT_SITUATION, EXTRA_VARIABLE_METADATA, VARIABLE_CATEGORIES } from "./data/situation";
import { EXTRA_PARAMETER_DATA } from "./data/policy";

export class PolicyEngineUS extends React.Component {
    constructor(props) {
        super(props);
        // Attach methods
        this.updatePolicy = this.updatePolicy.bind(this);
        this.updateSituation = this.updateSituation.bind(this);
        this.fetchData = this.fetchData.bind(this);

        // Initialise state (before updating from API)
        this.state = {
            policy: {},
            policyValid: false,
            situation: null,
            computedSituation: null,
            situationValid: false,
            variables: {},
            entities: {},
            householdVisited: false,
            currentPage: "policy",
            fetchDone: false,
            validator: this.validatePolicy,
        }
    }

    componentDidMount() {
        // As soon as the page loads, fetch from the API
        this.fetchData();
    }

    fetchData() {
        fetch(this.props.api_url + "/parameters").then(res => res.json()).then(policyData => {
            fetch(this.props.api_url + "/entities").then(res => res.json()).then(entities => {
                fetch(this.props.api_url + "/variables").then(res => res.json()).then(variables => {
                    // Once we've got all the data, check it and update the state
                    let {policy, policyValid} = validatePolicy(urlToPolicy(policyData), policyData);
                    for(let parameter of Object.keys(policy)) {
                        if(Object.keys(EXTRA_PARAMETER_DATA).includes(parameter)) {
                            policy[parameter] = Object.assign(policy[parameter], EXTRA_PARAMETER_DATA[parameter]);
                        }
                    }
                    let {situation, situationValid} = validateSituation(JSON.parse(JSON.stringify(DEFAULT_SITUATION)));
                    for(let variable of Object.keys(variables)) {
                        if(Object.keys(EXTRA_VARIABLE_METADATA).includes(variable)) {
                            variables[variable] = Object.assign(variables[variable], EXTRA_VARIABLE_METADATA[variable]);
                        }
                    }
                    this.setState({
                        // The policy and situation might need adjusting with PolicyEngine-specific modifications
                        policy: JSON.parse(JSON.stringify(policy)),
                        entities: entities,
                        variables: JSON.parse(JSON.stringify(variables)),
                        situation: JSON.parse(JSON.stringify(situation)),
                        policyValid: policyValid,
                        situationValid: situationValid,
                        fetchDone: true,
                    });
                });
            });
        });
    }

    updatePolicy(name, value) {
        // Update a parameter - validate, then update the state
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		let { policy, policyValid } = validatePolicy(oldPolicy);
		this.setState({policy: policy, policyValid: policyValid});
    }

    updateSituation(newSituation, newComputedSituation) {
        // Update the situation - validate, then update the state
        let { situation, situationValid } = validateSituation(newSituation);
        this.setState({situation: situation, situationValid: situationValid, computedSituation: newComputedSituation});
    }

    render() {
        if(!this.state.fetchDone) {
            return <></>;
        }
        const setPage = page => {this.setState({page: page});};
        return (
            <PolicyEngineWrapper>
                <Route exact path="/us">
                    <Redirect to="/us/household" />
                </Route>
                <Header country="us" policy={this.state.policy} household={this.state.householdVisited} hidePolicy hidePopulationImpact hideHouseholdImpact/>
                <BodyWrapper>
                    <Switch>
                        <Route path="/us/household">
                            <Household
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                variables={this.state.variables}
                                policyValid={this.state.policyValid}
                                situationValid={this.state.situationValid}
								situation={this.state.situation}
                                entities={this.state.entities}
                                updateSituation={this.updateSituation}
								setPage={setPage}
                                baseURL="/uk"
                                fetchDone={this.state.fetchDone}
                                defaultSelectedName="You"
                                defaultSelectedType="person"
                                situationStructureButtons={situationButtons}
                                setHouseholdVisited={() => this.setState({householdVisited: true})}
                                categories={VARIABLE_CATEGORIES}
                                disableOverviewNavigation
                            />
                        </Route>
                    </Switch>
                </BodyWrapper>
                <Footer country="us" />
            </PolicyEngineWrapper>
        );
    }
}