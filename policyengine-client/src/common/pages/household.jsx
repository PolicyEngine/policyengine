import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Button, Menu } from "antd";
import { Parameter } from "../parameter";

const { SubMenu } = Menu;

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function hasItems(object) {
	return Object.keys(object).length > 0;
}

function EntityMenu(props) {
	const key = props.parents.concat([props.entityType, props.name]).join(",");
	if(props.entities.hierarchy[props.entityType].is_group) {
		let children = [];
		let buttons = [];
		for(let childType of props.entities.hierarchy[props.entityType].children) {
			const newParents = props.parents.concat([props.entityType, props.name])
			const childMeta = props.entities.hierarchy[childType];
			for(let childName in props.entity[childType]) {
				children.push(EntityMenu({
					addEntity: props.addEntity,
					removeEntity: props.removeEntity,
					entities: props.entities, 
					entity: props.entity[childType][childName],
					entityType: childType,
					name: childName,
					parents: newParents,
					selectEntity: props.selectEntity,
				}));
			}
			if(Object.keys(props.entity[childType]).length < childMeta.max) {
				buttons.push(
					<Menu.Item disabled={true} key={props.name + childType}><Button onClick={() => props.addEntity(childType, newParents)}>Add {childMeta.label}</Button></Menu.Item>
				);
			}
		}
		return (
			<SubMenu key={props.name + "_"} title={props.entity.label || props.name}>
				<Menu.Item onClick={() => props.selectEntity(key)} key={key}>{capitalizeFirstLetter(props.entities.hierarchy[props.entityType].label)}</Menu.Item>
				{children}
				{buttons}
			</SubMenu>
		);
	} else {
		return <Menu.Item onClick={() => props.selectEntity(key)} key={key}>{props.entity.label || props.name}<Button hidden={props.entity.label === "You"} onClick={() => props.removeEntity(props.name, props.parents.concat([props.entityType]))} style={{float: "right", marginTop: 5}}>Remove</Button></Menu.Item>;
	}
}

function HouseholdMenu(props) {
	if((Object.keys(props.household).length === 0) || (Object.keys(props.entities).length === 0)) {
		return <Menu />
	}
	const entityType = Object.keys(props.household)[0];
	const name = Object.keys(props.household[entityType])[0]
	const entity = props.household[entityType][name];
	return (
		<Menu
			mode="inline"
			defaultOpenKeys={props.defaultOpenKeys}
			selectedKeys={[props.selected]}
			inlineIndent={16}
		>
			{
				EntityMenu({
					addEntity: props.addEntity,
					removeEntity: props.removeEntity,
					entities: props.entities, 
					entity: entity,
					entityType: entityType,
					name: name,
					parents: [],
					selectEntity: props.selectEntity,
				})
			}
		</Menu>
	);
}

function HouseholdVariables(props) {
	let household = props.household;
	let node = household;
	try {
		for(let parent of props.selected.split(",")) {
			node = node[parent];
		}
	} catch {
		return <></>;
	}
	if(!node || !node.variables) {
		return <></>;
	}
	return Object.values(node.variables).map(variable => <Parameter name={variable.short_name} key={variable.short_name} setPolicy={props.setValue} currency={props.currency} param={variable}/>)
}

export class HouseholdPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, household: props.household, invalid: false};
		this.addEntity = this.addEntity.bind(this);
		this.removeEntity = this.removeEntity.bind(this);
		this.setValue = this.setValue.bind(this);
		this.selectEntity = this.selectEntity.bind(this);
	}

	addEntity(type, parents) {
		let household = this.props.household;
		let node = household;
		for(let parent of parents) {
			node = node[parent];
		}
		const meta = this.props.entities.hierarchy[type];
		const name = this.props.household.num_entities;
		node[type][name] = {};
		if(meta.is_group) {
			for(let childType of meta.children) {
				if(childType === meta.initialiser) {
					node[type][name][childType] = {};
					node[type][name][childType][name + 1] = {};
					household.num_entities++;
				} else {
					node[type][name][childType] = {};
				}
			}
		}
		household.num_entities++;
		this.props.setHouseholdStructure(household);
	}

	removeEntity(name, parents) {
		let household = this.props.household;
		let node = household;
		for(let parent of parents) {
			node = node[parent];
		}
		delete node[name];
		this.setState({selected: "household,0,benunit,1,adult,2"}, () => this.props.setHouseholdStructure(household));
	}

	setValue(variable, value) {
		let household = this.props.household;
		let node = household;
		for(let parent of this.state.selected.split(",")) {
			node = node[parent];
		}
		node.variables[variable].value = value;
		this.props.setHouseholdValues(household);
	}

	selectEntity(path) {
		let household = this.props.household;
		let node = household;
		try {
			for(let parent of path.split(",")) {
				node = node[parent];
			}
		} catch {
			return;
		}
		this.setState({selected: path});
	}

	render() {
		if(!hasItems(this.props.entities) || !hasItems(this.props.household) || !hasItems(this.props.variables)) {
			return <Row></Row>;
		}
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu defaultOpenKeys={this.props.defaultOpenKeys} addEntity={this.addEntity} removeEntity={this.removeEntity} selectEntity={this.selectEntity} selected={this.state.selected} household={this.props.household} entities={this.props.entities} />
				</Col>
				<Col xl={6}>
					<HouseholdVariables setValue={this.setValue} currency={this.props.currency} household={this.props.household} selected={this.state.selected} />
				</Col>
				<Col xl={3}>
					<Overview page="household" currency={this.props.currency} policy={this.props.policy} setPage={this.props.setPage} baseURL={this.props.baseURL} household={!this.state.invalid ? this.props.household : null}/>
				</Col>
			</Row>
		);
	}
}

export default function Household(props) {
	if(props.fetchDone) {
		return <HouseholdPage 
			api_url={props.api_url}
			policy={props.policy}
			defaultOpenKeys={props.defaultOpenKeys}
			variables={props.variables}
			currency={props.currency}
			household={props.household}
			entities={props.entities}
			selected={props.selected}
			setHouseholdValues={props.setHouseholdValues}
			setHouseholdStructure={props.setHouseholdStructure}
			setPage={props.setPage}
			baseURL={props.baseURL}
		/>;
	} else {
		return <></>;
	}
}