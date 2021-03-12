import {CraftingComponent} from "./CraftingComponent";
import {AlchemicalEffect} from "./AlchemicalEffect";

abstract class EssenceCombiner<E extends AlchemicalEffect<{}>, I> {
    protected readonly _maxComponents: number;
    protected readonly _maxEssences: number;
    protected readonly _effects: E[];
    protected readonly _baseItem: Entity<I>;

    protected constructor(maxComponents: number, maxEssences: number, effects: E[], baseItem: Entity<I>) {
        this._maxComponents = maxComponents;
        this._maxEssences = maxEssences;
        this._effects = effects;
        this._baseItem = baseItem;
    }

    get maxComponents(): number {
        return this._maxComponents;
    }

    get maxEssences(): number {
        return this._maxEssences;
    }

    get effects(): E[] {
        return this._effects;
    }

    get baseItem(): Entity<I> {
        return this._baseItem;
    }

    combine(components: CraftingComponent[]): Entity<I> {
        this.validate(components);
        const effects: E[] = this.determineAlchemicalEffectsForComponents(components);
        const orderedEffects: E[] = this.orderAlchemicalEffects(effects);
        return this.applyEffectsToBaseItem(orderedEffects, this.baseItem);
    }

    protected validate(components: CraftingComponent[]) {
        if ((this._maxComponents > 0) && (this._maxComponents < components.length)) {
            throw new Error(`The Essence Combiner for this system supports a maximum of ${this._maxComponents} components. `);
        }
        if (this._maxEssences > 0) {
            const essenceCount = components.map((component: CraftingComponent) => component.essences.length)
                .reduce((left: number, right: number) => left + right, 0);
            if (essenceCount > this._maxEssences) {
                throw new Error(`The Essence Combiner for this system supports a maximum of ${this._maxEssences} essences. `);
            }
        }
    }

    abstract applyEffectsToBaseItem(effects: E[], baseItem: Entity<I>): Entity<I>;

    determineAlchemicalEffectsForComponents(components: CraftingComponent[]): E[] {
        if (components.length === 0 || this.effects.length === 0) {
            return [];
        }
        const effectEssenceMatchSizes: number[] = this.effects.map((effect: E) => effect.essenceCombination.length)
            .filter((count: number, index: number, essenceCounts: number[]) => essenceCounts.indexOf(count) === index)
            .sort((left: number, right: number) => right - left);
        const remainingComponents: CraftingComponent[] = components;
        effectEssenceMatchSizes.forEach((essenceCount: number) => {
            const unmatched: CraftingComponent[] = [];
            remainingComponents.forEach((component: CraftingComponent) => {
                if (component.essences.length === essenceCount) {
                    potentialEffectMatches.push(component);
                    this.effects.find((effect: AlchemicalEffect<E>) => effect.essenceCombination)
                } else {
                    unmatched.push(component);
                }
            });

        });
        return components.map((component: CraftingComponent) => this._availableResults.getByEssenceCombination(component.essences));
    }

    protected abstract orderAlchemicalEffects(effects: E[]): E[];
}

namespace EssenceCombiner {

    export class Builder<E, I> {

        public maxComponents: number;
        public maxEssences: number
        public effects: E[] = [];
        public baseItem: Entity<I>;

        public withMaxComponents(value: number): Builder<E, I> {
            this.maxComponents = value;
            return this;
        }

        public withMaxEssences(value: number): Builder<E, I> {
            this.maxComponents = value;
            return this;
        }

        public withAlchemicalEffect(value: E): Builder<E, I> {
            this.effects.push(value);
            return this;
        }

        public withAlchemicalEffects(value: E[]): Builder<E, I> {
            this.effects = value;
            return this;
        }

        public withBaseItem(value: Entity<I>): Builder<E, I> {
            this.baseItem = value;
            return this;
        }

    }

}

export {EssenceCombiner}