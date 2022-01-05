import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries/country"
import Menu from "./menu";


export default class PolicyPage extends React.Component {
    render() {
        return <>
            <Row>
                <Col xl={3}>
                    <Menu
                        selected={this.props.selected}
                        selectGroup={this.selectGroup}
                    />
                </Col>
            </Row>
        </>
    }
}