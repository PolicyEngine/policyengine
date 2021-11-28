import { Steps, Divider, Empty, Button, message } from "antd";
import { Link } from "react-router-dom";
import { LinkOutlined, TwitterOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import { Fragment, default as React } from "react";
import { policyToURL } from "./url";
import { getTranslators, Spinner } from "./parameter";

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

function generateStepFromParameter(parameter) {
	if(parameter.value !== parameter.defaultValue) {
		const formatter = getTranslators(parameter).formatter;
		const changeLabel = (!isNaN(parameter.value) && (typeof parameter.value !== "boolean")) ? 
			(parameter.value > parameter.defaultValue ? "Increase" : "Decrease") : 
			"Change";
		const description = `${changeLabel} from ${formatter(parameter.defaultValue)} to ${formatter(parameter.value)}`
		return <Step
			key={parameter.name}
			status="finish"
			title={parameter.label}
			description={description}
		/>
	}
}

export function Overview(props) {
	let plan = Object.values(props.policy).map(generateStepFromParameter);
	let isEmpty = plan.every(element => element === null);
	const householdDetails = (props.page === "household" || props.page === "household-impact");
	let numPeople = 0;
	let household_net_income = 0;
	let household_market_income = 0;
	if(householdDetails) {
		let household = props.situation.households["Your household"];
		numPeople = household["household_num_people"]["2021"];
		household_market_income = getTranslators(props.variables["household_market_income"]).formatter(household["household_market_income"]["2021"]);
		household_net_income = getTranslators(props.variables["household_net_income"]).formatter(household["household_net_income"]["2021"]);
	}
	return (
		<>
			<Divider>Your policy</Divider>
			{!isEmpty ?
				<Steps progressDot direction="vertical">
					{plan}
				</Steps> :
				<Empty description="No plan provided" />
			}
			{
				householdDetails && (
					<>
						<Divider>Your household</Divider>
						<Steps progressDot direction="vertical">
							<Step status="finish" title={<>{(props.loading ? <Spinner /> : numPeople)}{(numPeople === 1 ? " person" : " people")}</>} />
							<Step status="finish" title={<>{(props.loading ? <Spinner /> : household_market_income)}{" market income"}</>} />
							<Step status="finish" title={<>{(props.loading ? <Spinner /> : household_net_income)}{" net income"}</>} />
						</Steps>
					</>
				)
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
					disabled={props.invalid || !props.situation} 
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