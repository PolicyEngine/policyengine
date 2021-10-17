import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.props.analytics.gtag("event", "page_view", {page_location: "/"});
	}

	render() {
		return (
			<Router>
				<Route path="/uk">
					UK
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