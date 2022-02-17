import React from "react";
import { Header } from "./policyengine/header";
import { PolicyEngineWrapper } from "./policyengine/layout/general";
import { Row, Col, Container } from "react-bootstrap";
import { Card } from "antd";
import Parliament from "./images/parliament.jpg";
import moment from "moment";

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
                    title="PolicyEngine UK" 
                    bordered={false}
                    cover={<img alt="UK" src={UK} />}
                >
                    Explore the impact of tax-benefit reforms on UK households.
                </Card>
            </Col>
            <Col md={6}>
                <Card 
                    title="PolicyEngine US" 
                    bordered={false}
                >
                    Explore the impact of tax-benefit reforms on US households.
                </Card>
            </Col>
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
                <Card title={<p>{post.title}</p>} bordered={false} cover={
                    <img src={post.thumbnail} />
                }>
                </Card>
            </Col>
        )
    }
}