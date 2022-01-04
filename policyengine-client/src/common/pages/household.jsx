import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Collapse, Button, Radio, Select } from "antd";
import { Parameter } from "../parameter";
import { Menu } from "../menu";

const { Option } = Select;

function hasItems(object) {
	return object && (Object.keys(object).length > 0);
}

function Spacing() {
	return <div style={{paddingTop: 15}}/>;
}

function pathToItem(path, object) {
	let node = object;
	for(const item of path.split("/").slice(1)) {
		node = node[item];
	}
	return node;
}

function HouseholdSetup(props) {
	return <>
		<Spacing />
		<h5>Adults</h5>
		<Spacing />
		<Radio.Group defaultValue={props.situation.households["Your household"].adults.length} onChange={e => {props.updateSituation(props.situationActions.setNumAdults(props.situation, e.target.value))}}>
			{[...Array(3).keys()].slice(1).map(i => <Radio.Button key={i} value={i}>{i}</Radio.Button>)}
		</Radio.Group>
		<Spacing />
		<h5>Children</h5>
		<Spacing />
		<Radio.Group defaultValue={props.situation.households["Your household"].children.length} onChange={e => props.updateSituation(props.situationActions.setNumChildren(props.situation, e.target.value))}>
			{[...Array(6).keys()].map(i => <Radio.Button key={i} value={i}>{i}</Radio.Button>)}
		</Radio.Group>
	</>
}

class HouseholdVariables extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selectedGroup: null, selectedName: null};
	}

	render() {
		const variables = pathToItem(this.props.selected, this.props.hierarchy);
		const entity = this.props.entities[this.props.variables[variables[0]].entity];
		const instances = Object.keys(this.props.situation[entity.plural]);
		let selectedName;
		if(this.props.selected !== this.state.selectedGroup) {
			this.setState({selectedGroup: this.props.selected, selectedName: instances[0]});
			selectedName = instances[0];
		} else {
			selectedName = this.state.selectedName;
		}
		let entitySelector = null;
		if(instances.length > 1) {
			entitySelector = <>
				<Spacing />
				<Select 
					defaultValue={selectedName}
					style={{ width: 200, float: "right" }}
					onChange={e => this.setState({selectedName: e})}>
						{instances.map(name => <Option key={name} value={name}>{name}</Option>)}
				</Select>
			</>;
		}
		if(this.props.selected == "/General") {
			// Show variables controlling the structure of the household
			return <HouseholdSetup 
				updateSituation={this.props.updateSituation} 
				situation={this.props.situation}
				situationActions={this.props.situationActions} 
			/>
		}
		// By default, show the variables from the selected category
		const controls = variables.map(variable => {
			let computed = this.props.computedSituation[entity.plural][selectedName];
			let value;
			const entityVariables = this.props.situation[entity.plural][selectedName];
			if(computed === undefined) {
				value = this.props.variables[variable].defaultValue;
			} else if(entityVariables[variable]["2021"] !== null) {
				value = entityVariables[variable]["2021"];
			} else {
				value = computed[variable]["2021"];
			}
			if(this.props.variables[variable].valueType === "Enum") {
				const match = this.props.variables[variable].possibleValues.filter(possibleValue => possibleValue.key === value)[0];
				value = {
					key: value,
					value: match && match.value,
				}
			}
			try {
				return <Parameter 
					key={variable} 
					updatePolicy={(variable, value) => this.props.updateValue(variable, this.state.selectedName, entity.key, value)}
					param={{
						name: this.props.variables[variable].name,
						label: this.props.variables[variable].label,
						unit: this.props.variables[variable].unit,
						period: this.props.variables[variable].definitionPeriod,
						defaultValue: value,
						value: value,
						min: this.props.variables[variable].min,
						max: this.props.variables[variable].max,
						valueType: this.props.variables[variable].valueType,
						description: this.props.variables[variable].documentation,
						possibleValues: this.props.variables[variable].possibleValues,
					}}
					isComputed={!entityVariables[variable]["2021"] && !this.props.inputVariables.includes(variable)}
					loading={this.props.loading && !this.props.inputVariables.includes(variable)}
					error={this.props.error}
				/>
			} catch(e) {
				return <p>Couldn't load {variable}: {e.toString()}</p>
			}
		});
		return <>
			{entitySelector}
			{controls}
			</>;
	}
}

