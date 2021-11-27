import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";
import { Menu, Collapse } from "antd";
import { Parameter } from "../parameter";
import { VARIABLE_CATEGORIES } from "../../countries/uk/data/situation";

const { Panel } = Collapse;

function hasItems(object) {
	return object && (Object.keys(object).length > 0);
}

function HouseholdMenu(props) {
	return (
		<Menu>
			<h6 style={{marginTop: 20}}>People</h6>
			{
				Object.keys(props.situation.people).map(name => (
					<Menu.Item key={name} onClick={() => props.select(name, "person")}>{name}</Menu.Item>
				))
			}
			<h6 style={{marginTop: 20}}>Groups</h6>
			{
				Object.keys(props.situation.benunits).map(name => (
					<Menu.Item key={name} onClick={() => props.select(name, "benunit")}>{name}</Menu.Item>
				))
			}
			{
				Object.keys(props.situation.households).map(name => (
					<Menu.Item key={name} onClick={() => props.select(name, "household")}>{name}</Menu.Item>
				))
			}
		</Menu>
	);
}

function HouseholdVariables(props) {
	const variables = props.situation[props.entities[props.selected.type].plural][props.selected.name];
	let panels = [];
	for(let category of Object.keys(props.categories)) {
		const panelVariables = Object.keys(variables).filter(variable => props.categories[category].includes(variable)).map(variable => (
			<Parameter 
				key={variable} 
				updatePolicy={props.updateValue}
				param={{
					name: props.variables[variable].name,
					label: props.variables[variable].label,
					defaultValue: props.variables[variable].defaultValue || props.computedSituation[props.entities[props.selected.type].plural][props.selected.name][variable]["2021"],
					unit: props.variables[variable].unit,
					period: props.variables[variable].definitionPeriod,
					value: variables[variable]["2021"] || props.computedSituation[props.entities[props.selected.type].plural][props.selected.name][variable]["2021"],
					min: props.variables[variable].min,
					max: props.variables[variable].max,
					value_type: props.variables[variable].value_type,
					description: props.variables[variable].documentation,
				}}
				isComputed={!variables[variable]["2021"]}
				loading={props.loading}
				error={props.error}
			/>
		));
		if(panelVariables.length > 0) {
			panels.push(
				<Panel style={{marginBottom: 10, padding: 10}} header={category} key={category}>
				{panelVariables}
				</Panel>
			);
		}
	}
	return <Collapse style={{margin: 10}} bordered={false} defaultActiveKey={Object.keys(props.categories)}>{panels}</Collapse>
}

export class HouseholdPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: {name: props.defaultSelectedName, type: props.defaultSelectedType}, error: false, situation: props.situation, computedSituation: props.situation, situationValid: true, autoComputeIntervalID: null, situationHasChanged: true};
		this.updateSituation = this.updateSituation.bind(this);
		this.autoComputeSituation = this.autoComputeSituation.bind(this);
	}
	
	componentDidMount() {
		this.setState({autoComputeIntervalID: setInterval(this.autoComputeSituation, 1000)});
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
		if(this.state.situationHasChanged) {
			fetch(this.props.api_url + "/calculate", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.state.situation),
			}).then(response => response.json()).then(situation => {
				this.setState({computedSituation: situation, situationValid: true, situationHasChanged: false});
				this.props.updateSituation(this.state.situation, this.state.computedSituation);
			}).catch((e) => this.setState({situationHasChanged: false, error: true}));
		}
	}

	render() {
		if(!hasItems(this.props.entities) || !hasItems(this.props.situation) || !hasItems(this.props.variables)) {
			return <Row></Row>;
		}
		return (
			<Row>
				<Col xl={3}>
					<HouseholdMenu selected={this.state.selected} situation={this.props.situation} entities={this.props.entities} select={(name, type) => {this.setState({selected: {name: name, type: type}});}}/>
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
						categories={VARIABLE_CATEGORIES}
					/>
				</Col>
				<Col xl={3}>
					<Overview 
						page="household" 
						policy={this.props.policy}
						setPage={this.props.setPage} 
						invalid={!this.props.policyValid} 
						baseURL={this.props.baseURL}
						situation={this.state.computedSituation}
						variables={this.props.variables}
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
		/>;
	} else {
		return <></>;
	}
}