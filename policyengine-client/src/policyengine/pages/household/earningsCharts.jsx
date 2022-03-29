import { Row, Radio } from "antd";
import React from "react";
import { CountryContext } from "../../../countries";
import Centered from "../../general/centered";
import Spinner from "../../general/spinner";
import { Chart } from "../populationImpact/chart";
import { Spacing } from "../../layout/general";


export default class AccountingTable extends React.Component {
    static contextType = CountryContext;
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            show_difference: false,
        }
        this.updateCharts = this.updateCharts.bind(this);
    }

    updateCharts() {
        this.context.setState({ waitingOnEarningsCharts: true, }, () => {
            const submission = this.context.getPolicyJSONPayload();
            let url = new URL(this.context.apiURL + "/household-variation");
            url.search = new URLSearchParams(submission).toString();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "household": this.context.situation })
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw res;
                }
            }).then((data) => {
                this.context.setState({ computedSituationVariationCharts: data, situationVariationImpactIsOutdated: false, waitingOnEarningsCharts: false }, () => {
                    this.setState({ error: false });
                });
            }).catch(e => {
                this.context.setState({ waitingOnEarningsCharts: false });
                this.setState({ error: true, });
            });
        });
    }

    componentDidMount() {
        if (this.context.situationVariationImpactIsOutdated) {
            this.updateCharts();
        }
    }

    render() {
        // Update situations where necessary (re-using where not)
        // If the policy changes, we need to update only the reform 
        // situation. If the situation changes, we need to update both.
        if (!this.context.computedSituationVariationCharts || this.context.waitingOnEarningsCharts) {
            const message = "Calculating tax-benefit responses to your income...";
            return <Centered><Spinner rightSpacing={10} />{message}</Centered>
        } else if (this.state.error) {
            return <Centered>Something went wrong.</Centered>
        }
        const reformExists = Object.keys(this.context.getPolicyJSONPayload()).length > 0;
        if (reformExists) {
            return (
                <>
                    <Spacing />
                    <div className="justify-content-center d-flex" style={{marginBottom: 10}}>
                        <Radio.Group defaultValue={true} buttonStyle="solid" onChange={() => this.setState({ show_difference: !this.state.show_difference })} >
                            <Radio.Button value={true}>Baseline and reform</Radio.Button>
                            <Radio.Button value={false}>Difference</Radio.Button>
                        </Radio.Group>
                    </div>
                    <Row>
                        <Chart plot={this.state.show_difference ? this.context.computedSituationVariationCharts.budget_difference_chart : this.context.computedSituationVariationCharts.budget_chart} />
                    </Row>
                    <Row>
                        <Chart plot={this.state.show_difference ? this.context.computedSituationVariationCharts.mtr_difference_chart : this.context.computedSituationVariationCharts.mtr_chart} />
                    </Row>
                </>
            );
        }
        else {
            return (
                <>
                    <Spacing />
                    <Row>
                        <Chart plot={this.context.computedSituationVariationCharts.budget_chart} />
                    </Row>
                    <Row>
                        <Chart plot={this.context.computedSituationVariationCharts.mtr_chart} />
                    </Row>
                </>
            );
        }
    }
}