import { Table } from "antd";

function displayFinancial(amount) {
    return Number(Math.round(amount)).toLocaleString();
}

function displayDeriv(amount) {
    return Math.round(amount * 100).toString() + "%";
}

function deriv_to_MTR(is_addition, deriv) {
    return !is_addition ? 1 - deriv : deriv;
}

export default function AccountingTable(props) {
    console.log(props.values)
    const firstColumnWidth = 300 - props.depth * 10;
    const otherColumnWidth = (800 - firstColumnWidth) / 6;
    const columns = [
        { title: "Component", dataIndex: "label", width: firstColumnWidth },
        { title: "Baseline (£)", dataIndex: "baseline", width: otherColumnWidth },
        { title: "Reform (£)", dataIndex: "reformed", width: otherColumnWidth },
        { title: "Difference (£)", dataIndex: "difference", width: otherColumnWidth },
        { title: "Baseline MTR (%)", dataIndex: "baseline_deriv", width: otherColumnWidth },
        { title: "Reform MTR (%)", dataIndex: "reformed_deriv", width: otherColumnWidth },
        { title: "MTR difference (%)", dataIndex: "difference_deriv", width: otherColumnWidth },
    ];
    const filteredVariables = props.variableNames.map(name => props.variables[name]).filter(variable => Object.keys(variable).includes("accounting"));
    let output = filteredVariables.map(variable => Object.assign(variable, {
        key: variable.title,
        label: variable.title,
        baseline_deriv: displayDeriv(deriv_to_MTR(!variable.accounting.is_addition, props.values[variable.short_name].old_deriv)),
        reformed_deriv: displayDeriv(deriv_to_MTR(!variable.accounting.is_addition, props.values[variable.short_name].new_deriv)),
        difference_deriv: displayDeriv(deriv_to_MTR(!variable.accounting.is_addition, props.values[variable.short_name].difference_deriv)),
        baseline: displayFinancial((variable.accounting.is_addition ? 1 : -1) * props.values[variable.short_name].old),
        reformed: displayFinancial((variable.accounting.is_addition ? 1 : -1) * props.values[variable.short_name].new),
        difference: displayFinancial((variable.accounting.is_addition ? 1 : -1) * props.values[variable.short_name].difference),
    }));
    output = [...new Set(output)];
    return (
        <Table
            columns={columns}
            dataSource={Object.values(output)}
            showHeader={props.showHeader}
            pagination={false}
            style={{marginLeft: props.depth * 10}}
            expandable={{
                expandedRowRender: row =>  <AccountingTable variables={props.variables} variableNames={row.accounting.components} depth={props.depth + 1} values={props.values} showHeader={false} />,
                rowExpandable: row => row.accounting.components && row.accounting.components.length > 0,
            }}
        />
    );
} 