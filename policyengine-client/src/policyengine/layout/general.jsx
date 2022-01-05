/**
 * Components for general spacing/layout.
 */

import React from "react";
import { useContext } from "react";
import { Container } from "react-bootstrap";
import { Redirect } from "react-router";
import { CountryContext } from "../../countries/country";

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

export function NamedPolicyRedirects(props) {
    const country = useContext(CountryContext);
	return Object.keys(country.namedPolicies).map(name => (
		<Redirect from={`/${country.name}${name}`} to={`/${country.name}${props.page}?${country.namedPolicies[name]}`} />
	));
}