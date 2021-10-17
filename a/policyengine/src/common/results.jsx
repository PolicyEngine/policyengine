import { Card, Statistic, Collapse, Empty, Spin } from "antd";
import Plot from "react-plotly.js";
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Col } from "react-bootstrap";
import { Fragment, default as React } from "react";

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


export function ChangedHeadlineFigure(props) {
	const data = props.results[props.name];
	const variable = VARIABLES[props.name];
	const formatNumber = num => (props.gbp ? "£" : "") + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	const oldV = formatNumber(data.old);
	const newV = formatNumber(data.new);
	let prefix = null;
	const gain = data.new > data.old;
	const loss = data.new < data.old;
	let changeColor = "black";
	if((gain && !variable.inverted) || (loss && variable.inverted)) {
		changeColor = "green";
	} else if((loss && !variable.inverted) || (gain && variable.inverted)) {
		changeColor = "red";
	}
	if(gain) {
		prefix = <ArrowUpOutlined style={{color: changeColor}} />;
	} else {
		prefix = <ArrowDownOutlined style={{color: changeColor}}/>;
	}

	return (
		<Col style={{ padding: 10, margin: 10 }}>
			<Card style={{ minWidth: 300 }}>
				<Statistic
					style={{paddingLeft: 40}}
					title={variable.name}
					value={[oldV, newV, data.old, data.new]}
					formatter={x => x[0] !== x[1] ? <><s style={{color: "grey"}}>{x[0]}</s><br /><div style={{color: changeColor}}>{x[1]}<br />({prefix}{formatNumber(x[3] - x[2])})</div></> : x[0]}
					suffix={props.suffix}
				/>
				<Collapse ghost>
					<Panel header={<><QuestionCircleOutlined/>  Explanation</>} key="1">
						<Explainer formatter={formatNumber} name={props.name} results={props.results} explainers={VARIABLES[props.name].explainers}/>
					</Panel>
				</Collapse>
			</Card>
		</Col>
	);
}

export function Chart(props) {
	return (
		<>
			<Col>
				<Plot
					data={props.plot.data}
					layout={props.plot.layout}
					config={{ displayModeBar: false }}
					frames={props.plot.frames}
					style={{ width: "100%" }}
				/>
			</Col>
		</>
	);
}


export function TakeAway(props) {
	return <Col>
		<div style={{padding: 10}} className="d-flex justify-content-center align-items-center">
			<div style={{fontSize: 20, color: "gray"}}>{props.children}</div>
		</div>
	</Col>;
}

export function LoadingResultsPane(props) {
	return (
		<Empty description={props.message}>
			{!props.noSpin ? <Spin indicator={antIcon} /> : <></>}
		</Empty>
	);
}