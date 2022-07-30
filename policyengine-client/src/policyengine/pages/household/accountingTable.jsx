import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Table } from "antd";
import React from "react";
import { useContext } from "react";
import { CountryContext } from "../../../countries";
import Centered from "../../general/centered";
import Spinner from "../../general/spinner";
import { Spacing } from "../../layout/general";
import { getTranslators } from "../../tools/translation";

function HouseholdResultsCaveats() {
    return <p style={{color: "grey"}}><ExclamationCircleOutlined />  &nbsp; &nbsp;PolicyEngine results may not constitute exact tax liabilities or benefit entitlements.</p>;

}

export default class AccountingTable extends React.Component {
    static contextType = CountryContext;
    constructor(props) {
        super(props);
        this.state = {
            error: false,
        }
        this.updateBaselineSituation = this.updateBaselineSituation.bind(this);
        this.updateReformSituation = this.updateReformSituation.bind(this);
    }

    updateBaselineSituation() {
        this.context.setState({ waitingOnAccountingTableBaseline: true }, () => {
            let url = new URL(this.context.apiURL + "/calculate");
            const submission = this.context.getPolicyJSONPayload();
            // We just want the keys beginning with baseline_
            const baselineSubmission = {};
            for (const key in submission) {
                if (key.startsWith("baseline_")) {
                    baselineSubmission[key.substring(9)] = submission[key];
                }
            }
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.assign({ "household": this.context.situation}, baselineSubmission))
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw res;
                }
            }).then((data) => {
                this.context.setState({ waitingOnAccountingTableBaseline: false, computedBaselineSituation: data, baselineSituationImpactIsOutdated: false }, () => {
                    this.setState({ error: false });
                });
            }).catch(e => {
                this.context.setState({ waitingOnAccountingTableBaseline: false});
                this.setState({ error: true, });
            });
        });
    }

    updateReformSituation() {
        this.context.setState({ waitingOnAccountingTableReform: true }, () => {
            const submission = this.context.getPolicyJSONPayload();
            let url = new URL(this.context.apiURL + "/calculate");
            url.search = new URLSearchParams(submission).toString();
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.assign({ "household": this.context.situation }, submission))
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw res;
                }
            }).then((data) => {
                this.context.setState({ waitingOnAccountingTableReform: false, computedReformSituation: data, reformSituationImpactIsOutdated: false }, () => {
                    this.setState({ error: false });
                })
            }).catch(e => {
                this.context.setState({ waitingOnAccountingTableReform: false});
                this.setState({ error: true });
            });
        });
    }

    componentDidMount() {
        if (this.context.baselineSituationImpactIsOutdated && !this.context.waitingOnAccountingTableBaseline) {
            this.updateBaselineSituation();
        }
        const reformExists = Object.keys(this.context.getPolicyJSONPayload()).length > 0;
        if (reformExists && this.context.reformSituationImpactIsOutdated && !this.context.waitingOnAccountingTableReform) {
            this.updateReformSituation();
        }
    }

    render() {
        // Update situations where necessary (re-using where not)
        // If the policy changes, we need to update only the reform 
        // situation. If the situation changes, we need to update both.
        const reformExists = Object.keys(this.context.getPolicyJSONPayload()).length > 0;
        if (
            this.context.computedBaselineSituation === null
            || (reformExists && (this.context.computedReformSituation === null))
            || this.context.waitingOnAccountingTableBaseline
            || this.context.waitingOnAccountingTableReform
        ) {
            const message = (this.context.waitingOnAccountingTableBaseline & this.context.waitingOnAccountingTableReform) ?
                "Calculating baseline and reform impact..." :
                (this.context.waitingOnAccountingTableBaseline ? "Calculating baseline impact..." : "Calculating reform impact...");
            return <Centered><Spinner rightSpacing={10} />{message}</Centered>
        } else if (this.state.error) {
            return <Centered>Something went wrong.</Centered>
        }

        return <>
            <Spacing />
            <VariableTable variable={Object.keys(this.context.outputVariableHierarchy)[0]} />
            <Spacing />
            <HouseholdResultsCaveats />
        </>;
    }
}