export class HouseholdPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			waiting: false, 
			selected: "/General", 
			error: false, 
			situation: props.situation, 
			computedSituation: props.situation, 
			situationValid: true, 
			autoComputeIntervalID: null, 
			situationHasChanged: true
		};
		this.updateSituation = this.updateSituation.bind(this);
		this.autoComputeSituation = this.autoComputeSituation.bind(this);
	}
	
	componentDidMount() {
		this.setState({autoComputeIntervalID: setInterval(this.autoComputeSituation, 2000)});
		this.props.setHouseholdVisited();
	}
	 
	componentWillUnmount() {
		clearInterval(this.state.autoComputeIntervalID);
	}

	updateSituation(name, type, variable, value) {
		let situation = this.state.situation;
		situation[this.props.entities[type].plural][name][variable]["2021"] = value;
		this.setState({situation: situation, situationValid: true, situationHasChanged: true});
	}

	autoComputeSituation() {
		if(this.state.situationHasChanged && !this.state.waiting) {
			this.setState({waiting: true}, () => {fetch(this.props.api_url + "/calculate", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.state.situation),
			}).then(response => response.json()).then(situation => {
				this.setState({waiting: false, computedSituation: situation, situationValid: true, situationHasChanged: false});
				this.props.updateSituation(this.state.situation, this.state.computedSituation);
			}).catch((e) => this.setState({situationHasChanged: false, error: true}))});
		}
	}

	render() {
		if(!hasItems(this.props.entities) || !hasItems(this.props.situation) || !hasItems(this.props.variables)) {
			return <Row></Row>;
		}
		return (
			<Row>
				<Col xl={3}>
					<Menu 
						hierarchy={this.props.hierarchy}
						selectGroup={group => this.setState({selected: group})}
						selected={this.state.selected}
					/>
				</Col>
				<Col xl={6}>
					<HouseholdVariables
						selected={this.state.selected} 
						situation={this.props.situation} 
						computedSituation={this.state.computedSituation}
						updateValue={(variable, name, entityType, value) => this.updateSituation(name, entityType, variable, value)}
						entities={this.props.entities}
						variables={this.props.variables}
						loading={this.state.situationHasChanged}
						error={this.state.error}
						hierarchy={this.props.hierarchy}
						situationActions={this.props.situationActions}
						updateSituation={this.props.updateSituation}
						inputVariables={this.props.inputVariables}
					/>
				</Col>
				<Col xl={3}>
					<Overview 
						page="household" 
						policy={this.props.policy}
						setPage={this.props.setPage} 
						invalid={!this.props.policyValid || this.state.situationHasChanged} 
						baseURL={this.props.baseURL}
						situation={this.state.computedSituation}
						variables={this.props.variables}
						loading={this.state.situationHasChanged}
						disableNavigation={this.props.disableOverviewNavigation}
					/>
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
			variables={props.variables}
			situation={props.situation}
			situationValid={props.situationValid}
			policyValid={props.policyValid}
			entities={props.entities}
			updateSituation={props.updateSituation}
			setPage={props.setPage}
			baseURL={props.baseURL}
			setHouseholdVisited={props.setHouseholdVisited}
			disableOverviewNavigation={props.disableOverviewNavigation}
			inputVariables={props.inputVariables}
			openCategories={props.openCategories}
			hierarchy={props.hierarchy}
			situationActions={props.situationActions}
		/>;
	} else {
		return <></>;
	}
}