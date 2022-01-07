import { Table } from "antd";
import React from "react";
import { useContext } from "react";
import { CountryContext } from "../../../countries";
import Centered from "../../general/centered";
import Spinner from "../../general/spinner";
import { Spacing } from "../../layout/general";
import { getTranslators } from "../../tools/translation";

export default class AccountingTable extends React.Component {
    static contextType = CountryContext;
    constructor(props) {
        super(props);
        this.state = {
            waitingOnBaseline: true,
            waitingOnReform: false,
            error: false,
        }
        this.updateBaselineSituation = this.updateBaselineSituation.bind(this);
        this.updateReformSituation = this.updateReformSituation.bind(this);
    }

    updateBaselineSituation() {
        this.setState({waitingOnBaseline: true}, () => {
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
                    this.setState({ waitingOnBaseline: false, error: false });
                });
            }).catch(e => {
                this.setState({ waitingOnBaseline: false, error: true, });
            });
        });
    }

    updateReformSituation() {
        this.setState({waitingOnReform: true}, () => {
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
                    this.setState({ waitingOnReform: false, error: false });
                })
            }).catch(e => {
                this.setState({ waitingOnReform: false, error: true});
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
        if(this.state.waitingOnBaseline || this.state.waitingOnReform) {
            const message = (this.state.waitingOnBaseline & this.state.waitingOnReform) ?
                "Calculating baseline and reform impact..." :
                (this.state.waitingOnBaseline ? "Calculating baseline impact..." : "Calculating reform impact...");
            return <Centered><Spinner rightSpacing={10}/>{message}</Centered>
        } else if(this.state.error) {
            return <Centered>Something went wrong.</Centered>
        }

        return <>
            <Spacing />
            <VariableTable variable={Object.keys(this.context.outputVariableHierarchy)[0]} />
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
        entities.map(name => baseline[entity.plural][name][variable]["2021"]).reduce((a, b) => a + b, 0) :
        baseline[entity.plural][entities[0]][variable]["2021"];
    const reformValue = entities.length > 1 ? 
        entities.map(name => reform[entity.plural][name][variable]["2021"]).reduce((a, b) => a + b, 0) :
        reform[entity.plural][entities[0]][variable]["2021"];
    return {baselineValue: baselineValue, reformValue: reformValue};
}

function shouldShow(variable, country) {
    const { baselineValue, reformValue } = getValues(variable, country);
    if(variable === "employment_income") {
    }
    return !(baselineValue === 0 && reformValue === 0);
}

function VariableTable(props) {
    // Given a variable name, return a table.
    const country = useContext(CountryContext);
    const reformExists = Object.keys(country.getPolicyJSONPayload()).length > 0;
    const { baselineValue, reformValue } = getValues(props.variable, country);
    if(props.depth && baselineValue === 0 && reformValue === 0) {
        return null;
    }
    const depth = props.depth || 0;
    let columns;
    if(reformExists) {
        columns = [{
            title: "",
            dataIndex: "variable",
            key: "variable",
            width: 150,
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
            width: 150,
        }, {
            title: "Value",
            dataIndex: "baseline",
            key: "baseline",
            width: 70,
            align: "center",
        }]
    }
    const { formatter } = getTranslators(country.variables[props.variable]);

    const colorZerosGrey = value => value === 0 ? "grey" : "black";
    const colorChanges = value => value > 0 ? "green" : value < 0 ? "red" : "grey";
    const applyColorLogic = (value, logic) => <div style={{color: logic(value)}}>{formatter(value, true)}</div>;
    const multiplier = props.isPositive || depth === 0 ? 1 : -1;
    const data = [{
        variable: <div style={{width: 150}}>{country.variables[props.variable].label}</div>,
        key: props.variable,
        baseline: applyColorLogic(baselineValue * multiplier, reformExists ? colorZerosGrey : colorChanges),
        reform: applyColorLogic(reformValue * multiplier, reformExists ? colorZerosGrey : colorChanges),
        change: applyColorLogic((reformValue - baselineValue) * multiplier, colorChanges),
    }]
    const isPositive = props.isPositive || depth === 0;

    const generateChildTable = row => {
        try {
            const addedChildren = (country.outputVariableHierarchy[row.key].add || []).filter(child => shouldShow(child, country));
            const subtractedChildren = (country.outputVariableHierarchy[row.key].subtract || []).filter(child => shouldShow(child, country));
            const children = addedChildren.concat(subtractedChildren);
            return children.map((child, i) => <VariableTable 
                key={child} 
                depth={depth + 1} 
                variable={child} 
                isPositive={isPositive === (i < addedChildren.length)} 
                isChild={true}
                isSingle={children.length === 1}
            />);
        } catch(e) {
            return <></>
        }
    };
    const rowIsExpandable = row => country.outputVariableHierarchy[row.key];

    return <Table 
        columns={columns}
        // The Ant Design table seems to have a bug where
        // nested children are indented if there is exactly
        // one nested table. The below styling fixes that.
        style={{
            width: props.isSingle ? 600 - 15 : 600,
            marginTop: props.isSingle ? 10 : 0,
            marginBottom: props.isSingle ? 10 : 0,
        }}
        dataSource={data} 
        pagination={false} 
        showHeader={!props.isChild}
        expandable={{
            expandedRowRender: generateChildTable,
            rowExpandable: rowIsExpandable,
            defaultExpandAllRows: depth === 0,
        }}/>;
}