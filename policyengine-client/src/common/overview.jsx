import { Steps, Divider, Empty, Button, message } from "antd";
import { Link } from "react-router-dom";
import { LinkOutlined, TwitterOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import { Fragment, default as React } from "react";
import { generateURLParams } from "./layout";

const { Step } = Steps;

export function SimulateButton(props) {
	const { policy } = props;
	const url = generateURLParams(props.target || "/", policy);
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
			? <Step key={key} status="finish" title={props.policy[key].title} description={props.policy[key].summary.replace("@", props.policy[key].value)} />
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
					text={<><ArrowLeftOutlined /> Change the policy reform</>}
					target="/" 
					policy={props.policy} 
					onClick={props.setPolicy}
				/>
				<SimulateButton 
					primary={props.page === "policy"}
					hidden={props.page === "population-impact"}
					disabled={props.invalid} 
					text={
						props.page === "policy" ?
							"Simulate on the population" :
							<><ArrowLeftOutlined /> Return to the population results</>
					}
					target="/population-impact" 
					policy={props.policy} 
					onClick={props.setPolicy}
				/>
				<SimulateButton 
					primary={props.page === "population-impact"} 
					hidden={props.page === "household"}
					disabled={props.invalid} 
					text={
						props.page === "household-impact" ?
							<><ArrowLeftOutlined /> Change your household</> :
							props.page === "policy" ?
								"Skip to your household" :
								"Describe your household"
					}
					target="/household" 
					policy={props.policy} 
					onClick={props.setPolicy} 
				/>
				<SimulateButton 
					primary={props.page === "household"} 
					hidden={props.page === "household-impact"}
					disabled={props.invalid || !props.household} 
					text="See your results" 
					target="/household-impact" 
					policy={props.policy} 
					onClick={props.setPolicy} 
				/>
			</Empty>
			<SharePolicyLinks policy={props.policy}/>
		</>
	);
}

export function SharePolicyLinks(props) {
	const url = generateURLParams("https://uk.policyengine.org/population-results", props.policy);
	return (
		<>
			<Divider>Share this reform<Button style={{marginRight: 20, border: 0}} onClick={() => {navigator.clipboard.writeText("https://uk.policyengine.org" + url); message.info("Link copied!");}}><LinkOutlined /></Button><TwitterShareButton style={{marginRight: 20, border: 0}} title="I just simulated a reform to the UK tax and benefit system with @ThePolicyEngine. Check it out or make your own!" url={url}><TwitterOutlined /></TwitterShareButton></Divider>
		</>
	);
}