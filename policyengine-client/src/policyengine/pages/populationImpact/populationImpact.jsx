import { Divider, Radio, Empty, Affix } from "antd";
import { ArrowLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "react-bootstrap";
import React from "react";
import { TakeAway } from "./figure";
import { Chart } from "./chart";
import { BreakdownTable } from "./breakdown";
import { CountryContext } from "../../../countries";
import Centered from "../../general/centered";
import Spinner from "../../general/spinner";
import { useContext } from "react";
import NavigationButton from "../../general/navigationButton";
import { OverviewHolder, PolicyOverview, SharePolicyLinks } from "../policy/overview";
import AgeChart from "./ageChart";
import CliffChart from "./cliffChart";
function PopulationResultsCaveats() {
	return <p style={{ color: "grey" }}><ExclamationCircleOutlined />  &nbsp; &nbsp;PolicyEngine results assume no behavioural or macroeconomic effects</p>;
}

function USPopulationResultsCaveats() {
	return <p style={{ color: "grey", marginTop: 20 }}><ExclamationCircleOutlined />  &nbsp; &nbsp;Results are simulated using the OpenFisca-US microsimulation model on the Current Population Survey dataset. This dataset under-reports high incomes and benefit totals, so may over- or under-estimate impacts.</p>;
}

function Loading(props) {
	const country = useContext(CountryContext);
	return (
		<Centered><Empty description={props.message}>
			{props.children}
			{!props.noSpin && <Spinner />}
		</Empty>
		</Centered>
	);
}


export function PopulationResultsPane(props) {
	const country = useContext(CountryContext);

	// process take-away figures
	const results = country.populationImpactResults;
	const isSurplus = results.budgetary_impact_str[0] === "-";
	const cost = isSurplus ? results.budgetary_impact_str.slice(1) : results.budgetary_impact_str;
	const costColor = isSurplus ? "green" : "darkred";
	const isPovRise = +results.poverty_change > 0;
	const isPovFall = +results.poverty_change < 0;
	let pov = Math.round(Math.abs(results.poverty_change) * 100);
	const povColor = isPovRise ? "darkred" : (isPovFall ? "green" : "grey");
	const winners = Math.round(+results.winner_share * 100);
	const winnerColor = winners > 0 ? "green" : (winners === 0 ? "grey" : "darkred");
	const losers = Math.round(+results.loser_share * 100);
	const loserColor = losers > 0 ? "darkred" : (losers === 0 ? "grey" : "green");
	const [decileChartIsAbsolute, setDecileChartIsAbsolute] = React.useState(false);
	const [decileChartIsWealth, setDecileChartIsWealth] = React.useState(false);
	const [intraDecileChartIsWealth, setIntraDecileChartIsWealth] = React.useState(false);
	const [showDeepPoverty, setShowDeepPoverty] = React.useState(false);
	return (
		<>
			{
				country.name === "us" ?
					<USPopulationResultsCaveats /> :
					null
			}
			<Row style={{ padding: 30 }}>
				<TakeAway><p style={{ textAlign: "center" }}>Reform produces <br /><span style={{ color: costColor }}>{cost}</span> net {isSurplus ? "surplus" : "cost"}</p></TakeAway>
				<TakeAway><p style={{ textAlign: "center" }}>Poverty <br />{isPovRise ? "rises" : "falls"} <span style={{ color: povColor }}>{pov}%</span></p></TakeAway>
				<TakeAway><p style={{ textAlign: "center" }}><span style={{ color: winnerColor }}>{winners}%</span> of people <br />come out ahead</p></TakeAway>
				<TakeAway><p style={{ textAlign: "center" }}><span style={{ color: loserColor }}>{losers}%</span> of people <br />come out behind</p></TakeAway>
			</Row>
			<Row>
				<Chart plot={results.waterfall_chart} md={12} />
			</Row>
			<Row>
				{
					showDeepPoverty ?
						<Chart plot={results.deep_poverty_chart} md={12} /> :
						<Chart plot={results.poverty_chart} md={12} />
				}
			</Row>
			<Row>
				<div className="justify-content-center d-flex">
					<Radio.Group defaultValue={true} buttonStyle="solid" onChange={() => setShowDeepPoverty(!showDeepPoverty)} >
						<Radio.Button value={true}>Poverty</Radio.Button>
						<Radio.Button value={false}>Deep poverty</Radio.Button>
					</Radio.Group>
				</div>
			</Row>
			<Row>
				<Chart plot={results[
					decileChartIsAbsolute ?
						decileChartIsWealth ?
							"avg_wealth_decile_chart" :
							"avg_income_decile_chart" :
						decileChartIsWealth ?
							"rel_wealth_decile_chart" :
							"rel_income_decile_chart"
				]} md={12} />
			</Row>
			<Row>
				<div className="justify-content-center d-flex">
					<Radio.Group defaultValue={false} buttonStyle="solid" onChange={x => setDecileChartIsAbsolute(x.target.value)} >
						<Radio.Button value={false}>Relative</Radio.Button>
						<Radio.Button value={true}>Absolute</Radio.Button>
					</Radio.Group>
					{
						country.showWealth &&
						(
							<Radio.Group style={{ marginLeft: 10 }} defaultValue={false} buttonStyle="solid" onChange={x => setDecileChartIsWealth(x.target.value)} >
								<Radio.Button value={false}>Income</Radio.Button>
								<Radio.Button value={true}>Wealth</Radio.Button>
							</Radio.Group>
						)
					}
				</div>
			</Row>
			<Row>
				<Chart plot={results[
					intraDecileChartIsWealth ?
						"intra_wealth_decile_chart" :
						"intra_income_decile_chart"
				]} md={12} />
			</Row>
			{
				country.showWealth &&
				(
					<Row>
						<div className="justify-content-center d-flex">
							<Radio.Group defaultValue={false} buttonStyle="solid" onChange={x => setIntraDecileChartIsWealth(x.target.value)} >
								<Radio.Button value={false}>Income decile</Radio.Button>
								<Radio.Button value={true}>Wealth decile</Radio.Button>
							</Radio.Group>
						</div>
					</Row>
				)
			}
			<Row>
				<Chart plot={results.inequality_chart} md={12} />
			</Row>
			<Row>
				<BreakdownTable policy={country.policy} api_url={country.apiURL} />
			</Row>
			<Row>
				<AgeChart policy={country.policy} api_url={country.apiURL} />
			</Row>
			<Row>
				<CliffChart policy={country.policy} api_url={country.apiURL} />
			</Row>
			<Divider />
			<PopulationResultsCaveats />
		</>
	);
}


export default class PopulationImpact extends React.Component {
	static contextType = CountryContext;
	constructor(props) {
		super(props);
		this.state = { error: false };
		this.simulate = this.simulate.bind(this);
	}

	componentDidMount() {
		if (this.context.populationImpactIsOutdated && !this.context.waitingOnPopulationImpact) {
			this.simulate();
		};
	}

	simulate() {
		const submission = this.context.getPolicyJSONPayload();
		let url = new URL(`${this.context.apiURL}/population-reform`);
		const requestOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify(submission)
		};
		const editsBaseline = Object.keys(submission).some(key => key.includes("baseline_"));
		const eta = this.context["endpoint-runtimes"][editsBaseline ? "population_impact_reform_and_baseline" : "population_impact_reform_only"];
		this.context.setState({ waitingOnPopulationImpact: true }, () => {
			fetch(url, requestOptions)
				.then(res => res.json()).then(data => {
					// Got a receipt of submission.
					if (data.status === "completed") {
						this.context.setState({ populationImpactResults: data, populationImpactIsOutdated: false }, () => {
							this.setState({ error: false });
							this.context.setState({ waitingOnPopulationImpact: false });
						});
					} else {
						let checker = setInterval(() => {
							fetch(url, requestOptions).then(res => res.json()).then(data => {
								if (data.status === "completed") {
									clearInterval(checker);
									if (data.error) {
										throw new Error(data.error);
									}
									this.context.setState({ populationImpactResults: data, populationImpactIsOutdated: false }, () => {
										this.setState({ error: false });
										this.context.setState({ waitingOnPopulationImpact: false });
									});
								}
							}).catch(e => {
								this.setState({ error: true });
								this.context.setState({ waitingOnPopulationImpact: false });
							});
						}, 1000 * eta * 0.2);
					}
				});
		});
	}

	render() {
		const editsBaseline = Object.keys(this.context.getPolicyJSONPayload()).some(key => key.includes("baseline_"));
		let eta;
		try {
			eta = this.context["endpoint-runtimes"][editsBaseline ? "population_impact_reform_and_baseline" : "population_impact_reform_only"];
		} catch {
			eta = 10;
		}
		const overview = (
			<OverviewHolder>
				<PolicyOverview page="policy" />
				<SharePolicyLinks page="policy" />
				<div className="d-block align-middle">
					<div className="justify-content-center">
						{this.context.showPopulationImpact && (
							<NavigationButton
								primary
								target="population-impact"
								text={`Compute population impact`}
							/>
						)}
					</div>
					<div className="justify-content-center">
						{this.context.showHousehold && (
							<NavigationButton
								target="household"
								text="Compute household impact"
								primary={!this.context.showPopulationImpact}
							/>
						)}
					</div>
				</div>
			</OverviewHolder>
		);
		const desktopView = (
			<Row>
				<Col xl={1} />
				<Col xl={8} style={{
					height: "calc(100vh - 60px)",
					overflow: "scroll",
					paddingRight: 40,
					paddingLeft: 40,
				}}>
					{
						(this.context.waitingOnPopulationImpact || (!this.state.error & (this.context.populationImpactResults === null))) ?
							<Loading message={`Simulating your results on the ${this.context.properName} population (this usually takes about ${Math.round(eta / 15) * 15} seconds)`} /> :
							this.state.error ?
								<Loading noSpin message="Something went wrong (try navigating back and returning to this page)" /> :
								<PopulationResultsPane />
					}
				</Col>
				<Col xl={3} style={{
					position: "relative",
					top: -2,
					padding: 0,
				}}>
					{overview}
				</Col>
			</Row>
		);
		const mobileView = (
			<div style={{ paddingLeft: 15, paddingRight: 15 }}>
				<div style={{ position: "fixed", top: 120, height: "60vh", overflowY: "scroll" }}>
					<Row>
						<Col>
							{
								(this.context.waitingOnPopulationImpact || (!this.state.error & (this.context.populationImpactResults === null))) ?
									<Loading message={`Simulating your results on the ${this.context.properName} population (this usually takes about ${Math.round(eta / 15) * 15} seconds)`} /> :
									this.state.error ?
										<Loading noSpin message="Something went wrong (try navigating back and returning to this page)" /> :
										<PopulationResultsPane />
							}
						</Col>
					</Row>
				</div>
				<div
					style={{
						position: "fixed",
						top: "calc(60vh + 120px)",
						left: 0,
						width: "100%",
						padding: 10,
					}}
				>
					<Row>
						<Col>
							<SharePolicyLinks page="population-impact" />
							<div className="d-block align-middle">
								<div className="justify-content-center">
									<NavigationButton
										target="policy"
										text={<><ArrowLeftOutlined /> Edit your policy</>}
									/>
								</div>
								<div className="justify-content-center">
									<NavigationButton
										target="household"
										text="Compute household impact"
										primary={!this.context.showPopulationImpact}
									/>
								</div>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
		return (
			<>
				<div className="d-none d-lg-block">{desktopView}</div>
				<div className="d-block d-lg-none">{mobileView}</div>
			</>
		);
	}
}
