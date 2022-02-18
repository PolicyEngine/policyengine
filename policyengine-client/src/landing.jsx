import React from "react";
import { Header } from "./policyengine/header";
import { PolicyEngineWrapper } from "./policyengine/layout/general";
import { Row, Col, Container } from "react-bootstrap";
import { Card, Divider } from "antd";
import moment from "moment";

import UKFadedBlue from "./images/uk_faded_blue.png";
import USFadedBlue from "./images/us_faded_blue.png";

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

function LandingPageContent() {
    return <>
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
        <Row style={{marginTop: 10, marginBottom: 10}}>
            <h4>Commentary</h4>
            <p>Analyses of policy reforms by the PolicyEngine team.</p>
        </Row>
        <Row>
            <MediumFeed />
        </Row>
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
        //return JSON.stringify(this.state.feed.items.map(item => item.title));
        return this.state.feed.items.map(post => 
            <Col md={3}>
                <Card hoverable style={{marginTop: 10}} bordered={false} cover={
                    <img style={{minHeight: 200, objectFit: "cover"}} alt={post.title + " cover image"} src={post.thumbnail} />
                }
                    onClick={() => window.open(post.link, "_blank")}
                >
                    <h6>{post.title}</h6>
                </Card>
            </Col>
        )
    }
}