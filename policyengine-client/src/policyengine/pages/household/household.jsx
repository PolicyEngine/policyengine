import React from "react";
import { Row, Col } from "react-bootstrap";
import { CountryContext } from "../../../countries";
import Menu from "./menu";
import { VariableControlPane } from "./inputPane";
import AccountingTable from "./accountingTable";
import EarningsChartsPane from "./earningsCharts";
import { OverviewHolder, PolicyOverview, SharePolicyLinks } from "../policy/overview";
import NavigationButton from "../../general/navigationButton";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Breadcrumb, Divider, PageHeader } from "antd";

export class Household extends React.Component {
    static contextType = CountryContext;
    constructor(props, context) {
        super(props);
        this.state = {
            selected: context.defaultSelectedVariableGroup,
            selectedMobilePage: "Menu",
        }
    }

    getVariables() {
        try {
            const parts = this.state.selected.split("/").slice(1);
            let node = this.context.inputVariableHierarchy;
            for (const item of parts) {
                try {
                    node = node[item];
                } catch (e) {
                    node = this.context.outputVariableHierarchy[item];
                }
            }
            return node;
        } catch (e) {
            return [];
        }
    }
    render() {
        const parts = this.state.selected.split("/").slice(1);
        const inputSelected = Object.keys(this.context.inputVariableHierarchy).includes(parts[0]);
        let middlePane;
        if (inputSelected) {
            middlePane = <VariableControlPane
                selected={this.state.selected}
                variables={this.getVariables()}
            />;
        } else if (this.state.selected === "Your net income") {
            middlePane = <AccountingTable />;
        } else if (this.state.selected === "How earnings affect you") {
            middlePane = <EarningsChartsPane />;
        }
        let navigateBack = () => this.setState({ selectedMobilePage: "Menu" });
        const selectedTree = this.state.selected.split("/");
        const selectedName = selectedTree.slice(-1)[0];
        const breadcrumbs = <Breadcrumb>
            {
                selectedTree.map((item, index) => {
                    return <Breadcrumb.Item key={index}>
                        {item}
                    </Breadcrumb.Item>
                })
            }
        </Breadcrumb>
        middlePane = <>
            <div className="d-block d-lg-none">
                <PageHeader
                    onBack={navigateBack}
                    title={<h5>{selectedName}</h5>}
                    breadcrumb={breadcrumbs}
                />
            </div>
            <div className="d-none d-lg-block">
                <PageHeader
                    breadcrumb={breadcrumbs}
                />
            </div>
            {middlePane}
        </>;
        const menu = <Menu selectVariableGroup={group => this.setState({ selected: group, selectedMobilePage: "Edit" })} />;
        const overview = <OverviewHolder>
            <PolicyOverview />
            <SharePolicyLinks page="household" />
            <div className="d-block align-middle">
                <div className="justify-content-center">
                    <NavigationButton
                        text="Compute your net income"
                        onClick={() => this.setState({ selected: "Your net income" })}
                        primary
                    />
                    <NavigationButton
                        text="Compute how earnings affect you"
                        onClick={() => this.setState({ selected: "How earnings affect you" })}
                    />
                </div>
                <div className="justify-content-center">
                    <NavigationButton
                        target="policy"
                        text={<><ArrowLeftOutlined /> Edit your policy</>}
                    />
                </div>
                <div className="justify-content-center">
                    {this.context.showPopulationImpact && <NavigationButton
                        target="population-impact"
                        text={<><ArrowLeftOutlined /> Return to population impact</>}
                    />}
                </div>
            </div>
        </OverviewHolder>;

        const desktopView = <Row>
            <Col xl={3} style={{
                height: "calc(100vh - 100px)",
                overflowY: "scroll",
            }}>
                {menu}
            </Col>
            <Col xl={6} style={{
                height: "calc(100vh - 100px)",
                overflow: "scroll",
                paddingRight: 40,
            }}>
                {middlePane}
            </Col>
            <Col xl={3} style={{
                position: "relative",
                top: -2,
                padding: 0,
            }}>
                {overview}
            </Col>
        </Row>;
        const mobileView = <div style={{ paddingLeft: 15, paddingRight: 15 }}>
            <Row style={{ height: "40vh", marginBottom: 5, overflowY: "scroll" }}>
                <Col>
                    {
                        this.state.selectedMobilePage === "Menu" ?
                            menu :
                            this.state.selectedMobilePage === "Edit" ?
                                middlePane :
                                overview
                    }
                </Col>
            </Row>
            <Row style={{ height: "20vh" }}>
                <Col>
                    <Divider>Your policy</Divider>
                    <PolicyOverview page="policy" pageSize={1} />
                </Col>
            </Row>
            <div style={{ position: "fixed", top: "calc(60vh + 120px)", left: 0, width: "100%", padding: 10 }}>
                <Row>
                    <Col>
                        <NavigationButton
                            text="Compute your net income"
                            onClick={() => this.setState({ selected: "Your net income", selectedMobilePage: "Edit" })}
                            primary
                        />
                    </Col>
                    <Col>
                        <NavigationButton
                            text="Compute how earnings affect you"
                            onClick={() => this.setState({ selected: "How earnings affect you", selectedMobilePage: "Edit" })}
                        />
                    </Col>
                </Row>
            </div>
        </div>
        return <>
            <div className="d-none d-lg-block">
                {desktopView}
            </div>
            <div className="d-block d-lg-none">
                {mobileView}
            </div>
        </>
    }
}