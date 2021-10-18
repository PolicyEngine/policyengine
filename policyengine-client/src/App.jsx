import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import "./common/policyengine.css";
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
					<PolicyEngineUK analytics={this.props.analytics} api_url="http://localhost:5000/uk/api" />
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