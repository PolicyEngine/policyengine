import Plot from "react-plotly.js";
import { Col } from "react-bootstrap";
import React from "react";

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