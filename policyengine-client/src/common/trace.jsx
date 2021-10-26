import { Table } from "antd";

export default function Trace(props) {
    const columns = [
        { title: "Component", dataIndex: "label", width: 300 },
        { title: "Baseline", dataIndex: "baseline" },
        { title: "Reform", dataIndex: "reformed" },
    ];
    const filteredVariables = props.variables.map(variable => props.trace[variable])
    let output = filteredVariables.map(variable => Object.assign(variable, {
        key: variable.label + props.depth.toString(),
        baseline: variable.baseline || "-",
        reformed: variable.reformed || "-",
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
                expandedRowRender: row =>  <Trace trace={props.trace} depth={props.depth + 1} variables={row.children} showHeader={false} />,
                rowExpandable: row => row.children && row.children.length > 0,
            }}
        />
    );
}