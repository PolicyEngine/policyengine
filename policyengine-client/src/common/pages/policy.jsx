import { Menu } from "antd";
import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Parameter } from "../parameter";
import "../../common/policyengine.less";

const { SubMenu } = Menu;

function PolicyMenu(props) {
	function addMenuEntry(parameter, parent) {
		let children = [];
		for(let child in parameter) {
			const name = parent + "/" + child;
			let logo;
			if(child in props.organisations) {
				logo = props.organisations[child].logo;
			} else {
				logo = null;
			}
			if(Array.isArray(parameter[child])) {
				children.push(<Menu.Item icon={logo} key={name}>{logo ? <div style={{paddingLeft: 10}}>{child}</div> : child}</Menu.Item>);
			} else {
				children.push(<SubMenu icon={logo} key={name} title={logo ? <div style={{paddingLeft: 10}}>{child}</div> : child}>{addMenuEntry(parameter[child], name)}</SubMenu>);
			}
		}
		return children;
	}
	return (
		<Menu
			onClick={(e) => {props.selectGroup(e.key);}}
			mode="inline"
			defaultOpenKeys={props.open}
			defaultSelectedKeys={props.selected}
		>
			{addMenuEntry(props.hierarchy, "")}
		</Menu>
	);
}

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
				parameterControls.push(React.cloneElement(this.props.overrides[parameter], {key: parameter, param: this.props.policy[parameter], policy: this.props.policy, updatePolicy: this.props.updatePolicy}));
			} else {
				parameterControls.push(<Parameter key={parameter} param={this.props.policy[parameter]} updatePolicy={this.props.updatePolicy}/>)
			}
		}
		return (
			<Row>
				<Col xl={3}>
					<PolicyMenu hierarchy={this.props.hierarchy} organisations={this.props.organisations} selected={this.props.selected} open={this.props.open} selectGroup={this.selectGroup}/>
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