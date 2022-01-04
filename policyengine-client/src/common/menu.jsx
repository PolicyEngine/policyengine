import { Menu as AntMenu } from "antd";
import React from "react";

const { SubMenu } = AntMenu;

export function Menu(props) {
	function addMenuEntry(parameter, parent) {
		let children = [];
		for(let child in parameter) {
			const name = parent + "/" + child;
			let logo;
			if(props.organisations && (child in props.organisations)) {
				logo = props.organisations[child].logo;
			} else {
				logo = null;
			}
			if(Array.isArray(parameter[child])) {
				children.push(<AntMenu.Item icon={logo} key={name}>{logo ? <div style={{paddingLeft: 10}}>{child}</div> : child}</AntMenu.Item>);
			} else {
				children.push(<SubMenu icon={logo} key={name} title={logo ? <div style={{paddingLeft: 10}}>{child}</div> : child}>{addMenuEntry(parameter[child], name)}</SubMenu>);
			}
		}
		return children;
	}
	return (
		<AntMenu
			onClick={(e) => {props.selectGroup(e.key);}}
			mode="inline"
			defaultOpenKeys={props.open}
			defaultSelectedKeys={props.selected}
		>
			{addMenuEntry(props.hierarchy, "")}
		</AntMenu>
	);
}