import { Empty, Spin } from "antd";
import Plot from "react-plotly.js";
import { LoadingOutlined } from "@ant-design/icons";
import { Col } from "react-bootstrap";
import React from "react";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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