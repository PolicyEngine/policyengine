import React from 'react';
import { Collapse, Alert, Table, Tooltip, Radio } from 'antd';
import { Chart } from "./chart";
import prettyMilliseconds from "pretty-ms";
import { Row } from "react-bootstrap";
import { CountryContext } from '../../../countries';
import Spinner from '../../general/spinner';

const { Panel } = Collapse;

export default class AgeChart extends React.Component {
    // The age chart is an optional microsimulation output, showing the effect
    // of a given reform on each age group.
    static contextType = CountryContext;

    constructor(props) {
        super(props);
        this.state = {
            error: false,
        }
        this.fetchResults = this.fetchResults.bind(this);
    }

    fetchResults() {
        let url = new URL(`${this.context.apiURL}/age-chart`);
        const eta = this.context["endpoint-runtimes"]["age_chart"];
        const submission = this.context.getPolicyJSONPayload();
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submission)
        };
		this.context.setState({ waitingOnAgeChart: true }, () => {
			fetch(url, requestOptions)
				.then((res) => {
                    if(res.ok) {
                        let checker = setInterval(() => {
                            fetch(url, requestOptions).then(res => res.json()).then(data => {
                                if(data.status === "completed") {
                                    clearInterval(checker);
                                    if(data.error) {
                                        throw new Error(data.error);
                                    }
                                    this.setState({ error: false });
                                    this.context.setState({ageChartResult: data, waitingOnAgeChart: false, ageChartIsOutdated: false});
                                }
                            }).catch(e => {
                                this.context.setState({ waitingOnAgeChart: false});
                                this.setState({ error: true });
                            });
                        }, 1000 * eta * 0.5);
                    }
				});
		});
    }

    render() {
        const results = this.context.ageChartResult;
        return (
            <Collapse ghost onChange={open => {if(open && (!results || this.context.ageChartIsOutdated)) { this.fetchResults(); }}}>
                <Panel header="Impact by age" key="1">
                    {
                        (this.context.waitingOnAgeChart || (!this.state.error && !results)) ?
                            <Spinner /> :
                            this.state.error ?
                                <Alert type="error" message="Something went wrong." /> :
                                <>
                                    <Row>
                                        <Chart plot={results.age_chart} md={12}/>
                                    </Row>
                                </>
                    }
                </Panel>
            </Collapse>
        );
    }
    
}