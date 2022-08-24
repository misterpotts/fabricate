import {AlchemicalCombination, AlchemicalEffect, NoAlchemicalEffect} from "./AlchemicalEffect";
import {EssenceDefinition, EssenceIdentityProvider} from "../../common/EssenceDefinition";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

interface AlchemyFormula {

    basePartId: string;

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<AlchemicalCombination>): AlchemicalEffect<AlchemicalCombination>;

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<AlchemicalCombination>;

    getAllEffects(): AlchemicalEffect<AlchemicalCombination>[];

    getEffectsForComponents(components: Combination<CraftingComponent>): AlchemicalEffect<AlchemicalCombination>[];

    hasEffectFor(essences: Combination<EssenceDefinition>): boolean;

}

class DefaultAlchemyFormula implements AlchemyFormula {

    private readonly _basePartId: string;
    private readonly _effectsByEssenceIdentity: Map<number, AlchemicalEffect<AlchemicalCombination>>;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;

    constructor({
        basePartId,
        essenceIdentityProvider,
        effectsByEssenceIdentity = new Map()
    }: {
        basePartId: string;
        essenceIdentityProvider: EssenceIdentityProvider;
        effectsByEssenceIdentity?: Map<number, AlchemicalEffect<AlchemicalCombination>>;
    }) {
        this._basePartId = basePartId;
        this._essenceIdentityProvider = essenceIdentityProvider;
        this._effectsByEssenceIdentity = effectsByEssenceIdentity ? effectsByEssenceIdentity : new Map();
    }

    get basePartId() {
        return this._basePartId;
    }

    getAllEffects(): AlchemicalEffect<AlchemicalCombination>[] {
        return Array.from(this._effectsByEssenceIdentity.values())
    }

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<AlchemicalCombination> {
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

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<AlchemicalCombination>): AlchemicalEffect<AlchemicalCombination> {
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

    getEffectsForComponents(components: Combination<CraftingComponent>): AlchemicalEffect<AlchemicalCombination>[] {
        if (components.isEmpty()) {
            return []
        }
        return components.units.flatMap(unit => unit.flatten())
            .map(part => this.getEffect(part.essences));
    }

}

export { AlchemyFormula, DefaultAlchemyFormula }