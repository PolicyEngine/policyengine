import { Input, Pagination, Statistic, Tag } from "antd";
import React, { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { CountryContext } from "../../countries";
import fuzzysort from "fuzzysort";
import { getTranslators } from "../tools/translation";

export default function LegislationExplorer(props) {
    const country = useContext(CountryContext);
    // Add country.parameters to country.variables, but adding a type: "parameter"/"variable" attribute to each.
    let items = [];
    for (let variable of Object.keys(country.variables)) {
        items.push({...country.variables[variable], type: "variable"});
    }
    for (let parameter of Object.keys(country.parameters)) {
        items.push({...country.parameters[parameter], type: "parameter"});
    }
    let itemLookup = {};
    for (let item of items) {
        itemLookup[item.name] = item;
    }
    // /legislation/name should select name

    const regex = new RegExp("/legislation/([^/\\?]*)(\\?)*", "gm")
    const str = document.location.pathname;
    const match = regex.exec(str);
    let defaultSearch = match ? match[1] : null;
    let defaultSelected = defaultSearch;

    // get query parameter from url, e.g. /legislation?q=term
    const { searchParams } = new URL(document.location);
    defaultSearch = searchParams.get("q") ? searchParams.get("q") : defaultSearch;
    const defaultList = !defaultSearch ?
        items.map(x => {return {score: x.name, target: x.name}}) :
        fuzzysort.go(defaultSearch.replace(" ", "_"), items.map(x => x.name));

    const [searchResults, setSearchResults] = useState(defaultList);
    const onSearch = term => setSearchResults(term === "" ? defaultList : fuzzysort.go(term.replace(" ", "_"), items.map(x => x.name)));
    const [selected, setSelected] = useState(defaultSelected);
    const searchResultItems = searchResults.sort(res => -res.score).map(res => itemLookup[res.target]).map(res => <Parameter key={res.name} selected={selected} select={() => setSelected(res.name)} {...res} />);
    const itemsPerPage = 7;
    const [page, setPage] = useState(0);
    return <>
        <Row>
            <Col md={1}></Col>
            <Col md={6}>
                <Input defaultValue={defaultSearch} onChange={e => onSearch(e.target.value)} style={{marginTop: 30, marginBottom: 30, width: "100%"}} />
            </Col>
            <Col md={5}></Col>
        </Row>
        <Row>
            <Col md={1}></Col>
            <Col md={6}>
                {searchResultItems.slice(page * itemsPerPage, (page + 1) * itemsPerPage)}
                <div style={{marginTop: 15}} className="d-flex justify-content-center">
                    <Pagination defaultCurrent={1} total={Math.ceil(searchResultItems.length / itemsPerPage)} onChange={(page) => setPage(page - 1)} showSizeChanger={false}/>
                </div>
            </Col>
            <Col md={4}>
                {<SelectedParameter {...itemLookup[selected]} />}
            </Col>
            <Col md={1}></Col>
        </Row>
    </>
}

function Parameter(props) {
    let styleAdditions = props.selected === props.name ? 
        {
            backgroundColor: "lightgrey"
        } :
        {}
    return <div onClick={props.select} style={{cursor: "pointer", margin: 5, padding: 5, paddingLeft: 25, borderRadius: 40, ...styleAdditions}}>
        <h4 style={{fontSize: 20}}><Tag style={{marginTop: 0}}>{props.type === "parameter" ? "Parameter" : "Variable"}</Tag>{props.name}</h4>
        <h6>{props.label}</h6>
    </div>
}

function SelectedParameter(props) {
    const country = useContext(CountryContext);
    if(!props.name) {
        return <></>;
    }
    let description;
    const { formatter } = getTranslators(props);
    if(props.type === "parameter") {
        const references = Object.keys(props.reference);
        description = <>
            {props.description ? <p>{props.description}</p> : null}
            <p>This <b>parameter</b> refers to the parameter node found at <b>{props.parameter}</b> in the OpenFisca-{country.properName} parameter tree.</p>
            <Statistic title="Current value" value={formatter(props.value)} />
            <h6 style={{paddingTop: 5}}>References</h6>
            {
                references.length > 0 ?
                    references.map(name => <p><a href={props.reference[name]}>{name}</a></p>) :
                    <p>This parameter has no references.</p>
            }
        </>
    } else {
        const entity = props.entity;
        // Metadata: defaultValue, definitionPeriod, entity, unit, valueType
        const references = Object.keys(props.reference);
        description = <>
            {props.description ? <p>{props.description}</p> : null}
            <p>This <b>variable</b> applies to <b>{country.entities[entity].label}s</b> for a given <b>{props.definitionPeriod}</b>.</p>
            <p style={{color: "gray"}}>Default value: {formatter(props.defaultValue)}</p>
            <h6 style={{paddingTop: 5}}>References</h6>
            {
                references.length > 0 ?
                    references.map(name => <p><a href={props.reference[name]}>{name}</a></p>) :
                    <p>This parameter has no references.</p>
            }
        </>
    }
    return <div style={{margin: 20}}>
        <h4>{props.name}</h4>
        <h3>{props.label}</h3>
        {description}
    </div>
}