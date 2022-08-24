import React from "react";
import SocialLinks from "./policyengine/header/socialLinks";


export default function FOF() {
    return (
        <>
        <p style={{ marginTop: 180, fontSize: "2em", textAlign: "center" }}>This page does not exist, please navigate home.</p>
        <div style={{
        position: "fixed",
        height: "4.2em",
        width: "100%",
        bottom: 0,
        backgroundColor: "white",
        borderTop: "1px solid",
        borderColor: "#EEE",
        paddingTop: 20,
        paddingBottom: 20
        }}>
            <SocialLinks color={"black"}/>
        </div>
        </>
    )
}