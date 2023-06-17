import {CraftingSystemJson} from "../CraftingSystem";

const SYSTEM_DEFINITION: CraftingSystemJson = {
    "locked": true,
    "details": {
        "name": "Alchemist's Supplies v1.6",
        "description": "Alchemy is the skill of exploiting unique properties of certain plants, minerals, and creature parts, combining them to produce fantastic substances. This allows even non-spellcasters to mimic minor magical effects, although the creations themselves are non-magical.",
        "summary": "A crafting system for 5th Edition by u/calculusChild",
        "author": "u/calculusChild",
    },
    "enabled": true,
    "parts": {
        "essences": {
            "water": {
                "name": "Water",
                "description": "Elemental water, one of the fundamental forces of nature",
                "iconCode": "fa-solid fa-droplet",
                "tooltip": "Elemental water",
                "activeEffectSourceItemUuid": null
            },
            "earth": {
                "name": "Earth",
                "description": "Elemental earth, one of the fundamental forces of nature",
                "iconCode": "fa-solid fa-mountain",
                "tooltip": "Elemental earth",
                "activeEffectSourceItemUuid": null
            },
            "air": {
                "name": "Air",
                "description": "Elemental air, one of the fundamental forces of nature",
                "iconCode": "fa-solid fa-wind",
                "tooltip": "Elemental air",
                "activeEffectSourceItemUuid": null
            },
            "fire": {
                "name": "Fire",
                "description": "Elemental fire, one of the fundamental forces of nature",
                "iconCode": "fa-solid fa-fire",
                "tooltip": "Elemental fire",
                "activeEffectSourceItemUuid": null
            },
            "negative-energy": {
                "name": "Negative Energy",
                "description": "Negative Energy - The essence of death and destruction",
                "iconCode": "fa-solid fa-moon",
                "tooltip": "Negative energy",
                "activeEffectSourceItemUuid": null
            },
            "positive-energy": {
                "name": "Positive Energy",
                "description": "Positive Energy - The essence of life and creation",
                "iconCode": "fa-solid fa-sun",
                "tooltip": "Positive energy",
                "activeEffectSourceItemUuid": null
            }
        },
        "recipes": {
            "Compendium.fabricate.alchemists-supplies-v16.3N7TGYWJRrUJ9thy": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.3N7TGYWJRrUJ9thy",
                "essences": {
                    "earth": 2,
                    "water": 2,
                    "negative-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.zogQbVwUggRUWK2l": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.6mKiAWQIzDZRPNOP": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.6mKiAWQIzDZRPNOP",
                "essences": {
                    "air": 2,
                    "negative-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.m51mvhPcubqfPbWB": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.8M0vwnOuCEIEP9ww": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.8M0vwnOuCEIEP9ww",
                "essences": {
                    "fire": 2,
                    "positive-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.HyicGjYWESWIdEhc": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.EQfnAlIaDLh57ETN": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.EQfnAlIaDLh57ETN",
                "essences": {
                    "earth": 2,
                    "positive-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.fZsZ5EYMs9ioZ6Kk": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.F2dhRws4mZppZVIa": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.F2dhRws4mZppZVIa",
                "essences": {
                    "water": 2,
                    "positive-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.Ffv7X37ZT7LRzDvP": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.IVqzRv8v1MrfpKSa": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.IVqzRv8v1MrfpKSa",
                "essences": {
                    "earth": 3,
                    "negative-energy": 2
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.8AdG3048UmUOo5Qx": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.JEewjPpD6JA2ifE3": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.JEewjPpD6JA2ifE3",
                "essences": {
                    "fire": 1,
                    "negative-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.QXN2n98HnjFzSsNJ": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.O0FPlz7ARBLuLY1E": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.O0FPlz7ARBLuLY1E",
                "essences": {
                    "earth": 2,
                    "positive-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.zgDyoqjRxwhD9cNR": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.Pl65b1VSVhUJ2li9": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.Pl65b1VSVhUJ2li9",
                "essences": {
                    "fire": 2,
                    "earth": 1,
                    "water": 1,
                    "positive-energy": 1
                },

                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.Kv4752l95eP4IeBM": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.WseDmjhOWaT1XeJf": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.WseDmjhOWaT1XeJf",
                "essences": {
                    "earth": 1,
                    "fire": 2
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.EDGSJpxtSuvq7XWW": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.hJFEOjoiLdTOOoBn": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.hJFEOjoiLdTOOoBn",
                "essences": {
                    "earth": 2,
                    "water": 2
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.sB64MUbYpMqiWCkS": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.kI3lqJmjWai0aX5L": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.kI3lqJmjWai0aX5L",
                "essences": {
                    "air": 3
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.4U429BrJKdMKDZaR": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.x4MkisNL6yBoTZ94": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.x4MkisNL6yBoTZ94",
                "essences": {
                    "air": 2,
                    "fire": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.bNOIJaY21OSsdybw": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.ylQuglLVjQFuH9w1": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.ylQuglLVjQFuH9w1",
                "essences": {
                    "water": 1,
                    "fire": 1,
                    "negative-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.1lx7oTedScyEgTOm": 1
                    }
                },
                disabled: false
            },
            "Compendium.fabricate.alchemists-supplies-v16.yqKIdplKhpa5Ir7A": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.yqKIdplKhpa5Ir7A",
                "essences": {
                    "air": 2,
                    "fire": 2,
                    "negative-energy": 1
                },
                "ingredientOptions": {},
                "resultOptions": {
                    "Option 1": {
                        "Compendium.fabricate.alchemists-supplies-v16.VHUXcExXZLCDfqmM": 1
                    }
                },
                disabled: false
            },
        },
        "components": {
            "Compendium.fabricate.alchemists-supplies-v16.1lx7oTedScyEgTOm": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.1lx7oTedScyEgTOm",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.0FiywpRZf3cOYs4U": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.0FiywpRZf3cOYs4U",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "water": 2
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.zogQbVwUggRUWK2l": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.zogQbVwUggRUWK2l",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.4U429BrJKdMKDZaR": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.4U429BrJKdMKDZaR",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.8AdG3048UmUOo5Qx": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.8AdG3048UmUOo5Qx",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.90z9nOwmGnP4aUUk": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.90z9nOwmGnP4aUUk",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.Act4cJsuz2HhID55": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.Act4cJsuz2HhID55",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "fire": 1,
                    "earth": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.BPiO2qqMvJbdlxJf": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.BPiO2qqMvJbdlxJf",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "fire": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.BjAyhAmkbFJdVVQW": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.BjAyhAmkbFJdVVQW",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "air": 1,
                    "fire": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.BzC8HmlN3bNY4D8Z": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.BzC8HmlN3bNY4D8Z",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "positive-energy": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.EDGSJpxtSuvq7XWW": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.EDGSJpxtSuvq7XWW",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.Ffv7X37ZT7LRzDvP": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.Ffv7X37ZT7LRzDvP",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.HyicGjYWESWIdEhc": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.HyicGjYWESWIdEhc",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.JuAZVO3QioTf7ACf": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.JuAZVO3QioTf7ACf",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "negative-energy": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.Kv4752l95eP4IeBM": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.Kv4752l95eP4IeBM",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.LnFU0qkUkKz3iV1Q": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.LnFU0qkUkKz3iV1Q",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "water": 1,
                    "air": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.PwEY1nRmDzoFN5TW": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.PwEY1nRmDzoFN5TW",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "fire": 2
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.QXN2n98HnjFzSsNJ": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.QXN2n98HnjFzSsNJ",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.R50XdiWxV5awA6HL": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.R50XdiWxV5awA6HL",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "earth": 2
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.SmE4zjl9xLBOSo4A": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.SmE4zjl9xLBOSo4A",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "water": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.TAdDF3reNmXc00ST": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.TAdDF3reNmXc00ST",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "earth": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.VHUXcExXZLCDfqmM": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.VHUXcExXZLCDfqmM",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.bNOIJaY21OSsdybw": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.bNOIJaY21OSsdybw",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.dVgM7j75KoBDKRep": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.dVgM7j75KoBDKRep",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "air": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.dvrdsBAt0B2ag8Q8": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.dvrdsBAt0B2ag8Q8",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "air": 2
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.fZsZ5EYMs9ioZ6Kk": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.fZsZ5EYMs9ioZ6Kk",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.m51mvhPcubqfPbWB": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.m51mvhPcubqfPbWB",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.sB64MUbYpMqiWCkS": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.sB64MUbYpMqiWCkS",
                disabled: false,
                "salvageOptions": {},
                "essences": {}
            },
            "Compendium.fabricate.alchemists-supplies-v16.xtrSxjCohTVr1bZy": {
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.xtrSxjCohTVr1bZy",
                disabled: false,
                "salvageOptions": {},
                "essences": {
                    "earth": 1,
                    "water": 1
                }
            },
            "Compendium.fabricate.alchemists-supplies-v16.zgDyoqjRxwhD9cNR": {
                disabled: false,
                "itemUuid": "Compendium.fabricate.alchemists-supplies-v16.zgDyoqjRxwhD9cNR",
                "salvageOptions": {},
                "essences": {}
            }
        }
    }
}

const ALCHEMISTS_SUPPLIES_SYSTEM_DATA = {
    definition: SYSTEM_DEFINITION,
    id: "alchemists-supplies-v1.6",
    gameSystem: "dnd5e"
}

export { ALCHEMISTS_SUPPLIES_SYSTEM_DATA }