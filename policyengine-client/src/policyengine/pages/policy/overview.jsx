import { Steps, Divider, Empty, Button, message } from "antd";
import { LinkOutlined, TwitterOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import React, { useContext } from "react";
import { policyToURL } from "../../tools/url";
import { getTranslators } from "../../tools/translation";
import { CountryContext } from "../../../countries";

const { Step } = Steps;

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
	} else {
        return null;
    }
}

export function PolicyOverview(props) {
    const country = useContext(CountryContext);
	const plan = Object.values(country.policy).map(generateStepFromParameter);
	const isEmpty = plan.every(element => element === null);
	return (
		<>
			<Divider>Your policy</Divider>
			{!isEmpty ?
				<Steps progressDot direction="vertical">
					{plan}
				</Steps> :
				<Empty description="No plan provided" />
			}
			<SharePolicyLinks page={props.page}/>
		</>
	);
}

export function SharePolicyLinks(props) {
    const country = useContext(CountryContext);
	const url = policyToURL(`https://policyengine.org/${country.name}/${props.page}`, country.policy);
	return (
		<>
			<Divider>Share this policy<Button style={{marginRight: 20, border: 0}} onClick={() => {navigator.clipboard.writeText(url); message.info("Link copied!");}}><LinkOutlined /></Button><TwitterShareButton style={{marginRight: 20, border: 0}} title="I just simulated a reform to the UK tax and benefit system with @ThePolicyEngine. Check it out or make your own!" url={url}><TwitterOutlined /></TwitterShareButton></Divider>
		</>
	);
}