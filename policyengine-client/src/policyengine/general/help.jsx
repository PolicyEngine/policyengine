import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Steps } from "antd";
import { useContext, useState } from "react";
import UKPolicyHelper from "../../images/help/uk/policyHelper.gif";
import UKImpactHelper from "../../images/help/uk/impactHelper.gif";
import UKHouseholdHelper from "../../images/help/uk/householdHelper.gif";
import USHouseholdHelper from "../../images/help/us/householdHelper.gif";
import USPolicyHelper from "../../images/help/us/policyHelper.gif";
import { CountryContext } from "../../countries";

const { Step } = Steps;

export default function HelpButton(props) {
    const country = useContext(CountryContext);
    return country.name === "uk" ?
        <UKHelpButton /> :
        <USHelpButton />;
}

export function UKHelpButton(props) {
    const [helpPaneOpen, setHelpPaneOpen] = useState(false);
    const [currentPane, setCurrentPane] = useState(0);
    return <div className="d-none d-lg-block">
        <div style={{position: "fixed", zIndex: 0, left: 20, bottom: 70}}>
            <QuestionCircleOutlined style={{fontSize: 35, cursor: "pointer"}} onClick={() => {setCurrentPane(0); setHelpPaneOpen(true)}}/>
        </div>
        <Modal visible={helpPaneOpen} centered closable={false} footer={null} width="50%">
            <h4>How to use PolicyEngine</h4>
            <Steps current={currentPane} style={{marginTop: 20}}>
                <Step title="Create a reform" />
                <Step title="See the population impact" />
                <Step title="Enter your household" />
            </Steps>
            <div style={{marginTop: 25}}>
                {currentPane === 0 && <>
                    <img src={UKPolicyHelper} alt="A GIF showing how to build a policy reform as explained by the text below." style={{width: "100%", borderRadius: 10, marginTop: 5, marginBottom: 15}}/>
                    <h6>Use the sliders in the center to change the parameters of benefits, taxes and or new programs (your changes will save as you make them). If you just want to see your taxes and benefits as they are, you can skip straight to the household page.</h6><h6>To see the effect of your reform on the whole country, click onto the impact tab.</h6>
                    <div style={{marginTop: 20}} className="d-flex justify-content-center">
                        <Button style={{marginRight: 10}} type="primary" onClick={() => setCurrentPane(1)}>Show me the reform results</Button>
                        <Button onClick={() => setCurrentPane(2)}>Just show me my household</Button>
                    </div>
                </>}
                {currentPane === 1 && <>
                    <img src={UKImpactHelper} alt="A GIF showing how to read the results of a reform as explained by the text below." style={{width: "100%", borderRadius: 10, marginTop: 5, marginBottom: 15}}/>
                    <h6>PolicyEngine calculates how your reform would affect the budget, poverty and inequality. Hover over the charts for more detail, or click onto the <i>Your household</i> tab to see how you'd be affected. </h6>
                    <div style={{marginTop: 20}} className="d-flex justify-content-center">
                        <Button type="primary" onClick={() => setCurrentPane(2)}>Next</Button>
                    </div>
                </>}
                {currentPane === 2 && <>
                    <img src={UKHouseholdHelper} alt="A GIF showing how to input your household details as explained by the text below." style={{width: "100%", borderRadius: 10, marginTop: 5, marginBottom: 15}}/>
                    <h6>Enter your household details: first, how many adults and children are in your household, and then variables like income by source or assets by type.</h6><h6>When you're done, click the <i>Net income</i> tab at the bottom-left to see how your finances compare, and the <i>How earnings affect you</i> tab to see how your situation would change if you earned more or less.</h6>
                    <div style={{marginTop: 20}} className="d-flex justify-content-center"><Button type="primary" onClick={() => setHelpPaneOpen(false)}>Let me jump in!</Button></div>
                </>}
            </div>
        </Modal>
    </div>
}



export function USHelpButton(props) {
    const [helpPaneOpen, setHelpPaneOpen] = useState(false);
    const [currentPane, setCurrentPane] = useState(0);
    return <div className="d-none d-lg-block">
        <div style={{position: "fixed", zIndex: 0, left: 20, bottom: 70}}>
            <QuestionCircleOutlined style={{fontSize: 35, cursor: "pointer"}} onClick={() => {setCurrentPane(0); setHelpPaneOpen(true)}}/>
        </div>
        <Modal visible={helpPaneOpen} centered closable={false} footer={null} width="50%">
            <h4>How to use PolicyEngine</h4>
            <Steps current={currentPane} style={{marginTop: 20}}>
                <Step title="Enter your household" />
                <Step title="Create a reform" />
            </Steps>
            <div style={{marginTop: 25}}>
                {currentPane === 0 && <>
                    <img src={USHouseholdHelper} alt="A GIF showing how to input household details as explained by the text below." style={{width: "100%", borderRadius: 10, marginTop: 5, marginBottom: 15}}/>
                    <h6>Enter your household details: first, how many adults and children are in your household, and then variables like income by source or assets by type.</h6><h6>When you're done, click the <i>Net income</i> tab at the bottom-left to see your benefits and taxes, and the <i>How earnings affect you</i> tab to see how your situation would change if you earned more or less.</h6>
                    <div style={{marginTop: 20}} className="d-flex justify-content-center">
                        <Button type="primary" style={{marginRight: 10}} onClick={() => setCurrentPane(1)}>Create a reform</Button><Button onClick={() => setHelpPaneOpen(false)}>Let me jump in!</Button>
                    </div>
                </>}
                {currentPane === 1 && <>
                    <img src={USPolicyHelper} alt="A GIF showing how to build a reform as explained by the text below." style={{width: "100%", borderRadius: 10, marginTop: 5, marginBottom: 15}}/>
                    <h6>Create your reform to taxes and benefits by dragging the sliders or manually entering values (your changes will save as you make them). When you're done, click <i>Calculate your net income</i> to see how it'd affect your finances.</h6>
                    <div style={{marginTop: 20}} className="d-flex justify-content-center"><Button type="primary" onClick={() => setHelpPaneOpen(false)}>Let me jump in!</Button></div>
                </>}
            </div>
        </Modal>
    </div>
}