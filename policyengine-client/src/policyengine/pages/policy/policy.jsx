import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../../countries";
import Menu from "./menu";
import { OverviewHolder, PolicyOverview, SharePolicyLinks } from "./overview";
import Parameter from "./parameter";
import NavigationButton from "../../general/navigationButton";
import { Breadcrumb, Image, Divider, PageHeader, Tooltip } from "antd";
import SponsorshipLogo from "../../../images/logos/partnership_icon.png";
export default class Policy extends React.Component {
  static contextType = CountryContext;

  constructor(props, context) {
    super(props);
    this.state = {
      selected: context.defaultSelectedParameterGroup,
      selectedMobilePage: "Menu",
    };
    this.getParameters = this.getParameters.bind(this);
  }

  getParameters() {
    try {
      let node = this.context.parameterHierarchy;
      for (const item of this.state.selected.split("/").slice(1)) {
        node = node[item];
      }
      return node;
    } catch (e) {
      return [];
    }
  }

  render() {
    const menu = (
      <Menu
        selected={this.state.selected}
        selectParameterGroup={(group) =>
          this.setState({ selected: group, selectedMobilePage: "Edit" })
        }
      />
    );
    const parameterControls = (
      <ParameterControlPane
        parameters={this.getParameters()}
        selected={this.state.selected}
        onBack={() => this.setState({ selectedMobilePage: "Menu" })}
      />
    );
    const overview = (
      <OverviewHolder>
        <PolicyOverview page="policy" />
        <SharePolicyLinks page="policy" />
        <div className="d-block align-middle">
          <div className="justify-content-center">
            {this.context.showPopulationImpact && (
              <NavigationButton
                primary
                target="population-impact"
                text={`Compute population impact`}
              />
            )}
          </div>
          <div className="justify-content-center">
            {this.context.showHousehold && (
              <NavigationButton
                target="household"
                text="Compute household impact"
                primary={!this.context.showPopulationImpact}
              />
            )}
          </div>
        </div>
      </OverviewHolder>
    );
    const desktopView = (
      <Row>
        <Col
          xl={3}
          style={{
            height: "calc(100vh - 100px)",
            overflowY: "scroll",
          }}
        >
          {menu}
        </Col>
        <Col
          xl={6}
          style={{
            height: "calc(100vh - 150px)",
            overflow: "scroll",
            paddingRight: 40,
          }}
        >
          {parameterControls}
        </Col>
        <Col 
          xl={3} 
          style={{
            position: "relative",
            top: -2,
            padding: 0,
          }}
        >
          {overview}
        </Col>
      </Row>
    );
    const mobileView = (
      <div style={{ paddingLeft: 15, paddingRight: 15 }}>
        <Row style={{ height: "40vh", marginBottom: 5, overflowY: "scroll" }}>
          <Col>
            {this.state.selectedMobilePage === "Menu"
              ? menu
              : this.state.selectedMobilePage === "Edit"
                ? parameterControls
                : overview}
          </Col>
        </Row>
        <Divider></Divider>
        <Row style={{ backgroundColor: "#fafafa", paddingBottom: 50 }}>
          <Col style={{marginBottom: 15, textAlign: "center"}}>
            <PolicyOverview page="policy" pageSize={1} />
          </Col>
          <NavigationButton 
            text={`Compute population impact`}
            target="population-impact"
            primary
          />
          <NavigationButton
            text={`Compute household impact`}
            target="household"
          />
        </Row>
      </div>
    );
    return (
      <>
        <div className="d-none d-lg-block">{desktopView}</div>
        <div className="d-block d-lg-none">{mobileView}</div>
      </>
    );
  }
}

function ParameterControlPane(props) {
  const country = useContext(CountryContext);
  let parameterControls = [];
  for (let parameter of props.parameters) {
    if (parameter in (country.parameterComponentOverrides || {})) {
      parameterControls.push(
        React.cloneElement(country.parameterComponentOverrides[parameter], {
          key: parameter,
          name: parameter,
        })
      );
    } else {
      parameterControls.push(<Parameter key={parameter} name={parameter} />);
    }
  }
  const selectedTree = props.selected.split("/");
  const selectedName = selectedTree.slice(-1)[0];
  const breadcrumbs = (
    <Breadcrumb>
      {selectedTree.map((item, index) => {
        return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>;
      })}
    </Breadcrumb>
  );
  let cgoCredit = <Tooltip
    trigger="click"
    title={<div style={{ padding: 10, paddingBottom: 0 }} ><p style={{ textAlign: "center", maxWidth: 200, color: "black" }}>State tax policies sponsored by <a href="https://thecgo.org">the Center for Growth and Opportunity</a></p></div>}
    color="white"
  >
    <h6 style={{ float: "right", color: "grey" }} className="ant-breadcrumb-link">
      <Image preview={false} src={SponsorshipLogo} height={20} width={25} style={{ display: "inline", paddingLeft: 5 }} />
    </h6>
  </Tooltip>
  cgoCredit = selectedTree[1] === "State governments" ?
    cgoCredit :
    null;
  return (
    <>
      <div className="d-block d-lg-none">
        <PageHeader
          onBack={props.onBack}
          title={<h5>{selectedName}</h5>}
          breadcrumb={breadcrumbs}
        />
        <div style={{ marginTop: -55, marginBottom: 30, paddingRight: 30, paddingBottom: 10 }}>{cgoCredit}</div>
      </div>
      <div className="d-none d-lg-block">
        <PageHeader breadcrumb={breadcrumbs} />
        <div style={{ marginTop: -38, marginBottom: 30, paddingRight: 30 }}>{cgoCredit}</div>
      </div>
      {parameterControls}
    </>
  );
}
