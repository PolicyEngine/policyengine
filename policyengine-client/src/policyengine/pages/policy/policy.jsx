import React, { useContext, useState } from "react"
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries"
import Menu from "./menu";
import { OverviewHolder, PolicyOverview, SharePolicyLinks } from "./overview";
import Parameter from "./parameter";
import NavigationButton from "../../general/navigationButton";
import { Affix, Divider } from "antd";
import RadioButton from "../../general/radioButton";


export default class Policy extends React.Component {
    static contextType = CountryContext;

    constructor(props, context) {
        super(props);
        this.state = {
            selected: context.defaultSelectedParameterGroup,
            selectedMobilePage: "Menu",
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
        const menu = <Menu
            selected={this.state.selected}
            selectParameterGroup={group => this.setState({ selected: group, selectedMobilePage: "Edit" })}
        />;
        const parameterControls = <ParameterControlPane
            parameters={this.getParameters()}
        />;
        const overview = <OverviewHolder>
            <PolicyOverview page="policy"/>
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
        </OverviewHolder>
        const desktopView = <Row>
            <Col xl={3} style={{
                height: "calc(100vh - 100px)",
                overflowY: "scroll",
            }}>
                {menu}
            </Col>
            <Col xl={6} style={{
                height: "calc(100vh - 100px)",
                overflow: "scroll",
                paddingRight: 40,
            }}>
                {parameterControls}
            </Col>
            <Col xl={3}>
                {overview}
            </Col>
        </Row>
        const mobileView = <>
            <Row style={{maxHeight: 400, marginBottom: 10, overflowY: "scroll"}}>
                <Col>
                {
                    this.state.selectedMobilePage === "Menu" ?
                        menu :
                        this.state.selectedMobilePage === "Edit" ?
                            parameterControls :
                            overview
                }
                </Col>
                <Divider>Your policy</Divider>
            </Row>
        </>
        return <>
            <div className="d-none d-lg-block">
                {desktopView}
            </div>
            <div className="d-block d-lg-none">
                {mobileView}
            </div>
        </>
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