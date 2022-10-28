import {CraftingSystemSettingsValueV2} from "../interface/settings/values/CraftingSystemSettingsValueV2";

const SYSTEM_DEFINITION: CraftingSystemSettingsValueV2 = {
    "id": "alchemists-supplies-v1.6",
    "locked": true,
    "details": {
        "name": "Alchemist's Supplies v1.6",
        "description": "Alchemy is the skill of exploiting unique properties of certain plants, minerals, and creature parts, combining them to produce fantastic substances. This allows even non-spellcasters to mimic minor magical effects, although the creations themselves are non-magical.",
        "summary": "A crafting system for 5th Edition by u/calculusChild",
        "author": "u/calculusChild",
    },
    "enabled": true,
    "essences": {
        "water": {
            "name": "Water",
            "id": "water",
            "description": "Elemental water, one of the fundamental forces of nature",
            "iconCode": "tint",
            "tooltip": "Elemental water"
        },
        "earth": {
            "name": "Earth",
            "id": "earth",
            "description": "Elemental earth, one of the fundamental forces of nature",
            "iconCode": "mountain",
            "tooltip": "Elemental earth"
        },
        "air": {
            "name": "Air",
            "id": "air",
            "description": "Elemental air, one of the fundamental forces of nature",
            "iconCode": "wind",
            "tooltip": "Elemental air"
        },
        "fire": {
            "name": "Fire",
            "id": "fire",
            "description": "Elemental fire, one of the fundamental forces of nature",
            "iconCode": "fire",
            "tooltip": "Elemental fire"
        },
        "negative-energy": {
            "name": "Negative Energy",
            "id": "negative-energy",
            "description": "Negative Energy - The essence of death and destruction",
            "iconCode": "moon",
            "tooltip": "Negative energy"
        },
        "positive-energy": {
            "name": "Positive Energy",
            "id": "positive-energy",
            "description": "Positive Energy - The essence of life and creation",
            "iconCode": "sun",
            "tooltip": "Positive energy"
        }
    },
    "checks": {
        "enabled": true,
        "hasCustomAlchemyCheck": false,
        "recipe": {
            "wastage": "PUNITIVE",
            "ability": "int",
            "addToolProficiency": true,
            "tool": {
                "name": "Alchemist's Supplies",
                "skillProficiency": "Alchemy"
            },
            "threshold": {
                "baseValue": 6,
                "type": "MEET",
                "contributions": {
                    "ingredient": 1,
                    "essence": 0
                }
            }
        },
    },
    "recipeIds": [],
    "componentIds": [],
    "alchemy": {
        "enabled": true,
        "performCheck": true,
        "formulae": {
            "90z9nOwmGnP4aUUk": {
                "basePartId": "90z9nOwmGnP4aUUk",
                "constraints": {
                    "components": {
                        "min": 1,
                        "max": 6
                    },
                    "effects": {
                        "min": 1,
                        "max": 6
                    }
                },
                "effects": [
                    {
                        "name": "Blind",
                        "type": "DESCRIPTIVE",
                        "description": "Release a burst of stinging dust. Affected targets are blinded for the next round. ",
                        "essenceMatch": {
                            "earth": 2
                        }
                    },
                    {
                        "name": "Knock prone",
                        "type": "DESCRIPTIVE",
                        "description": "Release a puddle of slippery oil. Affected targets immediately fall prone.",
                        "essenceMatch": {
                            "water": 2
                        }
                    },
                    {
                        "name": "Persistent damage",
                        "type": "DESCRIPTIVE",
                        "description": "Release gel that sticks to targets. Each round, any damage-dealing effects continue to deal 1 damage each until an action is used to remove the gel with a DC 10 Dexterity check .",
                        "essenceMatch": {
                            "earth": 1,
                            "water": 1
                        }
                    },
                    {
                        "name": "Lightning damage",
                        "type": "DAMAGE",
                        "description": "Deal 1d4 lightning damage on contact. Double damage to targets touching a metal surface or using metal weapons or armor. ",
                        "damage": {
                            "expression": "1d4",
                            "type": "lightning"
                        },
                        "essenceMatch": {
                            "air": 2
                        }
                    },
                    {
                        "name": "Fire damage",
                        "type": "DAMAGE",
                        "description": "Deal 1d4 fire damage on contact. Double damage to targets with cloth or leather armor. ",
                        "damage": {
                            "expression": "1d4",
                            "type": "fire"
                        },
                        "essenceMatch": {
                            "fire": 2
                        }
                    },
                    {
                        "name": "Cold damage",
                        "type": "DAMAGE",
                        "description": "Deal 1d4 cold damage on contact. Reduce target speed by 10 feet for the next round. ",
                        "damage": {
                            "expression": "1d4",
                            "type": "cold"
                        },
                        "essenceMatch": {
                            "air": 1,
                            "water": 1
                        }
                    },
                    {
                        "name": "Acid damage",
                        "type": "DAMAGE",
                        "description": "Deal 1d8 acid damage on contact. ",
                        "damage": {
                            "expression": "1d8",
                            "type": "acid"
                        },
                        "essenceMatch": {
                            "fire": 1,
                            "earth": 1
                        }
                    },
                    {
                        "name": "AoE extension",
                        "type": "AOE_EXTENSION",
                        "description": "Release concentrated mist in all directions. Increase the radius of all effects by 5 feet. ",
                        "aoe": {
                            "units": "ft",
                            "value": 5
                        },
                        "essenceMatch": {
                            "fire": 1,
                            "air": 1
                        }
                    },
                    {
                        "name": "Damage multiplier",
                        "type": "DAMAGE_MULTIPLIER",
                        "description": "Roll double the number of all damage dice. ",
                        "diceMultiplier": 2,
                        "essenceMatch": {
                            "positive-energy": 1
                        }
                    },
                    {
                        "name": "Saving throw modifier",
                        "type": "SAVE_MODIFIER",
                        "description": "Increase the DC to avoid bomb effects by 2.  ",
                        "saveModifier": 2,
                        "essenceMatch": {
                            "negative-energy": 1
                        }
                    }
                ]
            }
        },
        "constraints": {
            "components": {
                "min": 1,
                "max": 6
            },
            "effects": {
                "min": 1,
                "max": 6
            }
        }
    }
}

export {SYSTEM_DEFINITION}