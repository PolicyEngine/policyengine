import FAQText from "../data/faq.md";

import ReactMarkdown from "react-markdown";
import { Row, Col } from "react-bootstrap";
import { Divider } from "antd";
import React from "react";
import rehypeRaw from "rehype-raw";

function Header(props) {
	return <><h1>{props.children}</h1></>;
}

function Subheader(props) {
	return <><h3 style={{paddingTop: 30}}>{props.children}</h3><Divider /></>;
}

function Subsubheader(props) {
	return <><h5><i>{props.children}</i></h5></>;
}

export class FAQ extends React.Component {
	constructor(props) {
		super(props);
        this.state = {text: ""};
	}

    componentDidMount() {
        fetch(FAQText).then(res => res.text()).then(text => this.setState({text: text}));
        this.props.analytics.pageview("/uk/faq");
    }

	render() {
		const components = {h1: Header, h2: Subheader, h3: Subsubheader};
		return <Row style={{paddingTop: 30}}>
			<Col md={2}>
			</Col>
			<Col>
				<ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>{this.state.text}</ReactMarkdown>
			</Col>
			<Col md={2}>
			</Col>
		</Row>;
	}
}

export default FAQ;