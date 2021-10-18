import React from "react";
import { urlToPolicy } from "../../common/url";
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

export class PolicyEngineUK extends React.Component {
    constructor(props) {
        super(props);
        this.setPolicy = this.setPolicy.bind(this);
        this.validatePolicy = this.validatePolicy.bind(this);
        this.state = {
            policy: {},
            household: {},
            entities: {},
            householdVisited: false,
            currentPage: "policy",
            invalid: false,
        }
    }

    componentDidMount() {
        this.fetchPolicy();
        this.fetchHousehold();
        this.fetchEntities();
    }

    fetchPolicy() {
        fetch(this.props.api_url + "/parameters").then(res => res.json()).then(data => {this.setState({policy: urlToPolicy(data)});});
    }

    fetchHousehold() {
        fetch(this.props.api_url + "/default-household").then(res => res.json()).then(data => {this.setState({household: data});});
    }

    fetchEntities() {
        fetch(this.props.api_url + "/entities").then(res => res.json()).then(data => {this.setState({entities: data});});
    }

    setPolicy(name, value) {
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		const { policy, invalid } = (this.state.validator || (policy => {return {policy: policy, invalid: false};}))(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
    }

    validatePolicy(policy) {
        if(policy.higher_threshold.value === policy.add_threshold.value) {
			policy.higher_threshold.error = "The higher rate threshold must be different than the additional rate threshold.";
			policy.add_threshold.error = "The additional rate threshold must be different than the higher rate threshold.";
			return {policy: policy, invalid: true};
		}
		return {policy: policy, invalid: false};
    }

    render() {
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
                                overrides={{autoUBI: <AutoUBI />}}
                                setPage={setPage}
                                invalid={this.state.invalid}
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
                                currency="£"
								household={this.state.household}
                                entities={this.state.entities}
								selected="You"
								setHousehold={household => {this.setState({household: household, householdEntered: true});}}
								setPage={setPage}
                                baseURL="/uk"
                            />
                        </Route>
                    </Switch>
                </BodyWrapper>
                <Footer country="uk" />
            </PolicyEngineWrapper>
        );
    }
}