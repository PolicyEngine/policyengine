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
        this.state = {waiting: false, error: false, showAbsDecile: false};
        this.fetchResults = this.fetchResults.bind(this);
    }

    fetchResults() {
        let url = new URL(`${this.context.apiURL}/population-breakdown`);
		url.search = new URLSearchParams(this.context.getPolicyJSONPayload()).toString();
		this.setState({ waiting: true }, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((data) => {
					this.setState({ waiting: false, error: false });
                    this.context.setState({populationImpactBreakdownResults: data});
				}).catch(e => {
					this.setState({ waiting: false, error: true });
				});
		});
    }

    render() {
        const results = this.context.populationImpactBreakdownResults;
        return (
            <Collapse ghost onChange={open => {if(open && !results) { this.fetchResults(); }}}>
                <Panel header={<Tooltip title={`Estimated to take around ${prettyMilliseconds(2400 + Object.keys(this.props.policy).length * 1600)}`}>See a breakdown of the changes (may take longer)</Tooltip>} key="1">
                    {
                        (this.state.waiting || (!this.state.error && !results)) ?
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