import {AlchemicalEffect, NoAlchemicalEffect} from "./AlchemicalEffect";
import {EssenceDefinition, EssenceIdentityProvider} from "../../common/EssenceDefinition";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";

interface AlchemySpecification<D> {

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<D>): AlchemicalEffect<D>;

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<D>;

    getAllEffects(components: CraftingComponent[]): AlchemicalEffect<D>[];

    hasEffectFor(essences: Combination<EssenceDefinition>): boolean;

}

class DefaultAlchemySpecification<D> implements AlchemySpecification<D> {

    private readonly _effectsByEssenceIdentity: Map<number, AlchemicalEffect<D>>;
    private readonly _essenceIdentityProvider: EssenceIdentityProvider;

    constructor(essenceIdentityProvider: EssenceIdentityProvider, effectsByEssenceIdentity?: Map<number, AlchemicalEffect<D>>) {
        this._essenceIdentityProvider = essenceIdentityProvider;
        this._effectsByEssenceIdentity = effectsByEssenceIdentity == null ? new Map<number, AlchemicalEffect<D>>() : effectsByEssenceIdentity;
    }

    getEffect(essences: Combination<EssenceDefinition>): AlchemicalEffect<D> {
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

    registerEffect(essences: Combination<EssenceDefinition>, effect: AlchemicalEffect<D>): AlchemicalEffect<D> {
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

    getAllEffects(components: CraftingComponent[]): AlchemicalEffect<D>[] {
        if (components.length === 0) {
            return []
        }
        return components.map(component => this.getEffect(component.essences));
    }

}

export { AlchemySpecification, DefaultAlchemySpecification }