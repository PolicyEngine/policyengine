/*
 * Parameters for the UK app.
 */

import UBICenterLogo from "../../images/parameter-icons/ubi-center.png";
import UKGovernmentLogo from "../../images/parameter-icons/uk/uk.webp";
import ThirdPartyLogo from "../../images/parameter-icons/third-party.png";
import GreenPartyLogo from "../../images/parameter-icons/uk/third-party/green-party.png";
import SMFLogo from "../../images/parameter-icons/uk/third-party/smf.png";
import MiscLogo from "../../images/parameter-icons/misc.webp";
import SimulationLogo from "../../images/parameter-icons/simulation.webp";
import Country from "../country";
import AutoUBI from "./components/autoUBI";
import ExtraBand from "./components/extraBand";
import TimeTravel from "./components/timeTravel";
import CountrySpecific from "./components/countrySpecific";

const childNamer = {
  1: "Your first child",
  2: "Your second child",
  3: "Your third child",
  4: "Your fourth child",
  5: "Your fifth child",
};

function validatePolicy(policy, defaultPolicy) {
  if (defaultPolicy) {
    for (let parameter in policy) {
      if (policy[parameter].baselineValue === undefined) {
        policy[parameter].baselineValue = defaultPolicy[parameter].value;
      }
    }
  }
  if (policy.higher_threshold.value === policy.add_threshold.value) {
    policy.higher_threshold.error =
      "The higher rate threshold must be different than the additional rate threshold.";
    policy.add_threshold.error =
      "The additional rate threshold must be different than the higher rate threshold.";
    return { policy: policy, policyValid: false };
  } else {
    policy.higher_threshold.error = null;
    policy.add_threshold.error = null;
  }
  return { policy: policy, policyValid: true };
}

export class UK extends Country {
  constructor() {
    super();
    this.baseApiUrl = !this.useLocalServer
      ? this.usePolicyEngineOrgServer
        ? "https://policyengine.org/"
        : `${window.location.protocol}//${window.location.hostname}`
      : `http://127.0.0.1:5000`;
    this.apiURL = `${this.baseApiUrl}/${this.name}/api`;
  }
  apiURL = null;
  name = "uk";
  properName = "UK";
  beta = false;
  // Pages to show
  showPolicy = true;
  showPopulationImpact = true;
  showHousehold = true;
  showEarningsVariation = true;
  showWealth = true;
  showFAQ = true;
  // Vanity URLs
  namedPolicies = {
    "/ubilabs/resilience-ubi":
      "WA_adult_UBI_age=16&adult_UBI=184&child_UBI=92&senior_UBI=184&abolish_CB=1&abolish_CTC=1&abolish_ESA_income=1&abolish_IS=1&abolish_JSA_income=1&abolish_PC=1&abolish_SP=1&abolish_UC_carer=1&abolish_UC_child=1&abolish_UC_childcare=1&abolish_UC_standard=1&abolish_WTC=1&personal_allowance=0&higher_threshold=50000&add_rate=60&basic_rate=35&higher_rate=55&NI_add_rate=10&NI_class_4_add_rate=10&NI_class_4_main_rate=10&NI_main_rate=10",
    "/ubilabs/covid-dividend":
      "child_UBI=46&adult_UBI=92&senior_UBI=46&WA_adult_UBI_age=16",
    "/government/uc-budget-2021":
      "policy_date=20211030&UC_reduction_rate=55&UC_work_allowance_without_housing=557&UC_work_allowance_with_housing=335",
    "/green-party/manifesto-2019":
      "higher_threshold=50270&household_lvt=1_2&UC_reduction_rate=40&WA_adult_UBI_age=16&abolish_CB=1&abolish_CT=1&abolish_CTC=1&abolish_ESA_income=1&abolish_JSA_income=1&abolish_NI=1&abolish_PC=1&abolish_SP=1&abolish_WTC=1&abolish_lbtt=1&abolish_ltt=1&abolish_sdlt=1&add_rate=47&adult_UBI=94&basic_rate=32&carbon_tax=135&child_UBI=75&higher_rate=42&personal_allowance=0&scottish_basic_rate=32&scottish_higher_rate=42&scottish_intermediate_rate=32&scottish_starter_rate=32&senior_UBI=185&SPS_amount=25&SPS_reduction_rate=10&abolish_IS=1&abolish_UC_child=1&corporate_lvt=1_9&abolish_business_rates=1&abolish_UC_standard=1&UC_disabled_element=400&UC_lcwra_element=500&UC_severely_disabled_element=600",
  };

