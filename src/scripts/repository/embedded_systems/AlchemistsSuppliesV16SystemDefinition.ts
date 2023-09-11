import {EmbeddedCraftingSystemDefinition} from "./EmbeddedCraftingSystemDefinition";
import {CraftingSystem, DefaultCraftingSystem} from "../../system/CraftingSystem";
import {CraftingSystemDetails} from "../../system/CraftingSystemDetails";
import {DefaultEssence, Essence} from "../../crafting/essence/Essence";
import {Component, DefaultComponent} from "../../crafting/component/Component";
import {FabricateItemData, LoadedFabricateItemData, PendingFabricateItemData} from "../../foundry/DocumentManager";
import {Combination} from "../../common/Combination";
import {Unit} from "../../common/Unit";
import {EssenceReference} from "../../crafting/essence/EssenceReference";
import {
    DefaultRecipe,
    Recipe
} from "../../crafting/recipe/Recipe";
import {SelectableOptions} from "../../crafting/selection/SelectableOptions";
import {ComponentReference} from "../../crafting/component/ComponentReference";
import {RequirementOption, RequirementOptionJson} from "../../crafting/recipe/RequirementOption";
import {ResultOption, ResultOptionJson} from "../../crafting/recipe/ResultOption";

class AlchemistsSuppliesV16SystemDefinition implements EmbeddedCraftingSystemDefinition {

    private static readonly CRAFTING_SYSTEM_ID = "alchemists-supplies-v1.6";
    private static readonly DEFAULT_ITEM_DATA_LOADING_FUNCTION = () => {
        throw new Error("No item data loading function provided. ");
    };
    
    private readonly _itemDataLoadingFunction: (uuid: string) => Promise<FabricateItemData>;
    
    constructor(itemDataLoadingFunction: (uuid: string) => Promise<LoadedFabricateItemData> = AlchemistsSuppliesV16SystemDefinition.DEFAULT_ITEM_DATA_LOADING_FUNCTION) {
        this._itemDataLoadingFunction = itemDataLoadingFunction;
    }

    get supportedGameSystem(): string {
        return "dnd5e";
    }

