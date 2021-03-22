import {CraftingComponent, Ingredient} from "./CraftingComponent";
import {InventoryRecord} from "./InventoryRecord";
import {EssenceDefinition, EssenceUnit} from "./EssenceDefinition";

interface Inventory<I extends Item, A extends Actor<Actor.Data, I>> {
    actor: A;
    contents: Map<CraftingComponent, InventoryRecord<I>>;
    containsIngredients(ingredients: Ingredient[]): boolean;
    containsEssences(essences: EssenceUnit[]): boolean;
    selectFor(essences: EssenceUnit[]): Ingredient[];
    excluding(ingredients: Ingredient[]): Inventory<I, A>;
}

interface InventorySearch<I extends Item> {
    perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean;
}

class IngredientSearch<I extends Item> implements InventorySearch<I> {
    private readonly _ingredients: Ingredient[];

    constructor(ingredients: Ingredient[]) {
        this._ingredients = ingredients;
    }

    public perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean {
        return this._ingredients.map((ingredient)  => {
            const component: CraftingComponent = ingredient.component;
            if (!contents.has(component)) {
                return false;
            }
            const record: InventoryRecord<Item> = contents.get(component);
            const requiredQuantity = ingredient.quantity;
            if (requiredQuantity < record.totalQuantity) {
                return false;
            }
        }).reduce((previousValue, currentValue) => previousValue && currentValue, true);
    }

}

class EssenceSearch<I extends Item> implements InventorySearch<I> {
    private readonly _essences: EssenceUnit[];

    constructor(essences: EssenceUnit[]) {
        this._essences = essences;
    }

    public perform(contents: Map<CraftingComponent, InventoryRecord<I>>): boolean {
        const requiredEssences: Map<EssenceDefinition, number> = new Map(this._essences.map(essenceUnit => [essenceUnit.essence, essenceUnit.quantity]));
        for (const entry of contents) {
            const component: CraftingComponent = entry[0];
            if (!component.essences) {
                break;
            }
            const record: InventoryRecord<I> = entry[1];
            component.essences.forEach((essence: EssenceDefinition) => {
                    if (!requiredEssences.has(essence)) {
                        return;
                    }
                    const outstandingAmount: number = requiredEssences.get(essence);
                    if (outstandingAmount >= record.totalQuantity) {
                        requiredEssences.delete(essence);
                    } else {
                        requiredEssences.set(essence, outstandingAmount - record.totalQuantity);
                    }
                });
            if (requiredEssences.size === 0) {
                return true;
            }
        }
        return false;
    }

}

class EssenceSelection<I extends Item> {

    private readonly _essences: EssenceUnit[];

    constructor(essences: EssenceUnit[]) {
        this._essences = essences;
    }

    perform(contents: Map<CraftingComponent, InventoryRecord<I>>): Ingredient[] {
        return;
    }

}


class AbstractInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _actor: A;
    private readonly _contents: Map<CraftingComponent, InventoryRecord<I>> = new Map();

    constructor(builder: AbstractInventory.Builder<I, A>) {
        this._actor = builder.actor;
        this._contents = builder.contents;
    }

    get actor(): A {
        return this._actor;
    }

    get contents(): Map<CraftingComponent, InventoryRecord<I>> {
        return new Map(this._contents);
    }

    public index() {

    }

    containsIngredients(ingredients: Ingredient[]): boolean {
        return new IngredientSearch(ingredients).perform(this.contents);
    }

    containsEssences(essences: EssenceUnit[]): boolean {
        return new EssenceSearch(essences).perform(this.contents);
    }

    excluding(ingredients: Ingredient[]): Inventory<I, A> {
        return new ReadonlyInventory<I, A>(this, ingredients);
    }

    selectFor(essences: EssenceUnit[]): Ingredient[] {
        return new EssenceSelection(essences).perform(this.contents);
    }

}

class ReadonlyInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _source: Inventory<I, A>;
    private readonly _contents: Map<CraftingComponent, InventoryRecord<I>> = new Map();

    constructor(source: Inventory<I, A>, exclude?: Ingredient[]) {
        this._source = source;
        const reducedComponentQuantities: Map<string, number> = new Map();
        if (exclude) {
            exclude.forEach((value => reducedComponentQuantities.set(value.component.partId, -Math.abs(value.quantity))));
        }
        source.contents.forEach((sourceRecord: InventoryRecord<I>, component: CraftingComponent) => {
            if (reducedComponentQuantities.has(component.partId)) {
                this._contents.set(component, sourceRecord.readOnly(reducedComponentQuantities.get(component.partId)))
            } else {
                this._contents.set(component, sourceRecord.readOnly());
            }
        });
    }

    containsIngredients(ingredients: Ingredient[]): boolean {
        return new IngredientSearch(ingredients).perform(this.contents);
    }

    containsEssences(essences: EssenceUnit[]): boolean {
        return new EssenceSearch(essences).perform(this.contents);
    }

    get actor(): A {
        return this._source.actor;
    }

    get contents(): Map<CraftingComponent, InventoryRecord<I>> {
        return new Map(this._contents);
    }

    excluding(ingredients: Ingredient[]): Inventory<I, A> {
        return new ReadonlyInventory<I, A>(this, ingredients);
    }

    selectFor(essences: EssenceUnit[]): Ingredient[] {
        return new EssenceSelection(essences).perform(this.contents);
    }

}

namespace AbstractInventory {

    export class Builder<I extends Item, A extends Actor<Actor.Data, I>> {

        public actor: A;
        public contents: Map<CraftingComponent, InventoryRecord<I>>;

        public withActor(value: A): Builder<I, A> {
            this.actor = value;
            return this;
        }

        public withContents(value: Map<CraftingComponent, InventoryRecord<I>>): Builder<I, A> {
            this.contents = value;
            return this;
        }

    }

}

export {Inventory, AbstractInventory}