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
        <Col xs={12} md={6}>
            <h3 style={{ marginBottom: 0 }}>{props.title}</h3>
        </Col>
        <Col xs={12} md={6}>
            <h6 style={{ marginTop: 0 }}>{props.description}</h6>
        </Col>
    </Row>


}

function UsageExplanations(props) {
    return <>
        <UsageBox title="Citizens" description="Check your eligibility for government benefits and programs. Simulate how a change in requirements could affect your household." />
        <UsageBox title="Think tanks" description="Simulate tax-benefit reforms on the UK economy and individual households to better understand and recommend policy changes." />
        <UsageBox title="Parties and campaigns" description="Estimate the economic outcomes of your policy proposals. Produce evidence-based talking points and refute speculative criticism of your platform." />
        <UsageBox title="Developers" description={<>Allow your users to check their benefits eligibility with <a href="https://docs.google.com/document/d/1y-kRDOssYyRwEVTsntqGxoBtvFS4HKMQD-U0Ga9YzJE/preview">our API</a>. <a href="https://github.com/PolicyEngine">Contribute to our work on GitHub.</a></>} />
    </>
}

function LandingPageContent() {
    const in_uk = window.navigator.language === "en-GB";
    const in_us = window.navigator.language === "en-US";
    const outside_uk_us = !in_uk && !in_us;
    const ukIcon = <Col md={6} style={{ marginBottom: 15 }} key={"ukIcon"}>
        <img onClick={() => window.location.href = "/uk/policy"} className="img-fluid" style={{ borderRadius: 35, cursor: "pointer" }} alt="UK" src={UKFadedBlue} />
    </Col>;
    const usIcon = <Col md={6} style={{ marginBottom: 15 }} key={"usIcon"}>
        <img onClick={() => window.location.href = "/us/household"} className="img-fluid" style={{ borderRadius: 35, cursor: "pointer" }} alt="US" src={USFadedBlue} />
    </Col>;
    return <>
        <Row>
            <Col lg={10} style={{ paddingTop: 50 }}>
                <h4><b>PolicyEngine</b> empowers people to understand and change public policy. </h4><br /><h4>Our app lets anyone imagine reforms to the tax and benefit system and see the impact on society and their own household.</h4>
            </Col>
            <Col lg={2}></Col>
        </Row>
        <Subheader><a href={(in_uk ? "/uk/policy" : (in_us ? "/us/household" : "/uk/policy"))}>Use the app→</a></Subheader>
        <Row>
            {
                outside_uk_us ?
                    [ukIcon, usIcon] :
                    in_uk ?
                        [ukIcon, usIcon] :
                        [usIcon, ukIcon]
            }
        </Row>
        <Subheader>Who we help</Subheader>
        <UsageExplanations />
        <Subheader subtitle={<>We're currently seeking funding partners, volunteer developers and policy analysts to expand our work and its impact. Is that you? <a href="mailto:hello@policyengine.org">Get in touch.</a></>}></Subheader>
        <Subheader>Blog</Subheader>
        <MediumFeed />
        <Footer />
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