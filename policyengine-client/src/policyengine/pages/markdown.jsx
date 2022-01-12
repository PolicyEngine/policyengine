import ReactMarkdown from "react-markdown";
import { Row, Col } from "react-bootstrap";
import { Divider } from "antd";
import React from "react";
import rehypeRaw from "rehype-raw";
import { CountryContext } from "../../countries/country";
import { BodyWrapper } from "../layout/general";
import { Header as PageHeader } from "../header";
import { Footer } from "antd/lib/layout/layout";

function Header(props) {
	return <><h1>{props.children}</h1></>;
}

function Subheader(props) {
	return <><h3 style={{paddingTop: 30}}>{props.children}</h3><Divider /></>;
}

function Subsubheader(props) {
	return <><h5><i>{props.children}</i></h5></>;
}

export class MarkdownPage extends React.Component {
	static contextType = CountryContext;
	constructor(props) {
		super(props);
        this.state = {text: ""};
	}

    componentDidMount() {
        fetch(this.props.content).then(res => res.text()).then(text => this.setState({text: text}));
    }

	render() {
		const components = {h1: Header, h2: Subheader, h3: Subsubheader};
		return (
			<>
				<PageHeader title={this.props.title} />
				<BodyWrapper>
				<Row style={{paddingTop: 30}}>
					<Col md={2}>
					</Col>
					<Col>
						<ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>{this.state.text}</ReactMarkdown>
					</Col>
					<Col md={2}>
					</Col>
				</Row>
				</BodyWrapper>
				<Footer />
			</>
		);
	}
}

export default MarkdownPage;