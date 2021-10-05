const PARAMETER_MENU = {
    "Tax": {
        "Income Tax": {
            "Labour income": [
                "basic_rate",
                "higher_rate",
                "higher_threshold",
                "add_rate",
                "add_threshold",
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
        "Land value tax": [
            "LVT"
        ]
    },
    "Benefit": {
        "Child Benefit": [
            "abolish_CB",
            "CB_eldest",
            "CB_additional",
        ],
        "Legacy benefits": [
            "abolish_CTC",
            "abolish_WTC",
            "abolish_HB",
            "abolish_IS",
            "abolish_JSA_income",
        ],
        "State Pension": [
            "abolish_SP",
            "abolish_PC",
        ],
        "Universal Credit": [
            "abolish_UC",
            "UC_single_young",
            "UC_single_old",
            "UC_couple_young",
            "UC_couple_old",
            "UC_reduction_rate",
        ],
        "UBI": [
            "child_UBI",
            "adult_UBI",
            "senior_UBI",
            "autoUBI",
        ],
    }
}

export default PARAMETER_MENU;