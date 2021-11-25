import { Fragment, default as React } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import {
	InputNumber, Divider, Switch, Slider, Select, Alert, Input
} from "antd";

import "../style/policyengine.less";

const { Option } = Select;

export function getParser(parameter, currency) {
	if (parameter.type === "rate") {
		return (value) => Math.round(+value.replace("%", "") * 10) / 1000;
	} else if (parameter.type === "weekly") {
		return (value) => +value.replace(currency, "").replace("/week", "");
	} else if (parameter.type === "yearly") {
		return (value) => +value.replace(currency, "").replace("/year", "");
	} else if (parameter.type === "monthly") {
		return (value) => +value.replace(currency, "").replace("/month", "");
	} else if (parameter.type === "currency") {
		return (value) => +value.replace(currency, "");
	} else {
		return value => value;
	}
}

export function getFormatter(parameter, currency) {
	if (parameter.type === "rate") {
		return (value) => `${Math.round(value * 1000) / 10}%`;
	} else if (parameter.type === "weekly") {
		return (value) => `${currency}${value}/week`;
	} else if (parameter.type === "yearly") {
		return (value) => `${currency}${value}/year`;
	} else if (parameter.type === "monthly") {
		return (value) => `${currency}${value}/month`;
	} else if (parameter.type === "currency") {
		return (value) => `${currency}${value}`;
	} else {
		return value => value;
	}
}

export function Parameter(props) {
	try {
		if(props.param.hidden) {
			return <></>;
		}
		let formatter = getFormatter(props.param, props.currency);
		let parser = getParser(props.param, props.currency);
		let component;
		if(props.param.type === "bool") {
			component = (
				<Switch
					onChange={(value) => {
						props.setPolicy(props.name, +value);
					}}
					checked={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else if(props.param.type === "abolish") {
			component = (
				<Switch
					onChange={(value) => {
						props.setPolicy(props.name, +value);
					}}
					checked={props.param.value}
					className="switch-red"
					disabled={props.disabled}
				/>
			);
		} else if(props.param.type === "category") {
			component = (
				<Select placeholder={props.param.default} disabled={props.disabled} onSelect={(value) => {
					props.setPolicy(props.name, value);
				}}>
					{props.param.options.map(value => <Option key={value} value={value}>{value}</Option>)}
				</Select>
			);
		} else if(props.param.type === "str") {
			component = (
				<Input
					onPressEnter={(e) => {
						props.setPolicy(props.name, e.target.value);
					}}
					defaultValue={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else {
			component = (
				<>
					<Slider
						value={props.param.value}
						min={props.param.min ? props.param.min : 0}
						max={props.param.max ? props.param.max : 100}
						onChange={(value) => {
							props.setPolicy(props.name, value);
							console.log("set via slider")
						}}
						step={props.param.type === "rate" ? 0.01 : 1}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					<InputNumber
						value={props.param.value}
						formatter={formatter}
						parser={parser}
						precision={3}
						onChange={(value) => {
							props.setPolicy(props.name, value);
							console.log("set via input")
						}}
						style={{ width: 175 }}
						disabled={props.disabled}
						step={props.param.type === "rate" ? 0.001 : 1}
					/>
				</>
			);
		}
		return (
			<>
				<h6 style={{marginTop: 20}}>{props.param.title}</h6>
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