function getValues(variable, country) {
    const reformExists = Object.keys(country.getPolicyJSONPayload()).length > 0;
    const baseline = country.computedBaselineSituation;
    const reform = reformExists ? country.computedReformSituation : baseline;
    const entity = country.entities[country.variables[variable].entity];
    const entities = Object.keys(baseline[entity.plural]);
    const baselineValue = entities.length > 1 ?
        entities.map(name => baseline[entity.plural][name][variable]["2022"]).reduce((a, b) => a + b, 0) :
        baseline[entity.plural][entities[0]][variable]["2022"];
    const reformValue = entities.length > 1 ?
        entities.map(name => reform[entity.plural][name][variable]["2022"]).reduce((a, b) => a + b, 0) :
        reform[entity.plural][entities[0]][variable]["2022"];
    return { baselineValue: baselineValue, reformValue: reformValue };
}

function shouldShow(variable, country) {
    const { baselineValue, reformValue } = getValues(variable, country);
    return !(baselineValue === 0 && reformValue === 0);
}

function VariableTable(props) {
    // Given a variable name, return a table.
    const country = useContext(CountryContext);
    const reformExists = Object.keys(country.getPolicyJSONPayload()).length > 0;
    let columns;
    if (reformExists) {
        columns = [{
            title: "",
            dataIndex: "variable",
            key: "variable",
            width: 150,
        }, {
            title: "Baseline",
            dataIndex: "baseline",
            key: "baseline",
            width: 10,
            align: "center",
        }, {
            title: "Reform",
            dataIndex: "reform",
            key: "reform",
            width: 10,
            align: "center",
        }, {
            title: "Change",
            dataIndex: "change",
            key: "change",
            width: 10,
            align: "center",
        }];
    } else {
        columns = [{
            title: "",
            dataIndex: "variable",
            key: "variable",
            width: 20,
        }, {
            title: "Value",
            dataIndex: "baseline",
            key: "baseline",
            align: "center",
            width: 80,
        }]
    }
    const data = generateTableData(props.variable, country, 0, true);
    return <Table
        columns={columns}
        dataSource={data}
        expandable={{
            indentSize: 10,
            expandRowByClick: true,
            defaultExpandedRowKeys: [props.variable],
        }}
        pagination={false}
    />;
}

function generateTableData(variable, country, depth, isPositive) {
    const { baselineValue, reformValue } = getValues(variable, country);
    const { formatter } = getTranslators(country.variables[variable]);
    const colorZerosGrey = value => value === 0 ? "grey" : "black";
    const colorChanges = value => value > 0 ? "green" : value < 0 ? "red" : "grey";
    const applyColorLogic = (value, logic) => <div style={{ color: logic(value) }}>{formatter(value, true)}</div>;
    const multiplier = isPositive || depth === 0 ? 1 : -1;
    const hierarchy = country.outputVariableHierarchy[variable];
    let childElements = [];
    if (hierarchy) {
        const addedChildren = (hierarchy.add || []).filter(child => depth < 1 || shouldShow(child, country));
        const subtractedChildren = (hierarchy.subtract || []).filter(child => depth < 1 || shouldShow(child, country));
        const children = addedChildren.concat(subtractedChildren);
        for (let child in children) {
            childElements = childElements.concat(generateTableData(children[child], country, depth + 1, isPositive !== (subtractedChildren.includes(children[child]))));
        }
    } else {
        childElements = null;
    }
    const data = [{
        variable: <div style={{display: "inline-block"}}>{country.variables[variable].label}</div>,
        key: variable,
        baseline: applyColorLogic(baselineValue * multiplier, colorZerosGrey),
        reform: applyColorLogic(reformValue * multiplier, colorZerosGrey),
        change: applyColorLogic((reformValue - baselineValue) * multiplier, colorChanges),
    }]
    if (childElements) {
        data[0].children = childElements;
    }
    return data;

}
