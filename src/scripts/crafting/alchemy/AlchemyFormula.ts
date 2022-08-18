import {AlchemicalEffect, NoAlchemicalEffect} from "./AlchemicalEffect";
import {EssenceDefinition, EssenceIdentityProvider} from "../../common/EssenceDefinition";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

interface AlchemyFormula<D> {

    basePartId: string;

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<D>): AlchemicalEffect<D>;

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<D>;

    getAllEffects(components: Combination<CraftingComponent>): AlchemicalEffect<D>[];

    hasEffectFor(essences: Combination<EssenceDefinition>): boolean;

}

interface AlchemyFormulaConfig {
    basePartId: string;
    essenceIdentityProvider: EssenceIdentityProvider;
    effectsByEssenceIdentity?: Map<number, AlchemicalEffect<ItemData>>;
}

class DefaultAlchemyFormula implements AlchemyFormula<ItemData> {

    private readonly _basePartId: string;
    private readonly _effectsByEssenceIdentity: Map<number, AlchemicalEffect<ItemData>>;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;

    constructor(config: AlchemyFormulaConfig) {
        this._basePartId = config.basePartId;
        this._essenceIdentityProvider = config.essenceIdentityProvider;
        this._effectsByEssenceIdentity = config.effectsByEssenceIdentity ? config.effectsByEssenceIdentity : new Map<number, AlchemicalEffect<ItemData>>();
    }

    get basePartId() {
        return this._basePartId;
    }

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<ItemData> {
        if (essences.isEmpty()) {
            return new NoAlchemicalEffect();
        }
        const combinationIdentity: number = this._essenceIdentityProvider.getForEssenceCombination(essences);
        if (!this._effectsByEssenceIdentity.has(combinationIdentity)) {
            return new NoAlchemicalEffect();
        }
        return this._effectsByEssenceIdentity.get(combinationIdentity);
    }

    hasEffectFor(essences: Combination<EssenceDefinition>): boolean {
        if (essences.isEmpty()) {
            return false;
        }
        const combinationIdentity: number = this._essenceIdentityProvider.getForEssenceCombination(essences);
        return this._effectsByEssenceIdentity.has(combinationIdentity);
    }

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<ItemData>): AlchemicalEffect<ItemData> {
        if (essences.isEmpty()) {
            return new NoAlchemicalEffect();
        }
        const combinationIdentity: number = this._essenceIdentityProvider.getForEssenceCombination(essences);
        if (!this._effectsByEssenceIdentity.has(combinationIdentity)) {
            this._effectsByEssenceIdentity.set(combinationIdentity, effect);
            return new NoAlchemicalEffect();
        }
        const previousEffect = this._effectsByEssenceIdentity.get(combinationIdentity);
        this._effectsByEssenceIdentity.set(combinationIdentity, effect);
        return previousEffect;
    }

    getAllEffects(components: Combination<CraftingComponent>): AlchemicalEffect<ItemData>[] {
        if (components.isEmpty()) {
            return []
        }
        return components.units.flatMap(unit => unit.flatten())
            .map(part => this.getEffect(part.essences));
    }

}

export { AlchemyFormula, DefaultAlchemyFormula }