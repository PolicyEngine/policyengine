import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import GA4React from "ga-4-react";


const ga4react = new GA4React("G-QL2XFHB7B4");
(
	async _ => {
		await ga4react.initialize()
			.catch(err => console.log("Analytics Failure"))
			.then(analytics => {
				ReactDOM.render(
					<App analytics={analytics} />,
					document.getElementById("root"),
				);
			});
	}
)();