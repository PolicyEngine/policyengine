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

import { validateSituation } from "./logic/situation";
import { validatePolicy } from "./logic/policy";
import { ORGANISATIONS, PARAMETER_HIERARCHY, PARAMETERS } from "./data/policy";
import { DEFAULT_SITUATION } from "./data/situation";
import { Empty } from "antd";

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
            situation: {},
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
                    this.setState({
                        // Entities and variables don't need validation
                        entities: entities,
                        variables: variables,
                    }, () => {
                        // The policy and situation might need adjusting with PolicyEngine-specific modifications
                        let {policy, policyValid} = validatePolicy(urlToPolicy(policyData), policyData);
                        let {situation, situationValid} = validateSituation(JSON.parse(JSON.stringify(DEFAULT_SITUATION)));
                        this.setState({
                            policy: JSON.parse(JSON.stringify(policy)),
                            entities: entities,
                            variables: variables,
                            situation: situation,
                            policyValid: policyValid,
                            situation: situationValid,
                            fetchDone: true,
                        });
                    });
                });
            });
        });
    }

    updatePolicy(name, value) {
        // Update a parameter - validate, then update the state
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		let { policy, valid } = validatePolicy(oldPolicy);
		this.setState({policy: policy, policyValid: valid});
    }

    updateSituation(situation) {
        // Update the situation - validate, then update the state
        let { household, valid } = validateSituation(situation);
        this.setState({household: household, householdValid: valid});
    }

    render() {
        if(!this.state.fetchDone) {
            return <></>;
        }
        const setPage = page => {this.setState({page: page});};
        return (
            <PolicyEngineWrapper>
                <Route path="/uk" exact>
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
                                hierarchy={PARAMETER_HIERARCHY}
                                organisations={ORGANISATIONS}
                                selected={"/Tax/Income Tax/Labour income"}
                                open={["/Tax", "/Tax/Income Tax", "/Benefit", "/UBI Center"]}
                                updatePolicy={this.updatePolicy}
                                overrides={null/*{
                                    autoUBI: <AutoUBI api_url={this.props.api_url}/>,
                                    extra_UK_band: <ExtraBand 
                                        rate_parameter="extra_UK_rate" 
                                        threshold_parameter="extra_UK_threshold" 
                                        policy={this.state.policy} 
                                        setPolicy={this.setPolicy} 
                                    />,
                                    extra_scot_band: <ExtraBand 
                                        rate_parameter="extra_scot_rate" 
                                        threshold_parameter="extra_scot_threshold" 
                                        policy={this.state.policy} 
                                        setPolicy={this.setPolicy}
                                    />,
                                }*/}
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
								household={this.state.household}
                                entities={this.state.entities}
                                updateSituation={this.updateSituation}
								setPage={setPage}
                                baseURL="/uk"
                                fetchDone={this.state.fetchDone}
                            />
                        </Route>
                        <Route path="/uk/household-impact">
                            <HouseholdImpact
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                household={this.state.household}
                                baseURL="/uk"
                                setHouseholdVisited={() => this.setState({householdVisited: true})}
                                householdValid={this.state.householdValid}
                                fetchDone={this.state.fetchDone}
                                currency="£"
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