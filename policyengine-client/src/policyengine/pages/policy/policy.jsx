import React from "react"
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries/country"
import Menu from "./menu";


export default class Policy extends React.Component {
    static contextType = CountryContext;

    constructor(props, context) {
        super(props);
        this.state = {
            selected: context.defaultSelectedParameterGroup,
        }
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
                <Col xl={3}>

                </Col>
            </Row>
        </>;
    }
}