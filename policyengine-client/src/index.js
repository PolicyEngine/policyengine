/*
    * This is the first entry point of the app. No UI code is here;
    * it is only responsible for initializing the app.
*/

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import GA4React from "ga-4-react";

const ga4react = new GA4React("G-QL2XFHB7B4");
(
	async _ => {
		await ga4react.initialize()
			.catch(err => console.log("Analytics failed to load"))
			.then(analytics => {
				ReactDOM.render(
					<App analytics={analytics} />,
					document.getElementById("root"),
				);
			});
	}
)();
