import { Affix, Tabs, Tag, PageHeader, Image } from "antd";
import { Route, Switch, useHistory } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { policyToURL } from "./url";
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';
import MainLogo from "../common/images/title_logo.png";

const { TabPane } = Tabs;

export function Header(props) {
	return (
		<Affix offsetTop={0}>
			<div style={{backgroundColor: "#2c6496"}}>
				<Switch>
					<Route path={`/${props.country}/policy`}>
						<MainNavigation
							beta={props.beta}
							country={props.country}
							policy={props.policy}
							household={props.household}
							selected="policy"
							baseUrl={`/${props.country}`}
						/>
					</Route>
					<Route path={`/${props.country}/population-impact`}>
						<MainNavigation
							beta={props.beta}
							country={props.country}
							policy={props.policy}
							household={props.household}
							selected="population-impact"
							baseUrl={`/${props.country}`}
						/>
					</Route>
					<Route path={`/${props.country}/household`}>
						<MainNavigation
							beta={props.beta}
							country={props.country}
							policy={props.policy}
							household={props.household}
							selected={"household"}
							baseUrl={`/${props.country}`}
						/>
					</Route>
					<Route path={`/${props.country}/household-impact`}>
						<MainNavigation
							beta={props.beta}
							country={props.country}
							policy={props.policy}
							household={props.household}
							selected={"household-impact"}
							baseUrl={`/${props.country}`}
						/>
					</Route>
					<Route path={`/${props.country}/faq`}>
						<MainNavigation
							beta={props.beta}
							country={props.country}
							policy={props.policy}
							household={props.household}
							selected={"faq"}
							baseUrl={`/${props.country}`}
							faq
						/>
					</Route>
				</Switch>
			</div>
		</Affix>
	);
}

function MainNavigation(props) {
	const history = useHistory();
	let middleColumn;
	if(props.faq) {
		middleColumn = (
			<Tabs activeKey={props.selected} centered onChange={key => {history.push(policyToURL(props.baseUrl + "/" + key, props.policy))}}>
				<TabPane tab="FAQ" key="faq"/>
			</Tabs>
		);
	} else {
		middleColumn = (
			<Tabs moreIcon={null} style={{paddingTop: 0, paddingBottom: 0}} activeKey={props.selected} centered onChange={key => {history.push(policyToURL(props.baseUrl + "/" + key, props.policy))}}>
				<TabPane tab="Policy" key="policy"/>
				<TabPane tab={props.country.toUpperCase() + " impact"} key="population-impact" />
				<TabPane tab="Your household" key="household" />
				{props.household ? <TabPane tab="Household impact" key="household-impact" /> : null}
			</Tabs>
		);
	}
	return (
		<>
			<Row style={{margin: 0}}>
				<Col lg={2}>
					<Title image={props.titleImage} country={props.country} beta={props.beta} />
				</Col>
				<Col lg={8} className="d-flex align-items-center justify-content-center" style={{paddingLeft: 25, paddingRight: 25}}>
					{middleColumn}
				</Col>
				<Col lg={2} className="d-none d-lg-flex align-items-center">
					<SocialLinks />
				</Col>
			</Row>
		</>
	);
}

export function Title(props) {
	const tags = props.beta ? [<Tag key="beta" color="#002766">BETA</Tag>] : null;
	const title = <a href="/"><Image src={MainLogo} preview={false} height={50} width={80} style={{padding: 0, margin: 0}} /></a>
	return (
		<div style={{minWidth: 300}}>
			<div className="d-none d-lg-flex align-items-center ">
				<PageHeader
					title={title}
					style={{minHeight: 30, padding: 0, margin: 0}}
					tags={tags}
				/>
			</div>
			<div className="d-lg-none">
				<div className="d-flex align-items-center justify-content-center">
					<PageHeader
						title={title}
						style={{paddingBottom: 8}}
						tags={tags}
					/>
				</div>
			</div>
		</div>
	);
}

export function SocialLinks(props) {
	const iconStyle = { marginLeft: 15, fontSize: 15, color: props.color || "white" };
	return (
		<div className="d-flex justify-content-center">
			<a href="https://twitter.com/thepolicyengine"><TwitterOutlined style={iconStyle}/></a>
			<a href="https://www.facebook.com/ThePolicyEngine"><FacebookOutlined style={iconStyle}/></a>
			<a href="https://www.linkedin.com/company/thepolicyengine/about/"><LinkedinOutlined style={iconStyle} href="https://twitter.com"/></a>
			<a href="https://www.instagram.com/policyengine/"><InstagramOutlined style={iconStyle}/></a>
		</div>
	);
}