import React from "react";
import { policyToURL, urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper, BodyWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import { ORGANISATIONS, PARAMETER_MENU } from "./data/policy_controls";

import FAQ from "./components/faq";
import Policy from "../../common/pages/policy";
import PopulationImpact from "../../common/pages/populationImpact";
import AutoUBI from "./components/autoUBI";
import Household from "../../common/pages/household";
import HouseholdImpact from "../../common/pages/householdImpact";
import ExtraBand from "./components/extra_band";

export class PolicyEngineUK extends React.Component {
    constructor(props) {
        super(props);
        this.setPolicy = this.setPolicy.bind(this);
        this.validatePolicy = this.validatePolicy.bind(this);
        this.setHouseholdValues = this.setHouseholdValues.bind(this);
        this.setHouseholdStructure = this.setHouseholdStructure.bind(this);
        this.validateHousehold = this.validateHouseholdValues.bind(this);
        this.validateHousehold = this.validateHouseholdStructure.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.state = {
            policy: {},
            household: {},
            variables: {},
            entities: {},
            householdVisited: false,
            currentPage: "policy",
            householdValid: false,
            policyValid: false,
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
                    fetch(this.props.api_url + "/default-household").then(res => res.json()).then(householdData => {
                        this.setState({
                            entities: entities,
                            variables: variables,
                        }, () => {
                            let {policy, policyValid} = this.validatePolicy(urlToPolicy(policyData));
                            let {household, householdValid} = this.validateHouseholdStructure(householdData);
                            this.setState({
                                policy: policy,
                                entities: entities,
                                variables: variables,
                                household: household,
                                policyValid: policyValid,
                                householdValid: householdValid,
                                fetchDone: true,
                            });
                        })
                        
                    });
                });
            });
        });
    }

    setPolicy(name, value) {
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		let { policy, invalid } = this.state.validator(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
    }

    validatePolicy(policy) {
        if(policy.higher_threshold.value === policy.add_threshold.value) {
			policy.higher_threshold.error = "The higher rate threshold must be different than the additional rate threshold.";
			policy.add_threshold.error = "The additional rate threshold must be different than the higher rate threshold.";
			return {policy: policy, policyValid: false};
		} else {
            policy.higher_threshold.error = null;
            policy.add_threshold.error = null;
        }
		return {policy: policy, policyValid: true};
    }

    setHouseholdStructure(householdData) {
        const { household, householdValid } = this.validateHouseholdStructure(householdData);
		this.setState({household: household, householdValid: householdValid, householdVisited: true});
    }

    setHouseholdValues(householdData) {
        const { household, householdValid } = this.validateHouseholdValues(householdData);
		this.setState({household: household, householdValid: householdValid, householdVisited: true});
    }

    validateHouseholdValues(householdData) {
        return {household: householdData, householdValid: true}
    }

    validateHouseholdStructure(householdData) {
        // First, check for any empty families - remove them
        let household = householdData.household[0];
        for(let benunit in household.benunit) {
            if(Object.keys(household.benunit[benunit].adult || {}).length + Object.keys(household.benunit[benunit].child || {}).length === 0) {
                delete householdData.household[0].benunit[benunit];
            }
        }
        // Next, apply default names
        const benunitDefaultNames = ["Your immediate family", "Another family in your household"];
        const firstBenunitAdultNames = ["You", "Your partner"];
        const firstBenunitChildNames = ["Your first child", "Your second child", "Your third child", "Your fourth child", "Your fifth child"];
        const secondBenunitAdultNames = ["Another adult", "Their partner"];
        const secondBenunitChildNames = ["Their first child", "Their second child", "Their third child", "Their fourth child", "Their fifth child"];
        const benunitNames = Object.keys(household.benunit);
        let adultNames;
        let childNames;
        household.label = "Your household";
        for(let i = 0; i < benunitNames.length; i++) {
            household.benunit[benunitNames[i]].label = benunitDefaultNames[i];
        }
        if(benunitNames.length > 0) {
            adultNames = Object.keys(household.benunit[benunitNames[0]].adult);
            for(let i = 0; i < adultNames.length; i++) {
                household.benunit[benunitNames[0]].adult[adultNames[i]].label = firstBenunitAdultNames[i];
            }
            childNames = Object.keys(household.benunit[benunitNames[0]].child);
            for(let i = 0; i < childNames.length; i++) {
                household.benunit[benunitNames[0]].child[childNames[i]].label = firstBenunitChildNames[i];
            }
        }
        if(benunitNames.length > 1) {
            adultNames = Object.keys(household.benunit[benunitNames[1]].adult);
            for(let i = 0; i < adultNames.length; i++) {
                household.benunit[benunitNames[1]].adult[adultNames[i]].label = secondBenunitAdultNames[i];
            }
            childNames = Object.keys(household.benunit[benunitNames[1]].child);
            for(let i = 0; i < childNames.length; i++) {
                household.benunit[benunitNames[1]].child[childNames[i]].label = secondBenunitChildNames[i];
            }
        }
        // Finally, ensure all default values are set
        let varHolder;
        if(Object.keys(this.state.variables).length > 0) {
            varHolder = household;
            if(!varHolder.variables) {
                varHolder.variables = {}
            }
            for(let variable of Object.values(JSON.parse(JSON.stringify(this.state.variables)) || {}).filter(v => v.entity === "household")) {
                varHolder.variables[variable.short_name] = Object.assign(variable, (varHolder.variables[variable.short_name] || {}));
            }
            for(let benunit in household.benunit) {
                varHolder = household.benunit[benunit];
                if(!varHolder.variables) {
                    varHolder.variables = {}
                }
                for(let variable of Object.values(JSON.parse(JSON.stringify(this.state.variables)) || {}).filter(v => v.entity === "benunit")) {
                    varHolder.variables[variable.short_name] = Object.assign(variable, (varHolder.variables[variable.short_name] || {}));
                }
                for(let adult in household.benunit[benunit].adult) {
                    varHolder = household.benunit[benunit].adult[adult];
                    if(!varHolder.variables) {
                        varHolder.variables = {}
                    }
                    for(let variable of Object.values(JSON.parse(JSON.stringify(this.state.variables)) || {}).filter(v => v.entity === "person").map(v => Object.assign(v, (v.roles.adult || {})))) {
                        varHolder.variables[variable.short_name] = Object.assign(variable, (varHolder.variables[variable.short_name] || {}));
                    }
                }
                for(let child in household.benunit[benunit].child) {
                    varHolder = household.benunit[benunit].child[child];
                    if(!varHolder.variables) {
                        varHolder.variables = {}
                    }
                    for(let variable of Object.values(JSON.parse(JSON.stringify(this.state.variables)) || {}).filter(v => v.entity === "person").map(v => Object.assign(v, (v.roles.child || {})))) {
                        varHolder.variables[variable.short_name] = Object.assign(variable, (varHolder.variables[variable.short_name] || {}));
                    }                
                }
            }
        }
        return {household: householdData, householdValid: true};
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
                                defaultOpenKeys={["0_", "1_"]}
                                variables={this.state.variables}
                                currency="£"
								household={this.state.household}
                                entities={this.state.entities}
								selected={"household,0,benunit,1,adult,2"}
								setHouseholdValues={this.setHouseholdValues}
                                setHouseholdStructure={this.setHouseholdStructure}
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