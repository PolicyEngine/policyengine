import React from "react";
import { Button, Divider, Alert, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CountryContext } from "../../country";

export default class AutoUBI extends React.Component {
	static contextType = CountryContext;
	constructor(props) {
		super(props);
		this.state = {waiting: false, amount: 0};
		this.applyAutoUBI = this.applyAutoUBI.bind(this);
	}

	applyAutoUBI() {
		const submission = this.context.getPolicyJSONPayload();
		let url = new URL(this.context.apiURL + "/ubi");
		url.search = new URLSearchParams(submission).toString();
		this.setState({waiting: true}, () => {
			fetch(url)
				.then((res) => {
					if (res.ok) {
						return res.json();
					} else {
						throw res;
					}
				}).then((json) => {
					const amount = Math.round(json.UBI / 52, 2);
					this.setState({waiting: false, amount: amount});
					this.context.updatePolicy("child_UBI", this.context.policy["child_UBI"].value + amount);
					this.context.updatePolicy("adult_UBI", this.context.policy["adult_UBI"].value + amount);
					this.context.updatePolicy("senior_UBI", this.context.policy["senior_UBI"].value + amount);
				}).catch(e => {
					message.error("Couldn't apply AutoUBI - something went wrong." + e.toString());
					this.setState({waiting: false});
				});
		});
	}
	
	render() {
		let result;
		if(this.state.waiting) {
			result = <Alert style={{marginTop: 10}} message={<>This reform would fund a UBI of £<Spin indicator={<LoadingOutlined />}/>/week</>} />;
		} else if(this.state.amount) {
			result = <Alert style={{marginTop: 10}} message={<>This reform would fund a UBI of £{this.state.amount}/week</>} /> ;
		}
		return (
			<>
				<Divider>AutoUBI</Divider>
				<Button onClick={this.applyAutoUBI}>Direct surplus revenue into UBI</Button>
				{result}
			</>
		);
	}
}