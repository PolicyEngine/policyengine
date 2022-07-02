/**
 * Components for general spacing/layout.
 */

import React from "react";
import { useContext } from "react";
import { Container } from "react-bootstrap";
import { Redirect } from "react-router";
import { CountryContext } from "../../countries";

export function BodyWrapper(props) {
	return (
		<>
			<div className="d-none d-lg-block">
				<Container fluid style={{height: "calc(80vh - 25px)", overflow: props.scroll && "scroll", position: "fixed", top: 60}}>{props.children}</Container>
			</div>
			<div className="d-block d-lg-none">
				<Container style={{maxHeight: "calc(100vh - 100px)", position: "fixed", overflow: props.scroll && "scroll", top: 95}}>{props.children}</Container>
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

export function NamedPolicyRedirects(props) {
    const country = useContext(CountryContext);
	return Object.keys(country.namedPolicies).map(name => (
		<Redirect from={`/${country.name}${name}`} to={`/${country.name}${props.page}?${country.namedPolicies[name]}`} />
	));
}

export function Spacing() {
	return <div style={{paddingTop: 15}}/>;
}