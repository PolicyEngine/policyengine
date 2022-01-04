import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Collapse, Button } from "antd";
import { Parameter } from "../parameter";
import { Menu } from "../menu";

const { Panel } = Collapse;

function hasItems(object) {
	return object && (Object.keys(object).length > 0);
}

function SubTitle(props) {
	return <h6 style={{marginTop: 20}}>{props.children}</h6>
}

function pathToItem(path, object) {
	let node = object;
	for(const item of path.split("/").slice(1)) {
		node = node[item];
	}
	return node;
}

function HouseholdVariables(props) {
	try {
		const variables = pathToItem(props.path,)
		let panels = [];
		for(let category of Object.keys(props.categories)) {
			const panelVariables = Object.keys(variables).filter(variable => props.categories[category].includes(variable)).map(variable => {
				let computed = props.computedSituation[props.entities[props.selected.type].plural][props.selected.name];
				let value;
				if(computed === undefined) {
					value = props.variables[variable].defaultValue;
				} else if(variables[variable]["2021"] !== null) {
					value = variables[variable]["2021"];
				} else {
					value = computed[variable]["2021"];
				}
				if(props.variables[variable].valueType === "Enum") {
					const match = props.variables[variable].possibleValues.filter(possibleValue => possibleValue.key === value)[0];
					value = {
						key: value,
						value: match && match.value,
					}
				}
				try {
					const isInputVariable = props.inputVariables.includes(variable);
					return <Parameter 
						key={variable} 
						updatePolicy={props.updateValue}
						param={{
							name: props.variables[variable].name,
							label: props.variables[variable].label,
							unit: props.variables[variable].unit,
							period: props.variables[variable].definitionPeriod,
							defaultValue: value,
							value: value,
							min: props.variables[variable].min,
							max: props.variables[variable].max,
							valueType: props.variables[variable].valueType,
							description: props.variables[variable].documentation,
							possibleValues: props.variables[variable].possibleValues,
						}}
						isComputed={!variables[variable]["2021"] & !isInputVariable}
						loading={props.loading & !((value !== null) & isInputVariable)}
						error={props.error}
					/>
				} catch {
					return <p>Couldn't load {variable}</p>
				}
			});
			if(panelVariables.length > 0) {
				panels.push(
					<Panel style={{marginBottom: 10, padding: 10}} header={category} key={category}>
					{panelVariables}
					</Panel>
				);
			}
		}
		return <Collapse style={{margin: 10}} bordered={false} defaultActiveKey={props.openCategories}>{panels}</Collapse>
	} catch(e) {
		return <>{e.toString}</>;
	}
}

export class HouseholdPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			waiting: false, 
			selected: props.defaultSelected, 
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
						updateValue={(variable, value) => this.updateSituation(this.state.selected.name, this.state.selected.type, variable, value)}
						entities={this.props.entities}
						variables={this.props.variables}
						loading={this.state.situationHasChanged}
						error={this.state.error}
						hierarchy={this.props.hierarchy}
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
			defaultSelectedName={props.defaultSelectedName}
			defaultSelectedType={props.defaultSelectedType}
			situationStructureButtons={props.situationStructureButtons}
			setHouseholdVisited={props.setHouseholdVisited}
			categories={props.categories}
			disableOverviewNavigation={props.disableOverviewNavigation}
			inputVariables={props.inputVariables}
			openCategories={props.openCategories}
			hierarchy={props.hierarchy}
		/>;
	} else {
		return <></>;
	}
}