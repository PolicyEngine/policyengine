import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Button, Menu, message } from "antd";

const { SubMenu } = Menu;

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function EntityMenu(props) {
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
				}));
			}
			if(Object.keys(props.entity[childType]).length < childMeta.max) {
				buttons.push(
					<Menu.Item key={props.name + childType}><Button onClick={() => props.addEntity(childType, newParents)}>Add {childMeta.label}</Button></Menu.Item>
				);
			}
		}
		return (
			<SubMenu key={props.name + "_"} title={props.entity.label || props.name}>
				<Menu.Item key={props.name}>{capitalizeFirstLetter(props.entities.hierarchy[props.entityType].label)}</Menu.Item>
				{children}
				{buttons}
			</SubMenu>
		);
	} else {
		return <Menu.Item key={props.name}>{props.entity.label ||props.name}<Button onClick={() => props.removeEntity(props.name, props.parents.concat([props.entityType]))} style={{float: "right", marginTop: 5}}>Remove</Button></Menu.Item>;
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
			onClick={e => props.selectEntity(e.key)}
			defaultOpenKeys={props.defaultOpenKeys}
			defaultSelectedKeys={[props.selected]}
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
				})
			}
		</Menu>
	);
}

export default class Household extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, household: props.household, invalid: false};
		this.addEntity = this.addEntity.bind(this);
		this.removeEntity = this.removeEntity.bind(this);
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
		this.props.setHousehold(household);
	}

	removeEntity(name, parents) {
		let household = this.props.household;
		let node = household;
		for(let parent of parents) {
			node = node[parent];
		}
		delete node[name];
		this.props.setHousehold(household);
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu defaultOpenKeys={this.props.defaultOpenKeys} addEntity={this.addEntity} removeEntity={this.removeEntity} selectEntity={entity => this.setState({selected: entity})} selected={this.state.selected} household={this.props.household} entities={this.props.entities} />
				</Col>
				<Col xl={6}>
					{this.state.selected}
				</Col>
				<Col xl={3}>
					<Overview page="household" policy={this.props.policy} setPage={this.props.setPage} household={!this.state.invalid ? this.props.household : null}/>
				</Col>
			</Row>
		);
	}
}