import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/policyengine.less";
import { PolicyEngineUK } from "./countries/uk";
import { PolicyEngineUS } from "./countries/us";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Router>
				<Route path="/uk">
					<PolicyEngineUK analytics={this.props.analytics} api_url="https://policyengine.org/uk/api" />
				</Route>
				<Route path="/us">
					<PolicyEngineUS analytics={this.props.analytics} api_url="http://localhost:5000/us/api" />
				</Route>
				<Route exact path="/">
					<Redirect to="/uk" />
				</Route>
			</Router>
		);
	}
}