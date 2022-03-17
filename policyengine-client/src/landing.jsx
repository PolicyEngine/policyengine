import React from "react";
import { Header } from "./policyengine/header";
import { PolicyEngineWrapper } from "./policyengine/layout/general";
import { Row, Col, Container } from "react-bootstrap";
import { Card, Divider } from "antd";

import UKFadedBlue from "./images/uk_faded_blue.png";
import USFadedBlue from "./images/us_faded_blue.png";
import { Footer } from "./policyengine/footer";

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
    return <><Divider /><Row style={{marginTop: 30, marginBottom: 30}}>
        <h2>{props.children}</h2>
        <h6>{props.subtitle}</h6>
    </Row>
    </>
}

function UsageBox(props) {
    // e.g. title = "Citizens", description = "Citizens can use PolicyEngine to do X."

    // Displays the title anchored to the left (and big) and the description anchored to the right (and small)

    return <Row style={{marginTop: 20, marginBottom: 20}}>
        <Col xs={12} md={6}>
            <h3 style={{marginBottom: 0}}>{props.title}</h3>
        </Col>
        <Col xs={12} md={6}>
            <p style={{marginTop: 0}}>{props.description}</p>
        </Col>
    </Row>


}

function UsageExplanations(props) {
    return <>
        <UsageBox title="For citizens" description="Check your eligibility for government benefits and programs. Simulate how a change in requirements could affect your household." />
        <UsageBox title="For think tanks" description="Simulate tax-benefit reforms on the UK economy and individual households to better understand and recommend policy changes." />
        <UsageBox title="For parties and campaigns" description="Estimate the economic oucomes of your policy proposals. Produce evidence-based talking points and refute speculative criticism of your platform." />
        <UsageBox title="For developers" description="Allow your users to check their benefits eligibility with our API. Contribute to our work on GitHub." />
    </>
}

function LandingPageContent() {
    return <>
        <Row>
            <Col lg={2}></Col>
            <Col lg={8} style={{padding: 50}}>
                <h4><b>PolicyEngine</b> empowers people to understand and change public policy. </h4><br /><h4>Our app lets anyone imagine reforms to the tax and benefit system and see the impact on society and their own household.</h4>
            </Col>
            <Col lg={2}></Col>
        </Row>
        <Subheader>Our projects</Subheader>
        <Row>
            <Col md={6}>
                <Card 
                    style={{marginTop: 10}} 
                    hoverable
                    bordered={false}
                    cover={<img alt="UK" src={UKFadedBlue} />}
                    onClick={() => window.location.href = "/uk"}
                >
                    Explore the impact of tax-benefit reforms on UK households.
                </Card>
            </Col>
            <Col md={6}>
                <Card 
                    style={{marginTop: 10}} 
                    hoverable
                    bordered={false}
                    cover={<img alt="US" src={USFadedBlue} />}
                    onClick={() => window.location.href = "/us"}
                >
                    Explore the impact of tax-benefit reforms on US households.
                </Card>
            </Col>
        </Row>
        <Divider />
        <UsageExplanations />
        <Subheader subtitle="Analyses of policy reforms by the PolicyEngine team.">Commentary</Subheader>
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
        if(!this.state.feed) {
            return <></>;
        }
        const items = this.state.feed.items.map(post => 
            <Col md={3} style={{display: "inline-block"}}>
                <Card hoverable style={{marginTop: 10}} bordered={false} cover={
                    <img style={{minHeight: 200, objectFit: "cover"}} alt={post.title + " cover image"} src={post.thumbnail} />
                }
                    onClick={() => window.open(post.link, "_blank")}
                >
                    <h6>{post.title}</h6>
                </Card>
            </Col>
        )
        return <Row>{items}</Row>
    }
}