import React from "react";
import { policyToURL, urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper, BodyWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import FAQ from "./components/faq";
import Policy from "../../common/pages/policy";
import PopulationImpact from "../../common/pages/populationImpact";
import AutoUBI from "./components/autoUBI";
import Household from "../../common/pages/household";
import HouseholdImpact from "../../common/pages/householdImpact";
import ExtraBand from "./components/extra_band";

import { situationButtons, validateSituation } from "./logic/situation";
import { validatePolicy } from "./logic/policy";
import { ORGANISATIONS, PARAMETER_HIERARCHY, EXTRA_PARAMETER_DATA } from "./data/policy";
import { DEFAULT_SITUATION, EXTRA_VARIABLE_METADATA } from "./data/situation";

export class PolicyEngineUK extends React.Component {
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
                <Route path="/uk">
                    <Redirect to="/uk/policy" />
                </Route>
                <Header country="uk" policy={this.state.policy} household={this.state.householdVisited}/>
                <BodyWrapper>
                    <Switch>
                        <Route path="/uk/faq">
                            <FAQ analytics={this.props.analytics} />
                        </Route>
                        <Route path="/uk/policy">
                            <Policy 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                policyValid={this.state.policyValid}
                                hierarchy={PARAMETER_HIERARCHY}
                                organisations={ORGANISATIONS}
                                selected={"/Tax/Income Tax/Labour income"}
                                open={["/Tax", "/Tax/Income Tax", "/Benefit", "/UBI Center"]}
                                updatePolicy={this.updatePolicy}
                                overrides={{
                                    autoUBI: <AutoUBI api_url={this.props.api_url}/>,
                                    extra_UK_band: <ExtraBand 
                                        rate_parameter="extra_UK_rate" 
                                        threshold_parameter="extra_UK_threshold"
                                    />,
                                    extra_scot_band: <ExtraBand 
                                        rate_parameter="extra_scot_rate" 
                                        threshold_parameter="extra_scot_threshold"
                                    />,
                                }}
                                setPage={setPage}
                                invalid={!this.state.policyValid}
                                baseURL="/uk"
                            />
                        </Route>
                        <Route path="/uk/population-impact">
                            <PopulationImpact 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                currency="£"
                                country="uk"
                                setPage={setPage}
                                baseURL="/uk"
                            />
                        </Route>
                        <Route path="/uk/household">
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
                            />
                        </Route>
                        <Route path="/uk/household-impact">
                            <HouseholdImpact
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                variables={this.state.variables}
                                situation={this.state.situation}
                                computedSituation={this.state.computedSituation}
                                baseURL="/uk"
                                setHouseholdVisited={() => this.setState({householdVisited: true})}
                                situationValid={this.state.situationValid}
                                fetchDone={this.state.fetchDone}
                                setPage={setPage}
                            />
                        </Route>
                    </Switch>
                </BodyWrapper>
                <Footer country="uk" />
                {
                    this.state.fetchDone ?
                        <>
                            <Route path="/uk/population-results">
                                <Redirect to={policyToURL("/uk/population-impact", urlToPolicy(this.state.policy))} />
                            </Route>
                            <Route path="/uk/situation">
                                <Redirect to={policyToURL("/uk/household", urlToPolicy(this.state.policy))} />
                            </Route>
                            <Route path="/uk/situation-results">
                                <Redirect to={policyToURL("/uk/household", urlToPolicy(this.state.policy))} />
                            </Route>
                        </> :
                        null
                }
            </PolicyEngineWrapper>
        );
    }
}