  parameterRenames = {
    adult_UBI: "adult_bi",
    child_UBI: "child_bi",
    senior_UBI: "senior_bi",
    WA_adult_UBI_age: "bi_adult_age",
  };

  // Policy page metadata
  extraParameterMetadata = {
    ebr_ct_rebate: {
      max: 500,
    },
    ebr_energy_bills_credit: {
      max: 500,
    },
    fuel_duty_rate: {
      min: 0,
      max: 1,
      precision: 4,
    },
    tv_licence_fee: {
      max: 250,
    },
    ofgem_price_cap_2022_q4: {
      max: 10_000,
    },
    ofgem_price_cap_2023_q1: {
      max: 10_000,
    },
    ofgem_price_cap_2023_q2: {
      max: 10_000,
    },
    ofgem_price_cap_2023_q3: {
      max: 10_000,
    },
  };
  parameterHierarchy = {
    Simulation: {
      Snapshot: ["timeTravel"],
      Geography: ["countrySpecific"],
    },
    "UK government": {
      HMRC: {
        "Income Tax": {
          "Labour income": [
            "basic_rate",
            "higher_rate",
            "higher_threshold",
            "add_rate",
            "add_threshold",
            "extra_UK_band",
          ],
          "Dividend income": [
            "gov_hmrc_income_tax_rates_dividends",
          ],
          "Scottish rates": [
            "scottish_starter_rate",
            "scottish_basic_rate",
            "scottish_basic_threshold",
            "scottish_intermediate_rate",
            "scottish_intermediate_threshold",
            "scottish_higher_rate",
            "scottish_higher_threshold",
            "scottish_additional_rate",
            "scottish_add_threshold",
            "extra_scot_band",
          ],
          Allowances: {
            "Personal allowance": [
              "personal_allowance",
              "PA_reduction_threshold",
              "PA_reduction_rate",
            ],
            "Marriage allowance": [
              "marriage_allowance_cap",
              "abolish_marriage_allowance_income_condition",
            ],
            "Other allowances": [
              "dividend_allowance",
              "property_allowance",
              "trading_allowance",
            ],
          },
          Structural: ["abolish_income_tax"],
        },
        "National Insurance": {
          Employee: ["NI_main_rate", "NI_PT", "NI_add_rate", "NI_UEL"],
          "Self-employed": [
            "NI_LPL",
            "NI_class_4_main_rate",
            "NI_UPL",
            "NI_class_4_add_rate",
          ],
          Structural: ["abolish_NI"],
        },
        "Property taxes": [
          "abolish_CT",
          "abolish_sdlt",
          "abolish_ltt",
          "abolish_lbtt",
          "abolish_business_rates",
        ],
        "Child Benefit": [
          "abolish_CB",
          "CB_eldest",
          "CB_additional",
          "CB_HITC_reduction_threshold",
          "CB_HITC_reduction_rate",
        ],
        "Fuel duties": ["fuel_duty_rate"],
      },
      DCMS: {
        "TV licence": {
          "Fee": ["tv_licence_fee"],
          "Discounts": [
            "tv_licence_aged_discount",
            "tv_licence_aged_min_age",
            "tv_licence_aged_must_claim_pc",
          ],
          "Evasion": ["tv_licence_evasion_rate"],
        }
      },
      DWP: {
        "Legacy benefits": [
          "abolish_CTC",
          "abolish_WTC",
          "abolish_HB",
          "abolish_IS",
          "abolish_JSA_income",
          "abolish_ESA_income",
        ],
        "State Pension": ["abolish_SP", "abolish_PC"],
        "Universal Credit": {
          Structural: ["abolish_UC"],
          Elements: {
            "Standard allowance": [
              "abolish_UC_standard",
              "UC_single_young",
              "UC_single_old",
              "UC_couple_young",
              "UC_couple_old",
            ],
            Child: [
              "abolish_UC_child",
              "UC_first_child_element",
              "UC_child_element",
              "UC_child_limit",
              "UC_disabled_element",
              "UC_severely_disabled_element",
            ],
            Disability: ["abolish_UC_disability", "UC_lcwra_element"],
            Housing: ["abolish_UC_housing_costs", "UC_non_dep_deduction"],
            Care: ["abolish_UC_carer", "UC_carer_element"],
            Childcare: ["abolish_UC_childcare", "UC_childcare_coverage_rate"],
          },
          "Means test": [
            "UC_work_allowance_without_housing",
            "UC_work_allowance_with_housing",
            "UC_reduction_rate",
          ],
        },
      },
      Treasury: {
        "Energy bills support": ["ebr_ct_rebate", "ebr_energy_bills_credit"],
        "Cost-of-living support payment": [
          "col_benefit_payment_amount",
          "col_pensioner_payment_amount",
          "col_disability_payment_amount",
        ],
        "Energy price cap subsidy": [
          "ofgem_price_cap_2022_q4",
          "ofgem_price_cap_2023_q1",
          "ofgem_price_cap_2023_q2",
          "ofgem_price_cap_2023_q3",
        ]
      },
    },
    "Third party": {
      "UBI Center": {
        "Basic Income": [
          "child_bi",
          "adult_bi",
          "senior_bi",
          "bi_adult_age",
          "include_bi_in_taxable_income",
          "include_bi_in_means_tests",
          "bi_withdraw_cb",
          "bi_phase_out_threshold",
          "bi_phase_out_rate",
          "autoUBI",
        ],
        "Land Value Tax": ["LVT", "household_lvt", "corporate_lvt"],
        "Carbon Tax": ["carbon_tax", "carbon_tax_consumer_incidence"],
      },
      "Green Party": {
        "Single pensioner supplement": [
          "SPS_amount",
          "SPS_reduction_threshold",
          "SPS_reduction_rate",
          "SPS_takeup_rate",
        ],
      },
      "Social Market Foundation": {
        "Cash payments": [
          "benefit_based_cash_payment",
          "tax_bracket_based_cash_payment",
        ],
      },
    },
    Miscellaneous: {
      "Tax ": [
        "exempt_seniors_from_PA_reforms",
        "contrib_ubi_center_exempt_pensioners_from_tax_changes",
      ],
    },
  };
  defaultOpenParameterGroups = [];
  defaultSelectedParameterGroup = "/UK government/HMRC/Income Tax/Labour income";
  organisations = {
    "UBI Center": {
      logo: UBICenterLogo,
    },
    "UK government": {
      logo: UKGovernmentLogo,
    },
    "Third party": {
      logo: ThirdPartyLogo,
    },
    "Green Party": {
      logo: GreenPartyLogo,
    },
    "Social Market Foundation": {
      logo: SMFLogo,
    },
    Miscellaneous: {
      logo: MiscLogo,
    },
    Simulation: {
      logo: SimulationLogo,
    },
  };
  // OpenFisca data
  parameters = null;
  entities = null;
  variables = null;
  // Adjustments to OpenFisca data
  parameterComponentOverrides = {
    autoUBI: <AutoUBI />,
    extra_UK_band: (
      <ExtraBand
        rate_parameter="extra_UK_rate"
        threshold_parameter="extra_UK_threshold"
      />
    ),
    extra_scot_band: (
      <ExtraBand
        rate_parameter="extra_scot_rate"
        threshold_parameter="extra_scot_threshold"
      />
    ),
    timeTravel: <TimeTravel />,
    countrySpecific: <CountrySpecific />,
  };
  extraVariableMetadata = {
    owned_land: { max: 1_000_000 },
    main_residence_value: { max: 1_000_000 },
    other_residential_property_value: { max: 1_000_000 },
    non_residential_property_value: { max: 1_000_000 },
    corporate_wealth: { max: 1_000_000 },
  };
  validatePolicy = validatePolicy;
  situation = {
    people: {
      You: {
        age: { [this.year]: 25 },
      },
    },
    benunits: {
      "Your family": {
        adults: ["You"],
        children: [],
        claims_all_entitled_benefits: { [this.year]: true },
      },
    },
    households: {
      "Your household": {
        adults: ["You"],
        children: [],
        household_owns_tv: { [this.year]: true },
      },
    },
    states: {
      state: {
        citizens: ["You"],
      },
    },
  };
  inputVariables = [
    "age",
    "is_in_startup_period",
    "limited_capability_for_WRA",
    "weekly_hours",
    "employment_income",
    "self_employment_income",
    "pension_income",
    "state_pension",
    "dividend_income",
    "property_income",
    "savings_interest_income",
    "is_married",
    "region",
    "food_and_non_alcoholic_beverages_consumption",
    "alcohol_and_tobacco_consumption",
    "clothing_and_footwear_consumption",
    "housing_water_and_electricity_consumption",
    "household_furnishings_consumption",
    "health_consumption",
    "transport_consumption",
    "communication_consumption",
    "recreation_consumption",
    "education_consumption",
    "restaurants_and_hotels_consumption",
    "miscellaneous_consumption",
    "council_tax",
    "owned_land",
    "main_residence_value",
    "other_residential_property_value",
    "non_residential_property_value",
    "corporate_wealth",
    "rent",
    "claims_legacy_benefits",
    "BRMA",
    "council_tax_band",
    "petrol_spending",
    "diesel_spending",
    "household_owns_tv",
    "would_evade_tv_licence_fee",
  ];
  outputVariables = [
    "household_tax",
    "household_benefits",
    "household_market_income",
    "household_net_income",
    "tax",
    "benefits",
    "market_income",
    "net_income",
    "universal_credit",
    "working_tax_credit",
    "child_tax_credit",
    "housing_benefit",
    "ESA_income",
    "income_support",
    "JSA_income",
    "child_benefit",
    "income_tax",
    "national_insurance",
    "expected_sdlt",
    "expected_ltt",
    "expected_lbtt",
    "business_rates",
    "carbon_tax",
    "LVT",
    "basic_income",
    "single_pensioner_supplement",
    "smf_benefit_cash_payment",
    "smf_tax_cash_payment",
    "tv_licence",
  ];
  inputVariableHierarchy = {
    Household: {
      People: ["setup"],
      Location: ["region", "BRMA", "council_tax_band"],
      Relationships: ["is_married"],
      Benefits: ["claims_legacy_benefits"],
      Taxes: ["would_evade_tv_licence_fee"],
      Consumption: [
        "council_tax",
        "rent",
        "food_and_non_alcoholic_beverages_consumption",
        "alcohol_and_tobacco_consumption",
        "clothing_and_footwear_consumption",
        "housing_water_and_electricity_consumption",
        "household_furnishings_consumption",
        "health_consumption",
        "transport_consumption",
        "communication_consumption",
        "recreation_consumption",
        "education_consumption",
        "restaurants_and_hotels_consumption",
        "miscellaneous_consumption",
      ],
      Assets: [
        "owned_land",
        "main_residence_value",
        "other_residential_property_value",
        "non_residential_property_value",
        "corporate_wealth",
        "household_owns_tv",
      ],
    },
    People: {
      Demographics: [
        "age",
        "is_in_startup_period",
        "limited_capability_for_WRA",
        "weekly_hours",
      ],
      Income: [
        "employment_income",
        "self_employment_income",
        "pension_income",
        "state_pension",
        "dividend_income",
        "property_income",
        "savings_interest_income",
      ],
    },
  };
  defaultOpenVariableGroups = ["/Household", "/People"];
  defaultSelectedVariableGroup = "/Household/People";
  outputVariableHierarchy = {
    household_net_income: {
      add: ["market_income", "household_benefits"],
      subtract: ["household_tax"],
    },
    market_income: {
      add: [
        "employment_income",
        "self_employment_income",
        "pension_income",
        "state_pension",
        "dividend_income",
        "property_income",
        "savings_interest_income",
      ],
    },
    household_benefits: {
      add: [
        "universal_credit",
        "working_tax_credit",
        "child_tax_credit",
        "housing_benefit",
        "ESA_income",
        "income_support",
        "JSA_income",
        "child_benefit",
        "basic_income",
        "single_pensioner_supplement",
        "smf_benefit_cash_payment",
        "smf_tax_cash_payment",
      ],
    },
    household_tax: {
      add: [
        "income_tax",
        "national_insurance",
        "council_tax",
        "expected_sdlt",
        "expected_ltt",
        "expected_lbtt",
        "business_rates",
        "carbon_tax",
        "LVT",
        "tv_licence",
      ],
    },
  };

