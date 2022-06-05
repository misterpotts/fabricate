import {CraftingSystemSpecification} from "./specification/CraftingSystemSpecification";
import {CraftingSystem} from "./CraftingSystem";
import {PartDictionary} from "./PartDictionary";
import {CraftingCheck5E} from "../5e/CraftingCheck5E";
import {CraftingCheck} from "../crafting/check/CraftingCheck";
import {ContributionCounterFactory} from "../crafting/check/ContributionCounterFactory";
import {DND5ECraftingCheckSpecification} from "./specification/DND5ECraftingSystemSpecification";
import {Fabricator} from "../core/Fabricator";
import {NoCraftingCheck} from "../crafting/check/NoCraftingCheck";

class CraftingSystemFactory {
    private readonly _specification: CraftingSystemSpecification;
    private readonly _partDictionary: PartDictionary;
    private readonly _enabled: boolean;

    constructor(specification: CraftingSystemSpecification, partDictionary: PartDictionary, enabled: boolean) {
        this._specification = specification;
        this._partDictionary = partDictionary;
        this._enabled = enabled;
    }

    public make(): CraftingSystem {
        const craftingCheck: CraftingCheck<Actor> = this.buildCraftingCheck(this._specification);
        const fabricator: Fabricator<{}, Actor> = this.buildFabricator(craftingCheck, this._specification);
        return new CraftingSystem({
            craftingCheck: craftingCheck,
            fabricator: fabricator,
            enabled: this._enabled,
            partDictionary: this._partDictionary,
            specification: this._specification
        });
    }

    private buildCraftingCheck(specification: CraftingSystemSpecification): CraftingCheck<Actor> {
        switch (this._specification.craftingCheckType) {
            case CraftingCheckType.DND5E:
                const craftingCheckSpecification: DND5ECraftingCheckSpecification = <DND5ECraftingCheckSpecification> specification.craftingCheckSpecification;
                const contributionCounterFactory = new ContributionCounterFactory({
                    essenceContribution: craftingCheckSpecification.essenceContribution,
                    ingredientContribution: craftingCheckSpecification.ingredientContribution
                });
                return new CraftingCheck5E({
                    ability: craftingCheckSpecification.ability,
                    tool: craftingCheckSpecification.tool,
                    exceedThreshold: craftingCheckSpecification.exceedThreshold,
                    baseDC: craftingCheckSpecification.baseThreshold,
                    contributionCounter: contributionCounterFactory.make()
                });
            case CraftingCheckType.PF2E:
                return new NoCraftingCheck();
            case CraftingCheckType.NONE:
                return new NoCraftingCheck();
            default:
                return new NoCraftingCheck();
        }
    }

    private buildFabricator(craftingCheck: CraftingCheck<Actor>, specification: CraftingSystemSpecification): Fabricator<{}, Actor> {
        const consumeComponentsOnFailure: boolean = specification.craftingCheckType === CraftingCheckType.NONE ? false : specification.craftingCheckSpecification.consumeComponentsOnFailure;
        return new Fabricator({craftingCheck: craftingCheck, consumeComponentsOnFailure: consumeComponentsOnFailure});
    }
}

export {CraftingSystemFactory}