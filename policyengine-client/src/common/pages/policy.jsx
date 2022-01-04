import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Parameter } from "../parameter";
import { Menu } from "../menu";

export default class Policy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, invalid: false};
		this.selectGroup = this.selectGroup.bind(this);
		this.getParameters = this.getParameters.bind(this);
	}

	getParameters() {
		let node = this.props.hierarchy;
		for(const item of this.state.selected.split("/").slice(1)) {
			node = node[item];
		}
		return node;
	}

	selectGroup(name) {
		this.setState({selected: name});
	}
    
	render() {
		if(!this.props.policy) {
			return <></>;
		}
		const availableParameters = this.getParameters();
		let parameterControls = [];
		for(let parameter of availableParameters) {
			if(parameter in (this.props.overrides || {})) {
				parameterControls.push(React.cloneElement(this.props.overrides[parameter], {key: parameter, param: this.props.policy[parameter], policy: this.props.policy, updatePolicy: this.props.updatePolicy, updateEntirePolicy: this.props.updateEntirePolicy}));
			} else {
				parameterControls.push(<Parameter key={parameter} param={this.props.policy[parameter]} updatePolicy={this.props.updatePolicy}/>)
			}
		}
		return (
			<Row>
				<Col xl={3}>
					<Menu 
						hierarchy={this.props.hierarchy} 
						organisations={this.props.organisations} 
						selected={this.props.selected} 
						open={this.props.open} 
						selectGroup={this.selectGroup}
					/>
				</Col>
				<Col xl={6}>
					{parameterControls}
				</Col>
				<Col xl={3}>
					<Overview page="policy" policy={this.props.policy} setPage={this.props.setPage} invalid={!this.props.policyValid} baseURL={this.props.baseURL}/>
				</Col>
			</Row>
		);
	}
}