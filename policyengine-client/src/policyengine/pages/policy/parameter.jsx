import { getTranslators } from "../../tools/translation";
import React, { useState } from "react";
import { CloseCircleFilled, EditOutlined } from "@ant-design/icons";
import {
	Switch, Slider, Select, 
    Alert, Input,
    DatePicker,
} from "antd";
import Spinner from "../../general/spinner";
import { CountryContext } from "../../../countries/country";

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
	return <Switch
		onChange={props.onChange}
		checked={props.metadata.value}
		className={props.metadata.unit === "abolition" ? "switch-red" : null}
	/>
}

function CategoricalParameterControl(props) {
	return <Select 
		style={{minWidth: 200}} 
		showSearch 
		placeholder={props.metadata.defaultValue} 
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
	return <Input
		onPressEnter={(e) => {props.onChange(e.target.value)}}
		defaultValue={props.metadata.value}
	/>
}

function DateParameterControl(props) {
	return <DatePicker 
		format="YYYY-MM-DD" 
		value={getTranslators(props.metadata.name).parser(props.metadata.value)} 
		onChange={(_, dateStr) => {
			props.onChange(+(dateStr.replace("-", "").replace("-", "")))
		}}
	/>
}

function NumericParameterControl(props) {
	let [focused, setFocused] = useState(false);
	let { formatter, min, max } = getTranslators(props.metadata);
	let marks = {[max]: formatter(max)};
	if(min) {
		marks[min] = formatter(min);
	}
	const multiplier = props.metadata.unit === "/1" ? 100 : 1;
	let formattedValue = formatter(props.metadata.value);
	formattedValue = props.metadata.value === null ? <Spinner /> : formattedValue;
	return (
		<>
			<Slider
				value={props.metadata.value}
				style={{marginLeft: min ? 30 : 0, marginRight: 30}}
				min={min}
				max={max}
				marks={marks}
				onChange={props.onChange}
				step={props.metadata.unit === "/1" ? 0.01 : 1}
				tooltipVisible={false}
				disabled={props.disabled}
			/>
			{
				focused ?
					<Input.Search 
						enterButton="Enter" 
						style={{maxWidth: 300}} 
						placeholder={multiplier * props.metadata.value} 
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
			console.log(this.context)
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
		}[metadata.valueType] || <NumericParameterControl onChange={onChange} metadata={metadata} />;
		return (
			<>
				<h6 style={{marginTop: 20}}>{metadata.label}</h6>
				{metadata.error ? <Error message={metadata.error} /> : null}
				<p>{metadata.description}</p>
				{control}
				<div style={{paddingBottom: 20}} />
			</>
		);
	}
}
/*
export function ParameterX(props) {
	try {
		let { formatter, parser, min, max } = getTranslators(props.param);
		if(focused) {
			formatter = x => x;
		}
		const onChange = value => {if(value !== "") {props.updatePolicy(props.param.name, value)}};
		let component;
		if(props.param.valueType === "bool") {
			if(props.param.unit === "abolition") {
				component = (
					<Switch
						onChange={value => onChange(value)}
						checked={props.param.value}
						className="switch-red"
						disabled={props.disabled}
					/>
				)
			} else {
				component = (
					<Switch
						onChange={value => onChange(value)}
						checked={props.param.value}
						disabled={props.disabled}
					/>
				);
			}
		} else if(props.param.valueType === "Enum") {
			component = (
				<Select style={{minWidth: 200}} showSearch placeholder={props.param.defaultValue.value} disabled={props.disabled} onSelect={onChange}>
					{props.param.possibleValues.map(value => <Option key={value.key} value={value.key}>{value.value}</Option>)}
				</Select>
			);
		} else if(props.param.valueType === "str") {
			component = (
				<Input
					onPressEnter={(e) => {onChange(e.target.value)}}
					defaultValue={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else if(props.param.valueType === "date") {
			component = (
				<DatePicker format="YYYY-MM-DD" value={parser(props.param.value)} onChange={(_, dateStr) => {onChange(+(dateStr.replace("-", "").replace("-", "")))}}/>
			);
		} else {
			let marks = {[max]: formatter(max)};
			if(min) {
				marks[min] = formatter(min);
			}
			const multiplier = props.param.unit === "/1" ? 100 : 1;
			let formattedValue = formatter(props.param.value);
			formattedValue = props.param.value === null ? <Spinner /> : formattedValue;
			component = (
				<>
					<Slider
						value={props.param.value}
						style={{marginLeft: min ? 30 : 0, marginRight: 30}}
						min={min}
						max={max}
						marks={marks}
						onChange={onChange}
						step={props.param.unit === "/1" ? 0.01 : 1}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					{
						focused ?
							<Input.Search enterButton="Enter" style={{maxWidth: 300}} placeholder={multiplier * props.param.value} onSearch={value => {setFocused(false); onChange(value / multiplier);}} /> :
							<div>{formattedValue} <EditOutlined style={{marginLeft: 5}} onClick={() => setFocused(true)} /></div>
					}
				</>
			);
		}
		return (
			<>
				<h6 style={{marginTop: 20}}>{props.param.label}</h6>
				{props.param.error ? <Alert type="error" message={props.param.error} style={{marginBottom: 10}} showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}/> : null}
				<p>{props.param.description}</p>
				{component}
				<div style={{paddingBottom: 20}} />
			</>
		);
		} catch(e) {
			return <>Couldn't load parameter</>;
		}
}
*/