import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/policyengine.less";
import { PolicyEngineUK } from "./countries/uk";

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
					Coming soon!
				</Route>
				<Route exact path="/">
					<Redirect to="/uk" />
				</Route>
			</Router>
		);
	}
}