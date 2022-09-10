import { getTranslators } from "../../../tools/translation";
import React, { useState } from "react";
import { CheckCircleOutlined, CloseCircleFilled, EditOutlined, TrophyOutlined } from "@ant-design/icons";
import {
	Switch, Slider, Select, 
    Alert, Input,
    DatePicker,
	Tooltip,
	Steps,
	Row,
	Col,
} from "antd";
import Spinner from "../../../general/spinner";
import { CountryContext } from "../../../../countries/country";
import { useContext } from "react";
import NumericParameterControl from "./numericParameterControl";

const { Option } = Select;
const { Step } = Steps;

function Error(props) {
	return <Alert 
		type="error" 
		message={props.message} 
		style={{marginBottom: 10}} 
		showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}
	/>
}

function BooleanParameterControl(props) {
	const country = useContext(CountryContext);
	return <Switch
		onChange={value => props.onChange(Boolean(value))}
		checked={country.editingReform ? props.metadata.value : props.metadata.baselineValue}
		className={props.metadata.unit === "abolition" ? "switch-red" : null}
	/>
}

function CategoricalParameterControl(props) {
	const country = useContext(CountryContext);
	const targetKey = country.editingReform ? "value" : "baselineValue";
	return <Select
		style={{minWidth: 200}} 
		showSearch 
		defaultValue={props.metadata[targetKey]}
		value={props.metadata[targetKey]}
		onSelect={props.onChange}>
		{props.metadata.possibleValues.map(value => (
			<Option 
				key={value.key} 
				value={value.key}
			>
				{value.value}
			</Option>
		))}
	</Select>
}

function StringParameterControl(props) {
	const country = useContext(CountryContext);
	return <Input
		onPressEnter={(e) => {props.onChange(e.target.value)}}
		defaultValue={country.editingReform ? props.metadata.value : props.metadata.baselineValue}
	/>
}

function DateParameterControl(props) {
	return <DatePicker 
		allowClear={false}
		format="YYYY-MM-DD" 
		value={getTranslators(props.metadata.name).parser(props.metadata.value)} 
		onChange={(_, dateStr) => {
			props.onChange(+(dateStr.replace("-", "").replace("-", "")))
		}}
	/>
}


function BreakdownParameterControl(props) {
	const country = useContext(CountryContext);
	const childParameters = Object.values(country.policy).filter(p => (p.valueType !== "parameter_node") && p.name.includes(props.metadata.name));
	let firstEntry = childParameters[0].parameter.replace(props.metadata.parameter + ".", "").split(".");
	let [selected, setSelected] = useState(firstEntry);
	let numBreakdowns = firstEntry.length
	let dropDowns = [];
	let possibleValues;
	for(let i = 0; i < numBreakdowns; i++) {
		possibleValues = childParameters.map(p => p.breakdownParts[i]);
		let keyToValueMap = {};
		possibleValues.forEach(value => {
			keyToValueMap[value[0]] = value[1];
		});
		let possibleKeys = [...new Set(possibleValues.map(value => value[0]))];
		dropDowns.push(
			<Select key={i} defaultValue={possibleKeys[0]} style={{marginLeft: 0, paddingLeft: 0}} bordered={false} onChange={target => {
				let selectedCopy = [...selected];
				selectedCopy[i] = target;
				setSelected(selectedCopy);
			}}>
				{possibleKeys.map(key => <Option key={key} value={key}>{keyToValueMap[key]}</Option>)}
			</Select>
		);
	}
	const selectedParameter = childParameters.find(p => p.parameter === props.metadata.parameter + "." + selected.join("."));
	return <Parameter hideTitle name={selectedParameter.name} prefix={dropDowns} onChange={props.onChange} />;
}

