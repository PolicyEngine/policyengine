import { getTranslators } from "../../tools/translation";
import React, { useState } from "react";
import { CheckCircleOutlined, CloseCircleFilled, EditOutlined } from "@ant-design/icons";
import {
	Switch, Slider, Select, 
    Alert, Input,
    DatePicker,
	Tooltip,
} from "antd";
import Spinner from "../../general/spinner";
import { CountryContext } from "../../../countries/country";
import { useContext } from "react";

const { Option } = Select;

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

function NumericParameterControl(props) {
	const country = useContext(CountryContext);
	const targetKey = country.editingReform ? "value" : "baselineValue";
	let [focused, setFocused] = useState(false);
	let { formatter, min, max } = getTranslators(props.metadata);
	let marks = {[max]: formatter(max)};
	if(min) {
		marks[min] = formatter(min);
	}
	const multiplier = props.metadata.unit === "/1" ? 100 : 1;
	let formattedValue = formatter(props.metadata[targetKey]);
	formattedValue = props.metadata[targetKey] === null ? <Spinner /> : formattedValue;
	return (
		<>
			<Slider
				value={props.metadata[targetKey]}
				style={{marginLeft: min ? 30 : 0, marginRight: 30}}
				min={min}
				max={max}
				marks={marks}
				onChange={props.onChange}
				step={0.01}
				tooltipVisible={false}
				disabled={props.disabled}
			/>
			{
				focused ?
					<Input.Search 
						enterButton="Enter" 
						style={{maxWidth: 300}} 
						placeholder={multiplier * props.metadata[targetKey]} 
						onSearch={value => {
							setFocused(false); 
							props.onChange(value / multiplier);
						}} /> :
					<div>
						{formattedValue} 
						<EditOutlined 
							style={{marginLeft: 5}} 
							onClick={() => setFocused(true)} 
						/>
					</div>
			}
		</>
	);
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
		possibleValues = childParameters.map(p => p.breakdown_parts[i]);
		let keyToValueMap = {};
		possibleValues.forEach(value => {
			keyToValueMap[value[0]] = value[1];
		});
		let possibleKeys = [...new Set(possibleValues.map(value => value[0]))];
		dropDowns.push(
			<Select key={i} defaultValue={possibleKeys[0]} style={{marginRight: 10}} onChange={target => {
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
		const metadata = this.context.policy[this.props.name];
		if (!metadata) {
			return null;
		}
		const onChange = value => {
			if(value !== "") {
				this.context.updatePolicy(this.props.name, value)
			}
		};
		const control = {
			"bool": <BooleanParameterControl onChange={onChange} metadata={metadata} />,
			"Enum": <CategoricalParameterControl onChange={onChange} metadata={metadata} />,
			"string": <StringParameterControl onChange={onChange} metadata={metadata} />,
			"date": <DateParameterControl onChange={onChange} metadata={metadata} />,
			"parameter_node": <BreakdownParameterControl metadata={metadata} />,
		}[metadata.valueType] || <NumericParameterControl onChange={onChange} metadata={metadata} />;
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
				<div style={{paddingBottom: 20}} />
			</>
		);
	}
}