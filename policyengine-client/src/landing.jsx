import React from "react";
import { PolicyEngineWrapper } from "./policyengine/layout/general";
import { Row, Col, Container } from "react-bootstrap";
import { Card, Divider as DefaultDivider } from "antd";

import UKFadedBlue from "./images/uk_faded_blue.png";
import USFadedBlue from "./images/us_faded_blue.png";
import { Footer } from "./policyengine/footer";
import { Header } from "./policyengine/header";


function Divider(props) {
    return <DefaultDivider {...props} style={{ marginTop: 50, marginBottom: 50 }} />
}

export default function LandingPage() {
    return (
        <PolicyEngineWrapper>
            <Header noTabs />
            <Container>
                <LandingPageContent />
            </Container>
        </PolicyEngineWrapper>
    );
}

function Subheader(props) {
    return <><Divider /><Row style={{ marginTop: 10, marginBottom: 10 }}>
        <h2>{props.children}</h2>
        <h6>{props.subtitle}</h6>
    </Row>
    </>
}

function UsageBox(props) {
    // e.g. title = "Citizens", description = "Citizens can use PolicyEngine to do X."

    // Displays the title anchored to the left (and big) and the description anchored to the right (and small)

    return <Row style={{ marginTop: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 0 }}>{props.title}</h3>
        <br /><br />
        <h5 style={{ marginTop: 0 }}>{props.description}</h5>
    </Row>


}

function UsageExplanations(props) {
    return <>
        <UsageBox title="The public" description="Check your eligibility for government benefits and programs. Simulate how a change in requirements could affect your household." />
        <UsageBox title="Think tanks" description="Simulate tax-benefit reforms on the UK economy and individual households to better understand and recommend policy changes." />
        <UsageBox title="Parties and campaigns" description="Estimate the results of your policy proposals. Produce evidence-based talking points and refute speculative criticism of your platform." />
        <UsageBox title="Developers" description={<>Allow your users to check their benefits eligibility with <a href="https://docs.google.com/document/d/1y-kRDOssYyRwEVTsntqGxoBtvFS4HKMQD-U0Ga9YzJE/preview">our API</a>. <a href="https://github.com/PolicyEngine">Contribute to our work on GitHub.</a></>} />
    </>
}

function LandingPageContent() {
    const inUk = window.navigator.language === "en-GB";
    const inUs = window.navigator.language === "en-US";
    const ukLink = "uk/policy"
    const usLink = "us/household"
    const outsideUkUs = !inUk && !inUs;
    const ukIcon = <img onClick={() => window.location.href = ukLink} className="img-fluid" style={{ borderRadius: 35, cursor: "pointer" }} alt="UK" src={UKFadedBlue} />;
    const usIcon = <img onClick={() => window.location.href = usLink} className="img-fluid" style={{ borderRadius: 35, cursor: "pointer" }} alt="US" src={USFadedBlue} />;
    const ukLinkText = <h5><a href={ukLink}>Or enter PolicyEngine UK</a></h5>
    const usLinkText = <h5><a href={usLink}>Or enter PolicyEngine US (beta)</a></h5>
    return <>
        <center>
            <br /><br /><br />
            <Row>
                <h1>Compute the impact of public policy</h1><br /><h4>Estimate your taxes and benefits<br />Imagine reforms to the tax and benefit system<br />Calculate the impact on society and your own household</h4>
            </Row>
            {/* Main link goes to the US if the user is in the US, otherwise UK. */}
            <Subheader><a href={(inUs ? usLink : ukLink)}>Use the free app→</a></Subheader>
            <Row>
                {
                    outsideUkUs ?
                        [ukIcon, usIcon] :
                        inUk ?
                            [ukIcon, usLinkText] :
                            [usIcon, ukLinkText]
                }
            </Row>
            <Subheader>Who we help</Subheader>
            <UsageExplanations />
            <Subheader subtitle={<>We're currently seeking funding partners, volunteer developers and policy analysts to expand our work and its impact. Is that you? <a href="mailto:hello@policyengine.org">Get in touch.</a></>}></Subheader>
            <Subheader>Blog</Subheader>
            <MediumFeed />
            <Footer />
        </center>
    </>
}

class MediumFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            feed: null,
        }
    }

    componentDidMount() {
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Fpolicyengine").then(res => res.json()).then(feed => {
            this.setState({ feed: feed });
        });
    }

    render() {
        if (!this.state.feed) {
            return <></>;
        }
        const items = this.state.feed.items.map(post =>
            <Col md={3} style={{ display: "inline-block" }} key={post.link}>
                <Card hoverable style={{ marginTop: 10 }} bordered={false} cover={
                    <img style={{ minHeight: 200, objectFit: "cover" }} alt={post.title + " cover image"} src={post.thumbnail} />
                }
                    onClick={() => window.open(post.link, "_blank")}
                >
                    <h5>{post.title}</h5>
                </Card>
            </Col>
        )
        return <Row>{items}</Row>
    }
}