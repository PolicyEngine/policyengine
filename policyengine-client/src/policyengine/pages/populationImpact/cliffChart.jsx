import React from 'react';
import { Collapse, Alert, Table, Tooltip, Radio } from 'antd';
import { Chart } from "./chart";
import prettyMilliseconds from "pretty-ms";
import { Row } from "react-bootstrap";
import { CountryContext } from '../../../countries';
import Spinner from '../../general/spinner';

const { Panel } = Collapse;

export default class CliffChart extends React.Component {
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
        let url = new URL(`${this.context.apiURL}/cliff-impact`);
        const eta = this.context["endpoint-runtimes"]["age_chart"];
        const submission = this.context.getPolicyJSONPayload();
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(submission)
        };
		this.context.setState({ waitingOnCliffImpact: true }, () => {
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
                                    this.context.setState({cliffImpactResult: data, waitingOnCliffImpact: false, cliffImpactIsOutdated: false});
                                }
                            }).catch(e => {
                                this.context.setState({ waitingOnCliffImpact: false});
                                this.setState({ error: true });
                            });
                        }, 1000 * eta * 0.2);
                    }
				});
		});
    }

    render() {
        const results = this.context.cliffImpactResult;
        return (
            <Collapse ghost onChange={open => {if(open && (!results || this.context.cliffImpactIsOutdated)) { this.fetchResults(); }}}>
                <Panel header="Cliff impact" key="1">
                    {
                        (this.context.waitingOnCliffImpact || (!this.state.error && !results)) ?
                            <Spinner /> :
                            this.state.error ?
                                <Alert type="error" message="Something went wrong." /> :
                                <>
                                    <Row>
                                        <Chart plot={results} md={12}/>
                                    </Row>
                                </>
                    }
                </Panel>
            </Collapse>
        );
    }
    
}