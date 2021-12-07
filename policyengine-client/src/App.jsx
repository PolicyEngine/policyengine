import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./common/policyengine.less";
import { PolicyEngineUK } from "./countries/uk";
import { PolicyEngineUS } from "./countries/us";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const useLocalServer = false;
		let apiUrl = `${window.location.protocol}//${window.location.hostname}`;
		apiUrl = useLocalServer ? "http://localhost:5000" : apiUrl;
		return (
			<Router>
				<Route path="/uk">
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