import {AlchemicalEffect, NoAlchemicalEffect} from "./AlchemicalEffect";
import {EssenceDefinition, EssenceIdentityProvider} from "../../common/EssenceDefinition";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

interface AlchemyFormula {

    basePartId: string;

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect): AlchemicalEffect;

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect;

    getAllEffects(components: Combination<CraftingComponent>): AlchemicalEffect[];

    hasEffectFor(essences: Combination<EssenceDefinition>): boolean;

}

interface AlchemyFormulaConfig {
    basePartId: string;
    essenceIdentityProvider: EssenceIdentityProvider;
    effectsByEssenceIdentity?: Map<number, AlchemicalEffect>;
}

class DefaultAlchemyFormula implements AlchemyFormula {

    private readonly _basePartId: string;
    private readonly _effectsByEssenceIdentity: Map<number, AlchemicalEffect>;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;

    constructor(config: AlchemyFormulaConfig) {
        this._basePartId = config.basePartId;
        this._essenceIdentityProvider = config.essenceIdentityProvider;
        this._effectsByEssenceIdentity = config.effectsByEssenceIdentity ? config.effectsByEssenceIdentity : new Map<number, AlchemicalEffect>();
    }

    get basePartId() {
        return this._basePartId;
    }

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect {
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

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect): AlchemicalEffect {
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

    getAllEffects(components: Combination<CraftingComponent>): AlchemicalEffect[] {
        if (components.isEmpty()) {
            return []
        }
        return components.units.flatMap(unit => unit.flatten())
            .map(part => this.getEffect(part.essences));
    }

}

export { AlchemyFormula, DefaultAlchemyFormula }