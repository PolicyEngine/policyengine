/*
 * This file contains the top-level logic: directing as per the URL
 * up to the /country page.
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PolicyEngine from "./policyengine/policyengine";
import createRedirects from "./policyengine/tools/namedPolicies";
import { UK, US } from "./countries";
import MarkdownPage from "./policyengine/pages/markdown";
import LandingPage from "./landing";
import { Header } from "./policyengine/header";


// Markdown files

import { html as UK_FAQ } from "./markdown/uk/faq.md";
import { html as ABOUT } from "./markdown/about.md";
import { html as CONTACT } from "./markdown/contact.md";
// Import other markdown files here

const markdownPages = [
  { content: UK_FAQ, path: "/uk/faq", title: "FAQ" },
  { content: ABOUT, path: "/about", title: "About" },
  { content: CONTACT, path: "/contact", title: "Contact" },
  // Add other pages here
];

export default function App(props) {
  // Redirect http to https
  if (
    !window.location.hostname.includes("localhost") &&
    window.location.protocol !== "https:"
  ) {
    window.location.href =
      "https:" +
      window.location.href.substring(window.location.protocol.length);
  }
  const uk = new UK();
  const us = new US();

  return (
    <Router>
      <Routes>
        {markdownPages.map((page) => (
          <Route
            key={page.path}
            exact
            path={page.path}
            element={
              <MarkdownPage
                title={page.title}
                content={page.content}
                path={page.path}
              />
            }
          />
        ))}
        <Route exact path="/" element={<LandingPage />} />
        <Route exact path="/uk" element={<Navigate to="/uk/policy" />} />
        <Route exact path="/us" element={<Navigate to="/us/policy" />} />
        <Route
          path="/uk/*"
          element={
            <>
              <Routes>{createRedirects(uk.namedPolicies, "uk")}</Routes>
              <PolicyEngine country="uk" analytics={props.analytics} />
            </>
          }
        />
        <Route
          path="/us/*"
          element={
            <>
              <Routes>{createRedirects(us.namedPolicies, "us")}</Routes>
              <PolicyEngine country="us" analytics={props.analytics} />
            </>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <Header noTabs />
              <p>This page does not exist, please navigate home.</p>
            </>
          }
        />
      </Routes>
    </Router>
  );
}
