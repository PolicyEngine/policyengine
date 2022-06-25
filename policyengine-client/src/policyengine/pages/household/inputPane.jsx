import React, { useContext } from "react";
import { CountryContext } from "../../../countries";
import Variable, { Spacing } from "./variable";
import { Radio, Select } from "antd";


function HouseholdSetup(props) {
    const country = useContext(CountryContext);
	return <>
		<Spacing />
		<h5>Marital status</h5>
		<Spacing />
		<Radio.Group defaultValue={country.getHouseholdMaritalStatus()} onChange={e => country.setHouseholdMaritalStatus(e.target.value)}>
			{country.householdMaritalOptions.map(i => <Radio.Button key={i} value={i}>{i}</Radio.Button>)}
		</Radio.Group>
		<Spacing />
		<h5>{
            country.name === "us" ?
                "Dependents" :
                "Children"
            }</h5>
		<Spacing />
		<Radio.Group defaultValue={country.getNumChildren()} onChange={e => country.setNumChildren(e.target.value)}>
			{[...Array(6).keys()].map(i => <Radio.Button key={i} value={i}>{i}</Radio.Button>)}
		</Radio.Group>
	</>
}

const { Option } = Select;

export class VariableControlPane extends React.Component {
    static contextType = CountryContext;

    constructor(props) {
        super(props);
        this.state = {selectedGroup: null, selectedName: null};
    }

    render() {
        if((this.props.variables.length > 0) && this.props.variables.includes("setup")) {
			// Show variables controlling the structure of the household
			return <HouseholdSetup />
		}
        if(this.props.variables.length === 0) {
            return <></>
        }
        const entity = this.context.entities[this.context.variables[this.props.variables[0]].entity];
        const instances = Object.keys(this.context.situation[entity.plural]);
        let selectedName;
        if(this.props.selected !== this.state.selectedGroup) {
            this.setState({selectedGroup: this.props.selected, selectedName: instances[0]});
            selectedName = instances[0];
        } else {
            selectedName = this.state.selectedName;
        }
        let entitySelector = null;
        if(instances.length > 1) {
            entitySelector = <>
                <Spacing />
                <Select 
                    defaultValue={selectedName}
                    style={{ width: 200, float: "right" }}
                    onChange={e => this.setState({selectedName: e})}>
                        {instances.map(name => <Option key={name} value={name}>{name}</Option>)}
                </Select>
            </>;
        }
        const controls = this.props.variables.map(variable => <Variable entityName={selectedName} key={variable} name={variable} />);
        return <>
			{entitySelector}
			{controls}
        </>;
    }
}