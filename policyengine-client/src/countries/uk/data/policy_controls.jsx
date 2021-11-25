import { Image } from "antd";
import UBICenterLogo from "../images/ubicenter.png";

export const ORGANISATIONS = {
	"UBI Center": {
		"logo": <Image src={UBICenterLogo} preview={false} height={30} width={30}/>,
	}
};

export const PARAMETER_MENU = {
	"Tax": {
		"Income Tax": {
			"Labour income": [
				"basic_rate",
				"higher_rate",
				"higher_threshold",
				"add_rate",
				"add_threshold",
				"extra_UK_band",
			],
			"Scottish rates": [
				"scottish_starter_rate",
				"scottish_starter_threshold",
				"scottish_basic_rate",
				"scottish_basic_threshold",
				"scottish_intermediate_rate",
				"scottish_intermediate_threshold",
				"scottish_higher_rate",
				"scottish_higher_threshold",
				"scottish_add_rate",
				"scottish_add_threshold",
				"extra_scot_band",
			],
			"Allowances": [
				"personal_allowance"
			],
			"Structural": [
				"abolish_income_tax"
			]
		},
		"National Insurance": {
			"Employee": [
				"NI_main_rate",
				"NI_PT",
				"NI_add_rate",
				"NI_UEL",
			],
			"Self-employed": [
				"NI_LPL",
				"NI_class_4_main_rate",
				"NI_UPL",
				"NI_class_4_add_rate"
			],
			"Structural": [
				"abolish_NI"
			]
		},
		"Property taxes": [
			"abolish_CT"
		]
	},
	"Benefit": {
		"Child Benefit": [
			"abolish_CB",
			"CB_eldest",
			"CB_additional",
			"CB_takeup",
		],
		"Legacy benefits": [
			"abolish_CTC",
			"CTC_takeup",
			"abolish_WTC",
			"WTC_takeup",
			"abolish_HB",
			"HB_takeup",
			"abolish_IS",
			"IS_takeup",
			"abolish_JSA_income",
			"JSA_IB_takeup",
			"abolish_ESA_income",
		],
		"State Pension": [
			"abolish_SP",
			"abolish_PC",
			"PC_takeup",
		],
		"Universal Credit": [
			"abolish_UC",
			"abolish_UC_standard",
			"UC_single_young",
			"UC_single_old",
			"UC_couple_young",
			"UC_couple_old",
			"abolish_UC_child",
			"abolish_UC_disability",
			"abolish_UC_carer",
			"abolish_UC_housing_costs",
			"abolish_UC_childcare",
			"UC_work_allowance_without_housing",
			"UC_work_allowance_with_housing",
			"UC_reduction_rate",
		],
	},
	"UBI Center": {
		"Universal Basic Income": [
			"child_UBI",
			"adult_UBI",
			"senior_UBI",
			"WA_adult_UBI_age",
			"taxable_UBI",
			"means_test_UBI",
			"autoUBI",
		],
		"Land Value Tax": [
			"LVT",
		],
		"Carbon Tax": [
			"carbon_tax",
		]
	}
};