    get craftingSystem(): CraftingSystem {
        return new DefaultCraftingSystem({
            id: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
            embedded: true,
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Alchemist's Supplies v1.6",
                description: "Alchemy is the skill of exploiting unique properties of certain plants, minerals, and creature parts, combining them to produce fantastic substances. This allows even non-spellcasters to mimic minor magical effects, although the creations themselves are non-magical.",
                summary: "A crafting system for 5th Edition by u/calculusChild",
                author: "u/calculusChild",
            }),
            disabled: true,
        });
    }

    get essences(): Essence[] {
        return [
            new DefaultEssence({
                id: "water",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Water",
                description: "Elemental water, one of the fundamental forces of nature",
                iconCode: "fa-solid fa-droplet",
                tooltip: "Elemental water",
                embedded: true,
                disabled: false,
            }),
            new DefaultEssence({
                id: "fire",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Fire",
                description: "Elemental fire, one of the fundamental forces of nature",
                iconCode: "fa-solid fa-fire",
                tooltip: "Elemental fire",
                embedded: true,
                disabled: false,
            }),
            new DefaultEssence({
                id: "earth",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Earth",
                description: "Elemental earth, one of the fundamental forces of nature",
                iconCode: "fa-solid fa-mountain",
                tooltip: "Elemental earth",
                embedded: true,
                disabled: false,
            }),
            new DefaultEssence({
                id: "air",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Air",
                description: "Elemental air, one of the fundamental forces of nature",
                iconCode: "fa-solid fa-wind",
                tooltip: "Elemental air",
                embedded: true,
                disabled: false,
            }),
            new DefaultEssence({
                id: "positive-energy",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Positive Energy",
                description: "Positive Energy - The essence of life and creation",
                iconCode: "fa-solid fa-sun",
                tooltip: "Positive Energy",
                embedded: true,
                disabled: false,
            }),
            new DefaultEssence({
                id: "negative-energy",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                name: "Negative Energy",
                description: "Negative Energy - The essence of death and destruction",
                iconCode: "fa-solid fa-moon",
                tooltip: "Negative Energy",
                embedded: true,
                disabled: false,
            })
        ];
    }

    get components(): Component[] {
        return [
            new DefaultComponent({
                id: "night-eyes",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.1lx7oTedScyEgTOm",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "hydrathistle",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.0FiywpRZf3cOYs4U",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("water"), 2),
                ]),
            }),
            new DefaultComponent({
                id: "instant-rope",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.zogQbVwUggRUWK2l",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "breath-bottle",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.4U429BrJKdMKDZaR",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "dust-of-dryness",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.8AdG3048UmUOo5Qx",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "alchemical-bomb",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.90z9nOwmGnP4aUUk",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "wrackwort-bulbs",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.Act4cJsuz2HhID55",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("earth"), 1),
                    new Unit(new EssenceReference("fire"), 1),
                ]),
            }),
            new DefaultComponent({
                id: "lightningbug-thorax",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.BPiO2qqMvJbdlxJf",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "luminous-cap",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.BjAyhAmkbFJdVVQW",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "radiant-synthseed",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.BzC8HmlN3bNY4D8Z",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("air"), 1),
                    new Unit(new EssenceReference("fire"), 1),
                ]),
            }),
            new DefaultComponent({
                id: "melt-powder",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.EDGSJpxtSuvq7XWW",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "gashglue",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.Ffv7X37ZT7LRzDvP",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "flash-pellet",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.HyicGjYWESWIdEhc",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "voidroot",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.JuAZVO3QioTf7ACf",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("negative-energy"), 1),
                ]),
            }),
            new DefaultComponent({
                id: "alchemists-fire",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.Kv4752l95eP4IeBM",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "blue-toadshade",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.LnFU0qkUkKz3iV1Q",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("water"), 1),
                    new Unit(new EssenceReference("air"), 1),
                ]),
            }),
            new DefaultComponent({
                id: "drakus-flower",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.PwEY1nRmDzoFN5TW",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("fire"), 2)
                ]),
            }),
            new DefaultComponent({
                id: "firesnuff",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.QXN2n98HnjFzSsNJ",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "ironwood-heart",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.R50XdiWxV5awA6HL",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("earth"), 2)
                ]),
            }),
            new DefaultComponent({
                id: "amanita-cap",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.SmE4zjl9xLBOSo4A",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("water"), 1)
                ]),
            }),
            new DefaultComponent({
                id: "rockvine",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.TAdDF3reNmXc00ST",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("earth"), 1)
                ]),
            }),
            new DefaultComponent({
                id: "noxious-smokestick",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.VHUXcExXZLCDfqmM",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "smokestick",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.bNOIJaY21OSsdybw",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "fennel-silk",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.dVgM7j75KoBDKRep",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "wisp-stalks",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.dvrdsBAt0B2ag8Q8",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                   new Unit(new EssenceReference("air"), 2)
                ]),
            }),
            new DefaultComponent({
                id: "titan-gum",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.fZsZ5EYMs9ioZ6Kk",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "zaebelles-torpor",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.m51mvhPcubqfPbWB",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "tanglefoot-bag",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.sB64MUbYpMqiWCkS",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
            new DefaultComponent({
                id: "frozen-seedlings",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.xtrSxjCohTVr1bZy",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
                essences: Combination.ofUnits([
                    new Unit(new EssenceReference("earth"), 1),
                    new Unit(new EssenceReference("water"), 1),
                ]),
            }),
            new DefaultComponent({
                id: "snappowder",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.zgDyoqjRxwhD9cNR",
                    this._itemDataLoadingFunction
                ),
                embedded: true,
                disabled: false,
            }),
        ];
    }

    get recipes(): Recipe[] {
        return [
            new DefaultRecipe({
                id: "instant-rope",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.3N7TGYWJRrUJ9thy",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("water"), 2),
                                new Unit(new EssenceReference("earth"), 2),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("instant-rope"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "zaebelles-torpor",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.6mKiAWQIzDZRPNOP",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("air"), 2),
                                new Unit(new EssenceReference("negative-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("zaebelles-torpor"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "flash-pellet",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.8M0vwnOuCEIEP9ww",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("fire"), 2),
                                new Unit(new EssenceReference("positive-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("flash-pellet"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "titan-gum",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.EQfnAlIaDLh57ETN",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("earth"), 2),
                                new Unit(new EssenceReference("positive-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("titan-gum"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "gashglue",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.F2dhRws4mZppZVIa",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("water"), 2),
                                new Unit(new EssenceReference("positive-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("gashglue"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "dust-of-dryness",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.IVqzRv8v1MrfpKSa",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("earth"), 3),
                                new Unit(new EssenceReference("negative-energy"), 2 ),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("dust-of-dryness"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "firesnuff",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.JEewjPpD6JA2ifE3",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("fire"), 1),
                                new Unit(new EssenceReference("negative-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("firesnuff"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "snappowder",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.O0FPlz7ARBLuLY1E",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("earth"), 2),
                                new Unit(new EssenceReference("positive-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("snappowder"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "alchemists-fire",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.Pl65b1VSVhUJ2li9",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("fire"), 2),
                                new Unit(new EssenceReference("earth"), 1),
                                new Unit(new EssenceReference("water"), 1),
                                new Unit(new EssenceReference("positive-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("alchemists-fire"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "melt-powder",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.WseDmjhOWaT1XeJf",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("earth"), 1),
                                new Unit(new EssenceReference("fire"), 2),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("melt-powder"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "tanglefoot-bag",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.hJFEOjoiLdTOOoBn",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("water"), 2),
                                new Unit(new EssenceReference("earth"), 2),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("tanglefoot-bag"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "breath-bottle",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.kI3lqJmjWai0aX5L",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("air"), 3),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("breath-bottle"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "smokestick",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.x4MkisNL6yBoTZ94",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("air"), 2),
                                new Unit(new EssenceReference("fire"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("smokestick"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "night-eyes",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.ylQuglLVjQFuH9w1",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("water"), 1),
                                new Unit(new EssenceReference("fire"), 1),
                                new Unit(new EssenceReference("negative-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("night-eyes"), 1),
                            ])
                        }),
                    ]
                })
            }),
            new DefaultRecipe({
                id: "noxious-smokestick",
                craftingSystemId: AlchemistsSuppliesV16SystemDefinition.CRAFTING_SYSTEM_ID,
                itemData: new PendingFabricateItemData(
                    "Compendium.fabricate.alchemists-supplies-v16.yqKIdplKhpa5Ir7A",
                    this._itemDataLoadingFunction
                ),
                requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                    options: [
                        new RequirementOption({
                            id: "option-1",
                            name: "Option 1",
                            essences: Combination.ofUnits([
                                new Unit(new EssenceReference("air"), 2),
                                new Unit(new EssenceReference("fire"), 2),
                                new Unit(new EssenceReference("negative-energy"), 1),
                            ])
                        }),
                    ],
                }),
                resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                    options: [
                        new ResultOption({
                            id: "option-1",
                            name: "Option 1",
                            results: Combination.ofUnits([
                                new Unit(new ComponentReference("noxious-smokestick"), 1),
                            ])
                        }),
                    ]
                })
            }),
        ];
    }

}

export { AlchemistsSuppliesV16SystemDefinition }