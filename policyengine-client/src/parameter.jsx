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

export function Parameter(props) {
	let formatter = null;
	let parser = null;
	if (props.param.type === "rate") {
		formatter = (value) => `${value}%`;
		parser = (value) => +value.replace("%", "");
	} else if (props.param.type === "weekly") {
		formatter = (value) => `£${value}/week`;
		parser = (value) => +value.replace("£", "").replace("/week", "");
	} else if (props.param.type === "yearly") {
		formatter = (value) => `£${value}/year`;
		parser = (value) => +value.replace("£", "").replace("/year", "");
	} else if (props.param.type === "monthly") {
		formatter = (value) => `£${value}/month`;
		parser = (value) => +value.replace("£", "").replace("/month", "");
	} else if (props.param.type === "gbp") {
		formatter = (value) => `£${value}`;
		parser = (value) => +value.replace("£", "");
	}
	let component;
	if(props.param.type == "bool") {
		component = (
			<Switch
				onChange={(value) => {
					props.onChange(props.name, value);
				}}
				checked={props.param.value}
				disabled={props.disabled}
			/>
		);
	} else if(props.param.type == "abolish") {
		component = (
			<Switch
				onChange={(value) => {
					props.onChange(props.name, value);
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
					min={props.param.min || 0}
					max={props.param.max || 100}
					onChange={(value) => {
						props.onChange(props.name, value);
					}}
					tooltipVisible={false}
					disabled={props.disabled}
				/>
				<InputNumber
					value={props.param.value}
					min={props.param.min ? props.min : null}
					max={props.param.max ? props.max : null}
					formatter={formatter}
					parser={parser}
					onChange={(value) => {
						props.onChange(props.name, value);
					}}
					style={{ width: 175 }}
					disabled={props.disabled}
				/>
			</>
		);
	}
	return (
		<>
			<Divider>{props.param.title}</Divider>
			{props.param.error ? <Alert type="error" message={props.param.error} style={{marginBottom: 10}} showIcon icon={<CloseCircleFilled style={{marginTop: 5}} color="red" />}/> : null}
			<p>{props.param.description}</p>
			{component}
		</>
	);
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
			{Object.keys(props.policy).map((name) => <Parameter key={name} name={name} param={props.policy[name]} onChange={props.onChange} rate />)}
		</>
	);
}