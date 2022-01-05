import React from "react";
import { Parameter } from "../../../common/parameter";
import { Checkbox } from "antd";

export default class ExtraBand extends React.Component {
	constructor(props) {
		super(props);
		const rate_param = this.props.policy[this.props.rate_parameter];
		const threshold_param = this.props.policy[this.props.threshold_parameter];
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
			this.props.updatePolicy(this.props.rate_parameter, this.props.policy[this.props.rate_parameter].defaultValue);
			this.props.updatePolicy(this.props.threshold_parameter, this.props.policy[this.props.threshold_parameter].defaultValue);
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
							<Parameter key={this.props.rate_parameter} param={this.props.policy[this.props.rate_parameter]} name={this.props.rate_parameter} updatePolicy={this.props.updatePolicy}/>
							<Parameter key={this.props.threshold_parameter} param={this.props.policy[this.props.threshold_parameter]} name={this.props.threshold_parameter} updatePolicy={this.props.updatePolicy}/>
						</>
				}
			</>
		);
	}
}