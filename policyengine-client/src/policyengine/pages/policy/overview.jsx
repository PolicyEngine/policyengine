import { Pagination, Steps, Divider, Empty, Button, message, Tooltip } from "antd";
import { CheckCircleOutlined, LinkOutlined, TwitterOutlined } from "@ant-design/icons";
import { TwitterShareButton } from "react-share";
import React, { useContext, useState } from "react";
import { policyToURL } from "../../tools/url";
import { getTranslators } from "../../tools/translation";
import { CountryContext } from "../../../countries";
import RadioButton from "../../general/radioButton";

const { Step } = Steps;

function generateStepFromParameter(parameter, editingReform, country, page) {
	const comparisonKey = editingReform ? "baselineValue" : "defaultValue";
	const targetKey = editingReform ? "value" : "baselineValue";
	let populationSimCheckbox = null;
	let hide = false;
	if(country.showPopulationImpact && country.notAllParametersPopulationSimulatable && ((page === "population-impact") | (page === "policy"))) {
		populationSimCheckbox = country.populationSimulatableParameters.includes(parameter.name) ?
			<Tooltip title="This parameter will affect the country-wide simulation" overlayInnerStyle={{padding: 20, paddingRight: 0}}><CheckCircleOutlined /></Tooltip> :
			null;
		if(country.populationSimulatableParameters.includes(parameter.name)) {
			hide = false;
		} else {
			hide = true;
		}
	}
	if((parameter[targetKey] !== parameter[comparisonKey]) && (!hide | (page !== "population-impact"))) {
		const formatter = getTranslators(parameter).formatter;
		const changeLabel = (!isNaN(parameter[targetKey]) && (typeof parameter[targetKey] !== "boolean")) ? 
			(parameter[targetKey] > parameter[comparisonKey] ? "Increase" : "Decrease") : 
			"Change";
		const description = `${changeLabel} from ${formatter(parameter[comparisonKey])} to ${formatter(parameter[targetKey])}`
		return <Step
			key={parameter.name}
			status="finish"
			title={<><>{parameter.label}</> <>{populationSimCheckbox}</></>}
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

export function PolicyOverview(props) {
    const country = useContext(CountryContext);
	const plan = Object.values(country.policy).map(step => generateStepFromParameter(step, country.editingReform, country, props.page)).filter(step => step != null);
	const isEmpty = plan.length === 0;
	const pageSize = 4;
	let [page, setPage] = useState(1);
	return (
		<>
		<RadioButton style={{marginTop: 15}} options={["Baseline", "Reform"]} selected={country.editingReform ? "Reform" : "Baseline"} onChange={option => {country.setState({editingReform: option === "Reform"})}} />
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
					<Empty description={
						country.editingReform ?
							"You haven't created a reform yet." :
							"Your reform will be compared against current policy."
					 } />
			}		</>
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