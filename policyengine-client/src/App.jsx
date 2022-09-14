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
import { UK, US } from "./countries";
import MarkdownPage from "./policyengine/pages/markdown";
import LandingPage from "./landing";
import FOF from "./fof";

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

  const pages = ["policy", "population-impact", "household"];
  for (let page of pages) {
    for (let country of [uk, us]) {
      for (let url of Object.keys(country.namedPolicies)) {
        if(window.location.href.includes(`/${country.name}/${page}${url}`)) {
          window.history.pushState({}, "", `/${country.name}/${page}?${country.namedPolicies[url]}`);
          return <Router><Route path="/"><Navigate to={`/${country.name}/${page}?${country.namedPolicies[url]}`} /></Route></Router>
        }
      }
    }
  }

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
              <PolicyEngine country="uk" analytics={props.analytics} />
            </>
          }
        />
        <Route
          path="/us/*"
          element={
            <>
              <PolicyEngine country="us" analytics={props.analytics} />
            </>
          }
        />
        <Route
          path="/"
          element={<FOF />}
        />
      </Routes>
    </Router>
  );
}
