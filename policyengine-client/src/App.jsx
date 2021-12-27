import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./common/policyengine.less";
import { PolicyEngineUK } from "./countries/uk";
import { PolicyEngineUS } from "./countries/us";
import { REDIRECTS } from "./countries/uk/data/namedPolicies";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const useLocalServer = false;
		let apiUrl = `${window.location.protocol}//${window.location.hostname}`;
		apiUrl = useLocalServer ? "http://localhost:5000" : apiUrl;
		const namedPolicies  = Object.keys(REDIRECTS).map(url => <Route exact path={`/uk${url}`}><Redirect to={`/uk/population-impact?${REDIRECTS[url]}`} /></Route>);
		return (
			<Router>
				<Route path="/uk">
					{namedPolicies}
					<PolicyEngineUK analytics={this.props.analytics} api_url={`${apiUrl}/uk/api`} />
				</Route>
				<Route path="/us">
					<PolicyEngineUS analytics={this.props.analytics} api_url={`${apiUrl}/us/api`} />
				</Route>
				<Route exact path="/">
					<Redirect to="/uk" />
				</Route>
			</Router>
		);
	}
}