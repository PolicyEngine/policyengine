import { LoadingOutlined } from '@ant-design/icons';
import { Collapse, Spin, Alert, Table, Tooltip } from 'antd';
import React from 'react';
import prettyMilliseconds from "pretty-ms";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Panel } = Collapse;

export class BreakdownTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {results: null, waiting: false, error: false};
        this.fetchResults = this.fetchResults.bind(this);
    }

    fetchResults() {
        let url = new URL(`${this.props.api_url}/population-breakdown`);
		url.search = new URLSearchParams(this.props.policy).toString();
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
					this.setState({ waiting: false, error: true });
				});
		});
    }

    render() {
        return (
            <Collapse ghost onChange={open => {if(open && !this.state.results) { this.fetchResults(); }}}>
                <Panel header={<Tooltip title={`Esimated to take around ${prettyMilliseconds(2400 + Object.keys(this.props.policy).length * 1600)}`}>See a breakdown of the changes (may take longer)</Tooltip>} key="1">
                    {
                        this.state.waiting ?
                            <Spin indicator={antIcon} /> :
                            this.state.error ?
                                <Alert type="error" message="Something went wrong." /> :
                                <BreakdownTableContent results={this.state.results} />
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
