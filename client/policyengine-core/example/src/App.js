import React from "react";

import { PolicyEngine, Header, Footer, Policy, Responsive, PopulationResults, Switch, Route, getPolicyFromURL, Household, HouseholdImpact } from "policyengine-core";
import "./policyengine.css";

import PARAMETER_MENU from "./controls";
import POLICY from "./parameters";
import { ADULT, CHILD, SITUATION } from "./household";
import { FAQ } from "./faq";
import { Divider, Button, message, Alert, Spin, Image } from "antd";
import { LoadingOutlined } from "@ant-design/icons";


const ORGANISATIONS = {
	"UBI Center": {
		"logo": <Image src="/logos/ubicenter.png" preview={false} height={30} width={30}/>,
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.setPolicy = this.setPolicy.bind(this);
		this.validatePolicy = this.validatePolicy.bind(this);
		this.state = {policy: {}, household: SITUATION, householdEntered: false, page: "", validator: this.validatePolicy};
	}

	validatePolicy(policy) {
		if(policy.higher_threshold.value == policy.add_threshold.value) {
			policy.higher_threshold.error = "The higher rate threshold must be different than the additional rate threshold.";
			policy.add_threshold.error = "The additional rate threshold must be different than the higher rate threshold.";
			return {policy: policy, invalid: true};
		}
		return {policy: policy, invalid: false};
	}

	componentDidMount() {
		fetch("http://192.168.1.12:5000/api/parameters").then(res => res.json()).then(data => {this.setState({policy: getPolicyFromURL(data)});});
	}

	setPolicy(name, value) {
		let oldPolicy = this.state.policy;
		oldPolicy[name].value = Math.round(value * 100, 2) / 100;
		const { policy, invalid } = (this.state.validator || (policy => {return {policy: policy, invalid: false}}))(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
	}
	
	render() {
		return (
			<PolicyEngine>
				<Header country="UK" beta policy={this.state.policy} household={this.state.householdEntered}/>
				<Responsive>
					<Switch>
						<Route path="/" exact>
							<Policy 
								policy={this.state.policy}
								menuStructure={PARAMETER_MENU}
								selected={"/Tax/Income Tax/Labour income"}
								open={["/Tax", "/Tax/Income Tax", "/Benefit", "/UBI Center"]}
								setPolicy={this.setPolicy}
								overrides={{autoUBI: <AutoUBI />}}
								setPage={page => {this.setState({page: page});}}
								organisations={ORGANISATIONS}
								invalid={this.state.invalid}
							/>
						</Route>
						<Route path="/household">
							<Household 
								policy={this.state.policy}
								household={this.state.household}
								selected="head"
								defaultAdult={ADULT}
								defaultChild={CHILD}
								setHousehold={household => {this.setState({household: household, householdEntered: true});}}
								setPage={page => {this.setState({page: page});}}
							/>
						</Route>
						<Route path="/population-impact">
							<PopulationResults 
								country={"UK"}
								policy={this.state.policy}
								setPage={page => {this.setState({page: page});}}
								api_url="http://192.168.1.12:5000"
							/>
						</Route>
						<Route path="/household-impact">
							<HouseholdImpact
								policy={this.state.policy}
								household={this.state.household}
								setPage={page => {this.setState({page: page});}}
								api_url="http://192.168.1.12:5000"
							/>
						</Route>
						<Route path="/faq">
							<FAQ />
						</Route>

						{/* Backwards compatibility*/}

						<Route path="/situation">
							<Household 
								policy={this.state.policy}
								household={this.state.household}
								selected="head"
								defaultAdult={ADULT}
								defaultChild={CHILD}
								setHousehold={household => {this.setState({household: household, householdEntered: true});}}
								setPage={page => {this.setState({page: page});}}
							/>
						</Route>
						<Route path="/household-results">
							<HouseholdImpact
								policy={this.state.policy}
								household={this.state.household}
								setPage={page => {this.setState({page: page});}}
								api_url="http://localhost:5000"
							/>
						</Route>
						<Route path="/population-results">
							<PopulationResults 
								country={"UK"}
								policy={this.state.policy}
								setPage={page => {this.setState({page: page});}}
								api_url="http://localhost:5000"
							/>
						</Route>
					</Switch>
				</Responsive>
				<Footer />
			</PolicyEngine>
		);
	}
}

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

class AutoUBI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {waiting: false, amount: 0};
		this.applyAutoUBI = this.applyAutoUBI.bind(this);
	}

	applyAutoUBI() {
		const submission = {};
		for (const key in this.props.policy) {
			if(this.props.policy[key].value !== this.props.policy[key].default) {
				submission["policy_" + key] = this.props.policy[key].value;
			}
		}
		let url = new URL("http://192.168.1.12:5000/api/ubi");
		url.search = new URLSearchParams(submission).toString();
		this.setState({waiting: true}, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((json) => {
					const amount = Math.round(json.UBI / 52, 2);
					this.setState({waiting: false, amount: amount});
					this.props.setPolicy("child_UBI", this.props.policy["child_UBI"].value + amount);
					this.props.setPolicy("adult_UBI", this.props.policy["adult_UBI"].value + amount);
					this.props.setPolicy("senior_UBI", this.props.policy["senior_UBI"].value + amount);
				}).catch(e => {
					message.error("Couldn't apply AutoUBI - something went wrong.");
					this.setState({waiting: false});
				});
		});
	}
	
	render() {
		let result;
		if(this.state.waiting) {
			result = <Alert style={{marginTop: 10}} message={<>This reform would fund a UBI of £<Spin indicator={<LoadingOutlined />}/>/week</>} />;
		} else if(this.state.amount) {
			result = <Alert style={{marginTop: 10}} message={<>This reform would fund a UBI of £{this.state.amount}/week</>} /> ;
		}
		return (
			<>
				<Divider>AutoUBI</Divider>
				<Button onClick={this.applyAutoUBI}>Direct surplus revenue into UBI</Button>
				{result}
			</>
		);
	}
}


export default App;
