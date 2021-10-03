import { Fragment, default as React } from 'react'
import { Row, Col, Container } from "react-bootstrap";
import { PageHeader, Tag, Divider, BackTop, Tabs } from "antd";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

const { TabPane } = Tabs;

export function generateURLParams(page, policy) {
	let searchParams = new URLSearchParams(window.location.search);
	for (const key in policy) {
		if (policy[key].value !== policy[key].default) {
			searchParams.set(key, +policy[key].value);
		} else {
			searchParams.delete(key);
		}
	}
	const url = `${page || "/"}?${searchParams.toString()}`;
	return url;
}

export function getPolicyFromURL(defaultPolicy) {
	let plan = defaultPolicy;
	const { searchParams } = new URL(document.location);
	for (const key of searchParams.keys()) {
		plan[key].value = +searchParams.get(key);
	}
	return plan;
}

export function Title(props) {
	const tags = props.beta ? [<Tag key="beta" color="processing">BETA</Tag>] : null;
	const title = <><a href="/" style={{color: "white"}}>PolicyEngine<sub style={{fontSize: "50%"}}>{props.country}</sub></a></>;
	return (
		<div style={{minWidth: 200}}>
			<div className="d-none d-lg-block">
				<PageHeader
					title={title}
					style={{minHeight: 40}}
					tags={tags}
				/>
			</div>
			<div className="d-lg-none">
				<div className="d-flex justify-content-center">
					<PageHeader
						title={title}
						style={{paddingBottom: 8}}
						tags={tags}
					/>
				</div>
			</div>
		</div>
	);
}

export function Footer() {
	return (
		<>
			<BackTop />
			<Divider style={{marginTop: 50}} />
			<div className="d-none d-lg-block">
				<div className="d-flex justify-content-center">
					<p style={{textAlign: "center"}}><a href="https://policyengine.org">PolicyEngine © 2021</a> | <a href="/faq">FAQ</a> | <a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq">Share your feedback</a> | <a href="https://opencollective.com/psl">Donate</a></p>
				</div>
			</div>
			<div className="d-block d-lg-none">
				<p style={{textAlign: "center"}}><a href="https://policyengine.org">PolicyEngine © 2021</a> | <a href="/faq">FAQ</a></p>
				<p style={{textAlign: "center"}}><a href="https://zej8fnylwn9.typeform.com/to/XFFu15Xq">Share your feedback</a> | <a href="https://opencollective.com/psl">Donate</a></p>
			</div>
		</>
	)
}

export function PolicyEngine(props) {
	return (
		<Router>
			<Container style={{padding: 0}} fluid>
				{props.children}
			</Container>
		</Router>
	);
}

function MainNavigation(props) {
	const tabStyle = {fontSize: 15};
	return (
		<>
			<Row style={{margin: 0}}>
				<Col lg={2}>
					<Title country={props.country}/>
				</Col>
				<Col lg={8} style={{paddingLeft: 25, paddingRight: 25, paddingTop: 10}}>
					<Tabs defaultActiveKey={props.selected} centered>
						<TabPane tab={<Link style={tabStyle} to="/">Policy</Link>} key="policy"/>
						<TabPane tab={<Link style={tabStyle} to="/population-impact">UK impact</Link>} key="population-impact" />
						<TabPane tab={<Link style={tabStyle} to="/household">Your household</Link>} key="household" />
						<TabPane tab={<Link style={tabStyle} to="/household-impact">Household impact</Link>} key="household-impact" />
					</Tabs>
				</Col>
				<Col lg={2}>
				</Col>
			</Row>
		</>
	);
}

export function Header(props) {
	return (
		<div style={{backgroundColor: "#002766"}}>
			<Switch>
				<Route path="/" exact>
					<MainNavigation country={props.country} selected="policy" />
				</Route>
				<Route path="/population-impact">
					<MainNavigation country={props.country} selected="population-impact" />
				</Route>
				<Route path="/household">
					<MainNavigation country={props.country} selected="household" />
				</Route>
				<Route path="/household-impact">
					<MainNavigation country={props.country} selected="household-impact" />
				</Route>
				<Route path="/faq">
					<MainNavigation country={props.country} />
				</Route>
			</Switch>
		</div>
	);
}
