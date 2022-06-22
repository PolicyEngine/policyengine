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
import HelpButton from "../../general/help";
function PopulationResultsCaveats() {
	return <p style={{ color: "grey" }}><ExclamationCircleOutlined />  &nbsp; &nbsp;PolicyEngine results assume no behavioural or macroeconomic effects</p>;
}

function USPopulationResultsCaveats() {
	return <p style={{ color: "grey", marginTop: 20 }}><ExclamationCircleOutlined />  &nbsp; &nbsp;Results are simulated using the OpenFisca-US microsimulation model on the Current Population Survey dataset. This dataset under-reports high incomes and benefit totals, so may over- or under-estimate impacts.</p>;
}

function Loading(props) {
	const country = useContext(CountryContext);
	const message = `Simulating your results on the ${country.properName} population (this usually takes about 10 seconds)`;
	return (
		<Centered><Empty description={message}>
			{!props.noSpin && <Spinner />}
		</Empty>
		</Centered>
	);
}


export function PopulationResultsPane(props) {
	const country = useContext(CountryContext);

	// process take-away figures
	const results = country.populationImpactResults;
	const isSurplus = results.net_cost[0] === "-";
	const cost = isSurplus ? results.net_cost.slice(1) : results.net_cost;
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
		url.search = new URLSearchParams(submission).toString();
		this.context.setState({ waitingOnPopulationImpact: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((data) => {
					this.context.setState({ populationImpactResults: data, populationImpactIsOutdated: false }, () => {
						this.setState({ error: false });
						this.context.setState({ waitingOnPopulationImpact: false });
					});
				}).catch(e => {
					this.setState({ error: true });
					this.context.setState({ waitingOnPopulationImpact: false });
				});
		});
	}

	render() {
		return <>
			<HelpButton />
			<Row>
				<Col xl={1} />
				<Col xl={8}>
					{
						(this.context.waitingOnPopulationImpact || (!this.state.error & (this.context.populationImpactResults === null))) ?
							<Loading message={`Simulating your results on the ${this.context.properName} population (this usually takes about 10 seconds)`} /> :
							this.state.error ?
								<Loading noSpin message="Something went wrong (try navigating back and returning to this page)" /> :
								<PopulationResultsPane />
					}
				</Col>
				<Col xl={3}>
					<OverviewHolder>
						<Affix offsetTop={55}>
							<PolicyOverview page="population-impact" />
						</Affix>
						<Affix offsetTop={450}>
							<SharePolicyLinks page="population-impact" />
							<div className="d-block align-middle">
								<div className="justify-content-center">
									{this.context.showPopulationImpact &&
										<NavigationButton
											target="policy"
											text={<><ArrowLeftOutlined /> Edit your policy</>}
										/>}
								</div>
								<div className="justify-content-center">
									{this.context.showHousehold && <NavigationButton
										target="household"
										text="Describe your household"
										primary={!this.context.showPopulationImpact}
									/>}
								</div>
							</div>
						</Affix>
					</OverviewHolder>
				</Col>
			</Row>
		</>;
	}
}
