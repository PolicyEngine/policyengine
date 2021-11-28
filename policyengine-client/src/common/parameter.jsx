import { Fragment, default as React, useState } from "react";
import { CloseCircleFilled, LoadingOutlined, EditOutlined } from "@ant-design/icons";
import {
	Divider, Switch, Slider, Select, Alert, Input, Tag, Spin
} from "antd";

import "../common/policyengine.less";

const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>;

export function Spinner() {
	return <Spin indicator={antIcon}/>;
}

export function getTranslators(parameter) {
	const period = parameter.period || parameter.definitionPeriod;
	const CURRENCY_SYMBOLS = {
		"currency-GBP": "£",
		"currency-USD": "$",
	}
	let result;
	let minMax = 1;
	if (parameter.unit === "/1") {
		result = {
			formatter: value => `${Math.round(value * 1000) / 10}%`,
		}
	} else if (parameter.unit === "year") {
		result = {
			formatter: value => value + " year" + (value !== 1 ? "s" : ""),
		}
		minMax = 100;
	} else if (parameter.unit === "tonne C02") {
		result = {
			formatter: value => `${value} tonnes C02`,
		}
		minMax = 100;
	} else if (parameter.valueType === "bool") {
		result = {
			formatter: value => value ? "true" : "false",
		}
	}  else if (parameter.unit === "hour") {
		result = {
			formatter: value => `${value} hour${value !== 1 ? "s" : ""}`,
		}
		minMax = 80;
	} else if (Object.keys(CURRENCY_SYMBOLS).includes(parameter.unit)) {
		for(let currency in CURRENCY_SYMBOLS) {
			if(parameter.unit === currency) {
				result = {
					formatter: value => `${CURRENCY_SYMBOLS[currency]}${Math.round(Number(value)).toLocaleString()}${period ? ("/" + period) : ""}`,
				}
				minMax = {year: 100_000, month: 1000, week: 100, null: 100}[period];
			}
		}
	} else {
		result = {
			formatter: value => +value,
			parser: value => +value,
		}
	}
	return {
		formatter: result.formatter,
		min: 0,
		max: Math.max(parameter.max || minMax, Math.pow(10, Math.ceil(Math.log10(Math.max(parameter.defaultValue, parameter.value))))),
	}
}

export function Parameter(props) {
	try {
		let [focused, setFocused] = useState();
		let { formatter, min, max } = getTranslators(props.param);
		if(focused) {
			formatter = x => x;
		}
		const onChange = value => props.updatePolicy(props.param.name, value);
		let component;
		if(props.param.valueType === "bool") {
			if(props.param.unit === "abolition") {
				component = (
					<Switch
						onChange={value => onChange(+value)}
						checked={props.param.value}
						className="switch-red"
						disabled={props.disabled}
					/>
				)
			} else {
				component = (
					<Switch
						onChange={value => onChange(+value)}
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
		} else {
			let marks = {[max]: formatter(max)};
			if(min) {
				marks[min] = formatter(min);
			}
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
							<Input.Search enterButton="Enter" style={{maxWidth: 300}} placeholder={props.param.value} onSearch={value => {setFocused(false); onChange(value);}} /> :
							<div>{(props.isComputed && props.loading) ? <Spin indicator={antIcon} /> : formatter(props.param.value)} <EditOutlined style={{marginLeft: 5}} onClick={() => setFocused(true)} /></div>
					}
				</>
			);
		}
		const tag = props.isComputed ?
			props.loading ?
				<Tag style={{marginLeft: 10}} color="blue">COMPUTING</Tag> :
				props.error ?
					<Tag style={{marginLeft: 10}} color="red">ERROR</Tag> :
					<Tag style={{marginLeft: 10}} color="green">COMPUTED</Tag> :
			""
		return (
			<>
				<h6 style={{marginTop: 20}}>{props.param.label}{tag}</h6>
				{props.param.error ? <Alert type="error" message={props.param.error} style={{marginBottom: 10}} showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}/> : null}
				<p>{props.param.description}</p>
				{component}
				<div style={{paddingBottom: 20}} />
			</>
		);
		} catch(e) {
			return <>{e.toString() + JSON.stringify(props.param)}</>;
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