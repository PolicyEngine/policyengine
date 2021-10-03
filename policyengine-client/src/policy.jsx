import { Menu } from "antd";
import { Fragment, default as React } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import {
	InputNumber, Divider, Switch, Slider, Select, Alert, Spin
} from "antd";
import { Overview } from "./overview";
import { Parameter } from "./parameter";

const { SubMenu } = Menu;

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

const { Option } = Select;
export function PolicyMenu(props) {
	function addMenuEntry(parameter, parent) {
		let children = [];
		for(let child in parameter) {
			const name = parent + "/" + child;
			if(Array.isArray(parameter[child])) {
				children.push(<Menu.Item key={name}>{child}</Menu.Item>);
			} else {
				children.push(<SubMenu key={name} title={child}>{addMenuEntry(parameter[child], name)}</SubMenu>);
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
			{addMenuEntry(props.menuStructure, "")}
		</Menu>
	);
}

export class Policy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {policy: this.props.policy, selected: this.props.selected, invalid: false};
		this.updatePolicy = this.updatePolicy.bind(this);
		this.selectGroup = this.selectGroup.bind(this);
		this.getParameters = this.getParameters.bind(this);
	}

	getParameters() {
		let node = this.props.menuStructure;
		for(const item of this.state.selected.split("/").slice(1)) {
			node = node[item];
		}
		return node;
	}

	selectGroup(name) {
		this.setState({selected: name});
	}

	updatePolicy(name, value) {
		let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		const { policy, invalid } = (this.props.validator || (policy => {return {policy: policy, invalid: false}}))(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
	}
    
	render() {
		const availableParameters = this.getParameters();
		let parameterControls = [];
		for(let parameter of availableParameters) {
			if(parameter in (this.props.overrides || {})) {
				parameterControls.push(React.cloneElement(this.props.overrides[parameter], {key: parameter, param: this.state.policy[parameter], name: parameter, onChange: this.updatePolicy}));
			} else {
				parameterControls.push(<Parameter key={parameter} param={this.state.policy[parameter]} name={parameter} onChange={this.updatePolicy}/>)
			}
		}
		return (
			<Row>
				<Col xl={3}>
					<PolicyMenu menuStructure={this.props.menuStructure} selected={this.props.selected} open={this.props.open} selectGroup={this.selectGroup}/>
				</Col>
				<Col xl={6}>
					{parameterControls}
				</Col>
				<Col xl={3}>
					<Overview page="policy" policy={this.state.policy} setPolicy={() => {this.props.setPolicy(this.state.policy)}}/>
				</Col>
			</Row>
		);
	}
}