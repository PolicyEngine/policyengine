import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Button, Menu, message } from "antd";

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
	let childRoles = null;
	if(entityIndexInHierarchy !== props.entities.hierarchy.length - 1) {
		nextLevelEntity = props.entities.hierarchy[entityIndexInHierarchy + 1];
		entitiesOfChildType = Object.keys(props.household[props.entities.entities[nextLevelEntity].plural]);
		directChildren = entitiesOfChildType.filter(name => entityContainsEntity(props.household, props.entities, props.entityType, props.root, name));
		if(!props.entities.entities[nextLevelEntity].is_group) {
			childRoles = props.entities.entities[props.entities.hierarchy[props.entities.hierarchy.length - 2]].roles;
		} else {
			childRoles = [props.entities.entities[nextLevelEntity]];
		}
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
			addPerson: props.addPerson, 
			addGroup: props.addGroup, 
			removePerson: props.removePerson,
			setValue: props.setValue,
		})) :
		null;
	if(nextLevelEntity === null) {
		return <Menu.Item key={props.root}>{props.root} <Button style={{float: "right", marginTop: 5}} onClick={() => props.removePerson(props.root)}>Remove</Button></Menu.Item>;
	} else {
		return (
			<SubMenu title={props.root} key={props.root + "_"} >
				<Menu.Item key={props.root}>{props.entities.entities[props.entityType[props.root]].label}</Menu.Item>
				{immediateChildren}
				{
					Object.values(childRoles).map(entity => 
						(
							(!entity.max || (props.household[props.entities.entities[props.entityType[props.root]].plural][props.root][entity.plural] || []).length < entity.max) ?
							<Menu.Item key={props.root + entity.key}>
								<Button 
									onClick={entity.is_group ? () => props.addGroup(entity.key, props.root) : () => props.addPerson(entity.key, props.root)}
								>Add {entity.label}
								</Button>
							</Menu.Item> :
							null
						)
					)
				}
			</SubMenu>
		);
	}
}

function HouseholdMenu(props) {
	if((Object.keys(props.household).length === 0) || (Object.keys(props.entities).length === 0)) {
		return <Menu />
	}
	const root = Object.keys(props.household.households)[0];
	const groupEntities = Object.keys(props.entityType).filter(name => props.entities.entities[props.entityType[name]].is_group).map(name => name + "_");
	return (
		<Menu
			mode="inline"
			onClick={e => props.selectEntity(e.key)}
			defaultOpenKeys={groupEntities}
			defaultSelectedKeys={[props.selected]}
		>
			{
				EntityMenu({
					addPerson: props.addPerson, 
					addGroup: props.addGroup, 
					removePerson: props.removePerson,
					setValue: props.setValue,
					entityType: props.entityType, 
					entities: props.entities, 
					household: props.household, 
					selected: props.selected, 
					root: root
				})
			}
		</Menu>
	);
}

export default class Household extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, household: props.household, entityType: {}, invalid: false};
		this.addPerson = this.addPerson.bind(this);
		this.addGroup = this.addGroup.bind(this);
		this.assignPerson = this.assignPerson.bind(this);
		this.removePerson = this.removePerson.bind(this);
		this.validateHousehold = this.validateHousehold.bind(this);
		this.setValue = this.setValue.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if(Object.keys(props.entities).length === 0) {
			return {};
		}
		let entityType = {};
		for(let entity of Object.values(props.entities.entities)) {
			for(let entityName in props.household[entity.plural]) {
				entityType[entityName] = entity.key;
			}
		}
		return {entityType: entityType};
	}

	addPerson(targetRole, parentEntity) {
		// Name and find metadata

		let household = this.props.household;
		const parent = this.props.entities.entities[this.state.entityType[parentEntity]];
		const role = parent.roles[targetRole];
		let name = role.label;
		let i = 1;
		let numeric = false;
		const existingEntities = Object.keys(this.state.entityType);
		while((!numeric && existingEntities.includes(name)) || existingEntities.includes(name + " " + i.toString())) {
			i++;
			numeric = true;
		}
		name = name + " " + i.toString();
		let otherMembersOfGroup = {};
		for(let role of Object.values(parent.roles)) {
			otherMembersOfGroup[role.key] = household[parent.plural][parentEntity][role.plural] || [];
		}

		// Add to people

		household.people[name] = {}

		// Add to immediate parent entity

		if(Object.keys(household[parent.plural][parentEntity]).includes(role.plural)) {
			if(role.max && household[parent.plural][parentEntity][role.plural].length === role.max) {
				message.error(`${parent.label} can have at most ${role.max} ${role.label}s.`);
				return household;
			}
			household[parent.plural][parentEntity][role.plural].push(name);
		} else {
			household[parent.plural][parentEntity][role.plural] = [name];
		}

		// Add to indirect parent entities

		for(let entity of Object.values(this.props.entities.entities)) {
			if(entity.is_group && entity.key !== parent.key) {
				for(let entityName in household[entity.plural]) {
					for(let role of Object.values(entity.roles)) {
						if((household[entity.plural][entityName][role.plural] || []).filter(value => otherMembersOfGroup[role.key].includes(value)) && role.key === targetRole) {
							(household[entity.plural][entityName][role.plural] || []).push(name);
						}
					}
				}
			}
		}
		this.props.setHousehold(household);
	}

	addGroup(type, parentEntity) {
		
	}

	assignPerson(name, groupName, role) {
		console.log("assign person")
	}

	removePerson(name) {
		let household = this.props.household;
		delete household.people[name];
		for(let entity of Object.values(this.props.entities.entities)) {
			if(entity.is_group) {
				for(let instance in household[entity.plural]) {
					for(let role of Object.values(entity.roles)) {
						if((household[entity.plural][instance][role.plural] || []).includes(name)) {
							household[entity.plural][instance][role.plural] = household[entity.plural][instance][role.plural].filter(i => i !== name);
						}
					}
				}
			}
		}
		console.log(household, name);
		this.props.setHousehold(household);
	}

	validateHousehold() {
		console.log("validate household")
	}

	setValue(name, variable, value) {
		console.log("set value")
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu entityType={this.state.entityType} addPerson={this.addPerson} addGroup={this.addGroup} removePerson={this.removePerson} setValue={this.setValue} selectEntity={entity => this.setState({selected: entity})} selected={this.state.selected} household={this.props.household} entities={this.props.entities} />
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