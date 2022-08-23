/*
 * The parameter menu component.
*/

import { Divider, Menu as AntMenu } from "antd";
import React from "react";
import { useContext } from "react";
import { CountryContext } from "../../../countries";

const { SubMenu } = AntMenu;

export default function Menu(props) {
    const country = useContext(CountryContext);
	function addMenuEntry(variableGroup, parent) {
        // This function is needed because the menu entries need
        // to be direct descendents of the menu component.
		let children = [];
		for(let child in variableGroup) {
			const name = parent + "/" + child;
			if(Array.isArray(variableGroup[child])) {
				children.push(<AntMenu.Item key={name}>{child}</AntMenu.Item>);
			} else {
				children.push(<SubMenu key={name} title={child}>{addMenuEntry(variableGroup[child], name)}</SubMenu>);
			}
		}
		return children;
	}
	return (
		<AntMenu
			onClick={(e) => {props.selectVariableGroup(e.key);}}
			mode="inline"
			defaultOpenKeys={country.defaultOpenVariableGroups}
			defaultSelectedKeys={[country.defaultSelectedVariableGroup]}
			style={{fontSize: 18}}
		>
			{addMenuEntry(country.inputVariableHierarchy, "")}
		</AntMenu>
	)
}