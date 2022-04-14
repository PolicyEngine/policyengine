import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries"
import Menu from "./menu";
import { OverviewHolder, PolicyOverview, SharePolicyLinks } from "./overview";
import Parameter from "./parameter";
import NavigationButton from "../../general/navigationButton";
import { Affix } from "antd";
import HelpButton from "../../general/help";


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
        try {
            let node = this.context.parameterHierarchy;
            for(const item of this.state.selected.split("/").slice(1)) {
                node = node[item];
            }
            return node;
        } catch(e) {
            return [];
        }
	}

    render() {
        return <>
            <HelpButton />
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
                <Col xl={3}>
                    <OverviewHolder>
                        <Affix offsetTop={55}>
                            <PolicyOverview />
				        </Affix>
                        <Affix offsetTop={450}>
                            <SharePolicyLinks page="policy"/>
                            <div className="d-block align-middle">
                                <div className="justify-content-center">
                                    {this.context.showPopulationImpact && <NavigationButton 
                                        primary 
                                        target="population-impact" 
                                        text={`Calculate ${this.context.properName} impact`} 
                                    />}
                                </div>
                                <div className="justify-content-center">
                                    {this.context.showHousehold && <NavigationButton
                                        target="household" 
                                        text="Describe your household"
                                        primary={!this.context.showPopulationImpact}
                                    />}
                                </div>
                            </div>
                        </Affix>
                    </OverviewHolder>
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