function ParameterScaleControl(props) {
	const country = useContext(CountryContext);
	const target = country.editingReform ? "value" : "baselineValue";
	const brackets = [...Array(props.metadata.brackets).keys()];
	const parentName = props.metadata.name;
	let thresholdParameters = {};
	let rateParameters = {};
	for(let i = 0; i < props.metadata.brackets; i++) {
		if(`${parentName}_${i + 1}_threshold` in country.policy) {
			thresholdParameters[i] = country.policy[`${parentName}_${i + 1}_threshold`];
		} else {
			// The threshold parameter for the i-th bracket might have a custom name, but will still have
			// the 'parameter' attribute which we can use to identify it.
			thresholdParameters[i] = Object.values(country.policy).find(p => p.parameter === `${props.metadata.parameter}[${i}].threshold`);
		}
		if(`${parentName}_${i + 1}_rate` in country.policy) {
			rateParameters[i] = country.policy[`${parentName}_${i + 1}_rate`];
		} else {
			rateParameters[i] = Object.values(country.policy).find(p => p.parameter === `${props.metadata.parameter}[${i}].rate`);
		}
	}
	let upperThresholds = brackets.slice(0, props.metadata.brackets - 1).map(bracket => (
		thresholdParameters[bracket][target]
	));
	upperThresholds.push(Infinity);
	let lowerThresholds = brackets.slice(1).map(bracket => (
		thresholdParameters[bracket][target]
	));
	lowerThresholds.unshift(-Infinity);
	let thresholdMetadata = {exclusiveMin: true, exclusiveMax: true};
	if(props.metadata.thresholdPeriod) {
		thresholdMetadata.period = props.metadata.thresholdPeriod;
	}
	let displayOnly = [];
	for(let i = 0; i < props.metadata.brackets; i++) {
		let value = thresholdParameters[i][target];
		if(value.toString().includes("inf")) {
			const isPositive = !value.toString().startsWith("-");
			const nextParameter = thresholdParameters[isPositive ? i - 1 : i + 1];
			const relevantValue = getTranslators(nextParameter).formatter(nextParameter.value);
			displayOnly.push(isPositive ? `Above ${relevantValue}` : `Below ${relevantValue}`);
		} else {
			displayOnly.push(null);
		}
	}
	let rateBrackets = [];
	for(let i in brackets) {
		try {
			rateBrackets.push(<Step key={i} title={<Parameter noSlider hideTitle name={rateParameters[i].name} />} />);
		} catch(e) {
			// Something went wrong when looking up one of the rate parameters.
			rateBrackets.push(<></>);
		}
	}
	return <>
		<Row style={{width: "100%"}}>
			<Col style={{paddingRight: 20}}>
				<Steps direction="vertical" progressDot current={props.metadata.brackets - 1}>
					{
						brackets.map(i => (
							<Step key={i} title={<Parameter 
								noSlider 
								extraMetadata={{...thresholdMetadata, hardMin: lowerThresholds[i], hardMax: upperThresholds[i]}} 
								hideTitle 
								name={thresholdParameters[i].name}
								displayOnly={displayOnly[i]}
								/>
							} />
						))
					}
				</Steps>
			</Col>
			<Col>
				<Steps direction="vertical" progressDot style={{paddingTop: 25}} current={props.metadata.brackets - 1}>
					{
						rateBrackets
					}
				</Steps>
			</Col>
		</Row>
		
	</>
}

export default class Parameter extends React.Component {
	static contextType = CountryContext;

	constructor(props, context) {
		super(props);
		this.state = {
			focused: false,
		};
	}

	render() {
		if(!this.context.fullyLoaded) {
			return <></>;
		}
		const metadata = Object.assign(this.context.policy[this.props.name], this.props.extraMetadata || {});
		if (!metadata) {
			//return <></>;
			// Uncomment this line to debug: 
			console.log(this.context.policy)
			return <h2>Failed: {this.props.name}</h2>;
		}
		const onChange = value => {
			if(value !== "") {
				this.context.updatePolicy(this.props.name, value)
			}
		};
		const control = {
			"bool": <BooleanParameterControl onChange={onChange} metadata={metadata}/>,
			"Enum": <CategoricalParameterControl onChange={onChange} metadata={metadata} />,
			"string": <StringParameterControl onChange={onChange} metadata={metadata} />,
			"date": <DateParameterControl onChange={onChange} metadata={metadata} />,
			"parameter_node": <BreakdownParameterControl metadata={metadata} />,
			"parameter_scale": <ParameterScaleControl metadata={metadata} />,
		}[metadata.valueType] || <NumericParameterControl displayOnly={this.props.displayOnly} onChange={onChange} noSlider={this.props.noSlider} metadata={metadata} />;
		let populationSimCheckbox = null;
		if(this.context.notAllParametersPopulationSimulatable && this.context.showPopulationImpact) {
			populationSimCheckbox = this.context.populationSimulatableParameters.includes(metadata.name) &&
				<Tooltip title="This parameter will affect the country-wide simulation" overlayInnerStyle={{padding: 20, paddingRight: 0}}>
					<CheckCircleOutlined />
				</Tooltip>;
		}
		return (
			<>
				{
					!this.props.hideTitle ?
						<>
							<h6 style={{marginTop: 20}}>{metadata.label} {populationSimCheckbox}</h6>
							{metadata.error ? <Error message={metadata.error} /> : null}
							<p>{metadata.description}</p>
						</> :
						null
				}
				{this.props.prefix}
				{control}
				<div style={{paddingBottom: 10}} />
			</>
		);
	}
}