import { Fragment, default as React } from 'react'
import { Row, Col } from "react-bootstrap";
import { PageHeader, Tag, Divider, BackTop, Tabs } from "antd";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";
import { motion } from "framer-motion";

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

export function Title(props) {
	const tags = props.beta ? [<Tag key="beta" color="processing">BETA</Tag>] : null;
	const title = <><a href="/" style={{color: "white"}}>PolicyEngine<sub style={{fontSize: "50%"}}>{props.country}</sub></a></>;
	return (
		<>
			<div className="d-none d-md-block">
				<PageHeader
					title={title}
					style={{minHeight: 40}}
					tags={tags}
				/>
			</div>
			<div className="d-md-none">
				<div className="d-flex justify-content-center">
					<PageHeader
						title={title}
						style={{paddingBottom: 8}}
						tags={tags}
					/>
				</div>
			</div>
		</>
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
			{props.children}
		</Router>
	);
}

function MainNavigation(props) {
	let secondLevel = null;
	let topLevelSelected = props.selected;
	const upperTabStyle = {fontSize: 20};
	const lowerTabStyle = {fontSize: 15};
	const showTwoLevels = props.selected === "population-results" || props.selected === "household-results";
	if(showTwoLevels) {
		secondLevel = (
			<Row style={{height: 50}}>
				<Col md={6}>
				</Col>
				<Col md={4}>
					<Tabs defaultActiveKey={props.selected} className="main-tab">
						<TabPane tab={<Link style={lowerTabStyle} className="lower" to="/population-results">UK impact</Link>} key="population-results" />
						<TabPane tab={<Link style={lowerTabStyle} className="lower" to="/household-results">Household impact</Link>} key="household-results" />
					</Tabs>
				</Col>
				<Col md={4}>
				</Col>
			</Row>
		);
		topLevelSelected = "results";
	} else {
		secondLevel = null;
	}
	return (
		<>
			<Row style={{marginBottom: 0, height: 65}}>
				<Col md={4}>
					<Title country={props.country}/>
				</Col>
				<Col md={4} style={{paddingTop: 10}}>
					<Tabs defaultActiveKey={topLevelSelected} centered>
						<TabPane tab={<Link style={upperTabStyle} to="/">Policy</Link>} key="policy"/>
						<TabPane tab={<Link style={upperTabStyle} to="/household">Your household</Link>} key="household" />
						<TabPane tab={<Link style={upperTabStyle} to="/population-results">Results</Link>} key="results" />
					</Tabs>
				</Col>
				<Col md={4}>
				</Col>
			</Row>
			<motion.div animate={{height: showTwoLevels ? 50 : 0}} style={{backgroundColor: "#b4bdcc"}}>
				{secondLevel}
			</motion.div>
		</>
	);
}

export function Header(props) {
	return (
		<div style={{backgroundColor: "#00499c"}}>
			<Switch>
				<Route path="/" exact>
					<MainNavigation country={props.country} selected="policy" />
				</Route>
				<Route path="/population-results">
					<MainNavigation country={props.country} selected="population-results" />
				</Route>
				<Route path="/household">
					<MainNavigation country={props.country} selected="household" />
				</Route>
				<Route path="/household-results">
					<MainNavigation country={props.country} selected="household-results" />
				</Route>
				<Route path="/faq">
					<MainNavigation country={props.country} />
				</Route>
			</Switch>
		</div>
	);
}