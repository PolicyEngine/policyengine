import { Pagination, Steps, Divider, Empty, Button, message } from "antd";
import { LinkOutlined, TwitterOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import React, { useContext, useState } from "react";
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

export function OverviewHolder(props) {
	return (
		<>
			<div className="d-block d-lg-none">
				{props.children}
			</div>
			<div className="d-none d-lg-block">
				{props.children}
			</div>
		</>
	);
}

export function PolicyOverview() {
    const country = useContext(CountryContext);
	const plan = Object.values(country.policy).map(generateStepFromParameter).filter(step => step != null);
	const isEmpty = plan.length === 0;
	const [page, setPage] = useState(1);
	const pageSize = 4;
	return (
		<>
			<div style={{paddingTop: 20}}></div>
				{!isEmpty ?
					<>
						<Steps progressDot direction="vertical">
							{plan.slice((page - 1) * pageSize, page * pageSize)}
						</Steps> 
							{
								(plan.length > pageSize) && <Pagination 
									pageSize={pageSize} 
									defaultCurrent={page} 
									simple 
									onChange={setPage} 
									total={plan.length} 
								/>
							}
					</> :
					<Empty description="No plan provided" />
				}
		</>
	);
}

export function SharePolicyLinks(props) {
    const country = useContext(CountryContext);
	const url = policyToURL(`https://policyengine.org/${country.name}/${props.page}`, country.policy);
	return (
		<>
			<Divider><Button style={{marginRight: 20, border: 0}} onClick={() => {navigator.clipboard.writeText(url); message.info("Link copied!");}}><LinkOutlined /></Button><TwitterShareButton style={{marginRight: 20, border: 0}} title="I just simulated a reform to the UK tax and benefit system with @ThePolicyEngine. Check it out or make your own!" url={url}><TwitterOutlined /></TwitterShareButton></Divider>
		</>
	);
}