import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Button, Menu } from "antd";

const { SubMenu } = Menu;

function entityContainsEntity(household, entities, entityType, parent, child) {
	let parentEntity = entities.entities[entityType[parent]]
	let childEntity = entities.entities[entityType[child]]
	if(parentEntity.is_group && childEntity.is_group) {
		let parentMembers = [];
		for(let role of Object.values(parentEntity.roles)) {
			parentMembers = parentMembers.concat(household[parentEntity.plural][parent][role.plural] || []);
		}
		let childMembers = [];
		for(let role of Object.values(childEntity.roles)) {
			childMembers = childMembers.concat(household[childEntity.plural][child][role.plural] || []);
		}
		return parentMembers.filter(value => childMembers.includes(value));
	} else if(parentEntity.is_group) {
		let parentMembers = [];
		for(let role of Object.values(parentEntity.roles)) {
			parentMembers = parentMembers.concat(household[parentEntity.plural][parent][role.plural] || []);
		}
		return parentMembers.includes(child);
	} else {
		return false;
	}
}

function EntityMenu(props) {
	let nextLevelEntity;
	let entitiesOfChildType;
	const entityIndexInHierarchy = props.entities.hierarchy.indexOf(props.entityType[props.root]);
	let directChildren = null;
	if(entityIndexInHierarchy !== props.entities.hierarchy.length - 1) {
		nextLevelEntity = props.entities.hierarchy[entityIndexInHierarchy + 1];
		entitiesOfChildType = Object.keys(props.household[props.entities.entities[nextLevelEntity].plural]);
		directChildren = entitiesOfChildType.filter(name => entityContainsEntity(props.household, props.entities, props.entityType, props.root, name));
	} else {
		nextLevelEntity = null;
	}
	const immediateChildren = nextLevelEntity !== null ?
		directChildren.map(name => EntityMenu({
			entityType: props.entityType,
			key: name,
			entities: props.entities,
			household: props.household,
			root: name,
		})) :
		null;
	if(nextLevelEntity === null) {
		return <Menu.Item key={props.root}>{props.root}</Menu.Item>;
	} else {
		return (
			<SubMenu title={props.root} key={props.root + " (container)"} >
				<Menu.Item key={props.root}>{props.entities.entities[props.entityType[props.root]].label}</Menu.Item>
				{immediateChildren}
			</SubMenu>
		);
	}
}

function HouseholdMenu(props) {
	if((Object.keys(props.household).length === 0) || (Object.keys(props.entities).length === 0)) {
		return <Menu />
	}
	const root = Object.keys(props.household.households)[0];
	let entityType = {};
	for(let entity of Object.values(props.entities.entities)) {
		for(let entityName in props.household[entity.plural]) {
			entityType[entityName] = entity.key;
		}
	}
	const groupEntities = Object.keys(entityType).filter(name => props.entities.entities[entityType[name]].is_group).map(name => name + " (container)");
	return (
		<Menu
			mode="inline"
			onClick={e => props.selectEntity(e.key)}
			defaultOpenKeys={groupEntities}
			defaultSelectedKeys={[props.selected]}
		>
			{
				EntityMenu({entityType: entityType, entities: props.entities, household: props.household, selected: props.selected, root: root})
			}
		</Menu>
	);
}


export default class Household extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, invalid: false};
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu selectEntity={entity => this.setState({selected: entity})} selected={this.state.selected} household={this.props.household} entities={this.props.entities} />
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