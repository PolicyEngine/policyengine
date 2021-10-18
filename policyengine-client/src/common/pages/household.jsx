import React from "react";
import { Row, Col } from "react-bootstrap";
import { Overview } from "../overview";


export default class Household extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selected: this.props.selected, invalid: false};
	}

	render() {
		return (
			<Row>
				<Col xl={3}>
					Menu
				</Col>
				<Col xl={6}>
					Controls
				</Col>
				<Col xl={3}>
					<Overview page="household" policy={this.props.policy} setPage={this.props.setPage} household={!this.state.invalid ? this.props.household : null}/>
				</Col>
			</Row>
		);
	}
}