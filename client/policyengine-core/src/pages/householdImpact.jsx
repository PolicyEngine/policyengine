import { Divider, Collapse } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import { Fragment, default as React } from "react";
import { Overview } from "../common/overview";
import { LoadingResultsPane, Chart } from "../common/results";

const { Panel } = Collapse;

function HouseholdResultsCaveats() {
	return (
		<Collapse defaultActiveKey={["1"]} ghost>
			<Panel header={<><ExclamationCircleOutlined />  Disclaimer</>} key="1">
				<p>These results may not match exact benefit entitlement, due to other factors in your specific situation. To find out exactly which benefits and taxes are applicable, visit <a href="https://gov.uk/">gov.uk</a> or benefits calculators such as <a href="https://www.entitledto.co.uk/">entitledto.co.uk</a>.</p>
			</Panel>
		</Collapse>
	);
}


export function HouseholdResultsPane(props) {
	const netIncome = props.results["net_income"];
	const isGain = netIncome.new > netIncome.old;
	const isLoss = netIncome.new < netIncome.old;
	const formatNumber = num => "£" + num.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
	const difference = formatNumber(Math.abs(netIncome.new - netIncome.old));
	const percentageChange = Math.round(Math.abs((netIncome.new - netIncome.old) / netIncome.old) * 100) + "%";
	return (
		<>
            <Divider>Household results</Divider>
			<HouseholdResultsCaveats />
			<Divider />
			<Row>
				<Col>
					<div className="d-flex justify-content-center align-items-center">
						<p style={{fontSize: 30}}> Your annual net income would {isGain ? <span style={{color: "green"}}>rise</span>: !isLoss ? <span>not change</span> : <span style={{color: "darkred"}}>fall</span>}{(isGain || isLoss) ? ` by ${difference} (${percentageChange})`: ""}</p>
					</div>
				</Col>
			</Row>
			<Row>
				<Chart plot={props.results.waterfall_chart} />
			</Row>
			<Row>
				<Chart plot={props.results.budget_chart} />
			</Row>
			<Row>
				<Chart plot={props.results.mtr_chart} />
			</Row>
		</>
	);
}

export class HouseholdImpact extends React.Component {
	constructor(props) {
		super(props);
		this.state = {results: null, waiting: false};
	}

	componentDidMount() {
		this.simulate();
	}

	simulate() {
		let submission = {};
		let i = 1;
		for(let person in this.props.household.people) {
			for(let variableName in this.props.household.people[person]) {
				let variable = this.props.household.people[person][variableName];
				submission[variableName + "_" + (i)] = variable.value;
			}
			submission["family_" + i] = 1;
			i++;
		}
		i = 1;
		for(let family in this.props.household.families) {
			for(let variableName in this.props.household.families[family]) {
				let variable = this.props.household.families[family][variableName];
				submission[variableName + "_" + i] = variable.value;
			}
			i++;
		}
		for (const key in this.props.policy) {
			if(this.props.policy[key].value !== this.props.policy[key].default) {
				submission["policy_" + key] = this.props.policy[key].value;
			}
		}
		for(let variableName in this.props.household.household) {
			let variable = this.props.household.household[variableName];
			if(variable.default != variable.value) {
				submission[variableName + "_" + 1] = variable.value;
			}
		}
		let url = new URL(`https://${this.props.country || "uk"}.policyengine.org/api/situation-reform`);
		url = `${this.props.api_url}/api/situation-reform` || url;
		url.search = new URLSearchParams(submission).toString();
		this.setState({ waiting: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((json) => {
					this.setState({ results: json, waiting: false, error: false });
				}).catch(e => {
					this.setState({ waiting: false, error: true});
				});
		});
		return;
	}

	render() {
		return (
			<Row style={{paddingLeft: 50}}>

				<Col xl={9}>
					{
						(this.state.waiting || (!this.state.results && !this.state.error)) ?
							<div className="d-flex justify-content-center align-items-center" style={{minHeight: 400}}>
								<LoadingResultsPane message="Simulating the reform on your household (this usually takes about 10 seconds)"/>
							</div> :
							this.state.error ?
								<div className="d-flex justify-content-center align-items-center" style={{minHeight: 400}}>
									<LoadingResultsPane noSpin message="Something went wrong (try navigating back and returning to this page)"/>
								</div> :
								<HouseholdResultsPane results={this.state.results} />
					}
				</Col>
				<Col xl={3} style={{paddingLeft: 50}}>
					<Overview page="household-impact" policy={this.props.policy} setPage={this.props.setPage} household={this.props.household}/>
				</Col>
			</Row>
		);
	}
}