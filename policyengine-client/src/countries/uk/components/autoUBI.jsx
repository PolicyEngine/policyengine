import React from "react";
import { Button, Divider, Alert, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CountryContext } from "../../country";

function computeUBI(countryContext, callBack) {
	// This function sends an API call to the AutoUBI endpoint,
	// passing in the current policy as a JSON payload. It then
	// checks the results every 2 seconds until it gets a non-loading
	// response. Upon completion, it calls the callback function with
	// the UBI amount.
	const submission = countryContext.getPolicyJSONPayload();
	let url = new URL(countryContext.apiURL + "/auto-ubi");
	url.search = new URLSearchParams(submission).toString();
	const roundAndWeeklyise = (x) => Math.round(x / 52 * 100) / 100;
	return fetch(url)
		.then((response) => response.json())
		.then((data) => {
			if(data.status === "completed") {
				callBack(roundAndWeeklyise(data.UBI));
			} else {
				let checker = setInterval(() => {
					fetch(url).then(res => res.json()).then(data => {
						if (data.status === "completed") {
							clearInterval(checker);
							callBack(roundAndWeeklyise(data.UBI))
						}
					})
				}, 1000 * 2);
			}
		});
}

function updatePolicyWithUBI(countryContext, UBI) {
	// This function updates the policy with the UBI amount.
	let newPolicy = countryContext.policy;
	newPolicy.child_bi.value = UBI;
	newPolicy.adult_bi.value = UBI;
	newPolicy.senior_bi.value = UBI;
	countryContext.updateEntirePolicy(newPolicy);
}

export default function AutoUBI(props) {
	const [waiting, setWaiting] = React.useState(false);
	const [ubiAmount, setUBIAmount] = React.useState(0);
	const country = React.useContext(CountryContext);
	let loadingMessageIfNeeded;

	if(waiting) {
		loadingMessageIfNeeded = <Alert style={{marginTop: 10}} message={
			<>This reform would fund a UBI of £<Spin indicator={<LoadingOutlined />}/>/week</>
		} />;
	} else if(ubiAmount > 0) {
		loadingMessageIfNeeded = <Alert style={{marginTop: 10}} message={
			<>This reform would fund a UBI of £{ubiAmount}/week</>
		} /> ;
	}

	const onButtonClick = () => {
		setWaiting(true);
		computeUBI(country, (amount) => {
			updatePolicyWithUBI(country, amount);
			setUBIAmount(amount);
			setWaiting(false);
		});
	};

	return (
		<>
			<Divider>AutoUBI</Divider>
			<Button onClick={onButtonClick}>
				Direct surplus revenue into UBI
			</Button>
			{loadingMessageIfNeeded}
		</>
	);
}
