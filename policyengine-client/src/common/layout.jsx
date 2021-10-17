import React from "react";
import { Container } from "react-bootstrap";

export function PolicyEngineWrapper(props) {
	return (
        <Container style={{padding: 0}} fluid>
            {props.children}
        </Container>
	);
}