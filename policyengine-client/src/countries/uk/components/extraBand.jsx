import React from "react";
import Parameter from "../../../policyengine/pages/policy/parameter";
import { Checkbox } from "antd";
import { CountryContext } from "../../country";

export default class ExtraBand extends React.Component {
	static contextType = CountryContext;

	constructor(props, context) {
		super(props);
		const rate_param = context.policy[this.props.rate_parameter];
		const threshold_param = context.policy[this.props.threshold_parameter];
		this.state = { 
			shown: (rate_param.value !== rate_param.defaultValue) || (threshold_param.value !== threshold_param.defaultValue) 
		};
	}

	updateChecked(checked) {
		if(checked) {
			// Force showing of extra band
			this.setState({shown: true});
		} else {
			// Reset band on uncheck
			this.context.updatePolicy(this.props.rate_parameter, this.context.policy[this.props.rate_parameter].defaultValue);
			this.context.updatePolicy(this.props.threshold_parameter, this.context.policy[this.props.threshold_parameter].defaultValue);
			this.setState({shown: false});
		}
	}

	render() {
		return (
			<>
				<Checkbox checked={this.state.shown} onChange={(e) => this.updateChecked(e.target.checked)}>Add extra band</Checkbox>
				{
					this.state.shown &&
						<>
							<Parameter key={this.props.rate_parameter} name={this.props.rate_parameter}/>
							<Parameter key={this.props.threshold_parameter} name={this.props.threshold_parameter}/>
						</>
				}
			</>
		);
	}
}