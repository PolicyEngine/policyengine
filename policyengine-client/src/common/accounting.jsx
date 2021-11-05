import { Table } from "antd";

export default function AccountingTable(props) {
    const columns = [
        { title: "Component", dataIndex: "label", width: 300 },
        { title: "Baseline", dataIndex: "baseline" },
        { title: "Reform", dataIndex: "reformed" },
    ];
    console.log(props)
    const filteredVariables = props.variableNames.map(name => props.variables[name]).filter(variable => Object.keys(variable).includes("accounting"));
    let output = filteredVariables.map(variable => Object.assign(variable, {
        key: variable.title,
        label: (!variable.accounting.is_addition ? " - " : "") + variable.title,
        baseline: props.values[variable.short_name].old,
        reformed: props.values[variable.short_name].new,
    }));
    output = [...new Set(output)];
    return (
        <Table
            columns={columns}
            dataSource={Object.values(output)}
            showHeader={props.showHeader}
            pagination={false}
            expandable={{
                indentSize: 0, 
                expandedRowRender: row =>  <AccountingTable variables={props.variables} variableNames={row.accounting.components} values={props.values} showHeader={false} />,
                rowExpandable: row => row.accounting.components && row.accounting.components.length > 0,
            }}
        />
    );
} 