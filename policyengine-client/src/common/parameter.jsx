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
	if (parameter.unit === "/1") {
		return {
			formatter: value => `${Math.round(value * 1000) / 10}%`,
			parser: text => Math.round(+text.replace("%", "") * 10) / 1000,
			defaultMin: 0,
			defaultMax: 1,
			defaultInputStep: 0.001,
			defaultSliderStep: 0.01,
		}
	} else if (parameter.unit === "year") {
		return {
			formatter: value => value + " year" + (value !== 1 ? "s" : ""),
			parser: text => +text.replace(" year", "").replace(" years", ""),
		}
	}
	for(let currency in CURRENCY_SYMBOLS) {
		if(parameter.unit === currency) {
			return {
				formatter: value => `${CURRENCY_SYMBOLS[currency]}${Number(value).toLocaleString()}/${period}`,
				parser: text => +text.replace(CURRENCY_SYMBOLS[currency], "").replace(`/${period}`, ""),
				defaultMin: 0,
				defaultMax: Math.max(Math.pow(10, Math.ceil(Math.log10(parameter.defaultValue))), 100000),
				defaultInputStep: 1,
				defaultSliderStep: 1,
			}
		}
	}
	return {
		formatter: value => +value,
		parser: value => +value,
	}
}

export function Parameter(props) {
	try {
		let [focused, setFocused] = useState();
		let { formatter, defaultMin, defaultMax, defaultSliderStep } = getTranslators(props.param);
		if(focused) {
			formatter = x => x;
		}
		const onChange = value => props.updatePolicy(props.param.name, value);
		let component;
		if(props.param.value_type === "bool") {
			if(props.param.unit === "abolition") {
				component = (
					<Switch
						onChange={onChange}
						checked={props.param.value}
						className="switch-red"
						disabled={props.disabled}
					/>
				)
				} else {
				component = (
					<Switch
						onChange={onChange}
						checked={props.param.value}
						disabled={props.disabled}
					/>
				);
			}
		} else if(props.param.value_type === "Enum") {
			component = (
				<Select placeholder={props.param.defaultValue} disabled={props.disabled} onSelect={onChange}>
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
						step={defaultSliderStep}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					{
						focused ?
							<Input.Search enterButton="Enter" style={{maxWidth: 300}} placeholder={props.param.value} onSearch={value => {setFocused(false); onChange(value);}} /> :
							<div>{(!props.param.value && props.loading) ? <Spin indicator={antIcon} /> : formatter(props.param.value)} <EditOutlined style={{marginLeft: 5}} onClick={() => setFocused(true)} /></div>
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