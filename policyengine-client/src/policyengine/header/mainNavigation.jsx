/*
 * Components for the main tab-based navigation.
 */

import { Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { policyToURL } from "../tools/url";
import SocialLinks from "./socialLinks";
import Title from "./title";
import { useContext } from "react";
import { CountryContext } from "../../countries";

const { TabPane } = Tabs;

export default function MainNavigation(props) {
  const navigate = useNavigate();
  const country = useContext(CountryContext);
  let middleColumn;
  if (props.title || props.noTabs) {
    middleColumn = (
      <Tabs activeKey={props.title} centered>
        <TabPane tab={props.title} key={props.title} />
      </Tabs>
    );
  } else {
    const onTabClick = (key) => {
      navigate(policyToURL(`/${country.name}/${key}`, country.policy));
    };
    middleColumn = (
      <Tabs
        moreIcon={null}
        style={{ paddingTop: 0, paddingBottom: 0 }}
        activeKey={props.selected}
        centered
        onChange={onTabClick}
      >
        {country.showPolicy && <TabPane tab="Policy" key="policy" />}
        {country.showPopulationImpact && (
          <TabPane tab={"Population impact"} key="population-impact" />
        )}
        {country.showHousehold && (
          <TabPane tab="Your household" key="household" />
        )}
      </Tabs>
    );
  }
  return (
    <div
      style={{
        backgroundColor: "#2c6496",
        position: "fixed",
        top: 0,
        width: "100vw",
      }}
    >
      <Row style={{ margin: 0 }}>
        <Col lg={2}>
          <Title link={props.noTabs && "/"} />
        </Col>
        <Col
          lg={8}
          className="d-flex align-items-center justify-content-center"
          style={{ paddingLeft: 25, paddingRight: 25 }}
        >
          {middleColumn}
        </Col>
        <Col
          lg={2}
          className="d-none d-lg-flex align-items-center justify-content-right"
        >
          <SocialLinks color="black" />
        </Col>
      </Row>
    </div>
  );
}
