import { Steps, Divider, Empty, Button, message } from "antd";
import { Link } from "react-router-dom";
import { LinkOutlined, TwitterOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import { Fragment, default as React } from "react";
import { policyToURL } from "./url";
import { getFormatter } from "./parameter";

const { Step } = Steps;

export function SimulateButton(props) {
	const url = policyToURL(props.target, props.policy);
	if(props.hidden) {return <></>;}
	return (
		<div style={{marginBottom: 20}}>
			<Link to={url}><Button disabled={props.disabled} type={props.primary ? "primary" : null} onClick={props.onClick}>{props.text || "Simulate"}</Button></Link>
		</div>
	);
}

export function Overview(props) {
	let plan = Object.keys(props.policy).map((key, i) => (
		props.policy[key].value !== props.policy[key].default
			? <Step key={key} status="finish" title={props.policy[key].title} description={props.policy[key].summary.replace("@", getFormatter(props.policy[key], props.currency)(props.policy[key].value))} />
			: null
	));
	let isEmpty = plan.every(element => element === null);
	return (
		<>
			<Divider>Your plan</Divider>
			{!isEmpty ?
				<Steps progressDot direction="vertical">
					{plan}
				</Steps> :
				<Empty description="No plan provided" />
			}
			<Empty description="" image={null}>
				<SimulateButton 
					hidden={props.page === "policy"}
					text={<><ArrowLeftOutlined /> Edit your policy</>}
					target={props.baseURL + "/policy"}
					policy={props.policy} 
					onClick={() => {props.setPage("")}}
				/>
				<SimulateButton 
					primary={props.page === "policy"}
					hidden={props.page === "population-impact"}
					disabled={props.invalid} 
					text={
						props.page === "policy" ?
							"See the UK impact" :
							<><ArrowLeftOutlined /> Return to UK impact</>
					}
					target={props.baseURL + "/population-impact"}
					policy={props.policy} 
					onClick={() => {props.setPage("population-impact")}}
				/>
				<SimulateButton 
					primary={props.page === "population-impact"} 
					hidden={props.page === "household"}
					disabled={props.invalid} 
					text={
						props.page === "household-impact" ?
							<><ArrowLeftOutlined /> Edit your household</> :
							"Describe your household"
					}
					target={props.baseURL + "/household"}
					policy={props.policy} 
					onClick={() => {props.setPage("household")}}
				/>
				<SimulateButton 
					primary={props.page === "household"} 
					hidden={props.page === "household-impact"}
					disabled={props.invalid || !props.household} 
					text="See your household impact" 
					target={props.baseURL + "/household-impact"}
					policy={props.policy} 
					onClick={() => {props.setPage("household-impact")}}
				/>
			</Empty>
			<SharePolicyLinks baseURL={props.baseURL} policy={props.policy} page={props.page}/>
		</>
	);
}

export function SharePolicyLinks(props) {
	const url = policyToURL(`https://policyengine.org${props.baseURL}/${props.page}`, props.policy);
	return (
		<>
			<Divider>Share this policy<Button style={{marginRight: 20, border: 0}} onClick={() => {navigator.clipboard.writeText(url); message.info("Link copied!");}}><LinkOutlined /></Button><TwitterShareButton style={{marginRight: 20, border: 0}} title="I just simulated a reform to the UK tax and benefit system with @ThePolicyEngine. Check it out or make your own!" url={url}><TwitterOutlined /></TwitterShareButton></Divider>
		</>
	);
}