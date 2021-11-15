import React from "react";
import { urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper, BodyWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import { ORGANISATIONS, PARAMETER_MENU } from "./data/policy_controls";

import Policy from "../../common/pages/policy";
import PopulationImpact from "../../common/pages/populationImpact";

export class PolicyEngineUS extends React.Component {
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
        console.log(name, value)
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		let { policy, invalid } = this.state.validator(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
    }

    validatePolicy(policy) {
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
        return {household: householdData, householdValid: true};
    }

    render() {
        const setPage = page => {this.setState({page: page});};
        return (
            <PolicyEngineWrapper>
                <Route path="/us" exact>
                    <Redirect to="/us/policy" />
                </Route>
                <Header country="us" policy={this.state.policy} hideHouseholdPage/>
                <BodyWrapper>
                    <Switch>
                        <Route path="/us/policy">
                            <Policy 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                menuStructure={PARAMETER_MENU}
                                organisations={ORGANISATIONS}
                                selected={"/UBI Center/Universal Basic Income"}
                                open={["/UBI Center"]}
                                currency="$"
                                setPolicy={this.setPolicy}
                                setPage={setPage}
                                invalid={!this.state.policyValid}
                                baseURL="/us"
                                country="us"
                                hideHousehold
                            />
                        </Route>
                        <Route path="/us/population-impact">
                            <PopulationImpact 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                currency="$"
                                country="us"
                                setPage={setPage}
                                baseURL="/us"
                                hideHousehold
                            />
                        </Route>
                    </Switch>
                </BodyWrapper>
                <Footer country="us" />
            </PolicyEngineWrapper>
        );
    }
}