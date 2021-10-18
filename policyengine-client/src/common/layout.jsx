import React from "react";
import { Container } from "react-bootstrap";

export function BodyWrapper(props) {
	return (
		<>
			<div className="d-none d-lg-block">
				<Container fluid>{props.children}</Container>
			</div>
			<div className="d-block d-lg-none">
				<Container style={{marginTop: 20}}>{props.children}</Container>
			</div>
		</>
	);
}

export function PolicyEngineWrapper(props) {
	return (
        <Container style={{padding: 0}} fluid>
            {props.children}
        </Container>
	);
}