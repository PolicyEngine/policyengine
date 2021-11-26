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

export class PolicyEngineUK extends React.Component {
    constructor(props) {
        super(props);
        this.updatePolicy = this.updatePolicy.bind(this);
        this.updateSituation = this.updateSituation.bind(this);
        this.fetchData = this.fetchData.bind(this);
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
        this.fetchData();
    }

    fetchData() {
        fetch(this.props.api_url + "/parameters").then(res => res.json()).then(policyData => {
            fetch(this.props.api_url + "/entities").then(res => res.json()).then(entities => {
                fetch(this.props.api_url + "/variables").then(res => res.json()).then(variables => {
                    this.setState({
                        entities: entities,
                        variables: variables,
                    }, () => {
                        let {policy, policyValid} = this.validatePolicy(urlToPolicy(policyData));
                        let {household, householdValid} = this.validateHouseholdStructure(JSON.parse(JSON.stringify(DEFAULT_SITUATION)));
                        this.setState({
                            policy: policy,
                            entities: entities,
                            variables: variables,
                            household: household,
                            policyValid: policyValid,
                            householdValid: householdValid,
                            fetchDone: true,
                        });
                    });
                });
            });
        });
    }

    updatePolicy(name, value) {
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		let { policy, valid } = validatePolicy(oldPolicy);
		this.setState({policy: policy, policyValid: valid});
    }

    updateSituation(situation) {
        let { household, valid } = validateSituation(situation);
        this.setState({household: household, householdValid: valid});
    }

    render() {
        if(!this.state.fetchDone) {
            return null;
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
                                menuStructure={PARAMETER_MENU}
                                organisations={ORGANISATIONS}
                                selected={"/Tax/Income Tax/Labour income"}
                                open={["/Tax", "/Tax/Income Tax", "/Benefit", "/UBI Center"]}
                                currency="£"
                                setPolicy={this.setPolicy}
                                overrides={{
                                    autoUBI: <AutoUBI api_url={this.props.api_url}/>,
                                    extra_UK_band: <ExtraBand 
                                        rate_parameter="extra_UK_rate" 
                                        threshold_parameter="extra_UK_threshold" 
                                        policy={this.state.policy} 
                                        setPolicy={this.setPolicy} 
                                        currency="£"
                                    />,
                                    extra_scot_band: <ExtraBand 
                                        rate_parameter="extra_scot_rate" 
                                        threshold_parameter="extra_scot_threshold" 
                                        policy={this.state.policy} 
                                        setPolicy={this.setPolicy} 
                                        currency="£"
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