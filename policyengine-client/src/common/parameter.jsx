import { Fragment, default as React } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import {
	InputNumber, Divider, Switch, Slider, Select, Alert
} from "antd";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

const { Option } = Select;

export function getParser(parameter, currency) {
	if (parameter.type === "rate") {
		return (value) => Math.round(+value.replace("%", "") / 100, 2);
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
		return (value) => `${Math.round(value * 100, 2)}%`;
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
						props.setPolicy(props.name, value);
					}}
					checked={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else if(props.param.type === "abolish") {
			component = (
				<Switch
					onChange={(value) => {
						props.setPolicy(props.name, value);
					}}
					checked={props.param.value || props.param.default}
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
		} else {
			component = (
				<>
					<Slider
						value={props.param.value || props.param.default}
						min={props.param.min ? props.param.min : 0}
						max={props.param.max ? props.param.max : 1}
						onChange={(value) => {
							props.setPolicy(props.name, value);
						}}
						step={props.param.type === "rate" ? 0.01 : 1}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					<InputNumber
						value={props.param.value || props.param.default}
						formatter={formatter}
						parser={parser}
						onChange={(value) => {
							props.setPolicy(props.name, value);
						}}
						style={{ width: 175 }}
						disabled={props.disabled}
						step={props.param.type === "rate" ? 0.01 : 1}
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