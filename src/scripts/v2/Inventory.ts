import {CraftingComponent, Ingredient} from "./CraftingComponent";
import {InventoryRecord} from "./InventoryRecord";

interface Inventory<I extends Item, A extends Actor<Actor.Data, I>> {
    actor: A;
    containsIngredients(ingredients: Ingredient[]): boolean;
}

const multiIngredientSearch: <I extends Item> (ingredients: Ingredient[], contents: Map<CraftingComponent, InventoryRecord<I>>) => boolean
        = <I extends Item> (ingredients: Ingredient[], contents: Map<CraftingComponent, InventoryRecord<I>>) => {
            return ingredients.map((ingredient)  => {
                const component: CraftingComponent = ingredient.component;
                if (!contents.has(component)) {
                    return false;
                }
                const record: InventoryRecord<I> = contents.get(component);
                const requiredQuantity = ingredient.quantity;
                if (requiredQuantity < record.totalQuantity) {
                    return false;
                }
            })
            .reduce((previousValue, currentValue) => previousValue && currentValue, true);
};

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
        return multiIngredientSearch(ingredients, this.contents);
    }

    excluding(ingredients: Ingredient[]): Inventory<I, A> {
        return new ReadonlyInventory<I, A>(this, ingredients);
    }
}

class ReadonlyInventory<I extends Item, A extends Actor<Actor.Data, I>> implements Inventory<I, A> {

    private readonly _source: Inventory<I, A>;
    private readonly _contents: Map<CraftingComponent, InventoryRecord<I>> = new Map();

    constructor(source: AbstractInventory<I, A>, exclude?: Ingredient[]) {
        this._source = source;
        const reducedComponentQuantitiesByComponentId: Map<string, number> = new Map();
        if (exclude) {
            exclude.forEach((value => reducedComponentQuantitiesByComponentId.set(value.component.partId, value.quantity)));
        }
        source.contents.forEach((sourceRecord: InventoryRecord<I>, component: CraftingComponent) => this._contents.set(component, sourceRecord.readOnly()));
    }

    containsIngredients(ingredients: Ingredient[]): boolean {
        return multiIngredientSearch(ingredients, this._contents);
    }

    get actor(): A {
        return this._source.actor;
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

export {AbstractInventory}