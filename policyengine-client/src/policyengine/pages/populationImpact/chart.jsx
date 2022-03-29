import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import { Col } from "react-bootstrap";
import React from "react";

const Plot = createPlotlyComponent(Plotly);

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