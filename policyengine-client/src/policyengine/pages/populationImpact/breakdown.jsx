import { Collapse, Alert, Table, Tooltip, Radio } from 'antd';
import { Chart } from "./chart";
import React from 'react';
import prettyMilliseconds from "pretty-ms";
import { Row } from "react-bootstrap";
import { CountryContext } from '../../../countries';
import Spinner from '../../general/spinner';

const { Panel } = Collapse;

export class BreakdownTable extends React.Component {
    static contextType = CountryContext;
    constructor(props) {
        super(props);
        this.state = {error: false, showAbsDecile: false};
        this.fetchResults = this.fetchResults.bind(this);
    }

    fetchResults() {
        let url = new URL(`${this.context.apiURL}/population-breakdown`);
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.context.getPolicyJSONPayload())
        };
		this.context.setState({ waitingOnPopulationBreakdown: true }, () => {
			fetch(url, requestOptions).then((res) => {
                if (res.ok) {
                    let checker = setInterval(() => {
                        fetch(url, requestOptions).then(res => res.json()).then(data => {
                            if(data.status === "completed") {
                                clearInterval(checker);
                                if(data.error) {
                                    throw new Error(data.error);
                                }
                                this.setState({ error: false });
                                this.context.setState({populationImpactBreakdownResults: data, waitingOnPopulationBreakdown: false});
                            }
                        }).catch(e => {
                            this.context.setState({ waitingOnPopulationBreakdown: false});
                            this.setState({ error: true });
                        });
                    }, 5000);
                } else {
                    throw res;
                }
            });
		});
    }

    render() {
        const results = this.context.populationImpactBreakdownResults;
        return (
            <Collapse ghost onChange={open => {if(open && (!results || this.context.populationBreakdownIsOutdated)) { this.fetchResults(); }}}>
                <Panel header={<Tooltip title={`Estimated to take around ${prettyMilliseconds(2400 + Object.values(this.props.policy).filter(x => x.value !== x.baselineValue).length * 1600, {compact: true})}`}>See a breakdown of the changes (may take longer)</Tooltip>} key="1">
                    {
                        (this.context.waitingOnPopulationBreakdown || (!this.state.error && !results)) ?
                            <Spinner /> :
                            this.state.error ?
                                <Alert type="error" message="Something went wrong." /> :
                                <>
                                    <BreakdownTableContent results={results} />
                                    <Row>
                                        {
                                            this.state.showAbsDecile ?
                                                <Chart plot={results.avg_decile_chart} md={12}/> :
                                                <Chart plot={results.rel_decile_chart} md={12}/>
                                        }
                                    </Row>
                                    <Row>
                                        <div className="justify-content-center d-flex">
                                            <Radio.Group defaultValue={true} buttonStyle="solid"  onChange={() => this.setState({showAbsDecile: !this.state.showAbsDecile})} >
                                                <Radio.Button value={true}>Relative change</Radio.Button>
                                                <Radio.Button value={false}>Absolute change</Radio.Button>
                                            </Radio.Group>                                        
                                        </div>
                                    </Row>
                                </>
                    }
                </Panel>
            </Collapse>
        );
    }
}

function BreakdownTableContent(props) {
    const columns = [
        {
            title: "Provision",
            dataIndex: "provision",
            key: "provision",
        },
        {
            title: "Additional spending (£bn)",
            dataIndex: "additional_spending",
            key: "additional_spending",
        },
        {
            title: "Cumulative spending (£bn)",
            dataIndex: "cumulative_spending",
            key: "cumulative_spending",
        },
    ];
    let data = [];
    for(let i = 0; i < props.results.spending.length; i++) {
        data.push({
            key: props.results.provisions[i],
            provision: props.results.provisions[i],
            additional_spending: props.results.spending[i],
            cumulative_spending: props.results.cumulative_spending[i],
        });
    }
    return <Table columns={columns} dataSource={data} />;
}
