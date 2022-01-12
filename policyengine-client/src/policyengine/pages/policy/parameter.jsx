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
		onChange={value => props.onChange(+value)}
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
		allowClear={false}
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