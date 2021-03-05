import {AlchemicalResult, AlchemicalResultSet} from "./AlchemicalResultSet";
import {CraftingComponent} from "./CraftingComponent";

interface EssenceCombiner<T> {
    maxComponents: number;
    maxEssences: number;
    resultantItem: CraftingComponent;
    combine(components: CraftingComponent[]): AlchemicalResult<T>;
}

abstract class AbstractEssenceCombiner<T> implements EssenceCombiner<T> {
    private readonly _maxComponents: number;
    private readonly _maxEssences: number;
    private readonly _availableResults: AlchemicalResultSet<T>;
    private readonly _resultantItem: CraftingComponent;

    protected constructor(maxComponents: number, maxEssences: number, availableResults: AlchemicalResultSet<T>, resultantItem: CraftingComponent) {
        this._maxComponents = maxComponents;
        this._maxEssences = maxEssences;
        this._availableResults = availableResults;
        this._resultantItem = resultantItem;
    }

    get maxComponents(): number {
        return this._maxComponents;
    }

    get maxEssences(): number {
        return this._maxEssences;
    }

    get resultantItem(): CraftingComponent {
        return this._resultantItem;
    }

    combine(components: CraftingComponent[]): AlchemicalResult<T> {
        this.validate(components);
        const effects: AlchemicalResult<T>[] = this.getAlchemicalResultsForComponents(components);
        return this.combineAlchemicalResults(effects);
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

    abstract combineAlchemicalResults(effects: AlchemicalResult<T>[]): AlchemicalResult<T>;

    getAlchemicalResultsForComponents(components: CraftingComponent[]): AlchemicalResult<T>[] {
        return components.map((component: CraftingComponent) => this._availableResults.getByEssenceCombination(component.essences));
    }

}

export {EssenceCombiner, AlchemicalResult, AbstractEssenceCombiner}