  householdMaritalOptions = ["Single", "Married"];

  getHouseholdMaritalStatus() {
    return this.getNumAdults() > 1 ? "Married" : "Single";
  }

  setHouseholdMaritalStatus(status) {
    this.setNumAdults(status === "Single" ? 1 : 2);
  }

  addPartner(situation) {
    situation.people["Your spouse"] = {
      age: { [this.year]: 25 },
    };
    situation.benunits["Your family"].adults.push("Your spouse");
    situation.benunits["Your family"]["is_married"][this.year] = true;
    situation.households["Your household"].adults.push("Your spouse");
    return this.validateSituation(situation).situation;
  }

  addChild(situation) {
    const childName =
      childNamer[situation.benunits["Your family"].children.length + 1];
    situation.people[childName] = {
      age: { [this.year]: 10 },
    };
    situation.benunits["Your family"].children.push(childName);
    situation.households["Your household"].children.push(childName);
    return this.validateSituation(situation).situation;
  }

  removePerson(situation, name) {
    for (let benunit of Object.keys(situation.benunits)) {
      if (situation.benunits[benunit].adults.includes(name)) {
        situation.benunits[benunit].adults.pop(name);
      }
      if (situation.benunits[benunit].children.includes(name)) {
        situation.benunits[benunit].children.pop(name);
      }
    }
    if (situation.households["Your household"].adults.includes(name)) {
      situation.households["Your household"].adults.pop(name);
    }
    if (situation.households["Your household"].children.includes(name)) {
      situation.households["Your household"].children.pop(name);
    }
    if (name === "Your spouse") {
      situation.benunits["Your family"]["is_married"][this.year] = false;
    }
    delete situation.people[name];
    return this.validateSituation(situation).situation;
  }

