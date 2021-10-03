import { Fragment, default as React } from "react";
import { ParameterGroup } from "./parameter";
import { Button, Menu } from "antd";
import { Row, Col } from "react-bootstrap";
import { Overview } from "./overview";

const { SubMenu } = Menu;

function HouseholdMenu(props) {
	let numAdults = 0;
	for(let name in props.household.people) {
		if(props.household.people[name].age.value >= 18) {
			numAdults++;
		}
	}
	let numChildren = Object.keys(props.household.people).length - numAdults;
	return (
		<Menu
			mode="inline"
			onClick={e => props.selectEntity(e.key)}
			defaultOpenKeys={["family"]}
			defaultSelectedKeys={["head"]}
		>
			<Menu.Item key="household">Your household</Menu.Item>
			<SubMenu key="family" title="Your immediate family">
				<Menu.Item key="family_1">Family</Menu.Item>
				<Menu.Item key="head">You</Menu.Item>
				<Menu.Item key="partner">{
					numAdults == 1 ?
						<Button onClick={props.addPartner}>Add partner</Button> :
						"Your partner"
				}</Menu.Item>
				{Array.from(Array(numChildren).keys()).map(i => <Menu.Item key={"child_" + (i + 1)}>Child {i + 1}</Menu.Item>)}
				<Menu.Item key={"child_" + (numChildren + 1)}><Button onClick={props.addChild}>Add child</Button></Menu.Item>
			</SubMenu>
		</Menu>
	);
}

function HouseholdControls(props) {
	const returnFunction = (key, value) => {props.setVariable(key, value, props.selected);};
	if(props.selected.includes("child")) {
		if(props.selected in props.household.people) {
			return <ParameterGroup onChange={returnFunction} policy={props.household.people[props.selected]} />;
		} else {
			return <></>;
		}
	} else if(props.selected == "head" || props.selected == "partner") {
		if(props.selected in props.household.people) {
			return <ParameterGroup onChange={returnFunction} policy={props.household.people[props.selected]}/>;
		} else {
			return <></>;
		}
		
	} else if(props.selected.includes("family")) {
		return <ParameterGroup onChange={returnFunction} policy={props.household.families[props.selected]} />;
	} else {
		return <ParameterGroup onChange={returnFunction} policy={props.household.household} />;
	}
}

export class Household extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, invalid: false};
		this.addPartner = this.addPartner.bind(this);
		this.addChild = this.addChild.bind(this);
		this.setVariable = this.setVariable.bind(this);
	}

	addPartner() {
		let oldHousehold = this.props.household;
		oldHousehold.people["partner"] = JSON.parse(JSON.stringify(this.props.defaultAdult));
        const { household, invalid } = (this.props.validator || (household => {return {household: household, invalid: false}}))(oldHousehold);
		this.props.setHousehold(household);
        this.setState({invalid: invalid});
	}

	addChild() {
		let oldHousehold = this.props.household;
		let numChildren = 0;
		for(let name in oldHousehold.people) {
			if(oldHousehold.people[name].age.value < 18) {
				numChildren++;
			}
		}
		oldHousehold.people["child_" + (numChildren + 1)] = JSON.parse(JSON.stringify(this.props.defaultChild));
        const { household, invalid } = (this.props.validator || (household => {return {household: household, invalid: false}}))(oldHousehold);
		this.props.setHousehold(household);
        this.setState({invalid: invalid});
	}

	setVariable(key, value, selected) {
		let oldHousehold = this.props.household;
		if(selected in oldHousehold.people) {
			oldHousehold.people[selected][key].value = value;
		} else if(selected in oldHousehold.families) {
			oldHousehold.families[selected][key].value = value;
		} else {
			oldHousehold.household[key].value = value;
		}
        const { household, invalid } = (this.props.validator || (household => {return {household: household, invalid: false}}))(oldHousehold);
		this.props.setHousehold(household);
        this.setState({invalid: invalid});
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu household={this.props.household} addPartner={this.addPartner} addChild={this.addChild} selectEntity={name => {this.setState({selected: name});}}/>
				</Col>
				<Col xl={6}>
					<HouseholdControls defaultEntity="head" selected={this.state.selected} household={this.props.household} setVariable={this.setVariable}/>
				</Col>
				<Col xl={3}>
					<Overview page="household" policy={this.props.policy} household={!this.state.invalid ? this.props.household : null}/>
				</Col>
			</Row>
		);
	}
}