import { Table } from "antd";

function displayFinancial(amount) {
    return Number(Math.round(amount)).toLocaleString();
}

function displayDeriv(amount) {
    return Math.round(amount * 100);
}

function deriv_to_MTR(is_addition, includes_earnings, deriv) {
    if(is_addition && includes_earnings) {
        // e.g. market income
        return 1 - deriv;
    } else if(is_addition && !includes_earnings) {
        // e.g. benefits
        return - deriv;
    } else {
        // e.g. tax
        return deriv;
    }
}

export default function AccountingTable(props) {
    console.log(props.values, props.variables)
    const columns = [
        { title: "Component", dataIndex: "label", width: 200 },
        { title: "Baseline (£)", dataIndex: "baseline", width: 200 },
        { title: "Reform (£)", dataIndex: "reformed", width: 200 },
        { title: "Difference (£)", dataIndex: "difference", width: 200 },
        { title: "Baseline MTR (%)", dataIndex: "baseline_deriv", width: 200 },
        { title: "Reform MTR (%)", dataIndex: "reformed_deriv", width: 200 },
        { title: "MTR difference (pp)", dataIndex: "difference_deriv", width: 200 },
    ];
    const filteredVariables = props.variableNames.map(name => props.variables[name]).filter(variable => Object.keys(variable).includes("accounting"));
    let output = filteredVariables.map(variable => Object.assign(variable, {
        key: variable.title,
        label: variable.title,
        baseline_deriv: displayDeriv(deriv_to_MTR(variable.accounting.is_addition, variable.accounting.includes_earnings, props.values[variable.short_name].old_deriv)),
        reformed_deriv: displayDeriv(deriv_to_MTR(variable.accounting.is_addition, variable.accounting.includes_earnings, props.values[variable.short_name].new_deriv)),
        difference_deriv: displayDeriv(deriv_to_MTR(false, false, props.values[variable.short_name].difference_deriv)),
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
            expandable={{
                expandedRowRender: row =>  <AccountingTable variables={props.variables} variableNames={row.accounting.components} depth={props.depth + 1} values={props.values} showHeader={false} />,
                rowExpandable: row => row.accounting.components && row.accounting.components.length > 0,
            }}
        />
    );
} 