  setNumAdults(numAdults) {
    let situation = this.situation;
    const numExistingAdults =
      situation.households["Your household"].adults.length;
    if (numExistingAdults === 1 && numAdults === 2) {
      situation = this.addPartner(situation);
    } else if (numExistingAdults === 2 && numAdults === 1) {
      situation = this.removePerson(situation, "Your spouse");
    }
    situation.states.state.citizens = Object.keys(situation.people);
    this.setState({
      situation: this.validateSituation(situation).situation,
      baselineSituationImpactIsOutdated: true,
      reformSituationImpactIsOutdated: true,
      situationVariationImpactIsOutdated: true,
    });
  }

  getNumAdults() {
    return this.situation.households["Your household"].adults.length;
  }

  setNumChildren(numChildren) {
    let situation = this.situation;
    const numExistingChildren =
      situation.households["Your household"].children.length;
    if (numExistingChildren < numChildren) {
      for (let i = numExistingChildren; i < numChildren; i++) {
        situation = this.addChild(situation);
      }
    } else if (numExistingChildren > numChildren) {
      for (let i = numExistingChildren; i > numChildren; i--) {
        situation = this.removePerson(situation, childNamer[i]);
      }
    }
    situation.states.state.citizens = Object.keys(situation.people);
    this.setState({
      situation: this.validateSituation(situation).situation,
      baselineSituationImpactIsOutdated: true,
      reformSituationImpactIsOutdated: true,
      situationVariationImpactIsOutdated: true,
    });
  }

  getNumChildren() {
    return this.situation.households["Your household"].children.length;
  }

  // Parameter names not in parameterHierarchy but needed for the app
  extraParameterListNames = [
    "extra_UK_rate",
    "extra_UK_threshold",
    "extra_scot_rate",
    "extra_scot_threshold",
    "country_specific",
    "dividend_basic_rate",
    "dividend_basic_threshold",
    "dividend_higher_rate",
    "dividend_higher_threshold",
    "dividend_additional_rate",
    "dividend_additional_threshold",
  ];
}
