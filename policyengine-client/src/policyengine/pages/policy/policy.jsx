import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries"
import Menu from "./menu";
import Parameter from "./parameter";


export default class Policy extends React.Component {
    static contextType = CountryContext;

    constructor(props, context) {
        super(props);
        this.state = {
            selected: context.defaultSelectedParameterGroup,
        }
        this.getParameters = this.getParameters.bind(this);
    }

	getParameters() {
		let node = this.context.parameterHierarchy;
		for(const item of this.state.selected.split("/").slice(1)) {
			node = node[item];
		}
		return node;
	}

    render() {
        return <>
            <Row>
                <Col xl={3}>
                    <Menu
                        selected={this.state.selected}
                        selectParameterGroup={group => this.setState({ selected: group })}
                    />
                </Col>
                <Col xl={6}>
                    <ParameterControlPane
                        parameters={this.getParameters()}
                    />
                </Col>
            </Row>
        </>;
    }
}

function ParameterControlPane(props) {
    const country = useContext(CountryContext);
    let parameterControls = [];
    for(let parameter of props.parameters) {
        if(parameter in (country.parameterComponentOverrides || {})) {
            parameterControls.push(React.cloneElement(
                country.parameterComponentOverrides[parameter], 
                {
                    key: parameter,
                    name: parameter
                }
            ));
        } else {
            parameterControls.push(<Parameter 
                key={parameter}
                name={parameter}
            />)
        }
    }
    return parameterControls;
}