import { Fragment, default as React } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import {
	InputNumber, Divider, Switch, Slider, Select, Alert, Input
} from "antd";

import "../common/policyengine.less";

const { Option } = Select;


export function getTranslators(parameter) {
	const CURRENCY_SYMBOLS = {
		"currency-GBP": "£",
		"currency-USD": "$",
	}
	if (parameter.unit === "/1") {
		return {
			formatter: value => `${Math.round(value * 1000) / 10}%`,
			parser: text => Math.round(+text.replace("%", "") * 10) / 1000,
			defaultMin: 0,
			defaultMax: 1,
			defaultInputStep: 0.001,
			defaultSliderStep: 0.01,
		}
	}
	for(let currency in CURRENCY_SYMBOLS) {
		if(parameter.unit === currency) {
			return {
				formatter: value => `${CURRENCY_SYMBOLS[currency]}${Number(value).toLocaleString()}/${parameter.period}`,
				parser: text => +text.replace(CURRENCY_SYMBOLS[currency], "").replace(`/${parameter.period}`, ""),
				defaultMin: 0,
				defaultMax: Math.pow(10, Math.ceil(Math.log10(parameter.defaultValue))),
				defaultInputStep: 1,
				defaultSliderStep: 1,
			}
		}
	}
	return value => value;
}

export function Parameter(props) {
	try {
		const { formatter, parser, defaultMin, defaultMax, defaultInputStep, defaultSliderStep } = getTranslators(props.param);
		const onChange = value => props.updatePolicy(props.param.name, value);
		let component;
		if(props.param.value_type === "bool") {
			component = (
				<Switch
					onChange={onChange}
					checked={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else if(props.param.value_type === "abolish") {
			component = (
				<Switch
					onChange={onChange}
					checked={props.param.value}
					className="switch-red"
					disabled={props.disabled}
				/>
			);
		} else if(props.param.value_type === "Enum") {
			component = (
				<Select placeholder={props.param.default} disabled={props.disabled} onSelect={onChange}>
					{props.param.options.map(value => <Option key={value} value={value}>{value}</Option>)}
				</Select>
			);
		} else if(props.param.value_type === "str") {
			component = (
				<Input
					onPressEnter={(e) => {onChange(e.target.value)}}
					defaultValue={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else {
			const min = props.param.min || defaultMin;
			const max = props.param.max || defaultMax;
			const markStyle = {}
			component = (
				<>
					<Slider
						value={props.param.value}
						style={{marginLeft: 30, marginRight: 30}}
						min={min}
						max={max}
						marks={{[min]: {label: formatter(min), style: markStyle}, [max]: {label: formatter(max), style: markStyle}}}
						onChange={onChange}
						step={defaultSliderStep}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					<InputNumber
						value={props.param.value}
						formatter={formatter}
						parser={parser}
						onChange={onChange}
						style={{ width: 175 }}
						disabled={props.disabled}
						step={defaultInputStep}
					/>
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
		} catch {
			return <></>;
		}
}


export function NothingControls() {
	return (
		<>
			<Divider>No parameters available</Divider>
			<p>No parameters are currently available for this category.</p>
		</>
	);
}