import React from "react";
import { PolicyEngineWrapper } from "./policyengine/layout/general";
import { Row, Col, Container } from "react-bootstrap";
import { Button, Card, Divider as DefaultDivider } from "antd";

import { Footer } from "./policyengine/footer";
import { Header } from "./policyengine/header";

const blogPosts = [
    {
        title: "Make Everyone a Policymaker",
        thumbnail: "https://miro.medium.com/max/1400/1*sKPTtD2QzO5FZQNdyRP-YQ.png",
        link: "https://blog.policyengine.org/make-everyone-a-policymaker-dc7b00bdb143?source=collection_home---------6----------------------------",
    },
    {
        title: "Analysing Autumn Budget Universal Credit reforms with PolicyEngine",
        thumbnail: "https://miro.medium.com/max/1400/1*JonMF3ME_ufSYKC7aZFXGw.jpeg",
        link: "https://blog.policyengine.org/analysing-autumn-budget-universal-credit-reforms-with-policyengine-2ce93f177428?source=collection_home---------5----------------------------",
    },
    {
        title: "Income Tax cuts Rishi Sunak is reportedly considering",
        thumbnail: "https://miro.medium.com/max/1280/1*CXzE044rk2ZMpobYa7stoQ.png",
        link: "https://blog.policyengine.org/income-tax-cuts-rishi-sunak-is-reportedly-considering-9d75eb529262?source=collection_home---------4----------------------------",
    },
    {
        title: "PolicyEngine’s 2021 year in review",
        thumbnail: "https://miro.medium.com/max/1400/1*ExOry7bdKhkmUjGedfTR9w.png",
        link: "https://blog.policyengine.org/policyengines-2021-year-in-review-cfb4893ecf2e",
    },
    {
        title: "The Green Party Manifesto at PolicyFest",
        thumbnail: "https://miro.medium.com/max/1400/1*twyGvV3aJeT_RXU5Zg-bIw.jpeg",
        link: "https://blog.policyengine.org/the-green-party-manifesto-at-policyfest-ee05a2d3b06d",
    },
    {
        title: "How machine learning tools make PolicyEngine more accurate",
        thumbnail: "https://miro.medium.com/max/1400/0*lYp59pEkyRJED81P",
        link: "https://blog.policyengine.org/how-machine-learning-tools-make-policyengine-more-accurate-17af859cdd97",
    },
    {
        title: "PolicyEngine arrives stateside",
        thumbnail: "https://miro.medium.com/max/1400/0*h_n21_ZMZ2S66FDL.png",
        link: "https://blog.policyengine.org/policyengine-comes-stateside-cef88b122e48",
    }
].reverse();

function Divider(props) {
    return <DefaultDivider {...props} style={{ marginTop: 25, marginBottom: 25 }} />
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

    return <Row style={{ marginTop: 15, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 0 }}>{props.title}</h3>
        <br /><br />
        <h5 style={{ marginTop: 0 }}>{props.description}</h5>
    </Row>


}

function UsageExplanations(props) {
    return <>
        <UsageBox title="The public" description="Estimate your taxes and government benefits, under current law and potential policy changes" />
        <UsageBox title="Policy organizations" description="Design reforms and calculate the impacts on society and individual households" />
        <UsageBox title="Developers" description={<>Allow your users to check their benefits eligibility with <a href="https://docs.google.com/document/d/1y-kRDOssYyRwEVTsntqGxoBtvFS4HKMQD-U0Ga9YzJE/preview">our API</a>, and contribute to our work <a href="https://github.com/PolicyEngine">on GitHub</a></>} />
    </>
}

function LandingPageContent() {
    const inUs = window.navigator.language === "en-US";
    const ukLink = "uk/policy"
    const usLink = "us/household"

    return <>
        <center>
            <Row style={{ marginTop: 30 }}>
                <h1>Compute the impact of public policy</h1>
                <h4 style={{ marginTop: 10 }}>Estimate your taxes and benefits</h4>
                <h4 style={{ marginTop: 5 }}>Imagine custom economic policy reforms</h4>
                <h4 style={{ marginTop: 5, marginBottom: 30 }}>Calculate the effects on society and your own household</h4>
            </Row>
            {/* Primary link goes to the US if the user is in the US, otherwise UK. */}
            <Button type="primary" size="large" className="justify-content-center" style={{ fontSize: 30, height: 80, marginTop: 20, marginBottom: 20, display: "flex" }} href={inUs ? usLink : ukLink} block>
                <div style={{ margin: 20 }}><b>Enter PolicyEngine {inUs ? "US" : "UK"}</b></div>
            </Button>
            <Button block size="large" href={inUs ? ukLink : usLink}>
                Enter PolicyEngine {inUs ? "UK" : "US"}
            </Button>
            <Subheader>Who we help</Subheader>
            <UsageExplanations />
            <Subheader subtitle={<>We're currently seeking funding partners, volunteer developers and policy analysts to expand our work and its impact. Is that you? <a href="mailto:hello@policyengine.org">Get in touch.</a></>}></Subheader>
            <Subheader><a href="https://blog.policyengine.org">Blog</a></Subheader>
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
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Fpolicyengine").then(res => res.json()).then(res => {
            if(res.status === "error") {
                this.setState({ feed: { items: blogPosts } });
            } else {
                this.setState({ feed: res });
            }
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