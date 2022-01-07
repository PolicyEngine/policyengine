import { ConsoleSqlOutlined } from "@ant-design/icons";
import { Table } from "antd";
import React from "react";
import { useContext } from "react";
import { CountryContext } from "../../../countries";
import Centered from "../../general/centered";
import Spinner from "../../general/spinner";
import { getTranslators } from "../../tools/translation";

export default class AccountingTable extends React.Component {
    static contextType = CountryContext;
    constructor(props) {
        super(props);
        this.state = {
            waiting: true,
            error: false,
        }
        this.updateBaselineSituation = this.updateBaselineSituation.bind(this);
        this.updateReformSituation = this.updateReformSituation.bind(this);
    }

    updateBaselineSituation() {
        this.setState({waiting: true, waitingOnBaseline: true}, () => {
            let url = new URL(this.context.apiURL + "/calculate");
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"household": this.context.situation})
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw res;
                }
            }).then((data) => {
                this.context.setState({computedBaselineSituation: data, baselineSituationImpactIsOutdated: false}, () => {
                    this.setState({ waiting: false, waitingOnBaseline: false, error: false });
                });
            }).catch(e => {
                this.setState({ waiting: false, waitingOnBaseline: false, error: true, });
            });
        });
    }

    updateReformSituation() {
        this.setState({waiting: true, waitingOnReform: true}, () => {
            const submission = this.context.getPolicyJSONPayload();
            let url = new URL(this.context.apiURL + "/calculate");
            url.search = new URLSearchParams(submission).toString();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"household": this.context.situation})
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw res;
                }
            }).then((data) => {
                this.context.setState({computedReformSituation: data, reformSituationImpactIsOutdated: false}, () => {
                    this.setState({ waiting: false, waitingOnReform: false, error: false });
                })
            }).catch(e => {
                this.setState({ waiting: false, waitingOnReform: false, error: true});
            });
        });
    }

    componentDidMount() {
        this.context.updateOutdatedThen(() => {
			if(this.context.baselineSituationImpactIsOutdated) {
				this.updateBaselineSituation();
			}
            const reformExists = Object.keys(this.context.getPolicyJSONPayload()).length > 0;
            if(reformExists && this.context.reformSituationImpactIsOutdated) {
                this.updateReformSituation();
            }
		});
    }

    render() {
        // Update situations where necessary (re-using where not)
        // If the policy changes, we need to update only the reform 
        // situation. If the situation changes, we need to update both.
        if(this.state.waiting) {
            const message = (this.state.waitingOnBaseline & this.state.waitingOnReform) ?
                "Calculating baseline and reform impact..." :
                (this.state.waitingOnBaseline ? "Calculating baseline impact..." : "Calculating reform impact...");
            return <Centered><Spinner rightSpacing={10}/>{message}</Centered>
        } else if(this.state.error) {
            return <Centered>Something went wrong.</Centered>
        }

        return <VariableTable variable={Object.keys(this.context.outputVariableHierarchy)[0]} />;
    }
}

function VariableTable(props) {
    // Given a variable name, return a table.
    const country = useContext(CountryContext);
    const reformExists = Object.keys(country.getPolicyJSONPayload()).length > 0;
    const baseline = country.computedBaselineSituation;
    const reform = reformExists ? country.computedReformSituation : baseline;
    const depth = props.depth || 0;
    let columns;
    if(reformExists) {
        columns = [{
            title: "",
            dataIndex: "variable",
            key: "variable",
            width: 300,
        }, {
            title: "Baseline",
            dataIndex: "baseline",
            key: "baseline",
            width: 70,
            align: "center",
        }, {
            title: "Reform",
            dataIndex: "reform",
            key: "reform",
            width: 70,
            align: "center",
        }, {
            title: "Change",
            dataIndex: "change",
            key: "change",
            width: 70,
            align: "center",
        }];
    } else {
        columns = [{
            title: "",
            dataIndex: "variable",
            key: "variable",
            width: 300,
        }, {
            title: "Value",
            dataIndex: "baseline",
            key: "baseline",
            width: 70 * 3 ,
            align: "center",
        }]
    }
    const entity = country.entities[country.variables[props.variable].entity];
    const entities = Object.keys(baseline[entity.plural]);
    const baselineValue = entities.length > 1 ?
        entities.map(name => baseline[entity.plural][name][props.variable]["2021"]).reduce((a, b) => a + b, 0) :
        baseline[entity.plural][entities[0]][props.variable]["2021"];
    const reformValue = entities.length > 1 ? 
        entities.map(name => reform[entity.plural][name][props.variable]["2021"]).reduce((a, b) => a + b, 0) :
        reform[entity.plural][entities[0]][props.variable]["2021"];
    
    const { formatter } = getTranslators(country.variables[props.variable]);

    const colorZerosGrey = value => value === 0 ? "grey" : "black";
    const colorChanges = value => value > 0 ? "green" : value < 0 ? "red" : "grey";
    const applyColorLogic = (value, logic) => <div style={{color: logic(value)}}>{formatter(value, true)}</div>;
    
    if(baselineValue === 0 && reformValue === 0) {
        return <></>;
    }
    const data = [{
        variable: country.variables[props.variable].label,
        key: props.variable,
        baseline: applyColorLogic(baselineValue, colorZerosGrey),
        reform: applyColorLogic(reformValue, colorZerosGrey),
        change: applyColorLogic((reformValue - baselineValue) * (props.isPositive || depth === 0 ? 1 : -1), colorChanges),
    }]

    const generateChildTable = row => {
        try {
            const addedChildren = country.outputVariableHierarchy[row.key].add || [];
            const subtractedChildren = country.outputVariableHierarchy[row.key].subtract || [];
            const children = addedChildren.concat(subtractedChildren);
            return children.map((child, i) => <VariableTable depth={depth + 1} variable={child} isPositive={props.isPositive === (i < addedChildren.length)} isChild={true}/>);
        } catch {
            return <></>
        }
    };
    const rowIsExpandable = row => country.outputVariableHierarchy[row.key];

    return <Table 
        columns={columns}
        dataSource={data} 
        pagination={false} 
        showHeader={!props.isChild}
        expandable={{
            expandedRowRender: generateChildTable,
            rowExpandable: rowIsExpandable,
            defaultExpandAllRows: depth === 0,
        }}/>;
}