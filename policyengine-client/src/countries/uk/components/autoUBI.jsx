import React from "react";
import { Button, Divider, Alert, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default class AutoUBI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {waiting: false, amount: 0};
		this.applyAutoUBI = this.applyAutoUBI.bind(this);
	}

	applyAutoUBI() {
		const submission = {};
		for (const key in this.props.policy) {
			if(this.props.policy[key].value !== this.props.policy[key].default) {
				submission[key] = this.props.policy[key].value;
			}
		}
		let url = new URL(this.props.api_url + "/ubi");
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
					this.props.setPolicy("child_UBI", this.props.policy["child_UBI"].value + amount);
					this.props.setPolicy("adult_UBI", this.props.policy["adult_UBI"].value + amount);
					this.props.setPolicy("senior_UBI", this.props.policy["senior_UBI"].value + amount);
				}).catch(e => {
					message.error("Couldn't apply AutoUBI - something went wrong.");
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