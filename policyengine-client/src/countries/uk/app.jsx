import React from "react";
import { urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import FAQ from "./components/faq";

export class PolicyEngineUK extends React.Component {
    constructor(props) {
        super(props);
        this.setPolicy = this.setPolicy.bind(this);
        this.validatePolicy = this.validatePolicy.bind(this);
        this.state = {
            policy: {},
            household: {},
            householdVisited: false,
            currentPage: "policy",
        }
    }

    componentDidMount() {
        this.fetchPolicy();
    }

    fetchPolicy() {
        fetch(this.props.api_url + "/parameters").then(res => res.json()).then(data => {this.setState({policy: urlToPolicy(data)});});
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
        return (
            <PolicyEngineWrapper>
                <Route path="/uk" exact>
                    <Redirect to="/uk/policy" />
                </Route>
                <Header country="uk" policy={this.state.policy} household={this.state.householdVisited}/>
                <Switch>
                    <Route path="/uk/faq">
                        <FAQ />
                    </Route>
                </Switch>
                <Footer country="uk" />
            </PolicyEngineWrapper>
        );
    }
}