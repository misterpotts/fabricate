import {CraftingComponent} from "./CraftingComponent";
import {AlchemicalEffect} from "./AlchemicalEffect";
import {FabricationHelper} from "./FabricationHelper";

class EssenceCombiner<T> {
    private readonly _maxComponents: number;
    private readonly _maxEssences: number;
    private readonly _effects: AlchemicalEffect<T>[];

    private readonly _essenceMatchSizes: number[];
    private readonly _effectsByEssenceCombinationIdentity: Map<number, AlchemicalEffect<T>> = new Map();
    private readonly _essenceIdentities: Map<string, number> = new Map();

    public constructor(builder: EssenceCombiner.Builder<T>) {
        this._maxComponents = builder.maxComponents;
        this._maxEssences = builder.maxEssences;
        this._effects = builder.effects;

        this._essenceMatchSizes = this.effects.map((effect: AlchemicalEffect<T>) => effect.essenceCombination.length)
            .filter((count: number, index: number, essenceCounts: number[]) => essenceCounts.indexOf(count) === index);

        const uniqueEssences = this.effects.map((effect: AlchemicalEffect<T>) => effect.essenceCombination)
            .reduce((left: string[], right: string[]) => left.concat(right), [])
            .filter(((essence: string, index: number, essences: string[]) => essences.indexOf(essence) === index));
        this._essenceIdentities = FabricationHelper.assignEssenceIdentities(uniqueEssences);

        this.effects.forEach((effect: AlchemicalEffect<T>) => this._effectsByEssenceCombinationIdentity.set(FabricationHelper.essenceCombinationIdentity(effect.essenceCombination, this._essenceIdentities), effect));
    }

    public static builder<T>(): EssenceCombiner.Builder<T> {
        return new EssenceCombiner.Builder<T>();
    }

    get maxComponents(): number {
        return this._maxComponents;
    }

    get maxEssences(): number {
        return this._maxEssences;
    }

    get effects(): AlchemicalEffect<T>[] {
        return this._effects;
    }

    combine(components: CraftingComponent[], baseItemData: T): T {
        this.validate(components);
        const effects: AlchemicalEffect<T>[] = this.determineAlchemicalEffectsForComponents(components);
        const orderedEffects: AlchemicalEffect<T>[] = this.orderAlchemicalEffects(effects);
        return this.applyEffectsToBaseItem(orderedEffects, baseItemData);
    }

    private validate(components: CraftingComponent[]) {
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

    private applyEffectsToBaseItem(effects: AlchemicalEffect<T>[], baseItem: T): T {
        effects.forEach((effect: AlchemicalEffect<T>) => effect.applyTo(baseItem));
        return baseItem;
    }

    private determineAlchemicalEffectsForComponents(components: CraftingComponent[]): AlchemicalEffect<T>[] {
        if (components.length === 0 || this.effects.length === 0) {
            return [];
        }
        return components.filter((component: CraftingComponent) => this._essenceMatchSizes.includes(component.essences.length))
            .map((component: CraftingComponent) => {
                const essenceCombinationIdentity = FabricationHelper.essenceCombinationIdentity(component.essences, this._essenceIdentities);
                return this._effectsByEssenceCombinationIdentity.get(essenceCombinationIdentity);
            })
            .filter((effect: AlchemicalEffect<T>) => effect !== null && typeof effect!== 'undefined');
    }

    private orderAlchemicalEffects(effects: AlchemicalEffect<T>[]): AlchemicalEffect<T>[] {
        return effects.sort((left: AlchemicalEffect<T>, right: AlchemicalEffect<T>) => {
            return left.type.valueOf() - right.type.valueOf();
        });
    }
}

namespace EssenceCombiner {

    export class Builder<T> {

        public maxComponents: number;
        public maxEssences: number
        public effects: AlchemicalEffect<T>[] = [];
        public baseItem: T;

        public withMaxComponents(value: number): Builder<T> {
            this.maxComponents = value;
            return this;
        }

        public withMaxEssences(value: number): Builder<T> {
            this.maxComponents = value;
            return this;
        }

        public withAlchemicalEffect(value: AlchemicalEffect<T>): Builder<T> {
            this.effects.push(value);
            return this;
        }

        public withAlchemicalEffects(value: AlchemicalEffect<T>[]): Builder<T> {
            this.effects = value;
            return this;
        }

        public build(): EssenceCombiner<T> {
            return new EssenceCombiner(this);
        }

    }

}

export {EssenceCombiner}