import React from "react";
import { Parameter } from "../../../common/parameter";
import { Checkbox } from "antd";

export default class ExtraBand extends React.Component {
	constructor(props) {
		super(props);
		const rate_param = this.props.policy[this.props.rate_parameter];
		const threshold_param = this.props.policy[this.props.threshold_parameter];
		this.state = { 
			shown: (rate_param.value !== rate_param.default) || (threshold_param.value !== threshold_param.default) 
		};
	}

	updateChecked(checked) {
		if(checked) {
			// Force showing of extra band
			this.setState({shown: true});
		} else {
			// Reset band on uncheck
			this.props.setPolicy(this.props.rate_parameter, this.props.policy[this.props.rate_parameter].default);
			this.props.setPolicy(this.props.threshold_parameter, this.props.policy[this.props.threshold_parameter].default);
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
							<Parameter key={this.props.rate_parameter} param={this.props.policy[this.props.rate_parameter]} name={this.props.rate_parameter} currency={this.props.currency} setPolicy={this.props.setPolicy}/>
							<Parameter key={this.props.threshold_parameter} param={this.props.policy[this.props.threshold_parameter]} name={this.props.threshold_parameter} currency={this.props.currency} setPolicy={this.props.setPolicy}/>
						</>
				}
			</>
		);
	}
}