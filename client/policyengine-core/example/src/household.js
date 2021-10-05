export const HOUSEHOLD = {
	region: {
		title: "Region",
		description: "The region of the UK that this household resides in.",
		default: "South East",
		value: "South East",
		type: "category",
		options: [
			"South East",
			"London",
			"Scotland",
			"North West",
			"East of England",
			"West Midlands",
			"South West",
			"Yorkshire and the Humber",
			"East Midlands",
			"North East",
		]
	},
	land_value: {
		title: "Land value",
		description: "Total exposure to land value tax.",
		default: 0,
		value: 0,
		min: 0,
		max: 1000000,
		type: "gbp"
	}
};

export const FAMILY = {
	claims_legacy_benefits: {
		title: "Legacy benefits claimant",
		description: "Whether this family would claim legacy benefits (not UC)",
		default: false,
		value: false,
		type: "bool"
	},
	claims_UC: {
		title: "UC claimant",
		description: "Whether this family would claim Universal Credit",
		default: true,
		value: true,
		type: "bool"
	},
	claims_child_benefit: {
		title: "CB claimant",
		description: "Whether this family would claim the Child Benefit",
		default: true,
		value: true,
		type: "bool"
	},
	claims_PC: {
		title: "PC claimant",
		description: "Whether this family would claim Pension Credit",
		default: true,
		value: true,
		type: "bool"
	},
	claims_HB: {
		title: "HB claimant",
		description: "Whether this family would claim Housing Benefit",
		default: false,
		value: false,
		type: "bool"
	},
	claims_WTC: {
		title: "WTC claimant",
		description: "Whether this family would claim Working Tax Credit",
		default: false,
		value: false,
		type: "bool"
	},
	claims_CTC: {
		title: "CTC claimant",
		description: "Whether this family would claim Child Tax Credit",
		default: false,
		value: false,
		type: "bool"
	}
};

export const ADULT = {
	age: {
		title: "Age",
		description: "The age of the person",
		default: 18,
		value: 18,
		min: 18,
		max: 80
	},
	employment_income: {
		title: "Employment income",
		description: "Income from employment (gross)",
		default: 0,
		value: 0,
		max: 80000,
		type: "yearly"
	},
	pension_income: {
		title: "Pension income",
		description: "Income from pensions (excluding the State Pension)",
		default: 0,
		value: 0,
		max: 150000,
		type: "yearly"
	},
	state_pension: {
		title: "State Pension income",
		description: "Income from the State Pension",
		default: 0,
		value: 0,
		max: 12000,
		type: "yearly"
	},
	savings_interest_income: {
		title: "Savings interest income",
		description: "Income from savings interest (including ISAs)",
		default: 0,
		value: 0,
		max: 5000,
		type: "yearly"
	},
	dividend_income: {
		title: "Dividend income",
		description: "Income from dividends",
		default: 0,
		value: 0,
		max: 5000,
		type: "yearly"
	},
};

export const CHILD = {
	age: {
		title: "Age",
		description: "The age of the person",
		default: 10,
		value: 10,
		min: 0,
		max: 17
	},
	employment_income: {
		title: "Employment income",
		description: "Income from employment (gross)",
		default: 0,
		value: 0,
		max: 80000,
		type: "yearly"
	},
};

export const SITUATION = {
	household: JSON.parse(JSON.stringify(HOUSEHOLD)),
	families: {
		"family_1": {
			...JSON.parse(JSON.stringify(FAMILY)),
		}
	},
	people: {
		"head": JSON.parse(JSON.stringify(ADULT))
	}
};