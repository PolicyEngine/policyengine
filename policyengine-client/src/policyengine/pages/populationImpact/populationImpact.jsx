import { Divider, Collapse, Radio, Empty } from "antd";
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
import { PolicyOverview } from "../policy/overview";

const { Panel } = Collapse;

function PopulationResultsCaveats() {
	return (
		<Collapse defaultActiveKey={["1"]} ghost>
			<Panel header={<><ExclamationCircleOutlined />  Disclaimer</>} key="1">
				<p>Results are calculated using the OpenFisca-UK tax-benefit microsimulation model, and assume no behavioural or macroeconomic effects. See the <a href="https://github.com/PSLmodels/openfisca-uk">repository</a> for more information.</p>
			</Panel>
		</Collapse>
	);
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
	const [showAbsDecile, setShowAbsDecile] = React.useState(false);
	return (
		<>
			<Divider>Population results</Divider>
			<PopulationResultsCaveats />
			<Row style={{padding: 30}}>
				<TakeAway><p style={{textAlign: "center"}}>Reform produces <br /><span style={{color: costColor}}>{cost}</span> net {isSurplus ? "surplus" : "cost"}</p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}>Poverty <br />{isPovRise ? "rises" : "falls"} <span style={{color: povColor}}>{pov}%</span></p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}><span style={{color: winnerColor}}>{winners}%</span> of people <br />come out ahead</p></TakeAway>
				<TakeAway><p style={{textAlign: "center"}}><span style={{color: loserColor}}>{losers}%</span> of people <br />come out behind</p></TakeAway>
			</Row>
			<Row>
				<Chart plot={results.waterfall_chart} md={12} />
			</Row>
			<Row>
				<Chart plot={results.poverty_chart} md={12} />
			</Row>
			<Row>
				{
					showAbsDecile ?
						<Chart plot={results.avg_decile_chart} md={12}/> :
						<Chart plot={results.rel_decile_chart} md={12}/>
				}
			</Row>
			<Row>
				<div className="justify-content-center d-flex">
				<Radio.Group defaultValue={true} buttonStyle="solid"  onChange={() => setShowAbsDecile(!showAbsDecile)} >
					<Radio.Button value={true}>Relative change</Radio.Button>
					<Radio.Button value={false}>Absolute change</Radio.Button>
				</Radio.Group>
				</div>
			</Row>
			<Row>
				<Chart plot={results.intra_decile_chart} md={12}/>
			</Row>
			<Row>
				<BreakdownTable policy={country.policy} api_url={country.apiURL} />
			</Row>
		</>
	);
}


export default class PopulationImpact extends React.Component {
    static contextType = CountryContext;
	constructor(props) {
		super(props);
		this.state = {waiting: false, error: false};
		this.simulate = this.simulate.bind(this);
	}

	componentDidMount() {
		if(this.context.populationImpactIsOutdated) {
			this.simulate();
		};
	}

	simulate() {
		const submission = this.context.getPolicyJSONPayload();
		let url = new URL(`${this.context.apiURL}/population-reform`);
		url.search = new URLSearchParams(submission).toString();
		this.setState({ waiting: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((data) => {
					this.context.setState({populationImpactResults: data, populationImpactIsOutdated: false}, () => {
						this.setState({ waiting: false, error: false });
					});
				}).catch(e => {
					this.setState({waiting: false, error: true});
				});
		});
	}

	render() {
		return (
			<Row>
				<Col xl={1} />
				<Col xl={8}>
					{
						(this.state.waiting || (!this.state.error & (this.context.populationImpactResults === null))) ?
							<Loading message={`Simulating your results on the ${this.context.properName} population (this usually takes about 10 seconds)`}/> :
							this.state.error ?
								<Loading noSpin message="Something went wrong (try navigating back and returning to this page)"/> :
								<PopulationResultsPane />
					}
				</Col>
				<Col xl={3}>
                    <PolicyOverview page="policy"/>
                    <Divider />
                    <Centered>
                        <NavigationButton
                            target="household" 
                            text={<><ArrowLeftOutlined /> Edit your policy</>}
                        />
                        <NavigationButton
                            primary 
                            target="household" 
                            text="Describe your household"
                        />
                    </Centered>
				</Col>
			</Row>
		);
	}
}
