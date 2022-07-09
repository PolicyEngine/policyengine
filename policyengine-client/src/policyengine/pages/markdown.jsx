import ReactMarkdown from "react-markdown";
import { Row, Col } from "react-bootstrap";
import { Divider } from "antd";
import React from "react";
import rehypeRaw from "rehype-raw";
import { CountryContext } from "../../countries/country";
import { BodyWrapper } from "../layout/general";
import MainNavigation from "../header/mainNavigation";
import { Footer } from "../footer";

function Header(props) {
  return (
    <>
      <h1>{props.children}</h1>
    </>
  );
}

function Subheader(props) {
  return (
    <>
      <h3 style={{ paddingTop: 30 }}>{props.children}</h3>
      <Divider />
    </>
  );
}

function Subsubheader(props) {
  return (
    <>
      <h5>
        <i>{props.children}</i>
      </h5>
    </>
  );
}

export class MarkdownPage extends React.Component {
  static contextType = CountryContext;
  constructor(props) {
    super(props);
    this.state = { text: props.content };
  }

  render() {
    const components = { h1: Header, h2: Subheader, h3: Subsubheader };
    return (
      <>
        <MainNavigation
          title={
            !["Home", "About", "Contact"].includes(this.props.title) &&
            this.props.title
          }
        />
        <div className="mx-auto max-w-screen-md pt-24 py-16">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
            {this.state.text}
          </ReactMarkdown>
        </div>
        <Footer />
      </>
    );
  }
}

export default MarkdownPage;
