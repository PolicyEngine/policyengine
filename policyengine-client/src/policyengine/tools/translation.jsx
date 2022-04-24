/*
 * Helper functions to translate to and from OpenFisca metadata to
 * PolicyEngine descriptions and units
 */

import moment from "moment";

export function getTranslators(parameter) {
	let period = parameter.period || parameter.definitionPeriod;
	if(parameter.quantityType === "stock") {
		period = null;
	}
	const CURRENCY_SYMBOLS = {
		"currency-GBP": "£",
		"currency-USD": "$",
	}
	let result;
	let minMax = 1;
	if (parameter.unit === "/1") {
		result = {
			formatter: value => `${parseFloat((value * 100).toFixed(2))}%`,
		}
	} else if (parameter.unit === "year") {
		result = {
			formatter: value => value + " year" + (value !== 1 ? "s" : ""),
		}
		minMax = 100;
	} else if (parameter.unit === "tonne CO2") {
		result = {
			formatter: value => `${value} tonnes CO2`,
		}
		minMax = 100;
	} else if (parameter.valueType === "bool") {
		result = {
			formatter: value => value ? "true" : "false",
		}
	}  else if (parameter.unit === "hour") {
		result = {
			formatter: value => `${value} hour${value !== 1 ? "s" : ""}`,
		}
		minMax = 80;
	} else if (Object.keys(CURRENCY_SYMBOLS).includes(parameter.unit)) {
		for(let currency in CURRENCY_SYMBOLS) {
			if(parameter.unit === currency) {
				const round = value => parseFloat(Number(Math.abs(Math.round(value * (10 ** (parameter.precision || 2))) / (10 ** (parameter.precision || 2)))));
				result = {
					formatter: (value, noPeriod) => `${value < 0 ? "- " : ""}${CURRENCY_SYMBOLS[currency]}${round(value).toLocaleString(undefined, {maximumFractionDigits: parameter.precision})}${period && !noPeriod ? ("/" + period) : ""}`,
				}
				minMax = {year: 100_000, month: 1000, week: 100, null: 100}[period];
			}
		}
	} else if(parameter.valueType === "date") {
		const dateIntToMoment = value => moment(value.toString().slice(0, 4) + "-" + value.toString().slice(4, 6) + "-" + value.toString().slice(6, 8), "YYYY-MM-DD");
		result = {
			formatter: value => dateIntToMoment(value).format("LL"),
			parser: dateIntToMoment,
		}
	} else {
		result = {
			formatter: value => +value,
			parser: value => +value,
		}
	}
	return {
		formatter: result.formatter,
		parser: result.parser,
		min: 0,
		max: Math.max(parameter.max || minMax, Math.pow(10, Math.ceil(Math.log10(Math.max(parameter.defaultValue, parameter.value))))),
	}
}