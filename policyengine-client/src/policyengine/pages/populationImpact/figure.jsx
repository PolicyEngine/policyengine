import { Col } from "react-bootstrap";
import React from "react";

export function TakeAway(props) {
	return <Col>
		<div style={{padding: 10}} className="d-flex justify-content-center align-items-center">
			<div style={{fontSize: 20, color: "gray"}}>{props.children}</div>
		</div>
	</Col>;
}
