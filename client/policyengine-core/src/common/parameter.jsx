import { Menu } from "antd";
import { Fragment, default as React } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import {
	InputNumber, Divider, Switch, Slider, Select, Alert
} from "antd";

const { SubMenu } = Menu;

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

const { Option } = Select;

export function getParser(parameter) {
	if (parameter.type === "rate") {
		return (value) => Math.round(+value.replace("%", "") / 100, 2);
	} else if (parameter.type === "weekly") {
		return (value) => +value.replace("£", "").replace("/week", "");
	} else if (parameter.type === "yearly") {
		return (value) => +value.replace("£", "").replace("/year", "");
	} else if (parameter.type === "monthly") {
		return (value) => +value.replace("£", "").replace("/month", "");
	} else if (parameter.type === "gbp") {
		return (value) => +value.replace("£", "");
	} else {
		return value => value;
	}
}

export function getFormatter(parameter) {
	if (parameter.type === "rate") {
		return (value) => `${Math.round(value * 100, 2)}%`;
	} else if (parameter.type === "weekly") {
		return (value) => `£${value}/week`;
	} else if (parameter.type === "yearly") {
		return (value) => `£${value}/year`;
	} else if (parameter.type === "monthly") {
		return (value) => `£${value}/month`;
	} else if (parameter.type === "gbp") {
		return (value) => `£${value}`;
	} else {
		return value => value;
	}
}

export function Parameter(props) {
	try {
		let formatter = getFormatter(props.param);
		let parser = getParser(props.param);
		let component;
		if(props.param.type == "bool") {
			component = (
				<Switch
					onChange={(value) => {
						props.setPolicy(props.name, value);
					}}
					checked={props.param.value}
					disabled={props.disabled}
				/>
			);
		} else if(props.param.type == "abolish") {
			component = (
				<Switch
					onChange={(value) => {
						props.setPolicy(props.name, value);
					}}
					checked={props.param.value}
					className="switch-red"
					disabled={props.disabled}
				/>
			);
		} else if(props.param.type == "category") {
			component = (
				<Select placeholder={props.param.default} disabled={props.disabled}>
					{props.param.options.map(value => <Option key={value} value={value}>{value}</Option>)}
				</Select>
			);
		} else {
			component = (
				<>
					<Slider
						value={props.param.value}
						min={props.param.min ? props.param.min : 0}
						max={props.param.max ? props.param.max : 1}
						onChange={(value) => {
							props.setPolicy(props.name, value);
						}}
						step={props.param.type == "rate" ? 0.01 : 1}
						tooltipVisible={false}
						disabled={props.disabled}
					/>
					<InputNumber
						value={props.param.value}
						min={props.param.min ? props.param.min : 0}
						max={props.param.max ? props.param.max : 1}
						formatter={formatter}
						parser={parser}
						onChange={(value) => {
							props.setPolicy(props.name, value);
						}}
						style={{ width: 175 }}
						disabled={props.disabled}
						step={props.param.type == "rate" ? 0.01 : 1}
					/>
				</>
			);
		}
		return (
			<>
				<Divider orientation="left">{props.param.title}</Divider>
				{props.param.error ? <Alert type="error" message={props.param.error} style={{marginBottom: 10}} showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}/> : null}
				<p>{props.param.description}</p>
				{component}
			</>
		);
		} catch {
			return <></>;
		}
}


export function NothingControls(props) {
	return (
		<>
			<Divider>No parameters available</Divider>
			<p>No parameters are currently available for this category.</p>
		</>
	);
}

export function ParameterGroup(props) {
	return (
		<>
			{Object.keys(props.policy).map((name) => <Parameter key={name} name={name} param={props.policy[name]} setPolicy={props.setPolicy} rate />)}
		</>
	);
}